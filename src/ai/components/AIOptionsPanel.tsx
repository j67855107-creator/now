import { Sparkles } from "lucide-react";
import type { AIOptions } from "../../types";

interface AIOptionsPanelProps {
  options: AIOptions;
  onChange: (options: AIOptions) => void;
}

export default function AIOptionsPanel({ options, onChange }: AIOptionsPanelProps) {
  const toggle = (key: keyof AIOptions) => {
    onChange({ ...options, [key]: !options[key] });
  };

  return (
    <div className="mt-3 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2 select-none">
        <div className="w-6 h-6 bg-indigo-50 rounded-md flex items-center justify-center">
          <Sparkles size={12} className="text-indigo-600" />
        </div>
        <span className="text-xs font-bold text-slate-700 font-sans">AI Options</span>
        <span className="text-[9px] text-slate-400 font-medium ml-auto">Enhance your document</span>
      </div>
      <div className="p-3 space-y-2">
        <label className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
          <input type="checkbox" checked={options.cleanForAI} onChange={() => toggle("cleanForAI")} className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
          <div className="text-xs font-semibold text-slate-700 font-sans">Clean for AI</div>
        </label>
        <label className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
          <input type="checkbox" checked={options.generateSummary} onChange={() => toggle("generateSummary")} className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
          <div>
            <span className="text-xs font-semibold text-slate-700 font-sans">Generate AI Summary</span>
            <p className="text-[10px] text-slate-400">Short and detailed summaries with keywords</p>
          </div>
        </label>
        <label className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
          <input type="checkbox" checked={options.generatePrompt} onChange={() => toggle("generatePrompt")} className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
          <div>
            <span className="text-xs font-semibold text-slate-700 font-sans">Generate AI Prompt</span>
            <p className="text-[10px] text-slate-400">Create prompts for ChatGPT, Claude, Gemini</p>
          </div>
        </label>
        <label className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
          <input type="checkbox" checked={options.generateRAG} onChange={() => toggle("generateRAG")} className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
          <div>
            <span className="text-xs font-semibold text-slate-700 font-sans">Generate RAG Dataset</span>
            <p className="text-[10px] text-slate-400">Export chunks optimized for RAG pipelines</p>
          </div>
        </label>
      </div>
    </div>
  );
}