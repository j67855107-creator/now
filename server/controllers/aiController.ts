/**
 * AI Controller
 *
 * Express handlers for all AI document processing endpoints.
 * Groups all AI functionality under /api/ai/*
 */

import { Request, Response } from "express";
import { DocumentCleanerService } from "../services/DocumentCleanerService";
import { DocumentAnalyzerService } from "../services/DocumentAnalyzerService";
import { PromptGeneratorService } from "../services/PromptGeneratorService";
import { RAGExportService } from "../services/RAGExportService";
import { AIExportService } from "../services/AIExportService";
import { ProcessingPipeline } from "../services/ProcessingPipeline";
import { AnalyticsService } from "../services/AnalyticsService";
import { PromptTemplateRegistry } from "../../src/ai/registries/PromptTemplateRegistry";
import type { PromptTemplateId, AIProviderId, RAGExportFormat, ExportFormatId } from "../../src/types";

/**
 * POST /api/ai/clean
 * Clean a document for AI consumption.
 */
export async function handleCleanDocument(req: Request, res: Response) {
  const startTime = Date.now();
  try {
    const { markdown, options } = req.body;
    if (!markdown) {
      return res.status(400).json({ error: "Missing markdown content" });
    }

    const cleaned = DocumentCleanerService.clean(markdown, options);

    AnalyticsService.trackFeatureUsage("ai-cleaner", true, Date.now() - startTime);

    res.json({
      success: true,
      markdown: cleaned,
      originalLength: markdown.length,
      cleanedLength: cleaned.length,
      reduction: Math.round((1 - cleaned.length / markdown.length) * 100),
    });
  } catch (error: any) {
    AnalyticsService.trackFeatureUsage("ai-cleaner", false, Date.now() - startTime);
    console.error("[AI Cleaner Error]", error);
    res.status(500).json({ error: error.message || "Failed to clean document" });
  }
}

/**
 * POST /api/ai/analyze
 * Analyze document and return intelligence + readiness score.
 */
export async function handleAnalyzeDocument(req: Request, res: Response) {
  const startTime = Date.now();
  try {
    const { markdown, title, pageCount } = req.body;
    if (!markdown) {
      return res.status(400).json({ error: "Missing markdown content" });
    }

    const { analysis, readiness } = DocumentAnalyzerService.analyze(markdown, title, pageCount);

    AnalyticsService.trackFeatureUsage("document-analyzer", true, Date.now() - startTime);

    res.json({
      success: true,
      analysis,
      readiness,
    });
  } catch (error: any) {
    AnalyticsService.trackFeatureUsage("document-analyzer", false, Date.now() - startTime);
    console.error("[AI Analyzer Error]", error);
    res.status(500).json({ error: error.message || "Failed to analyze document" });
  }
}

/**
 * POST /api/ai/prompt
 * Generate an AI prompt from a template.
 */
export async function handleGeneratePrompt(req: Request, res: Response) {
  const startTime = Date.now();
  try {
    const { templateId, providerId, markdown, title, wordCount, readingTime, language } = req.body;

    if (!markdown || !templateId || !providerId) {
      return res.status(400).json({ error: "Missing required fields: markdown, templateId, providerId" });
    }

    const prompts = PromptTemplateRegistry.getAll();
    const templateExists = prompts.some((t) => t.id === templateId);
    if (!templateExists) {
      return res.status(400).json({ error: `Invalid template ID: ${templateId}` });
    }

    const result = PromptGeneratorService.generate(
      templateId as PromptTemplateId,
      providerId as AIProviderId,
      markdown,
      { title, wordCount, readingTime, language }
    );

    if (!result) {
      return res.status(500).json({ error: "Failed to generate prompt" });
    }

    // Format for the specified provider
    const formattedPrompt = PromptGeneratorService.formatForProvider(
      result.prompt,
      providerId as AIProviderId
    );

    AnalyticsService.trackFeatureUsage("prompt-generator", true, Date.now() - startTime);

    res.json({
      success: true,
      prompt: result,
      formattedPrompt,
    });
  } catch (error: any) {
    AnalyticsService.trackFeatureUsage("prompt-generator", false, Date.now() - startTime);
    console.error("[Prompt Generator Error]", error);
    res.status(500).json({ error: error.message || "Failed to generate prompt" });
  }
}

/**
 * POST /api/ai/rag
 * Generate RAG dataset from document.
 */
export async function handleGenerateRAG(req: Request, res: Response) {
  const startTime = Date.now();
  try {
    const { markdown, chunkSize, format, title, language } = req.body;
    if (!markdown) {
      return res.status(400).json({ error: "Missing markdown content" });
    }

    // Validate chunk size
    const validSizes = [256, 512, 1024];
    const size = validSizes.includes(Number(chunkSize)) ? Number(chunkSize) : 512;

    // Validate format
    const validFormats: RAGExportFormat[] = ["json", "jsonl", "markdown", "txt"];
    const fmt = validFormats.includes(format) ? format : "json";

    const result = RAGExportService.export(markdown, {
      chunkSize: size as 256 | 512 | 1024,
      format: fmt,
      includeMetadata: true,
      source: "convertoneai",
      language: language || "en",
      title: title || "Untitled Document",
    });

    // Get formatted output
    const output = RAGExportService.getFormattedOutput(result.chunks, fmt);

    AnalyticsService.trackFeatureUsage("rag-export", true, Date.now() - startTime);

    res.json({
      success: true,
      result,
      output,
    });
  } catch (error: any) {
    AnalyticsService.trackFeatureUsage("rag-export", false, Date.now() - startTime);
    console.error("[RAG Export Error]", error);
    res.status(500).json({ error: error.message || "Failed to generate RAG dataset" });
  }
}

/**
 * POST /api/ai/export
 * Export document in specified format.
 */
export async function handleExport(req: Request, res: Response) {
  const startTime = Date.now();
  try {
    const { format, markdown, cleanMarkdown, aiMarkdown, metadata } = req.body;
    if (!markdown || !format) {
      return res.status(400).json({ error: "Missing required fields: markdown, format" });
    }

    const result = AIExportService.export({
      format: format as ExportFormatId,
      markdown,
      cleanMarkdown,
      aiMarkdown,
      metadata,
    });

    if (!result) {
      return res.status(400).json({ error: `Invalid export format: ${format}` });
    }

    AnalyticsService.trackFeatureUsage("ai-export", true, Date.now() - startTime);

    res.json({
      success: true,
      export: result,
    });
  } catch (error: any) {
    AnalyticsService.trackFeatureUsage("ai-export", false, Date.now() - startTime);
    console.error("[AI Export Error]", error);
    res.status(500).json({ error: error.message || "Failed to export document" });
  }
}

/**
 * POST /api/ai/process
 * Run the full processing pipeline (clean, analyze, summarize).
 */
export async function handleFullProcess(req: Request, res: Response) {
  const startTime = Date.now();
  try {
    const { markdown, fileName, pageCount, cleanForAI, generateSummary } = req.body;
    if (!markdown || !fileName) {
      return res.status(400).json({ error: "Missing required fields: markdown, fileName" });
    }

    const pipeline = ProcessingPipeline.getInstance();
    const result = await pipeline.run({
      fileId: `file-${Date.now()}`,
      fileName,
      markdown,
      pageCount,
      cleanForAI: cleanForAI !== false,
      generateSummary: generateSummary !== false,
    });

    AnalyticsService.trackFeatureUsage("ai-full-process", true, Date.now() - startTime);

    res.json({
      success: true,
      result,
      processingTimeMs: Date.now() - startTime,
    });
  } catch (error: any) {
    AnalyticsService.trackFeatureUsage("ai-full-process", false, Date.now() - startTime);
    console.error("[AI Full Process Error]", error);
    res.status(500).json({ error: error.message || "Failed to process document" });
  }
}

/**
 * POST /api/ai/cancel
 * Cancel the running pipeline.
 */
export async function handleCancelProcessing(req: Request, res: Response) {
  try {
    const pipeline = ProcessingPipeline.getInstance();
    pipeline.cancel();
    res.json({ success: true, message: "Processing cancelled" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to cancel processing" });
  }
}

/**
 * GET /api/ai/templates
 * Get all available prompt templates.
 */
export async function handleGetTemplates(req: Request, res: Response) {
  try {
    const templates = PromptTemplateRegistry.getAll();
    res.json({
      success: true,
      templates: templates.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        icon: t.icon,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to retrieve templates" });
  }
}

/**
 * GET /api/ai/analytics
 * Get anonymous feature usage analytics (admin only).
 */
export async function handleGetAnalytics(req: Request, res: Response) {
  try {
    const snapshot = AnalyticsService.getSnapshot();
    res.json({
      success: true,
      analytics: snapshot,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to retrieve analytics" });
  }
}

