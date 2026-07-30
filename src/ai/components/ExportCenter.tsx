import { useState } from "react";
import { Download, FileText, Code, Database, Layers, Check, RefreshCw } from "lucide-react";
import type { AIEnhancedResult, ExportFormatId } from "../../types";
import { EXPORT_FORMATS } from "../config";
import { API_BASE } from "../../api";

interface ExportCenterProps {
  markdown: string;
  fileName?: string;
  enhancedResult?: AIEnhancedResult | null;
}

export default function ExportCenter({ markdown, fileName, enhancedResult }: ExportCenterProps) {
  const [downloading, setDownloading] = useState<ExportFormatId | null>(null);
  const [downloadedFormat, setDownloadedFormat] = useState<ExportFormatId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formats: { id: ExportFormatId; name: string; desc: string; ext: string; icon: any }[] = [
    { id: "markdown", name: "Standard Markdown", desc: "Raw converted document with headings and lists", ext: "md", icon: FileText },
    { id: "clean-markdown", name: "Cleaned Markdown", desc: "Preprocessed for AI — headers and footers purged", ext: "clean.md", icon: FileText },
    { id: "txt", name: "Plain Text", desc: "Unformatted UTF-8 text with all markdown syntax stripped", ext: "txt", icon: FileText },
    { id: "json", name: "Structured JSON", desc: "Parsed document payload with word count and metadata", ext: "json", icon: Code },
    { id: "jsonl", name: "JSON Lines (JSONL)", desc: "Line-delimited JSON objects for model fine-tuning", ext: "jsonl", icon: Database },
  ];

  const handleExport = async (formatId: ExportFormatId, ext: string) => {
    if (!markdown) return;
    setDownloading(formatId);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/ai/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: formatId,
          markdown,
          metadata: { title: fileName || "Document", source: "convertoneai" },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to export document.");

      const content = data.export?.content || markdown;
      const mime = data.export?.mimeType || "text/plain";
      const blob = new Blob([content], { type: `${mime};charset=utf-8;` });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const baseName = (fileName || "document").replace(/\.[^/.]+$/, "");
      link.setAttribute("download", `${baseName}_export.${ext}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadedFormat(formatId);
      setTimeout(() => setDownloadedFormat(null), 2500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-4 text-left font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-800">Export Center</h3>
          <p className="text-[11px] text-slate-500">Download formatted document assets ready for LLM consumption, fine-tuning, or publishing.</p>
        </div>
      </div>

      {error && <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-150">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {formats.map((fmt) => {
          const IconComp = fmt.icon;
          const isDownloading = downloading === fmt.id;
          const isDone = downloadedFormat === fmt.id;

          return (
            <div key={fmt.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-start justify-between hover:border-indigo-200 transition-all">
              <div className="space-y-1 pr-2">
                <div className="flex items-center gap-1.5">
                  <IconComp size={14} className="text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800">{fmt.name}</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">{fmt.desc}</p>
              </div>

              <button
                onClick={() => handleExport(fmt.id, fmt.ext)}
                disabled={isDownloading}
                className={`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                  isDone
                    ? "bg-emerald-600 text-white"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                } disabled:opacity-50`}
              >
                {isDownloading ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : isDone ? (
                  <Check size={12} />
                ) : (
                  <Download size={12} />
                )}
                <span>{isDone ? "Exported" : fmt.ext.toUpperCase()}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

