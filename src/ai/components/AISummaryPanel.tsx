import { useState, useEffect } from "react";
import { Sparkles, FileText, CheckCircle, AlertTriangle, RefreshCw, Layers, Clock, DollarSign, Award, ArrowRight } from "lucide-react";
import type { AIEnhancedResult, DocumentAnalysis, AIReadinessScore } from "../../types";
import { API_BASE } from "../../api";

interface AISummaryPanelProps {
  markdown: string;
  enhancedResult?: AIEnhancedResult | null;
}

export default function AISummaryPanel({ markdown, enhancedResult }: AISummaryPanelProps) {
  const [loading, setLoading] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(enhancedResult?.analysis || null);
  const [readiness, setReadiness] = useState<AIReadinessScore | null>(enhancedResult?.readiness || null);
  const [cleanedMarkdown, setCleanedMarkdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeDoc = async () => {
    if (!markdown) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/ai/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze document.");
      setAnalysis(data.analysis);
      setReadiness(data.readiness);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cleanDoc = async () => {
    if (!markdown) return;
    setCleaning(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/ai/clean`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to clean document.");
      setCleanedMarkdown(data.markdown);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCleaning(false);
    }
  };

  useEffect(() => {
    if (!analysis && markdown) {
      analyzeDoc();
    }
  }, [markdown]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-3">
        <RefreshCw size={24} className="animate-spin text-indigo-600" />
        <p className="text-xs text-slate-500 font-sans">Analyzing document structure & readiness...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-150 rounded-xl text-left text-xs text-rose-800 flex items-center justify-between">
        <span>{error}</span>
        <button onClick={analyzeDoc} className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-bold">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left font-sans">
      {/* AI Readiness Banner */}
      {readiness && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${readiness.overall >= 80 ? "bg-emerald-100 text-emerald-700" : readiness.overall >= 60 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
              {readiness.overall}%
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">AI Readiness Score</h4>
              <p className="text-[11px] text-slate-500">{readiness.overall >= 80 ? "Document is highly optimized for AI prompt & RAG context." : "Contains layout artifacts that may reduce LLM precision."}</p>
            </div>
          </div>
          <button
            onClick={cleanDoc}
            disabled={cleaning}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {cleaning ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
            <span>{cleanedMarkdown ? "Cleaned!" : "Clean for AI"}</span>
          </button>
        </div>
      )}

      {/* Metrics Grid */}
      {analysis && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-3">
            <div className="text-[10px] font-bold uppercase text-slate-400">Doc Type</div>
            <div className="text-sm font-extrabold text-slate-800 capitalize mt-0.5">{analysis.type}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3">
            <div className="text-[10px] font-bold uppercase text-slate-400">Word Count</div>
            <div className="text-sm font-extrabold text-slate-800 mt-0.5">{analysis.wordCount}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3">
            <div className="text-[10px] font-bold uppercase text-slate-400">Est. Tokens</div>
            <div className="text-sm font-extrabold text-indigo-600 mt-0.5">~{analysis.estimatedTokens}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3">
            <div className="text-[10px] font-bold uppercase text-slate-400">Read Time</div>
            <div className="text-sm font-extrabold text-slate-800 mt-0.5">{analysis.readingTimeMinutes} min</div>
          </div>
        </div>
      )}

      {/* Recommendations & Suggestions */}
      {analysis && analysis.recommendations.length > 0 && (
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
          <h4 className="text-xs font-bold text-indigo-900 mb-2 flex items-center gap-1.5">
            <Sparkles size={13} className="text-indigo-600" />
            AI Pipeline Recommendations
          </h4>
          <ul className="space-y-1 pl-4 text-xs text-indigo-950 list-disc">
            {analysis.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Issues & Clean Preview */}
      {cleanedMarkdown && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800">Cleaned AI Output Preview</h4>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">Preprocessed</span>
          </div>
          <textarea
            readOnly
            value={cleanedMarkdown}
            className="w-full h-32 bg-slate-900 text-indigo-100 text-xs p-3 rounded-lg font-mono resize-none focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}

