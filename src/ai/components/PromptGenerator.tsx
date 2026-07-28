interface PromptGeneratorProps {
  markdown: string;
  fileName?: string;
}

export default function PromptGenerator({ markdown, fileName }: PromptGeneratorProps) {
  return (
    <div className="text-left">
      <h3 className="text-sm font-bold text-slate-800 mb-4">Generate AI Prompt</h3>
      <p className="text-xs text-slate-500">Prompt generation features will appear here.</p>
    </div>
  );
}
