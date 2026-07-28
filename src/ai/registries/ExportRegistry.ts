/**
 * Export Registry
 *
 * All export formats are registered here. Adding a new export
 * format only requires registering it in this file — no
 * component changes needed.
 *
 * Future: NotionExport, ObsidianExport, VectorDBExport, etc.
 */

import type { ExportFormat, ExportFormatId } from "../../types";

export class ExportRegistry {
  private static formats: Map<ExportFormatId, ExportFormat> = new Map();

  /**
   * Initialize built-in export formats.
   * Call once at application startup.
   */
  static initialize(): void {
    const builtIn: ExportFormat[] = [
      {
        id: "markdown",
        name: "Markdown",
        description: "Standard Markdown (.md)",
        icon: "FileText",
        extension: ".md",
        mimeType: "text/markdown",
        isEnabled: true,
      },
      {
        id: "clean-markdown",
        name: "Clean Markdown",
        description: "AI-preprocessed clean Markdown",
        icon: "Sparkles",
        extension: ".md",
        mimeType: "text/markdown",
        isEnabled: true,
      },
      {
        id: "ai-markdown",
        name: "AI Markdown",
        description: "LLM-optimized Markdown with metadata",
        icon: "Brain",
        extension: ".md",
        mimeType: "text/markdown",
        isEnabled: true,
      },
      {
        id: "json",
        name: "JSON",
        description: "Structured JSON output with metadata",
        icon: "Braces",
        extension: ".json",
        mimeType: "application/json",
        isEnabled: true,
      },
      {
        id: "jsonl",
        name: "JSONL",
        description: "JSON Lines format for RAG pipelines",
        icon: "List",
        extension: ".jsonl",
        mimeType: "application/jsonl",
        isEnabled: true,
      },
      {
        id: "txt",
        name: "TXT",
        description: "Plain text output",
        icon: "File",
        extension: ".txt",
        mimeType: "text/plain",
        isEnabled: true,
      },
      {
        id: "prompt",
        name: "Prompt",
        description: "AI prompt file for ChatGPT/Claude/Gemini",
        icon: "MessageSquare",
        extension: ".md",
        mimeType: "text/markdown",
        isEnabled: true,
      },
      {
        id: "rag-dataset",
        name: "RAG Dataset",
        description: "Chunked document for RAG ingestion",
        icon: "Database",
        extension: ".json",
        mimeType: "application/json",
        isEnabled: true,
      },
    ];

    builtIn.forEach((fmt) => this.formats.set(fmt.id, fmt));
  }

  /**
   * Register a new export format.
   * @param format - The export format to register
   */
  static register(format: ExportFormat): void {
    this.formats.set(format.id, format);
  }

  /**
   * Get an export format by ID.
   */
  static get(id: ExportFormatId): ExportFormat | undefined {
    return this.formats.get(id);
  }

  /**
   * Get all registered export formats.
   */
  static getAll(): ExportFormat[] {
    return Array.from(this.formats.values());
  }

  /**
   * Get all enabled export formats.
   */
  static getEnabled(): ExportFormat[] {
    return this.getAll().filter((f) => f.isEnabled);
  }
}

