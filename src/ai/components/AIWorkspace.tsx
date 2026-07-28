import { useState, type ReactNode } from "react";
import { Sparkles, ChevronDown, ChevronUp, FileText, MessageSquare, Database, Download } from "lucide-react";
import type { AIEnhancedResult } from "../../types";
import AISummaryPanel from "./AISummaryPanel";
import PromptGenerator from "./PromptGenerator";
import RAGExportPanel from "./RAGExportPanel";
import ExportCenter from "./ExportCenter";

interface AIWorkspaceProps {
  markdown: string;
  fileName?: string;
  enhancedResult?: AIEnhancedResult | null;
}

type Tab = "summary" | "prompt" | "rag" | "export";

export default function AIWorkspace({ markdown, fileName, enhancedResult }: AIWorkspaceProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("summary");

  const tabs: { id: Tab; label: string; icon: ReactNode }[] = [
    { id: "summary", label: "AI Summary", icon: <FileText size={14} /> },
    { id: "prompt", label: "Prompt", icon: <MessageSquare size={14} /> },
    { id: "rag", label: "RAG Export", icon: <Database size={14} /> },
    { id: "export", label: "Export", icon: <Download size={14} /> },
  ];

  return (
    <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
            <Sparkles size={16} className="text-indigo-600" />
          </div>
          <span className="text-sm font-bold text-slate-800 font-sans">AI Workspace</span>
          <span className="text-[10px] text-slate-400 font-medium bg-slate-200/60 px-2 py-0.5 rounded-full">New</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-[11px] hidden sm:inline">{open ? "Hide" : "Show"} AI tools</span>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

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
            {activeTab === "summary" && <AISummaryPanel markdown={markdown} enhancedResult={enhancedResult} />}
            {activeTab === "prompt" && <PromptGenerator markdown={markdown} fileName={fileName} />}
            {activeTab === "rag" && <RAGExportPanel markdown={markdown} fileName={fileName} />}
            {activeTab === "export" && <ExportCenter markdown={markdown} fileName={fileName} enhancedResult={enhancedResult} />}
</div>
        </div>
      )}
    </div>
  );
}
