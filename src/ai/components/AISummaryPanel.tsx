import type { AIEnhancedResult } from "../../types";

interface AISummaryPanelProps {
  markdown: string;
  enhancedResult?: AIEnhancedResult | null;
}

export default function AISummaryPanel({ markdown, enhancedResult }: AISummaryPanelProps) {
  return (
    <div className="text-left">
      <h3 className="text-sm font-bold text-slate-800 mb-4">AI Summary</h3>
      <p className="text-xs text-slate-500">AI summary features will appear here after processing.</p>
    </div>
  );
}
