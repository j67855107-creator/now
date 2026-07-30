import { useState, useEffect } from "react";
import {
  Check,
  X,
  RefreshCw,
  Clock,
  FileText,
  Download,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
  Zap,
} from "lucide-react";
import type { ProcessingStage } from "../../types";

export interface EnhancedProgressBarProps {
  stage: ProcessingStage;
  percent: number;
  eta?: string;
  step?: string;
  file?: File | null;
  speed?: string;
  errorDetails?: string;
  outputFormat?: string;
  onRetry?: () => void;
  onCancel?: () => void;
  onDownload?: () => void;
  onConvertAnother?: () => void;
  onOpenAIWorkspace?: () => void;
}

const STAGE_LABELS: Record<ProcessingStage, string> = {
  idle: "Ready",
  uploading: "Uploading document securely...",
  validating: "Verifying file integrity...",
  extracting: "Extracting text content...",
  cleaning: "Cleaning document for AI...",
  analyzing: "Analyzing document structure...",
  summarizing: "Generating AI summary...",
  generating: "Preparing AI outputs...",
  exporting: "Finalizing downloads...",
  complete: "Conversion Completed",
  error: "Conversion Failed",
  cancelled: "Conversion Cancelled",
};

interface PipelineStep {
  id: string;
  label: string;
  stages: ProcessingStage[];
}

const PIPELINE_STEPS: PipelineStep[] = [
  { id: "upload", label: "Uploading", stages: ["uploading"] },
  { id: "validate", label: "Validating", stages: ["validating"] },
  { id: "extract", label: "Extracting", stages: ["extracting"] },
  { id: "process", label: "Processing", stages: ["cleaning"] },
  { id: "analyze", label: "AI Analysis", stages: ["analyzing", "summarizing"] },
  { id: "generate", label: "Generating", stages: ["generating", "exporting"] },
  { id: "complete", label: "Completed", stages: ["complete"] },
];

export default function EnhancedProgressBar({
  stage,
  percent,
  eta,
  step,
  file,
  speed,
  errorDetails,
  outputFormat = "Markdown (.md)",
  onRetry,
  onCancel,
  onDownload,
  onConvertAnother,
  onOpenAIWorkspace,
}: EnhancedProgressBarProps) {
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (stage !== "idle") setVisible(true);
  }, [stage]);

  // Smooth percent animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercent((prev) => {
        const diff = percent - prev;
        if (Math.abs(diff) < 1) return percent;
        return prev + diff * 0.3;
      });
    }, 60);
    return () => clearTimeout(timer);
  }, [percent, animatedPercent]);

  // Elapsed timer tick
  useEffect(() => {
    if (stage === "idle" || stage === "complete" || stage === "error" || stage === "cancelled") {
      return;
    }
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [stage]);

  if (stage === "idle" && !visible) return null;

  const isError = stage === "error";
  const isComplete = stage === "complete";
  const isCancelled = stage === "cancelled";
  const isFinished = isComplete || isError || isCancelled;

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getStepIndex = () => {
    if (isComplete) return PIPELINE_STEPS.length - 1;
    for (let i = 0; i < PIPELINE_STEPS.length; i++) {
      if (PIPELINE_STEPS[i].stages.includes(stage)) return i;
    }
    return 0;
  };

  const currentStepIdx = getStepIndex();

  const getFileSizeFormatted = () => {
    if (!file) return null;
    if (file.size >= 1024 * 1024) {
      return `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(file.size / 1024).toFixed(1)} KB`;
  };

  const getFileExtension = () => {
    if (!file) return "DOC";
    return file.name.split(".").pop()?.toUpperCase() || "DOC";
  };

  return (
    <div
      className="w-full bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-6 font-sans text-left transition-all animate-fadeIn"
      role="region"
      aria-label="Document conversion progress panel"
    >
      {/* 1. Header & File Info Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
            <FileText size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 truncate max-w-[240px] sm:max-w-[340px]">
                {file ? file.name : "Document File"}
              </h3>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md uppercase">
                {getFileExtension()}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
              {getFileSizeFormatted() && <span>{getFileSizeFormatted()}</span>}
              {getFileSizeFormatted() && <span className="text-slate-300">•</span>}
              <span>Target: <strong className="text-slate-700 font-medium">{outputFormat}</strong></span>
            </p>
          </div>
        </div>

        {/* Action Header Status Badge */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {isComplete && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-xs">
              <Check size={14} className="stroke-[3]" /> Completed
            </span>
          )}
          {isError && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-xs">
              <AlertCircle size={14} /> Failed
            </span>
          )}
          {isCancelled && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-semibold text-xs">
              <Clock size={14} /> Cancelled
            </span>
          )}
          {!isFinished && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold text-xs">
              <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              Processing
            </span>
          )}
        </div>
      </div>

      {/* 2. Multi-Step Pipeline Stepper */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
          <span>Processing Pipeline</span>
          <span className="text-slate-400 font-mono text-[11px]">
            Step {Math.min(currentStepIdx + 1, PIPELINE_STEPS.length)} of {PIPELINE_STEPS.length}
          </span>
        </div>

        {/* Stepper Grid Bar */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {PIPELINE_STEPS.map((pStep, idx) => {
            const isDone = isComplete || idx < currentStepIdx;
            const isCurrent = !isFinished && idx === currentStepIdx;

            return (
              <div key={pStep.id} className="flex flex-col items-center gap-1.5 group">
                <div
                  className={`w-full h-1.5 rounded-full transition-all duration-300 ${
                    isDone
                      ? "bg-emerald-500"
                      : isCurrent
                      ? "bg-indigo-600 animate-pulse"
                      : "bg-slate-100"
                  }`}
                />
                <div className="flex items-center justify-center">
                  {isDone ? (
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Check size={10} className="stroke-[3]" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping" />
                    </div>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-200" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium hidden md:block text-center truncate max-w-[60px] ${
                    isDone
                      ? "text-slate-700"
                      : isCurrent
                      ? "text-indigo-600 font-bold"
                      : "text-slate-400"
                  }`}
                >
                  {pStep.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Progress Bar & Main Metrics */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
            <Zap size={14} className="text-indigo-600" />
            {step || STAGE_LABELS[stage]}
          </span>
          <div className="flex items-center gap-2">
            {speed && !isFinished && (
              <span className="text-[11px] font-mono text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                {speed}
              </span>
            )}
            <span className="font-extrabold font-mono text-indigo-600 text-sm">
              {Math.round(animatedPercent)}%
            </span>
          </div>
        </div>

        {/* Animated Progress Bar Track */}
        <div
          className="relative h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner"
          role="progressbar"
          aria-valuenow={Math.round(animatedPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Conversion progress"
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isComplete
                ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                : isError
                ? "bg-gradient-to-r from-rose-500 to-red-500"
                : isCancelled
                ? "bg-amber-400"
                : "bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600"
            }`}
            style={{ width: `${isFinished ? 100 : Math.min(animatedPercent, 100)}%` }}
          />

          {!isFinished && (
            <div
              className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"
              style={{ transform: `translateX(${Math.min(animatedPercent, 100)}%)` }}
            />
          )}
        </div>

        {/* Live Processing Statistics Bar */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-mono">
              <Clock size={12} className="text-slate-400" />
              Elapsed: <strong className="text-slate-700">{formatSeconds(elapsedSeconds)}</strong>
            </span>
            {eta && !isFinished && (
              <span className="flex items-center gap-1 font-mono text-slate-400">
                ETA: <strong className="text-slate-600">~{eta}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onCancel && !isFinished && (
              <button
                onClick={onCancel}
                className="text-[11px] font-medium text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
              >
                Cancel Process
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. SUCCESS STATE: Rich Actions Bar */}
      {isComplete && (
        <div className="bg-emerald-50/70 border border-emerald-150 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs animate-fadeIn">
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Sparkles size={16} />
            </div>
            <div>
              <p className="font-bold text-emerald-950">Document converted successfully!</p>
              <p className="text-emerald-700 text-[11px]">
                Processed in {formatSeconds(elapsedSeconds)} • Ready for download or AI context.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {onDownload && (
              <button
                onClick={onDownload}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <Download size={14} /> Download .md
              </button>
            )}
            {onOpenAIWorkspace && (
              <button
                onClick={onOpenAIWorkspace}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-semibold px-3.5 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <Sparkles size={13} className="text-emerald-600" /> AI Workspace
              </button>
            )}
            {onConvertAnother && (
              <button
                onClick={onConvertAnother}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer"
              >
                Convert Another <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 5. ERROR STATE: Technical Details Accordion & Retry */}
      {isError && (
        <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-4 space-y-3 text-xs animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-rose-900 font-bold">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>Conversion process encountered an error</span>
            </div>
            <div className="flex items-center gap-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-1.5 rounded-lg transition-all cursor-pointer"
                >
                  <RefreshCw size={12} /> Retry Conversion
                </button>
              )}
            </div>
          </div>

          {errorDetails && (
            <div className="pt-2 border-t border-rose-100">
              <button
                onClick={() => setShowErrorDetails((prev) => !prev)}
                className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 hover:text-rose-900 transition-colors cursor-pointer"
              >
                <span>{showErrorDetails ? "Hide Technical Details" : "Show Technical Details"}</span>
                {showErrorDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>

              {showErrorDetails && (
                <pre className="mt-2 p-3 bg-slate-900 text-slate-200 text-[10px] font-mono rounded-lg overflow-x-auto leading-relaxed border border-slate-800">
                  {errorDetails}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
