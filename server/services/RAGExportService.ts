/**
 * RAG Export Service
 *
 * Chunks documents for Retrieval-Augmented Generation (RAG) pipelines.
 * Supports multiple chunk sizes and export formats.
 * Each chunk includes metadata (page, source, language, title, chunk ID).
 */

import type { RAGExportFormat, RAGChunk, RAGExportResult } from "../../src/types";

export interface RAGOptions {
  chunkSize: 256 | 512 | 1024;
  format: RAGExportFormat;
  includeMetadata: boolean;
  source: string;
  language: string;
  title: string;
}

export const DEFAULT_RAG_OPTIONS: RAGOptions = {
  chunkSize: 512,
  format: "json",
  includeMetadata: true,
  source: "convertoneai",
  language: "en",
  title: "Untitled Document",
};

export class RAGExportService {
  static export(markdown: string, options: Partial<RAGOptions> = {}): RAGExportResult {
    const opts = { ...DEFAULT_RAG_OPTIONS, ...options };
    const chunks = this.chunkDocument(markdown, opts.chunkSize, opts);
    const totalTokens = chunks.reduce((sum, c) => sum + c.tokens, 0);
    return { chunks, format: opts.format, chunkSize: opts.chunkSize, totalTokens, totalChunks: chunks.length, downloadUrl: "" };
  }

  private static chunkDocument(text: string, chunkSize: number, opts: RAGOptions): RAGChunk[] {
    const chunks: RAGChunk[] = [];
    const charsPerChunk = chunkSize * 4;
    const overlap = Math.round(charsPerChunk * 0.1);
    let pos = 0;
    let id = 0;

    while (pos < text.length) {
      const end = Math.min(pos + charsPerChunk, text.length);
      let chunkText = text.substring(pos, end);
      let splitAt = end;

      if (end < text.length) {
        const pb = chunkText.lastIndexOf("\n\n");
        const sb = chunkText.lastIndexOf(". ");
        const wb = chunkText.lastIndexOf(" ");
        if (pb > charsPerChunk * 0.5) { chunkText = chunkText.substring(0, pb); splitAt = pos + pb; }
        else if (sb > charsPerChunk * 0.5) { chunkText = chunkText.substring(0, sb + 1); splitAt = pos + sb + 1; }
        else if (wb > charsPerChunk * 0.5) { chunkText = chunkText.substring(0, wb); splitAt = pos + wb; }
      }

      const tokens = Math.round(chunkText.length / 4);
      const page = Math.floor(splitAt / 2000) + 1;

      chunks.push({
        id: `chunk-${id}-${Date.now()}`,
        index: id,
        text: chunkText.trim(),
        tokens,
        metadata: opts.includeMetadata ? { page, source: opts.source, language: opts.language, title: opts.title, chunkId: id, totalChunks: 0 } : undefined as any,
      });
      id++;

      // Apply overlap: go back by overlap chars, ensure forward progress
      const next = Math.max(splitAt - overlap, splitAt + 1);
      pos = Math.min(text.length, next);
    }

    if (opts.includeMetadata) chunks.forEach((c) => { c.metadata.totalChunks = chunks.length; });
    return chunks;
  }

  static getFormattedOutput(chunks: RAGChunk[], format: RAGExportFormat): string {
    switch (format) {
      case "json": return JSON.stringify(chunks, null, 2);
      case "jsonl": return chunks.map((c) => JSON.stringify(c)).join("\n");
      case "markdown": return chunks.map((c) => `## Chunk ${c.index + 1}/${chunks.length}\n\n*Page: ${c.metadata.page} | Source: ${c.metadata.source}*\n\n${c.text}\n\n---\n`).join("\n");
      case "txt": return chunks.map((c) => `--- Chunk ${c.index + 1}/${c.metadata.totalChunks} ---\n${c.text}\n`).join("\n\n");
      default: return JSON.stringify(chunks, null, 2);
    }
  }

  static validateChunkSize(s: number): s is 256 | 512 | 1024 { return [256, 512, 1024].includes(s); }
  static validateFormat(f: string): f is RAGExportFormat { return ["json", "jsonl", "markdown", "txt"].includes(f); }
}
