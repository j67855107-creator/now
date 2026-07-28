import { useState, useEffect } from "react";
import { Check, X, RefreshCw, Clock } from "lucide-react";
import type { ProcessingStage } from "../../types";

interface EnhancedProgressBarProps {
  stage: ProcessingStage;
  percent: number;
  eta: string;
  step: string;
  onRetry?: () => void;
  onCancel?: () => void;
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
  exporting: "Preparing downloads...",
  complete: "Completed Successfully",
  error: "Processing Failed",
  cancelled: "Processing Cancelled",
};

export default function EnhancedProgressBar({ stage, percent, eta, step, onRetry, onCancel }: EnhancedProgressBarProps) {
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (stage !== "idle") setVisible(true);
  }, [stage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercent((prev) => {
        const diff = percent - prev;
        if (Math.abs(diff) < 1) return percent;
        return prev + diff * 0.3;
      });
    }, 80);
    return () => clearTimeout(timer);
  }, [percent, animatedPercent]);

  if (stage === "idle" && !visible) return null;

  const isError = stage === "error";
  const isComplete = stage === "complete";
  const isCancelled = stage === "cancelled";
  const isFinished = isComplete || isError || isCancelled;

  const statusColor = isComplete ? "text-emerald-700" : isError ? "text-rose-700" : isCancelled ? "text-amber-700" : "text-slate-800";
  const barColor = isComplete ? "bg-emerald-500" : isError ? "bg-rose-500" : isCancelled ? "bg-amber-400" : "bg-indigo-500";

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {isComplete && (
            <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center animate-bounce">
              <Check size={14} className="text-emerald-600 stroke-[3]" />
            </div>
          )}
          {isError && (
            <div className="w-7 h-7 bg-rose-100 rounded-full flex items-center justify-center">
              <X size={14} className="text-rose-600 stroke-[3]" />
            </div>
          )}
          {isCancelled && (
            <div className="w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center">
              <Clock size={14} className="text-amber-600" />
            </div>
          )}
          {!isFinished && (
            <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <span className={"text-sm font-semibold font-sans " + statusColor}>{STAGE_LABELS[stage]}</span>
        </div>
        <div className="flex items-center gap-3">
          {!isFinished && <span className="text-[11px] text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded-md">{Math.round(animatedPercent)}%</span>}
          {onCancel && !isFinished && <button onClick={onCancel} className="text-[11px] text-slate-400 hover:text-rose-500 font-medium cursor-pointer transition-colors">Cancel</button>}
        </div>
      </div>
      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={"h-full rounded-full transition-all duration-500 ease-out " + barColor} style={{ width: (isFinished ? 100 : Math.min(animatedPercent, 100)) + "%" }} />
        {!isFinished && <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" style={{ transform: "translateX(" + Math.min(animatedPercent, 100) + "%)" }} />}
      </div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-slate-500 font-sans">{step || "Processing..."}</span>
        <div className="flex items-center gap-3">
          {eta && !isFinished && <span className="text-slate-400 font-mono flex items-center gap-1"><Clock size={11} />~{eta}</span>}
          {isComplete && <span className="text-emerald-600 font-semibold flex items-center gap-1"><Check size={12} />Done</span>}
        </div>
        {isError && onRetry && <button onClick={onRetry} className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-all cursor-pointer"><RefreshCw size={12} />Retry</button>}
      </div>
    </div>
  );
}

