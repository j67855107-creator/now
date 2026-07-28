import { Sparkles, FileText, MessageSquare, Database, Download, X } from "lucide-react";

interface AIAssistantPanelProps {
  onOpenSummary?: () => void;
  onOpenPrompt?: () => void;
  onOpenRAG?: () => void;
  onOpenExport?: () => void;
  readinessScore?: number;
}

export default function AIAssistantPanel({
  onOpenSummary, onOpenPrompt, onOpenRAG, onOpenExport,
  readinessScore
}: AIAssistantPanelProps) {
  const actions = [
    { label: "AI Summary", icon: FileText, onClick: onOpenSummary, color: "text-indigo-600" },
    { label: "Generate Prompt", icon: MessageSquare, onClick: onOpenPrompt, color: "text-emerald-600" },
    { label: "RAG Export", icon: Database, onClick: onOpenRAG, color: "text-amber-600" },
    { label: "Export", icon: Download, onClick: onOpenExport, color: "text-blue-600" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
        <div className="w-6 h-6 bg-indigo-50 rounded-md flex items-center justify-center">
          <Sparkles size={12} className="text-indigo-600" />
        </div>
        <span className="text-xs font-bold text-slate-700 font-sans">AI Assistant</span>
      </div>
      <div className="p-3 space-y-1.5">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all cursor-pointer text-left"
          >
            <action.icon size={14} className={action.color} />
            {action.label}
          </button>
        ))}
        {readinessScore !== undefined && (
          <div className="mt-3 pt-3 border-t border-slate-100 px-3">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">AI Readiness</span>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: readinessScore + "%" }} />
              </div>
              <span className="text-[10px] font-bold text-indigo-600 font-mono">{readinessScore}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}