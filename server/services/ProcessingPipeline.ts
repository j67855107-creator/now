/**
 * Processing Pipeline (Event-Driven Core Orchestrator)
 *
 * The heart of the AI Document Processing Platform.
 * Processes documents through configurable stages.
 * Emits events for each stage so the frontend can update progress.
 *
 * Pipeline stages are independent modules that can be reordered,
 * removed, or extended without affecting other stages.
 */

import { EventEmitter } from "events";
import type { ProcessingStage, ProcessingStatus, PipelineEvent, AIEnhancedResult, DocumentAnalysis, AIReadinessScore, AISummary } from "../../src/types";
import { CacheService } from "./CacheService";
import { AnalyticsService } from "./AnalyticsService";
import { DocumentCleanerService, type CleanerOptions } from "./DocumentCleanerService";
import { DocumentAnalyzerService } from "./DocumentAnalyzerService";
import { DocumentTypeRegistry } from "../../src/ai/registries/DocumentTypeRegistry";

// ─── Pipeline Events ────────────────────────────────────────
export const PIPELINE_EVENTS = {
  START: "pipeline:start",
  STAGE_START: "pipeline:stage-start",
  STAGE_END: "pipeline:stage-end",
  PROGRESS: "pipeline:progress",
  COMPLETE: "pipeline:complete",
  ERROR: "pipeline:error",
  CANCEL: "pipeline:cancel",
  RETRY: "pipeline:retry",
} as const;

// ─── Pipeline Options ──────────────────────────────────────
export interface PipelineOptions {
  fileId: string;
  fileName: string;
  markdown: string;
  pageCount?: number;
  cleanForAI: boolean;
  generateSummary: boolean;
  cleanOptions?: Partial<CleanerOptions>;
}

// ─── Pipeline Stage Configuration ──────────────────────────
interface StageConfig {
  id: ProcessingStage;
  name: string;
  weight: number; // Percentage of total progress
  handler: (data: PipelineContext) => Promise<void>;
  timeout: number; // milliseconds
}

interface PipelineContext {
  markdown: string;
  cleanMarkdown?: string;
  aiMarkdown?: string;
  analysis?: DocumentAnalysis;
  readiness?: AIReadinessScore;
  summary?: AISummary;
  errors: string[];
  warnings: string[];
}

/**
 * Processing Pipeline — Event-Driven Core Orchestrator
 *
 * Emits events:
 * - pipeline:start { stage, percent, timestamp }
 * - pipeline:stage-start { stage, percent, timestamp }
 * - pipeline:stage-end { stage, percent, timestamp, data }
 * - pipeline:progress { stage, percent, eta, step, startTime }
 * - pipeline:complete { stage: "complete", percent: 100, data }
 * - pipeline:error { stage, percent, error }
 * - pipeline:cancel { stage, percent }
 */
export class ProcessingPipeline extends EventEmitter {
  private static instance: ProcessingPipeline;
  private isRunning = false;
  private isCancelled = false;
  private startTime = 0;
  private currentStage = "";
  private completedWeight = 0;
  private stages: StageConfig[] = [];
  private context: PipelineContext = {
    markdown: "",
    errors: [],
    warnings: [],
  };

  private constructor() {
    super();
    this.setupStages();
  }

  /**
   * Get the singleton pipeline instance.
   */
  static getInstance(): ProcessingPipeline {
    if (!this.instance) {
      this.instance = new ProcessingPipeline();
    }
    return this.instance;
  }

  /**
   * Configure the pipeline stages.
   * Stages are ordered and can be extended by adding to this array.
   */
  private setupStages(): void {
    this.stages = [
      {
        id: "validating",
        name: "Validating document...",
        weight: 5,
        handler: this.stageValidate.bind(this),
        timeout: 10_000,
      },
      {
        id: "extracting",
        name: "Extracting text content...",
        weight: 15,
        handler: this.stageExtract.bind(this),
        timeout: 60_000,
      },
      {
        id: "cleaning",
        name: "Cleaning document for AI...",
        weight: 20,
        handler: this.stageClean.bind(this),
        timeout: 30_000,
      },
      {
        id: "analyzing",
        name: "Analyzing document structure...",
        weight: 20,
        handler: this.stageAnalyze.bind(this),
        timeout: 30_000,
      },
      {
        id: "summarizing",
        name: "Generating summaries...",
        weight: 15,
        handler: this.stageSummarize.bind(this),
        timeout: 30_000,
      },
      {
        id: "generating",
        name: "Preparing AI outputs...",
        weight: 15,
        handler: this.stageGenerate.bind(this),
        timeout: 30_000,
      },
      {
        id: "exporting",
        name: "Preparing exports...",
        weight: 10,
        handler: this.stageExport.bind(this),
        timeout: 10_000,
      },
    ];
  }

  /**
   * Run the pipeline with the given options.
   * @param options - Pipeline processing options
   * @returns Promise resolving with the enhanced result
   */
  async run(options: PipelineOptions): Promise<AIEnhancedResult> {
    if (this.isRunning) {
      throw new Error("Pipeline is already running");
    }

    this.isRunning = true;
    this.isCancelled = false;
    this.startTime = Date.now();
    this.completedWeight = 0;
    this.context = {
      markdown: options.markdown,
      errors: [],
      warnings: [],
    };

    // Check cache first
    const cacheKey = CacheService.generateKey(options.markdown, {
      clean: options.cleanForAI,
      summarize: options.generateSummary,
    });

    const cached = CacheService.get<AIEnhancedResult>(cacheKey);
    if (cached) {
      this.emit(PIPELINE_EVENTS.COMPLETE, {
        type: PIPELINE_EVENTS.COMPLETE,
        stage: "complete" as ProcessingStage,
        percent: 100,
        timestamp: Date.now(),
        data: cached,
      });
      this.isRunning = false;
      return cached;
    }

    try {
      // Emit pipeline start
      this.emit(PIPELINE_EVENTS.START, {
        type: PIPELINE_EVENTS.START,
        stage: "uploading" as ProcessingStage,
        percent: 0,
        timestamp: Date.now(),
      });

      // Run stages sequentially
      for (const stage of this.stages) {
        if (this.isCancelled) {
          this.emit(PIPELINE_EVENTS.CANCEL, {
            type: PIPELINE_EVENTS.CANCEL,
            stage: stage.id,
            percent: this.completedWeight,
            timestamp: Date.now(),
          });
          throw new Error("Pipeline cancelled");
        }

        // Check if we should skip this stage
        if (stage.id === "cleaning" && !options.cleanForAI) {
          this.completedWeight += stage.weight;
          continue;
        }
        if (stage.id === "summarizing" && !options.generateSummary) {
          this.completedWeight += stage.weight;
          continue;
        }

        // Emit stage start
        this.currentStage = stage.id;
        this.emit(PIPELINE_EVENTS.STAGE_START, {
          type: PIPELINE_EVENTS.STAGE_START,
          stage: stage.id,
          percent: this.completedWeight,
          timestamp: Date.now(),
        });

        // Emit progress
        this.emitProgress(stage.id);

        // Run stage with timeout
        await this.runStageWithTimeout(stage);

        // Stage complete
        this.completedWeight += stage.weight;
        this.emit(PIPELINE_EVENTS.STAGE_END, {
          type: PIPELINE_EVENTS.STAGE_END,
          stage: stage.id,
          percent: this.completedWeight,
          timestamp: Date.now(),
        });
      }

      // Build result
      const result: AIEnhancedResult = {
        markdown: this.context.markdown,
        cleanMarkdown: this.context.cleanMarkdown,
        aiMarkdown: this.context.aiMarkdown,
        analysis: this.context.analysis,
        readiness: this.context.readiness,
        summary: this.context.summary,
        warnings: this.context.warnings,
      };

      // Cache result
      CacheService.set(cacheKey, result);

      // Track analytics
      AnalyticsService.trackFeatureUsage("pipeline", true, Date.now() - this.startTime);

      // Emit complete
      this.emit(PIPELINE_EVENTS.COMPLETE, {
        type: PIPELINE_EVENTS.COMPLETE,
        stage: "complete" as ProcessingStage,
        percent: 100,
        timestamp: Date.now(),
        data: result,
      });

      return result;
    } catch (error: any) {
      this.context.errors.push(error.message);

      AnalyticsService.trackFeatureUsage("pipeline", false, Date.now() - this.startTime);

      this.emit(PIPELINE_EVENTS.ERROR, {
        type: PIPELINE_EVENTS.ERROR,
        stage: this.currentStage as ProcessingStage,
        percent: this.completedWeight,
        timestamp: Date.now(),
        data: { error: error.message },
      });

      return {
        markdown: options.markdown,
        warnings: [error.message],
        errors: this.context.errors,
      } as AIEnhancedResult;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Cancel the current pipeline run.
   */
  cancel(): void {
    this.isCancelled = true;
  }

  /**
   * Check if the pipeline is currently running.
   */
  get running(): boolean {
    return this.isRunning;
  }

  /**
   * Get current progress percentage.
   */
  get progress(): number {
    return this.completedWeight;
  }

  /**
   * Run a stage with a timeout guard.
   */
  private async runStageWithTimeout(stage: StageConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Stage "${stage.id}" timed out after ${stage.timeout}ms`));
      }, stage.timeout);

      stage
        .handler(this.context)
        .then(() => {
          clearTimeout(timeout);
          resolve();
        })
        .catch((err) => {
          clearTimeout(timeout);
          reject(err);
        });
    });
  }

  /**
   * Emit a progress event with ETA calculation.
   */
  private emitProgress(stageId: string): void {
    const elapsed = Date.now() - this.startTime;
    const remainingWeight = 100 - this.completedWeight;
    const etaMs = remainingWeight > 0 ? (elapsed / Math.max(1, this.completedWeight)) * remainingWeight : 0;
    const etaSeconds = Math.round(etaMs / 1000);
    const eta = etaSeconds > 60 ? `${Math.floor(etaSeconds / 60)}m ${etaSeconds % 60}s` : `${etaSeconds}s`;

    this.emit(PIPELINE_EVENTS.PROGRESS, {
      type: PIPELINE_EVENTS.PROGRESS,
      stage: stageId as ProcessingStage,
      percent: this.completedWeight,
      eta,
      step: stageId,
      startTime: this.startTime,
    });
  }

  // ─── Stage Handlers ───────────────────────────────────────
  // Each stage is an independent module. New stages can be added
  // by creating a handler function and adding to the stages array.

  private async stageValidate(ctx: PipelineContext): Promise<void> {
    // Markdown is already validated by the controller
    if (!ctx.markdown || ctx.markdown.trim().length === 0) {
      throw new Error("Document content is empty");
    }
    if (ctx.markdown.length > 10_000_000) {
      throw new Error("Document exceeds maximum size for AI processing");
    }
  }

  private async stageExtract(ctx: PipelineContext): Promise<void> {
    // Content is already extracted by the conversion service
    // This stage ensures the content is ready for downstream processing
    if (!ctx.markdown) {
      throw new Error("No extracted content available");
    }
  }

  private async stageClean(ctx: PipelineContext): Promise<void> {
    const cleaned = DocumentCleanerService.clean(ctx.markdown, {
      removeHeaders: true,
      removeFooters: true,
      removePageNumbers: true,
      removeDuplicates: true,
      mergeParagraphs: true,
      normalizeWhitespace: true,
      improveHeadings: true,
      preserveTables: true,
    });

    ctx.cleanMarkdown = cleaned;

    // Generate AI-optimized version (extra clean for LLM consumption)
    ctx.aiMarkdown = DocumentCleanerService.clean(ctx.markdown, {
      removeHeaders: true,
      removeFooters: true,
      removePageNumbers: true,
      removeDuplicates: true,
      mergeParagraphs: true,
      normalizeWhitespace: true,
      improveHeadings: true,
      preserveTables: false, // Tables in clean Markdown for AI
    });

    ctx.warnings.push(`Cleaning reduced document by ${ctx.markdown.length - cleaned.length} characters`);
  }

  private async stageAnalyze(ctx: PipelineContext): Promise<void> {
    const textToAnalyze = ctx.cleanMarkdown || ctx.markdown;
    const result = DocumentAnalyzerService.analyze(textToAnalyze);
    ctx.analysis = result.analysis;
    ctx.readiness = result.readiness;
  }

  private async stageSummarize(ctx: PipelineContext): Promise<void> {
    const text = ctx.cleanMarkdown || ctx.markdown;
    const wordCount = DocumentAnalyzerService.countWords(text);
    const headingCount = DocumentAnalyzerService.countHeadings(text);

    // Generate short summary (first ~100 words as a heuristic extractive summary)
    const words = text.split(/\s+/);
    const shortSummaryWords = words.slice(0, 100).join(" ");
    const shortSummary = shortSummaryWords.length < text.length
      ? shortSummaryWords + "..."
      : shortSummaryWords;

    // Generate detailed summary (first ~300 words)
    const detailedSummaryWords = words.slice(0, 300).join(" ");
    const detailedSummary = detailedSummaryWords.length < text.length
      ? detailedSummaryWords + "..."
      : detailedSummaryWords;

    // Extract keywords (most frequent significant words)
    const keywords = this.extractKeywords(text, 10);

    // Generate key points from headings + first sentences
    const keyPoints = this.extractKeyPoints(text, 5);

    ctx.summary = {
      short: shortSummary,
      detailed: detailedSummary,
      keywords,
      keyPoints,
    };
  }

  private async stageGenerate(ctx: PipelineContext): Promise<void> {
    // Generate AI Markdown (if not already done in clean stage)
    if (!ctx.aiMarkdown && ctx.cleanMarkdown) {
      ctx.aiMarkdown = ctx.cleanMarkdown;
    }
  }

  private async stageExport(ctx: PipelineContext): Promise<void> {
    // Export is handled by the frontend ExportCenter component
    // This stage ensures all data is ready for export
  }

  /**
   * Extract keywords from text using frequency analysis.
   */
  private extractKeywords(text: string, count: number): string[] {
    const stopWords = new Set([
      "the", "a", "an", "and", "or", "but", "in", "on", "at", "to",
      "for", "of", "with", "by", "from", "as", "is", "was", "are",
      "were", "be", "been", "being", "have", "has", "had", "do",
      "does", "did", "will", "would", "could", "should", "may",
      "might", "shall", "can", "need", "dare", "ought", "used",
      "this", "that", "these", "those", "it", "its", "they", "them",
      "their", "we", "us", "our", "you", "your", "he", "she", "his",
      "her", "him", "who", "whom", "which", "what", "not", "no",
      "nor", "so", "if", "then", "than", "too", "very", "just",
      "about", "above", "after", "again", "all", "also", "any",
      "because", "before", "between", "both", "each", "few", "more",
      "most", "other", "some", "such", "only", "own", "same",
    ]);

    const words = text
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stopWords.has(w));

    const freq = new Map<string, number>();
    words.forEach((w) => freq.set(w, (freq.get(w) || 0) + 1));

    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([word]) => word);
  }

  /**
   * Extract key points from headings and first sentences.
   */
  private extractKeyPoints(text: string, count: number): string[] {
    const points: string[] = [];

    // Extract from headings
    const headings = text.match(/^#{1,3}\s+(.+)$/gm);
    if (headings) {
      headings.forEach((h) => {
        const clean = h.replace(/^#+\s+/, "").trim();
        if (clean && !points.includes(clean)) {
          points.push(clean);
        }
      });
    }

    // Extract first sentences of paragraphs
    const paragraphs = text.split(/\n\n+/);
    paragraphs.forEach((p) => {
      const clean = p.replace(/^#+\s*/, "").trim();
      if (clean && points.length < count * 2) {
        const firstSentence = clean.split(/[.!?]/)[0];
        if (firstSentence && firstSentence.length > 20) {
          points.push(firstSentence.trim());
        }
      }
    });

    return points.slice(0, count);
  }

  /**
   * Reset the pipeline state.
   */
  reset(): void {
    this.isRunning = false;
    this.isCancelled = false;
    this.completedWeight = 0;
    this.context = {
      markdown: "",
      errors: [],
      warnings: [],
    };
    this.removeAllListeners();
  }
}

