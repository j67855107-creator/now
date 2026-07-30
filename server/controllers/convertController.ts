import { Request, Response } from "express";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { createWorker } from "tesseract.js";
import JSZip from "jszip";
import * as XLSX from "xlsx";
import { addConversionLog } from "../services/statsService";

const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});
turndownService.use(gfm);

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/**
 * Convert raw PDF page text into clean, structured Markdown.
 * - Uses per-page text from pdf-parse to avoid "-- X of Y --" markers.
 * - Detects headings from UPPERCASE lines and short standalone lines.
 * - Cleans up excessive whitespace and page numbers.
 * - Merges broken lines (common in PDF text extraction).
 */
function pdfTextToMarkdown(pages: { text: string; num: number }[]): string {
  const sections: string[] = [];

  for (const page of pages) {
    const rawText = page.text;
    if (!rawText || !rawText.trim()) continue;

    const lines = rawText.split("\n");
    const cleanedLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Skip empty lines (we'll add spacing later)
      if (!trimmed) {
        cleanedLines.push("");
        continue;
      }

      // Skip standalone page numbers ("1", "Page 2", "- 3 -")
      if (/^page\s+\d+(\s+of\s+\d+)?$/i.test(trimmed)) continue;
      if (/^[-—]\s*\d+\s*[-—]$/.test(trimmed)) continue;
      if (/^\d{1,3}$/.test(trimmed) && trimmed.length <= 3) continue;

      // Detect potential headings:
      // 1. ALL CAPS lines that are short (< 80 chars) and have real words
      // 2. Short lines (< 60 chars) followed by a blank line that don't end with punctuation
      const isAllCaps = trimmed === trimmed.toUpperCase() &&
        trimmed.length > 2 && trimmed.length < 80 &&
        /[A-Z]/.test(trimmed) && !/^\d+$/.test(trimmed);

      if (isAllCaps) {
        // Convert ALL CAPS to Title Case heading
        const titleCase = trimmed
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase());
        cleanedLines.push(`## ${titleCase}`);
        continue;
      }

      // Regular text line
      cleanedLines.push(trimmed);
    }

    // Merge broken paragraphs: if a line doesn't end with sentence-ending
    // punctuation and the next non-empty line starts with lowercase, merge them.
    const merged: string[] = [];
    for (let i = 0; i < cleanedLines.length; i++) {
      const current = cleanedLines[i];

      if (!current) {
        merged.push("");
        continue;
      }

      // Check if this line should be merged with the next
      const nextIdx = cleanedLines.findIndex((l, j) => j > i && l.trim() !== "");
      if (
        nextIdx > 0 &&
        !current.startsWith("#") &&
        !current.startsWith("-") &&
        !current.startsWith("|") &&
        !current.match(/[.!?:;]$/) &&
        cleanedLines[nextIdx] &&
        !cleanedLines[nextIdx].startsWith("#") &&
        !cleanedLines[nextIdx].startsWith("-") &&
        !cleanedLines[nextIdx].startsWith("|") &&
        /^[a-z]/.test(cleanedLines[nextIdx])
      ) {
        // Merge: append next line to current
        merged.push(current + " " + cleanedLines[nextIdx]);
        // Mark the merged line so we skip it
        cleanedLines[nextIdx] = "";
      } else {
        merged.push(current);
      }
    }

    // Normalize whitespace: collapse 3+ blank lines into 2
    const normalized = merged.join("\n").replace(/\n{3,}/g, "\n\n").trim();
    if (normalized) {
      sections.push(normalized);
    }
  }

  return sections.join("\n\n---\n\n");
}

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
      // ── Word (.docx) conversion ──
      const { value: html, messages } = await mammoth.convertToHtml({ buffer });

      if (!html || html.trim() === "") {
        return res.status(400).json({
          error: "The Word document appears to be empty or contains only images/objects that cannot be converted to text.",
        });
      }

      markdown = turndownService.turndown(html);

      // Report mammoth warnings (e.g. unsupported features)
      const warnings = messages.filter((m: any) => m.type === "warning");
      if (warnings.length > 0) {
        warning = `${warnings.length} element(s) could not be fully converted (e.g. embedded objects, SmartArt). Text content was preserved.`;
      }

    } else if (mimeType === "text/html" || fileName.endsWith(".html") || fileName.endsWith(".htm")) {
      // ── HTML conversion ──
      const htmlText = buffer.toString("utf-8");
      const cleanHtml = htmlText
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
      markdown = turndownService.turndown(cleanHtml);

    } else if (
      mimeType.startsWith("image/") ||
      /\.(png|jpe?g|webp|bmp|gif)$/i.test(fileName)
    ) {
      // ── Image OCR conversion ──
      const worker = await createWorker("eng");
      try {
        const ret = await worker.recognize(buffer);
        const ocrText = ret.data.text.trim();
        await worker.terminate();

        if (!ocrText) {
          return res.status(400).json({ error: "OCR could not detect any readable text in the uploaded image." });
        }

        markdown = ocrText
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .join("\n\n");
      } catch (ocrErr: any) {
        await worker.terminate().catch(() => {});
        throw ocrErr;
      }

    } else if (
      mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
      fileName.endsWith(".pptx")
    ) {
      // ── PPTX presentation conversion ──
      const zip = await JSZip.loadAsync(buffer);
      const slideFiles = Object.keys(zip.files)
        .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
        .sort((a, b) => {
          const numA = parseInt(a.match(/\d+/)?.[0] || "0", 10);
          const numB = parseInt(b.match(/\d+/)?.[0] || "0", 10);
          return numA - numB;
        });

      if (slideFiles.length === 0) {
        return res.status(400).json({ error: "The PowerPoint presentation appears to contain no text slides." });
      }

      const slideTexts: string[] = [];
      for (let i = 0; i < slideFiles.length; i++) {
        const slideXml = await zip.files[slideFiles[i]].async("text");
        const textMatches = slideXml.match(/<a:t[^>]*>(.*?)<\/a:t>/g) || [];
        const lines = textMatches
          .map((tag) => tag.replace(/<[^>]+>/g, "").trim())
          .filter(Boolean);

        if (lines.length > 0) {
          const slideTitle = lines[0];
          const slideBody = lines.slice(1).map((l) => `- ${l}`).join("\n");
          slideTexts.push(`## Slide ${i + 1}: ${slideTitle}\n\n${slideBody}`);
        }
      }

      if (slideTexts.length === 0) {
        return res.status(400).json({ error: "No text content could be extracted from the presentation slides." });
      }

      markdown = slideTexts.join("\n\n---\n\n");

    } else if (
      mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      mimeType === "application/vnd.ms-excel" ||
      /\.(xlsx|xls|csv)$/i.test(fileName)
    ) {
      // ── Excel (.xlsx / .xls / .csv) conversion ──
      const workbook = XLSX.read(buffer, { type: "buffer" });
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        return res.status(400).json({ error: "The Excel workbook contains no sheets." });
      }

      const sheetMarkdowns: string[] = [];
      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const csvText = XLSX.utils.sheet_to_csv(worksheet);
        if (!csvText || !csvText.trim()) continue;

        const lines = csvText.split("\n").filter((l) => l.trim() !== "");
        if (lines.length === 0) continue;

        const tableRows = lines.map((line) => {
          const cells = line.split(",").map((c) => c.replace(/^"|"$/g, "").trim());
          return `| ${cells.join(" | ")} |`;
        });

        if (tableRows.length > 0) {
          const header = tableRows[0];
          const colCount = (header.match(/\|/g) || []).length - 1;
          const separator = `| ${Array(Math.max(1, colCount)).fill("---").join(" | ")} |`;
          const body = tableRows.slice(1).join("\n");
          const tableMd = `${header}\n${separator}\n${body}`;

          sheetMarkdowns.push(`## Sheet: ${sheetName}\n\n${tableMd}`);
        }
      }

      if (sheetMarkdowns.length === 0) {
        return res.status(400).json({ error: "No tabular data found in the spreadsheet." });
      }

      markdown = sheetMarkdowns.join("\n\n---\n\n");

    } else if (
      mimeType === "application/epub+zip" ||
      fileName.endsWith(".epub")
    ) {
      // ── EPUB e-book conversion ──
      const zip = await JSZip.loadAsync(buffer);
      const htmlFiles = Object.keys(zip.files)
        .filter((name) => /\.(html|xhtml|htm)$/i.test(name) && !name.includes("toc"))
        .sort();

      if (htmlFiles.length === 0) {
        return res.status(400).json({ error: "The EPUB e-book appears to contain no HTML chapters." });
      }

      const chapterMarkdowns: string[] = [];
      for (const filePath of htmlFiles) {
        const rawHtml = await zip.files[filePath].async("text");
        const cleanHtml = rawHtml
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
          .replace(/<head\b[^<]*(?:(?!<\/head>)<[^<]*)*<\/head>/gi, "");

        const chapterMd = turndownService.turndown(cleanHtml).trim();
        if (chapterMd && chapterMd.length > 10) {
          chapterMarkdowns.push(chapterMd);
        }
      }

      if (chapterMarkdowns.length === 0) {
        return res.status(400).json({ error: "No readable text content could be extracted from the EPUB e-book." });
      }

      markdown = chapterMarkdowns.join("\n\n---\n\n");

    } else if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
      // ── PDF conversion ──
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      try {
        const result = await parser.getText();

        // Use per-page text extraction (avoids "-- X of Y --" separators)
        if (result.pages && result.pages.length > 0) {
          markdown = pdfTextToMarkdown(result.pages);
        } else {
          // Fallback: clean up the raw text
          markdown = result.text
            .replace(/\n--\s*\d+\s+of\s+\d+\s*--\n/g, "\n\n")
            .trim();
        }

        // Detect blank/empty PDFs (scanned images with no selectable text)
        const textContent = markdown.replace(/[#\-\s|>*_`]/g, "").trim();
        if (!textContent || textContent.length < 5) {
          return res.status(400).json({
            error: "This PDF appears to be a scanned image or contains no selectable text. Please use a PDF with selectable text or upload the document as an image file (PNG/JPG) for OCR extraction.",
          });
        }

        if (result.total > 20) {
          warning = `PDF has ${result.total} pages. Parsing may be imperfect for complex layouts.`;
        }
      } finally {
        await parser.destroy();
      }
    } else {
      return res.status(400).json({ error: "Unsupported file type. Please upload a .pdf, .docx, .html file or an image (.png, .jpg)." });
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
    if (errorMsg.includes('Invalid file signature') || errorMsg.includes('Invalid PDF')) {
        errorMessage = "File is corrupted or not a valid document format. Please check the file and try again.";
    } else if (errorMsg.includes('password') || errorMsg.includes('Password')) {
        errorMessage = "This PDF is password-protected. Please remove the password and try again.";
    } else if (errorMsg.includes('timeout')) {
        errorMessage = "Conversion timed out. The document may be too complex or too large.";
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
}

export async function handleUrlConversion(req: Request, res: Response) {
  const startTime = Date.now();
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string" || !url.startsWith("http")) {
      return res.status(400).json({ error: "Please provide a valid HTTP or HTTPS URL." });
    }

    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ConvertOneAI/1.0" },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return res.status(400).json({ error: `Failed to fetch URL: HTTP ${response.status} ${response.statusText}` });
    }

    const htmlText = await response.text();
    const cleanHtml = htmlText
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

    const markdown = turndownService.turndown(cleanHtml);
    const durationMs = Date.now() - startTime;

    // Record stats
    addConversionLog({
      fileName: url,
      fileSizeKb: Math.round(htmlText.length / 1024),
      fileExt: "url",
      mode: "classic",
      durationMs,
      status: "success",
    });

    res.status(200).json({
      success: true,
      markdown,
      modeUsed: "classic",
      durationMs,
    });
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    addConversionLog({
      fileName: req.body.url || "unknown_url",
      fileSizeKb: 0,
      fileExt: "url",
      mode: "classic",
      durationMs,
      status: "failed",
    });

    console.error("[URL Conversion Error]", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process URL conversion.",
    });
  }
}