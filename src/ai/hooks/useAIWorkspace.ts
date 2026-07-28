/**
 * useAIWorkspace Hook
 *
 * Central state management for the AI Workspace.
 * All AI-related state lives here, NOT in App.tsx.
 * Future AI features can extend this hook without modifying App.tsx.
 */

import { useState, useCallback, useRef } from "react";
import type {
  AIOptions,
  AIEnhancedResult,
  AISummary,
  DocumentAnalysis,
  AIReadinessScore,
  GeneratedPrompt,
  RAGExportResult,
  ProcessingStatus,
  ProcessingStage,
  ProgressInfo,
  PromptTemplateId,
  AIProviderId,
  RAGExportFormat,
  ExportFormatId,
} from "../../types";
import { API_BASE } from "../../api";

const VITE_API_PROTECTION_KEY = import.meta.env.VITE_API_PROTECTION_KEY || "WN3FBAF2GYF";

interface AIWorkspaceState {
  aiOptions: AIOptions;
  status: ProcessingStatus;
  progress: ProgressInfo | null;
  enhancedResult: AIEnhancedResult | null;
  summary: AISummary | undefined;
  analysis: DocumentAnalysis | null;
  readiness: AIReadinessScore | null;
  prompts: GeneratedPrompt[];
  ragResult: RAGExportResult | null;
  activeTab: string;
  error: string | null;
}

const defaultAIOptions: AIOptions = {
  cleanForAI: false,
  generateSummary: false,
  generatePrompt: false,
  generateRAG: false,
};

const defaultProgress: ProgressInfo = {
  stage: "idle",
  percent: 0,
  eta: "--",
  step: "idle",
  startTime: 0,
};

export function useAIWorkspace() {
  const [state, setState] = useState<AIWorkspaceState>({
    aiOptions: defaultAIOptions,
    status: "idle",
    progress: null,
    enhancedResult: null,
    summary: undefined,
    analysis: null,
    readiness: null,
    prompts: [],
    ragResult: null,
    activeTab: "summary",
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // ─── Actions ─────────────────────────────────────────────

  const setAIOptions = useCallback((options: Partial<AIOptions>) => {
    setState((prev) => ({
      ...prev,
      aiOptions: { ...prev.aiOptions, ...options },
    }));
  }, []);

  const setActiveTab = useCallback((tab: string) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  }, []);

  const resetAIState = useCallback(() => {
    setState({
      aiOptions: defaultAIOptions,
      status: "idle",
      progress: null,
      enhancedResult: null,
      summary: undefined,
      analysis: null,
      readiness: null,
      prompts: [],
      ragResult: null,
      activeTab: "summary",
      error: null,
    });
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, []);

  /**
   * Run the full AI processing pipeline.
   * @param markdown - The converted Markdown content
   * @param fileName - Original file name
   * @param pageCount - Number of pages (if known)
   */
  const runProcessing = useCallback(async (
    markdown: string,
    fileName?: string,
    pageCount?: number
  ) => {
    const { cleanForAI, generateSummary } = state.aiOptions;
    if (!cleanForAI && !generateSummary) {
      // No AI processing needed
      return;
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setState((prev) => ({
      ...prev,
      status: "processing",
      progress: { ...defaultProgress, stage: "uploading", step: "Starting AI processing..." },
      error: null,
    }));

    try {
      // Simulate realistic progress stages for better UX
      const stages: ProcessingStage[] = ["uploading", "validating", "extracting", "cleaning", "analyzing", "summarizing", "generating", "exporting"];
      const stepNames: Record<ProcessingStage, string> = {
        idle: "Ready",
        uploading: "Uploading document securely...",
        validating: "Verifying file integrity...",
        extracting: "Extracting text content...",
        cleaning: "Cleaning document for AI...",
        analyzing: "Analyzing document structure...",
        summarizing: "Generating summaries...",
        generating: "Preparing AI outputs...",
        exporting: "Preparing final exports...",
        complete: "Completed Successfully ✓",
        error: "Processing Failed ✗",
        cancelled: "Cancelled",
      };

      // First, call analyze
      setState((prev) => ({
        ...prev,
        progress: { stage: "analyzing", percent: 30, eta: "~30s", step: "Analyzing document structure...", startTime: Date.now() },
      }));

      const analyzeRes = await fetch(API_BASE + "/api/ai/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": VITE_API_PROTECTION_KEY,
        },
        body: JSON.stringify({ markdown, title: fileName, pageCount }),
        signal,
      });

      if (!analyzeRes.ok) throw new Error("Analysis failed");
      const analyzeData = await analyzeRes.json();

      setState((prev) => ({
        ...prev,
        analysis: analyzeData.analysis,
        readiness: analyzeData.readiness,
        progress: { stage: "analyzing", percent: 60, eta: "~15s", step: "Completed analysis", startTime: Date.now() },
      }));

      // Then clean if requested
      let cleanMarkdown = markdown;
      if (cleanForAI) {
        setState((prev) => ({
          ...prev,
          progress: { stage: "cleaning", percent: 50, eta: "~20s", step: "Cleaning document for AI...", startTime: Date.now() },
        }));

        const cleanRes = await fetch(API_BASE + "/api/ai/clean", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": VITE_API_PROTECTION_KEY,
          },
          body: JSON.stringify({ markdown }),
          signal,
        });

        if (cleanRes.ok) {
          const cleanData = await cleanRes.json();
          cleanMarkdown = cleanData.markdown;
          setState((prev) => ({
            ...prev,
            progress: { stage: "cleaning", percent: 70, eta: "~10s", step: `Cleaned: reduced by ${cleanData.reduction}%`, startTime: Date.now() },
          }));
        }
      }

      // Then summarize if requested
      let summary: AISummary | undefined = undefined;
      if (generateSummary && analyzeData.analysis) {
        setState((prev) => ({
          ...prev,
          progress: { stage: "summarizing", percent: 80, eta: "~5s", step: "Generating summaries...", startTime: Date.now() },
        }));

        const text = cleanMarkdown || markdown;
        const words = text.split(/\s+/);
        const shortSummary = words.slice(0, 100).join(" ") + (words.length > 100 ? "..." : "");
        const detailedSummary = words.slice(0, 300).join(" ") + (words.length > 300 ? "..." : "");

        // Extract keywords
        const stopWords = new Set(["the","a","an","and","or","but","in","on","at","to","for","of","with","by","from","as","is","was","are","were","be","been","being","have","has","had","do","does","did","will","would","could","should","may","might","shall","can","need","dare","ought","used","this","that","these","those","it","its","they","them","their","we","us","our","you","your","he","she","his","her","him","who","whom","which","what","not","no","nor","so","if","then","than","too","very","just","about","above","after","again","all","also","any","because","before","between","both","each","few","more","most","other","some","such","only","own","same"]);
        const wordFreq = new Map<string, number>();
        text.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w)).forEach(w => wordFreq.set(w, (wordFreq.get(w) || 0) + 1));
        const keywords = Array.from(wordFreq.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([w]) => w);

        summary = { short: shortSummary, detailed: detailedSummary, keywords, keyPoints: analyzeData.analysis.recommendations?.slice(0, 5) || [] };

        setState((prev) => ({
          ...prev,
          summary,
          progress: { stage: "summarizing", percent: 90, eta: "~2s", step: "Completed summaries", startTime: Date.now() },
        }));
      }

      // Final progress
      setState((prev) => ({
        ...prev,
        status: "complete",
        progress: { stage: "complete", percent: 100, eta: "0s", step: "Completed Successfully ✓", startTime: Date.now() },
        enhancedResult: {
          markdown,
          cleanMarkdown: cleanMarkdown !== markdown ? cleanMarkdown : undefined,
          analysis: analyzeData.analysis,
          readiness: analyzeData.readiness,
          summary,
          warnings: [],
        },
      }));

    } catch (error: any) {
      if (error.name === "AbortError") {
        setState((prev) => ({ ...prev, status: "idle", progress: null }));
        return;
      }
      setState((prev) => ({
        ...prev,
        status: "error",
        error: error.message,
        progress: { stage: "error", percent: 0, eta: "--", step: error.message, startTime: Date.now() },
      }));
    }
  }, [state.aiOptions]);

  /**
   * Cancel the current processing.
   */
  const cancelProcessing = useCallback(() => {
    abortControllerRef.current?.abort();
    setState((prev) => ({
      ...prev,
      status: "idle",
      progress: null,
    }));
  }, []);

  /**
   * Retry failed processing.
   */
  const retryProcessing = useCallback(async (
    markdown: string,
    fileName?: string,
    pageCount?: number
  ) => {
    setState((prev) => ({ ...prev, error: null }));
    return runProcessing(markdown, fileName, pageCount);
  }, [runProcessing]);

  /**
   * Generate a prompt from a template.
   */
  const generatePrompt = useCallback(async (
    templateId: PromptTemplateId,
    providerId: AIProviderId,
    markdown: string,
    metadata?: { title?: string; wordCount?: string; readingTime?: string; language?: string }
  ) => {
    try {
      const res = await fetch(API_BASE + "/api/ai/prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": VITE_API_PROTECTION_KEY,
        },
        body: JSON.stringify({
          templateId,
          providerId,
          markdown,
          ...metadata,
        }),
      });
      if (!res.ok) throw new Error("Failed to generate prompt");
      const data = await res.json();

      setState((prev) => ({
        ...prev,
        prompts: [data.prompt, ...prev.prompts],
      }));

      return data;
    } catch (error: any) {
      setState((prev) => ({ ...prev, error: error.message }));
      return null;
    }
  }, []);

  /**
   * Generate RAG dataset from document.
   */
  const generateRAG = useCallback(async (
    markdown: string,
    chunkSize: 256 | 512 | 1024 = 512,
    format: RAGExportFormat = "json",
    title?: string
  ) => {
    try {
      const res = await fetch(API_BASE + "/api/ai/rag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": VITE_API_PROTECTION_KEY,
        },
        body: JSON.stringify({ markdown, chunkSize, format, title }),
      });
      if (!res.ok) throw new Error("Failed to generate RAG dataset");
      const data = await res.json();

      setState((prev) => ({
        ...prev,
        ragResult: data.result,
      }));

      return data;
    } catch (error: any) {
      setState((prev) => ({ ...prev, error: error.message }));
      return null;
    }
  }, []);

  /**
   * Export document in the specified format.
   */
  const exportDocument = useCallback(async (
    format: ExportFormatId,
    markdown: string,
    cleanMarkdown?: string,
    metadata?: Record<string, any>
  ) => {
    try {
      const res = await fetch(API_BASE + "/api/ai/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": VITE_API_PROTECTION_KEY,
        },
        body: JSON.stringify({ format, markdown, cleanMarkdown, metadata }),
      });
      if (!res.ok) throw new Error("Failed to export");
      const data = await res.json();
      return data.export;
    } catch (error: any) {
      setState((prev) => ({ ...prev, error: error.message }));
      return null;
    }
  }, []);

  return {
    // State
    aiOptions: state.aiOptions,
    status: state.status,
    progress: state.progress,
    enhancedResult: state.enhancedResult,
    summary: state.summary,
    analysis: state.analysis,
    readiness: state.readiness,
    prompts: state.prompts,
    ragResult: state.ragResult,
    activeTab: state.activeTab,
    error: state.error,

    // Actions
    setAIOptions,
    setActiveTab,
    resetAIState,
    runProcessing,
    cancelProcessing,
    retryProcessing,
    generatePrompt,
    generateRAG,
    exportDocument,
  };
}

