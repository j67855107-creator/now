import React, { useState, useEffect } from "react";
import {
  Check,
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
  HelpCircle,
  FileCode,
  Layers,
  Database,
  Info,
} from "lucide-react";
import type { ProcessingStage } from "../../types";

export interface EnhancedProgressBarProps {
  stage: ProcessingStage;
  percent: number;
  eta?: string;
  step?: string;
  file?: File | null;
  speed?: string;
  pages?: number | string;
  errorDetails?: string;
  outputFormat?: string;
  isAIEnabled?: boolean;
  onRetry?: () => void;
  onCancel?: () => void;
  onDownload?: () => void;
  onConvertAnother?: () => void;
  onOpenAIWorkspace?: () => void;
  onGenerateSummary?: () => void;
  onGeneratePrompt?: () => void;
  onCreateRAG?: () => void;
  onExportJSONL?: () => void;
  onReportIssue?: () => void;
}

const STAGE_LABELS: Record<ProcessingStage, string> = {
  idle: "Ready",
  uploading: "Uploading document...",
  validating: "Validating file structure...",
  extracting: "Extracting text content...",
  cleaning: "Processing document formatting...",
  analyzing: "AI Analysis in progress...",
  summarizing: "Generating summary...",
  generating: "Generating Markdown output...",
  exporting: "Finalizing conversion...",
  complete: "Conversion completed",
  error: "Conversion failed",
  cancelled: "Conversion cancelled",
};

interface PipelineStep {
  id: string;
  label: string;
  stages: ProcessingStage[];
  aiOnly?: boolean;
}

const PIPELINE_STEPS: PipelineStep[] = [
  { id: "upload", label: "Uploading", stages: ["uploading"] },
  { id: "validate", label: "Validating", stages: ["validating"] },
  { id: "extract", label: "Extracting", stages: ["extracting"] },
  { id: "process", label: "Processing", stages: ["cleaning"] },
  { id: "analyze", label: "AI Analysis", stages: ["analyzing", "summarizing"], aiOnly: true },
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
  pages,
  errorDetails,
  outputFormat = "Markdown (.md)",
  isAIEnabled = false,
  onRetry,
  onCancel,
  onDownload,
  onConvertAnother,
  onOpenAIWorkspace,
  onGenerateSummary,
  onGeneratePrompt,
  onCreateRAG,
  onExportJSONL,
  onReportIssue,
}: EnhancedProgressBarProps) {
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);
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
        return prev + diff * 0.35;
      });
    }, 50);
    return () => clearTimeout(timer);
  }, [percent, animatedPercent]);

  // Elapsed timer tick during active conversion
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

  // Filter steps based on AI toggle
  const activeSteps = PIPELINE_STEPS.filter((s) => !s.aiOnly || isAIEnabled);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getStepIndex = () => {
    if (isComplete) return activeSteps.length - 1;
    for (let i = 0; i < activeSteps.length; i++) {
      if (activeSteps[i].stages.includes(stage)) return i;
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

  const estimatedPagesDisplay = () => {
    if (pages) return `${pages} pages`;
    if (!file) return null;
    const est = Math.max(1, Math.round(file.size / (45 * 1024)));
    return `~${est} ${est === 1 ? "page" : "pages"}`;
  };

  const currentStageMessage = step || STAGE_LABELS[stage] || "Processing...";

  return (
    <div
      className="w-full bg-[#FAF8F3] rounded-xl border border-[#E4E0D8] p-5 sm:p-6 space-y-5 font-sans text-left transition-all shadow-xs"
      role="region"
      aria-label="File conversion progress"
    >
      {/* 1. File Information Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#E4E0D8]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white border border-[#E4E0D8] rounded-xl flex items-center justify-center text-[#2F6F5E] shrink-0">
            <FileText size={20} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#171B26] truncate">
                {file ? file.name : "Document File"}
              </h3>
              <span className="text-[10px] font-mono font-semibold text-[#2F6F5E] bg-[#F6F4EE] border border-[#E4E0D8] px-2 py-0.5 rounded uppercase shrink-0">
                {getFileExtension()}
              </span>
            </div>
            <p className="text-xs text-[#6B6459] mt-0.5 flex flex-wrap items-center gap-2 font-mono">
              {getFileSizeFormatted() && <span>{getFileSizeFormatted()}</span>}
              {getFileSizeFormatted() && <span className="text-[#E4E0D8]">•</span>}
              <span>
                Target: <strong className="text-[#171B26] font-medium">{outputFormat}</strong>
              </span>
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0 font-mono">
          {isComplete && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6F4EE] border border-[#2F6F5E] text-[#2F6F5E] font-medium text-xs">
              <Check size={14} className="stroke-[2.5]" /> Conversion completed
            </span>
          )}
          {isError && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-[#EF4444] font-medium text-xs">
              <AlertCircle size={14} /> Conversion failed
            </span>
          )}
          {isCancelled && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-[#D98F3D] text-[#D98F3D] font-medium text-xs">
              <Clock size={14} /> Cancelled
            </span>
          )}
          {!isFinished && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6F4EE] border border-[#2F6F5E] text-[#2F6F5E] font-medium text-xs">
              <div className="w-3 h-3 border-2 border-[#2F6F5E] border-t-transparent rounded-full animate-spin" />
              Processing
            </span>
          )}
        </div>
      </div>

      {/* 2. Multi-Step Pipeline Stepper */}
      <div className="space-y-2 font-mono">
        <div className="flex items-center justify-between text-xs font-medium text-[#6B6459] mb-1.5">
          <span className="flex items-center gap-1.5">
            <Layers size={13} className="text-[#2F6F5E]" />
            <span>Pipeline Stage</span>
          </span>
          <span className="text-[#6B6459] text-[11px]">
            {Math.min(currentStepIdx + 1, activeSteps.length)} / {activeSteps.length}
          </span>
        </div>

        {/* Stepper Grid Bar */}
        <div
          className="grid gap-1.5 sm:gap-2"
          style={{ gridTemplateColumns: `repeat(${activeSteps.length}, minmax(0, 1fr))` }}
        >
          {activeSteps.map((pStep, idx) => {
            const isDone = isComplete || idx < currentStepIdx;
            const isCurrent = !isFinished && idx === currentStepIdx;

            return (
              <div key={pStep.id} className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-full h-1 rounded-full transition-all duration-300 ${
                    isDone
                      ? "bg-[#2F6F5E]"
                      : isCurrent
                      ? "bg-[#2F6F5E]"
                      : "bg-[#E4E0D8]"
                  }`}
                />
                <div className="flex items-center justify-center">
                  {isDone ? (
                    <div className="w-4 h-4 rounded-full bg-[#F6F4EE] border border-[#2F6F5E] text-[#2F6F5E] flex items-center justify-center">
                      <Check size={10} className="stroke-[2.5]" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-4 h-4 rounded-full bg-[#F6F4EE] border border-[#2F6F5E] text-[#2F6F5E] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-[#2F6F5E] rounded-full" />
                    </div>
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#E4E0D8]" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-mono font-medium hidden sm:block text-center truncate max-w-[70px] ${
                    isDone
                      ? "text-[#171B26]"
                      : isCurrent
                      ? "text-[#2F6F5E] font-semibold"
                      : "text-[#6B6459]"
                  }`}
                >
                  {pStep.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Essential Progress Bar */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span
            className="font-medium text-[#171B26] flex items-center gap-1.5"
            aria-live="polite"
          >
            <Zap size={14} className="text-[#2F6F5E] shrink-0" />
            <span className="truncate">{currentStageMessage}</span>
          </span>
          <span className="font-semibold font-mono text-[#2F6F5E] text-xs ml-2">
            {Math.round(animatedPercent)}%
          </span>
        </div>

        {/* Animated Progress Bar Track */}
        <div
          className="relative h-2 bg-[#E4E0D8] rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={Math.round(animatedPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`${currentStageMessage} (${Math.round(animatedPercent)}%)`}
        >
          <div
            className={`h-full rounded-full transition-all duration-300 ease-out ${
              isComplete
                ? "bg-[#2F6F5E]"
                : isError
                ? "bg-[#EF4444]"
                : isCancelled
                ? "bg-[#D98F3D]"
                : "bg-[#2F6F5E]"
            }`}
            style={{ width: `${isFinished ? 100 : Math.min(animatedPercent, 100)}%` }}
          />
        </div>

        {/* Control Row */}
        <div className="flex items-center justify-between text-[11px] text-[#6B6459] pt-0.5">
          <button
            onClick={() => setShowAdvancedDetails((prev) => !prev)}
            aria-expanded={showAdvancedDetails}
            className="flex items-center gap-1 text-[11px] font-mono font-medium text-[#2F6F5E] hover:text-[#275F50] transition-colors cursor-pointer"
          >
            <Info size={12} />
            <span>{showAdvancedDetails ? "Hide Details" : "Show Details"}</span>
            {showAdvancedDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {onCancel && !isFinished && (
            <button
              onClick={onCancel}
              className="text-[11px] font-mono font-medium text-[#6B6459] hover:text-[#EF4444] transition-colors cursor-pointer"
            >
              Cancel Process
            </button>
          )}
        </div>
      </div>

      {/* 4. Advanced Metrics Drawer */}
      {showAdvancedDetails && (
        <div className="bg-white border border-[#E4E0D8] rounded-xl p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div>
            <span className="text-[10px] text-[#6B6459] block">Elapsed Time</span>
            <span className="font-semibold text-[#171B26]">{formatSeconds(elapsedSeconds)}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#6B6459] block">ETA</span>
            <span className="font-semibold text-[#171B26]">
              {isFinished ? "00:00" : eta || "~2-5s"}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#6B6459] block">Processing Speed</span>
            <span className="font-semibold text-[#171B26]">{speed || "1.8 MB/s"}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#6B6459] block">Est. Page Count</span>
            <span className="font-semibold text-[#171B26]">{estimatedPagesDisplay()}</span>
          </div>
        </div>
      )}

      {/* 5. SUCCESS STATE */}
      {isComplete && (
        <div className="bg-white border border-[#E4E0D8] rounded-xl p-4 space-y-3.5 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#F6F4EE] border border-[#2F6F5E] text-[#2F6F5E] flex items-center justify-center shrink-0">
                <Check size={12} className="stroke-[2.5]" />
              </div>
              <span className="font-semibold text-[#171B26] text-xs">
                Document converted successfully
              </span>
            </div>
            <span className="text-[11px] text-[#6B6459] font-mono">
              Completed in {formatSeconds(elapsedSeconds)}
            </span>
          </div>

          <p className="text-[#6B6459] text-xs font-sans">
            Your document has been transpiled into clean Markdown. Choose your next action:
          </p>

          {/* Next Best Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1 font-mono">
            {onDownload && (
              <button
                onClick={onDownload}
                className="flex items-center justify-between bg-[#2F6F5E] hover:bg-[#275F50] text-[#F6F4EE] font-medium px-3.5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Download size={14} /> Download .md
                </span>
                <ArrowRight size={13} />
              </button>
            )}

            {onGenerateSummary && (
              <button
                onClick={onGenerateSummary}
                className="flex items-center justify-between bg-[#FAF8F3] border border-[#171B26] text-[#171B26] hover:bg-white font-medium px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles size={13} className="text-[#2F6F5E]" /> AI Summary
                </span>
                <ArrowRight size={13} className="text-[#6B6459]" />
              </button>
            )}

            {onGeneratePrompt && (
              <button
                onClick={onGeneratePrompt}
                className="flex items-center justify-between bg-[#FAF8F3] border border-[#171B26] text-[#171B26] hover:bg-white font-medium px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <FileCode size={13} className="text-[#2F6F5E]" /> Generate Prompt
                </span>
                <ArrowRight size={13} className="text-[#6B6459]" />
              </button>
            )}

            {onCreateRAG && (
              <button
                onClick={onCreateRAG}
                className="flex items-center justify-between bg-[#FAF8F3] border border-[#171B26] text-[#171B26] hover:bg-white font-medium px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Database size={13} className="text-[#2F6F5E]" /> Create RAG Dataset
                </span>
                <ArrowRight size={13} className="text-[#6B6459]" />
              </button>
            )}

            {onExportJSONL && (
              <button
                onClick={onExportJSONL}
                className="flex items-center justify-between bg-[#FAF8F3] border border-[#171B26] text-[#171B26] hover:bg-white font-medium px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <FileText size={13} className="text-[#6B6459]" /> Export JSONL
                </span>
                <ArrowRight size={13} className="text-[#6B6459]" />
              </button>
            )}

            {onConvertAnother && (
              <button
                onClick={onConvertAnother}
                className="flex items-center justify-between bg-[#FAF8F3] border border-[#171B26] text-[#6B6459] hover:bg-white hover:text-[#171B26] font-medium px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                <span>Convert Another</span>
                <RefreshCw size={13} className="text-[#6B6459]" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 6. ERROR STATE */}
      {isError && (
        <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-4 space-y-3 text-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[#EF4444] font-medium">
              <AlertCircle size={16} className="text-[#EF4444] shrink-0" />
              <span>Conversion process encountered an issue</span>
            </div>
            <div className="flex items-center gap-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center gap-1.5 bg-[#EF4444] hover:bg-rose-700 text-white font-medium px-3.5 py-1.5 rounded-xl transition-all cursor-pointer"
                >
                  <RefreshCw size={12} /> Retry Conversion
                </button>
              )}
              {onReportIssue && (
                <button
                  onClick={onReportIssue}
                  className="inline-flex items-center gap-1.5 bg-white border border-rose-200 text-[#EF4444] hover:bg-rose-50 font-medium px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                >
                  <HelpCircle size={12} /> Report Issue
                </button>
              )}
            </div>
          </div>

          {/* Technical Details */}
          <div className="pt-2 border-t border-rose-100">
            <button
              onClick={() => setShowErrorDetails((prev) => !prev)}
              aria-expanded={showErrorDetails}
              className="flex items-center gap-1 text-[11px] font-medium text-[#EF4444] hover:text-rose-700 transition-colors cursor-pointer"
            >
              <span>
                {showErrorDetails ? "Hide Technical Details" : "Show Technical Details"}
              </span>
              {showErrorDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            {showErrorDetails && (
              <pre className="mt-2 p-3 bg-gray-900 text-gray-200 text-[10px] font-mono rounded-xl overflow-x-auto leading-relaxed border border-gray-800">
                {errorDetails || "Error: Conversion process timed out or file format contains unreadable structure."}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
