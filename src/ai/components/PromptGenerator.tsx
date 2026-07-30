import { useState, useEffect } from "react";
import { Copy, Check, Sparkles, RefreshCw } from "lucide-react";
import type { AIProviderId, PromptTemplateId } from "../../types";
import { AI_PROVIDERS, PROMPT_TEMPLATES_META } from "../config";
import { API_BASE } from "../../api";

interface PromptGeneratorProps {
  markdown: string;
  fileName?: string;
}

export default function PromptGenerator({ markdown, fileName }: PromptGeneratorProps) {
  const [providerId, setProviderId] = useState<AIProviderId>("chatgpt");
  const [templateId, setTemplateId] = useState<PromptTemplateId>("summary");
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePrompt = async () => {
    if (!markdown) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/ai/prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown,
          templateId,
          providerId,
          title: fileName || "Document",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate prompt.");
      setGeneratedPrompt(data.formattedPrompt || data.prompt?.prompt || "");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (markdown) {
      generatePrompt();
    }
  }, [providerId, templateId, markdown]);

  const handleCopy = () => {
    if (!generatedPrompt) return;
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5 text-left font-sans">
      {/* Target Provider Picker */}
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Select Target AI Provider</label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {Object.values(AI_PROVIDERS).map((provider) => (
            <button
              key={provider.id}
              onClick={() => setProviderId(provider.id)}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                providerId === provider.id
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>{provider.icon}</span>
              <span className="truncate">{provider.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Template Picker */}
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Select Prompt Strategy</label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {Object.entries(PROMPT_TEMPLATES_META).map(([id, meta]) => (
            <button
              key={id}
              onClick={() => setTemplateId(id as PromptTemplateId)}
              className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                templateId === id
                  ? "bg-indigo-600 border-indigo-600 text-white font-bold shadow-sm"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <div className="text-xs truncate">{meta.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Display & Copy */}
      {loading ? (
        <div className="flex items-center justify-center py-8 gap-2 text-xs text-slate-500">
          <RefreshCw size={16} className="animate-spin text-indigo-600" />
          <span>Formulating optimal prompt structure...</span>
        </div>
      ) : error ? (
        <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-150">{error}</div>
      ) : (
        <div className="relative">
          <div className="flex items-center justify-between bg-slate-100 px-4 py-2 rounded-t-xl border border-slate-200 text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5"><Sparkles size={12} className="text-indigo-600" /> Optimized {AI_PROVIDERS[providerId]?.name} Prompt</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] bg-white border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              <span>{copied ? "Copied" : "Copy Prompt"}</span>
            </button>
          </div>
          <textarea
            readOnly
            value={generatedPrompt}
            className="w-full h-48 bg-slate-900 text-indigo-100 p-4 rounded-b-xl font-mono text-xs leading-relaxed focus:outline-none resize-none"
          />
        </div>
      )}
    </div>
  );
}

