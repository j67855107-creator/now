/**
 * AI Export Service
 *
 * Orchestrates final output formatting for all export types.
 * Works with ExportRegistry to determine available formats.
 * New export formats can be added by registering them in ExportRegistry.
 */

import type {
  ExportFormatId,
  RAGExportResult,
  GeneratedPrompt,
} from "../../src/types";
import { ExportRegistry } from "../../src/ai/registries/ExportRegistry";

export interface ExportRequest {
  format: ExportFormatId;
  markdown: string;
  cleanMarkdown?: string;
  aiMarkdown?: string;
  prompt?: GeneratedPrompt;
  ragExport?: RAGExportResult;
  metadata?: Record<string, any>;
}

export interface ExportResult {
  content: string;
  fileName: string;
  mimeType: string;
  extension: string;
  sizeBytes: number;
}

export class AIExportService {
  static export(request: ExportRequest): ExportResult | null {
    const format = ExportRegistry.get(request.format);
    if (!format || !format.isEnabled) return null;
    let content = "";
    let extension = format.extension;
    switch (request.format) {
      case "markdown": content = request.markdown; break;
      case "clean-markdown": content = request.cleanMarkdown || request.markdown; break;
      case "ai-markdown": content = request.aiMarkdown || request.markdown; break;
      case "json": content = this.exportAsJSON(request); extension = ".json"; break;
      case "jsonl": content = this.exportAsJSONL(request); extension = ".jsonl"; break;
      case "txt": content = this.exportAsTXT(request); extension = ".txt"; break;
      case "prompt": content = request.prompt?.prompt || request.markdown; break;
      case "rag-dataset": content = this.exportRAGDataset(request); break;
      default: content = request.markdown;
    }
    const sizeBytes = Buffer.byteLength(content, "utf-8");
    const baseName = request.metadata?.title || "document";
    const safeName = baseName.replace(/[^a-zA-Z0-9-_]/g, "_").substring(0, 50);
    return { content, fileName: `${safeName}${extension}`, mimeType: format.mimeType, extension, sizeBytes };
  }

  private static exportAsJSON(request: ExportRequest): string {
    const output: Record<string, any> = {
      content: request.markdown,
      metadata: { ...request.metadata, exportedAt: new Date().toISOString(), format: "markdown" },
    };
    if (request.cleanMarkdown) output.cleanContent = request.cleanMarkdown;
    if (request.aiMarkdown) output.aiOptimizedContent = request.aiMarkdown;
    if (request.ragExport) output.ragChunks = request.ragExport.chunks;
    if (request.prompt) output.generatedPrompt = request.prompt;
    return JSON.stringify(output, null, 2);
  }

  private static exportAsJSONL(request: ExportRequest): string {
    const lines: string[] = [JSON.stringify({ type: "content", text: request.markdown })];
    if (request.metadata) lines.push(JSON.stringify({ type: "metadata", ...request.metadata }));
    if (request.ragExport?.chunks) {
      request.ragExport.chunks.forEach((chunk) => {
        lines.push(JSON.stringify({ type: "chunk", index: chunk.index, text: chunk.text, tokens: chunk.tokens, metadata: chunk.metadata }));
      });
    }
    if (request.prompt) lines.push(JSON.stringify({ type: "prompt", templateId: request.prompt.templateId, providerId: request.prompt.providerId, text: request.prompt.prompt }));
    return lines.join("\n");
  }

  private static exportAsTXT(request: ExportRequest): string {
    const lines: string[] = [];
    lines.push("=".repeat(60));
    lines.push("ConvertOneAI Document Export");
    lines.push("=".repeat(60));
    lines.push("");
    if (request.metadata?.title) lines.push(`Title: ${request.metadata.title}`);
    if (request.metadata?.wordCount) lines.push(`Word Count: ${request.metadata.wordCount}`);
    lines.push(`Export Date: ${new Date().toISOString()}`);
    lines.push("");
    lines.push("=".repeat(60));
    lines.push("");
    lines.push(request.markdown);
    return lines.join("\n");
  }

  private static exportRAGDataset(request: ExportRequest): string {
    if (!request.ragExport) return JSON.stringify([], null, 2);
    return JSON.stringify(request.ragExport.chunks.map((c) => ({ id: c.id, text: c.text, metadata: c.metadata })), null, 2);
  }

  static exportAll(request: Omit<ExportRequest, "format">): Record<ExportFormatId, ExportResult | null> {
    const formats = ExportRegistry.getEnabled();
    const results: Record<string, ExportResult | null> = {};
    formats.forEach((format) => { results[format.id] = this.export({ ...request, format: format.id }); });
    return results as Record<ExportFormatId, ExportResult | null>;
  }
}
