import { useState, useEffect } from "react";
import { Download, Database, RefreshCw, FileText, Layers } from "lucide-react";
import type { RAGExportFormat } from "../../types";
import { RAG_CHUNK_SIZES, RAG_EXPORT_FORMATS } from "../config";
import { API_BASE } from "../../api";

interface RAGExportPanelProps {
  markdown: string;
  fileName?: string;
}

export default function RAGExportPanel({ markdown, fileName }: RAGExportPanelProps) {
  const [chunkSize, setChunkSize] = useState<number>(512);
  const [format, setFormat] = useState<RAGExportFormat>("json");
  const [output, setOutput] = useState<string>("");
  const [chunkCount, setChunkCount] = useState<number>(0);
  const [totalTokens, setTotalTokens] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRAG = async () => {
    if (!markdown) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/ai/rag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown,
          chunkSize,
          format,
          title: fileName || "Document",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate RAG dataset.");
      setOutput(data.output || "");
      setChunkCount(data.result?.totalChunks || 0);
      setTotalTokens(data.result?.totalTokens || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (markdown) {
      generateRAG();
    }
  }, [chunkSize, format, markdown]);

  const handleDownload = () => {
    if (!output) return;
    const mime = format === "json" ? "application/json" : format === "jsonl" ? "application/x-ndjson" : "text/plain";
    const ext = format === "jsonl" ? "jsonl" : format === "json" ? "json" : format === "markdown" ? "md" : "txt";
    const blob = new Blob([output], { type: `${mime};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const baseName = (fileName || "document").replace(/\.[^/.]+$/, "");
    link.setAttribute("download", `${baseName}_rag_dataset.${ext}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 text-left font-sans">
      {/* Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Chunk Window Size (Tokens)</label>
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1 border border-slate-200">
            {RAG_CHUNK_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setChunkSize(size)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  chunkSize === size ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {size} tokens
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Dataset Output Format</label>
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1 border border-slate-200">
            {RAG_EXPORT_FORMATS.map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer ${
                  format === fmt ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RAG Summary Statistics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Chunks</span>
          <span className="text-base font-extrabold text-slate-800">{chunkCount}</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Estimated Tokens</span>
          <span className="text-base font-extrabold text-indigo-600">~{totalTokens}</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Avg Chunk Density</span>
          <span className="text-base font-extrabold text-slate-800">{chunkCount > 0 ? Math.round(totalTokens / chunkCount) : 0} t/chunk</span>
        </div>
      </div>

      {/* Output Preview & Download */}
      {loading ? (
        <div className="flex items-center justify-center py-8 gap-2 text-xs text-slate-500">
          <RefreshCw size={16} className="animate-spin text-indigo-600" />
          <span>Generating vector-ready chunk dataset...</span>
        </div>
      ) : error ? (
        <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-150">{error}</div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5"><Database size={13} className="text-indigo-600" /> RAG Chunk Dataset Preview</h4>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm font-semibold transition-all cursor-pointer"
            >
              <Download size={12} />
              <span>Download Dataset</span>
            </button>
          </div>
          <textarea
            readOnly
            value={output}
            className="w-full h-40 bg-slate-900 text-indigo-100 p-4 rounded-xl font-mono text-xs leading-relaxed focus:outline-none resize-none"
          />
        </div>
      )}
    </div>
  );
}

