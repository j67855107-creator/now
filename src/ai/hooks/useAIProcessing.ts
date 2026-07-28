/**
 * useAIProcessing Hook
 *
 * Manages the AI processing pipeline states directly.
 * Provides fine-grained control over pipeline execution.
 */

import { useState, useCallback, useRef } from "react";
import type { ProcessingStatus, ProcessingStage, ProgressInfo } from "../../types";
import { API_BASE } from "../../api";

const VITE_API_PROTECTION_KEY = import.meta.env.VITE_API_PROTECTION_KEY || "WN3FBAF2GYF";

const STAGE_NAMES: Record<ProcessingStage, string> = {
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

interface ProcessingState {
  status: ProcessingStatus;
  progress: ProgressInfo | null;
  result: any | null;
  error: string | null;
}

export function useAIProcessing() {
  const [state, setState] = useState<ProcessingState>({
    status: "idle",
    progress: null,
    result: null,
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);

  /**
   * Update progress with transition animation smoothing.
   */
  const updateProgress = useCallback((
    stage: ProcessingStage,
    percent: number,
    eta: string,
    step?: string
  ) => {
    setState((prev) => ({
      ...prev,
      progress: {
        stage,
        percent: Math.min(100, Math.max(0, percent)),
        eta,
        step: step || STAGE_NAMES[stage] || stage,
        startTime: prev.progress?.startTime || Date.now(),
      },
    }));
  }, []);

  /**
   * Start a specific processing action.
   */
  const startProcessing = useCallback(async (
    endpoint: string,
    body: Record<string, any>,
    stages: { stage: ProcessingStage; percent: number; eta: string }[]
  ) => {
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    setState((prev) => ({
      ...prev,
      status: "processing",
      error: null,
      result: null,
    }));

    try {
      // Run through stages with progress updates
      for (let i = 0; i < stages.length; i++) {
        if (signal.aborted) {
          setState((prev) => ({ ...prev, status: "idle", progress: null }));
          return null;
        }

        const { stage, percent, eta } = stages[i];
        updateProgress(stage, percent, eta);

        // Small delay to show progress visually
        await new Promise((r) => setTimeout(r, 200));
      }

      // Make the actual API call
      const res = await fetch(API_BASE + endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": VITE_API_PROTECTION_KEY,
        },
        body: JSON.stringify(body),
        signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed with status ${res.status}`);
      }

      const data = await res.json();

      setState((prev) => ({
        ...prev,
        status: "complete",
        progress: {
          stage: "complete",
          percent: 100,
          eta: "0s",
          step: "Completed Successfully ✓",
          startTime: prev.progress?.startTime || Date.now(),
        },
        result: data,
      }));

      return data;
    } catch (error: any) {
      if (error.name === "AbortError") {
        setState((prev) => ({ ...prev, status: "idle", progress: null }));
        return null;
      }

      setState((prev) => ({
        ...prev,
        status: "error",
        error: error.message,
        progress: {
          stage: "error",
          percent: 0,
          eta: "--",
          step: error.message,
          startTime: Date.now(),
        },
      }));
      return null;
    }
  }, [updateProgress]);

  /**
   * Cancel current processing.
   */
  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setState((prev) => ({
      ...prev,
      status: "idle",
      progress: null,
    }));
  }, []);

  /**
   * Reset to idle state.
   */
  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState({
      status: "idle",
      progress: null,
      result: null,
      error: null,
    });
  }, []);

  return {
    status: state.status,
    progress: state.progress,
    result: state.result,
    error: state.error,
    updateProgress,
    startProcessing,
    cancel,
    reset,
  };
}

