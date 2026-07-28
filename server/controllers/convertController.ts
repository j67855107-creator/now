import { Request, Response } from "express";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { addConversionLog } from "../services/statsService";

const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});
turndownService.use(gfm);

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export async function handleConversion(req: Request, res: Response) {
  const startTime = Date.now();
  try {
    const { fileData, fileName, mimeType, mode } = req.body;

    if (!fileData || !fileName || !mimeType) {
      return res.status(400).json({ error: "Missing file data, name, or type." });
    }

    const buffer = Buffer.from(fileData, "base64");

    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      return res.status(400).json({ error: `File size exceeds the ${MAX_FILE_SIZE_MB}MB limit.` });
    }

    let markdown = "";
    let warning: string | undefined = undefined;

    if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || fileName.endsWith(".docx")) {
      const { value: html } = await mammoth.convertToHtml({ buffer });
      markdown = turndownService.turndown(html);
    } else if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
      // Use pdf-parse v2.4.5 official PDFParse class API
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      try {
        const result = await parser.getText();
        markdown = result.text;
        if (result.total > 20) {
          warning = `PDF has ${result.total} pages. Parsing may be imperfect for complex layouts.`;
        }
      } finally {
        await parser.destroy();
      }
    } else {
      return res.status(400).json({ error: "Unsupported file type." });
    }

    const durationMs = Date.now() - startTime;
    const fileSizeKb = Math.round(buffer.length / 1024);
    const fileExt = fileName.split('.').pop() || '';

    // Record the successful conversion
    addConversionLog({
      fileName,
      fileSizeKb,
      mode: mode || "classic",
      fileExt,
      durationMs,
      status: "success",
    });

    res.status(200).json({
      success: true,
      markdown,
      modeUsed: mode || "classic",
      durationMs,
      warning,
    });

  } catch (error: unknown) {
    const durationMs = Date.now() - startTime;
    const { fileName, fileData } = req.body;
    const fileExt = fileName ? fileName.split('.').pop() || '' : 'unknown';
    const fileSizeKb = fileData ? Math.round(Buffer.from(fileData, 'base64').length / 1024) : 0;

    // Record the failed conversion attempt
    addConversionLog({
      fileName: fileName || "unknown",
      fileSizeKb,
      fileExt,
      mode: req.body.mode || "classic",
      durationMs,
      status: "failed",
    });

    console.error("[Conversion Error]", error);

    const errorMsg = error instanceof Error ? error.message : String(error);
    let errorMessage = "An unexpected error occurred during conversion.";
    if (errorMsg.includes('Invalid file signature')) {
        errorMessage = "File is corrupted or not a valid document format.";
    } else if (errorMsg.includes('timeout')) {
        errorMessage = "Conversion timed out. The document may be too complex.";
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
}