
import { useState, type ReactNode } from "react";
import { Sparkles, ChevronDown, ChevronUp, FileText, MessageSquare, Database, Download, Play, RefreshCw, CheckCircle2 } from "lucide-react";
import type { AIEnhancedResult } from "../../types";
import AISummaryPanel from "./AISummaryPanel";
import PromptGenerator from "./PromptGenerator";
import RAGExportPanel from "./RAGExportPanel";
import ExportCenter from "./ExportCenter";
import { API_BASE } from "../../api";

interface AIWorkspaceProps {
  markdown: string;
  fileName?: string;
  enhancedResult?: AIEnhancedResult | null;
}

type Tab = "summary" | "prompt" | "rag" | "export";

export default function AIWorkspace({ markdown, fileName, enhancedResult }: AIWorkspaceProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("summary");
  const [runningPipeline, setRunningPipeline] = useState(false);
  const [pipelineComplete, setPipelineComplete] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<AIEnhancedResult | null>(enhancedResult || null);

  const tabs: { id: Tab; label: string; icon: ReactNode }[] = [
    { id: "summary", label: "AI Summary", icon: <FileText size={14} /> },
    { id: "prompt", label: "Prompt", icon: <MessageSquare size={14} /> },
    { id: "rag", label: "RAG Export", icon: <Database size={14} /> },
    { id: "export", label: "Export", icon: <Download size={14} /> },
  ];

  const runPrepareForAI = async () => {
    if (!markdown) return;
    setRunningPipeline(true);
    setPipelineComplete(false);
    setOpen(true);
    try {
      const res = await fetch(`${API_BASE}/api/ai/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown,
          fileName: fileName || "Document",
          cleanForAI: true,
          generateSummary: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.result) {
        setPipelineResult(data.result);
        setPipelineComplete(true);
        setActiveTab("summary");
      }
    } catch (err) {
      console.error("[Prepare for AI Error]", err);
    } finally {
      setRunningPipeline(false);
    }
  };

  return (
    <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden font-sans">
      <div className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100 select-none">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setOpen(!open)}>
          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
            <Sparkles size={16} className="text-indigo-600" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800">AI Intelligence Workspace</span>
              <span className="text-[10px] text-indigo-700 bg-indigo-50 font-bold px-2 py-0.5 rounded-full">Automated</span>
            </div>
            <p className="text-[11px] text-slate-400">Preprocess, analyze, extract prompts & generate RAG datasets</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runPrepareForAI}
            disabled={runningPipeline}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {runningPipeline ? <RefreshCw size={13} className="animate-spin" /> : pipelineComplete ? <CheckCircle2 size={13} /> : <Play size={13} />}
            <span>{runningPipeline ? "Running Pipeline..." : pipelineComplete ? "Pipeline Ready!" : "Prepare for AI"}</span>
          </button>

          <button
            onClick={() => setOpen(!open)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
          >
            {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="p-6">
          <div className="flex gap-1 mb-6 border-b border-slate-100 pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={
                  "flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer " +
                  (activeTab === tab.id
                    ? "bg-indigo-50 text-indigo-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50")
                }
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[200px]">
            {activeTab === "summary" && <AISummaryPanel markdown={markdown} enhancedResult={pipelineResult} />}
            {activeTab === "prompt" && <PromptGenerator markdown={markdown} fileName={fileName} />}
            {activeTab === "rag" && <RAGExportPanel markdown={markdown} fileName={fileName} />}
            {activeTab === "export" && <ExportCenter markdown={markdown} fileName={fileName} enhancedResult={pipelineResult} />}
          </div>
        </div>
      )}
    </div>
  );
}
