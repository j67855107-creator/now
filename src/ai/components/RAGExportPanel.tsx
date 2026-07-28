interface RAGExportPanelProps {
  markdown: string;
  fileName?: string;
}

export default function RAGExportPanel({ markdown, fileName }: RAGExportPanelProps) {
  return (
    <div className="text-left">
      <h3 className="text-sm font-bold text-slate-800 mb-4">RAG Dataset Export</h3>
      <p className="text-xs text-slate-500">Export document chunks optimized for RAG pipelines.</p>
    </div>
  );
}
