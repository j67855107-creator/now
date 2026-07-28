import type { AIEnhancedResult } from "../../types";

interface ExportCenterProps {
  markdown: string;
  fileName?: string;
  enhancedResult?: AIEnhancedResult | null;
}

export default function ExportCenter({ markdown, fileName, enhancedResult }: ExportCenterProps) {
  return (
    <div className="text-left">
      <h3 className="text-sm font-bold text-slate-800 mb-4">Export Center</h3>
      <p className="text-xs text-slate-500">Choose from multiple export formats.</p>
    </div>
  );
}
