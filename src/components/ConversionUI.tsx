import React, { useState, useRef, useEffect } from "react";
import {
  Zap,
  ShieldCheck,
  FileText,
  Download,
  BookOpen,
  HelpCircle,
  FileCheck,
  Smartphone,
  Check,
  Copy,
  Lock,
  ArrowRight,
} from "lucide-react";
import { ViewMode, AIOptions, ProcessingStage } from "../types";
import { GUIDE_SECTIONS } from "../data";
import MarkdownPreview from "./MarkdownPreview";
import AIWorkspace from "../ai/components/AIWorkspace";
import AIOptionsPanel from "../ai/components/AIOptionsPanel";
import EnhancedProgressBar from "../ai/components/EnhancedProgressBar";
import { toolsRegistry } from "../ai/registries/toolsRegistry";

interface ConversionUIProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  file: File | null;
  setFile: (file: File | null) => void;
  converting: boolean;
  setConverting: (converting: boolean) => void;
  conversionResult: string;
  setConversionResult: (res: string) => void;
  editedMarkdown: string;
  setEditedMarkdown: (md: string) => void;
  resultDetails: { modeUsed: "ai" | "classic"; durationMs: number; warning?: string } | null;
  setResultDetails: (details: { modeUsed: "ai" | "classic"; durationMs: number; warning?: string } | null) => void;
  runConversion: () => void;
  triggerAlert: (type: "success" | "error" | "info", text: string) => void;
  selectPreconfigMode: (mode: "docx" | "pdf") => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrag: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  loadingStep: number;
}

export default function ConversionUI({
  viewMode,
  setViewMode,
  file,
  setFile,
  converting,
  setConverting,
  conversionResult,
  setConversionResult,
  editedMarkdown,
  setEditedMarkdown,
  resultDetails,
  setResultDetails,
  runConversion,
  triggerAlert,
  selectPreconfigMode,
  handleFileChange,
  handleDrag,
  handleDrop,
  fileInputRef,
  loadingStep,
}: ConversionUIProps) {
  const [mockupMode, setMockupMode] = useState<"editor" | "preview">("editor");
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [dragActiveLocal, setDragActiveLocal] = useState(false);
  const [aiOptions, setAiOptions] = useState<AIOptions>({
    cleanForAI: false,
    generateSummary: false,
    generatePrompt: false,
    generateRAG: false,
  });
  const [progressStage, setProgressStage] = useState<ProcessingStage>("idle");
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressEta, setProgressEta] = useState("");
  const [progressStep, setProgressStep] = useState("");

  const mockupMarkdown = `# Welcome to ConvertOneAI

Convert Word and PDF files cleanly with direct code block and table preserving. Drag some documents on the left panel to start compiling instantly!

## Standard Features preserved

- **Bold** and *Italic* text emphasis
- Clean bullet structures & numerical list grids
- Pre-formatted syntax code block fences like \`node\`
- Aligned Markdown Tables with headers

### Compilation Specifications

| Param | Value |
| :--- | :--- |
| Latency | 0.65s |
| Mode Accuracy | 99% |
| Cache Memory | Volatile Purge |

\`\`\`javascript
console.log("Welcome to ConvertOneAI!");
\`\`\`
`;

  const loadingSteps = [
    "Uploading document securely to Express heap memory...",
    "Verifying character bounds and layout coordinates...",
    "Preserving lists and mapping complex visual tabulations...",
    "Running local classic layout parser...",
    "Constructing standard markdown, purging server cache buffers..."
  ];

  const handleExportJSONL = () => {
    if (!editedMarkdown && !conversionResult) return;
    const contentToExport = editedMarkdown || conversionResult;
    const jsonlLine = JSON.stringify({
      text: contentToExport,
      fileName: file?.name || "document.md",
      timestamp: new Date().toISOString(),
    }) + "\n";
    const blob = new Blob([jsonlLine], { type: "application/jsonl;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const originalName = file?.name || "converted_document";
    const baseName = originalName.substring(0, originalName.lastIndexOf(".")) || originalName;
    link.setAttribute("download", `${baseName}_dataset.jsonl`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerAlert("success", "JSONL dataset exported successfully.");
  };

  // Synchronize conversion stages with pipeline progress events
  useEffect(() => {
    if (converting) {
      setProgressStage("uploading");
      setProgressPercent(15);
      setProgressEta("~3s");

      const t1 = setTimeout(() => {
        setProgressStage("validating");
        setProgressPercent(35);
        setProgressEta("~2s");
      }, 350);

      const t2 = setTimeout(() => {
        setProgressStage("extracting");
        setProgressPercent(60);
        setProgressEta("~1s");
      }, 750);

      const t3 = setTimeout(() => {
        if (aiOptions.cleanForAI || aiOptions.generateSummary) {
          setProgressStage("analyzing");
          setProgressPercent(80);
        } else {
          setProgressStage("cleaning");
          setProgressPercent(75);
        }
        setProgressEta("~1s");
      }, 1200);

      const t4 = setTimeout(() => {
        setProgressStage("generating");
        setProgressPercent(92);
        setProgressEta("~0s");
      }, 1650);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    } else if (conversionResult) {
      setProgressStage("complete");
      setProgressPercent(100);
      setProgressEta("00:00");
    }
  }, [converting, conversionResult]);

  const handleInstantCopy = () => {
    if (!editedMarkdown) return;
    navigator.clipboard.writeText(editedMarkdown);
    setCopiedSuccess(true);
    triggerAlert("success", "Markdown successfully copied to your system clipboard!");
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  const handleInstantDownload = () => {
    if (!editedMarkdown && !conversionResult) return;
    const content = editedMarkdown || conversionResult;
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const originalName = file?.name || "converted_document";
    const baseName = originalName.substring(0, originalName.lastIndexOf(".")) || originalName;
    link.setAttribute("download", `${baseName}_converted.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerAlert("success", "Markdown file download initiated successfully.");
  };

  const handleDragOverLocal = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActiveLocal(true);
    } else if (e.type === "dragleave") {
      setDragActiveLocal(false);
    }
    handleDrag(e);
  };

  const handleDropLocal = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveLocal(false);
    handleDrop(e);
  };

  return (
    <div className="space-y-12">
      {!conversionResult ? (
        /* SIDE-BY-SIDE GRID THEME FROM "PROFESSIONAL POLISH" */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Side: Uploader + Title + Badges */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-6 text-left">
            {/* Hero Title and Subtitle */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#FAF8F3] text-[#2F6F5E] font-mono text-xs border border-[#E4E0D8]">
                <ShieldCheck size={13} className="stroke-[2]" />
                <span>// [ ai document intelligence platform ]</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold font-display text-[#171B26] leading-tight tracking-tight">
                {viewMode === "convert-word" && <>Word to Markdown Converter — Clean &amp; AI-Ready</>}
                {viewMode === "convert-pdf" && <>PDF to Markdown Converter — High Accuracy</>}
                {viewMode === "home" && <>Enterprise AI Document Processing &amp; Conversion Platform</>}
              </h1>
              <p className="text-[#6B6459] text-sm md:text-base leading-relaxed max-w-lg font-sans">
                Upload files to instantly parse layout noise, structure Markdown, generate prompts, and build RAG vector datasets for AI models.
              </p>

              {/* 3-Step Workflow Indicator */}
              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-[#6B6459] pt-1">
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${!file ? "bg-[#FAF8F3] border-[#2F6F5E] text-[#2F6F5E] font-bold" : "bg-[#FAF8F3] border-[#E4E0D8] text-[#6B6459]"}`}>
                  <span className="w-4 h-4 rounded bg-[#2F6F5E] text-[#F6F4EE] text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                  <span className="truncate">1. Upload File</span>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${file && !converting && progressStage === "idle" ? "bg-[#FAF8F3] border-[#2F6F5E] text-[#2F6F5E] font-bold" : "bg-[#FAF8F3] border-[#E4E0D8] text-[#6B6459]"}`}>
                  <span className="w-4 h-4 rounded bg-[#2F6F5E] text-[#F6F4EE] text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                  <span className="truncate">2. Choose Action</span>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${progressStage === "complete" ? "bg-[#FAF8F3] border-[#2F6F5E] text-[#2F6F5E] font-bold" : "bg-[#FAF8F3] border-[#E4E0D8] text-[#6B6459]"}`}>
                  <span className="w-4 h-4 rounded bg-[#2F6F5E] text-[#F6F4EE] text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
                  <span className="truncate">3. Get AI Output</span>
                </div>
              </div>
            </div>

            {/* Upload Zone */}
            <div
              onDragEnter={handleDragOverLocal}
              onDragOver={handleDragOverLocal}
              onDragLeave={handleDragOverLocal}
              onDrop={handleDropLocal}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col bg-[#FAF8F3] border-2 border-dashed rounded-xl p-8 items-center justify-center text-center group transition-all relative cursor-pointer min-h-[230px] ${
                dragActiveLocal ? "border-[#2F6F5E] bg-[#F6F4EE]" : "border-[#E4E0D8] hover:border-[#2F6F5E]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                id="file-selector-input"
                className="hidden"
                accept={
                  viewMode === "convert-word" ? ".docx" :
                  viewMode === "convert-pdf" ? ".pdf" :
                  ".docx,.pdf,.pptx,.xlsx,.xls,.csv,.epub,.html,.htm,.png,.jpg,.jpeg,.webp,.bmp"
                }
                onChange={handleFileChange}
              />

              <div className="w-12 h-12 bg-white border border-[#E4E0D8] rounded-xl flex items-center justify-center mb-3.5 group-hover:bg-[#FAF8F3] transition-colors">
                <svg className="w-6 h-6 text-[#2F6F5E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#171B26]">
                  {file ? "File selected & ready" : "Drop your file here or click to browse"}
                </p>
                <p className="text-[#6B6459] text-xs font-mono">
                  {file ? `${file.name} (${(file.size / 1024).toFixed(1)} KB)` : `Supports PDF, Word, PPTX, Excel, EPUB, HTML & Images`}
                </p>
              </div>

              {file ? (
                <button
                  type="button"
                  className="mt-4 bg-[#2F6F5E] text-[#F6F4EE] px-4 py-2 rounded-xl font-medium shadow-xs hover:bg-[#275F50] transition-all text-xs cursor-pointer"
                >
                  File Selected
                </button>
              ) : (
                <button
                  type="button"
                  className="mt-4 bg-white border border-[#171B26] text-[#171B26] px-5 py-2 rounded-xl font-medium hover:bg-[#FAF8F3] transition-all text-xs cursor-pointer"
                >
                  Choose File
                </button>
              )}
            </div>

            {/* Post-Upload Action Selector */}
            {file && !converting && (
              <div className="bg-[#FAF8F3] border border-[#E4E0D8] rounded-xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#171B26] flex items-center gap-1.5">
                    <Zap size={14} className="text-[#2F6F5E]" />
                    Select Action for Uploaded File
                  </span>
                  <span className="text-[10px] text-[#2F6F5E] font-mono font-medium bg-[#F6F4EE] px-2 py-0.5 rounded border border-[#E4E0D8]">✓ File Ready</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans">
                  <button
                    onClick={() => setAiOptions({ cleanForAI: false, generateSummary: false, generatePrompt: false, generateRAG: false })}
                    className={`p-2.5 rounded-xl border text-left font-medium transition-all cursor-pointer ${
                      !aiOptions.cleanForAI && !aiOptions.generateSummary && !aiOptions.generatePrompt && !aiOptions.generateRAG
                        ? "bg-[#FAF8F3] border-[#2F6F5E] text-[#2F6F5E]"
                        : "bg-white border-[#E4E0D8] text-[#6B6459] hover:bg-[#FAF8F3]"
                    }`}
                  >
                    <div className="font-semibold text-[#171B26]">Standard Convert</div>
                    <div className="text-[10px] text-[#6B6459] font-normal">Direct Document → Markdown</div>
                  </button>

                  <button
                    onClick={() => setAiOptions({ cleanForAI: true, generateSummary: false, generatePrompt: false, generateRAG: false })}
                    className={`p-2.5 rounded-xl border text-left font-medium transition-all cursor-pointer ${
                      aiOptions.cleanForAI && !aiOptions.generateSummary && !aiOptions.generatePrompt
                        ? "bg-[#FAF8F3] border-[#2F6F5E] text-[#2F6F5E]"
                        : "bg-white border-[#E4E0D8] text-[#6B6459] hover:bg-[#FAF8F3]"
                    }`}
                  >
                    <div className="font-semibold text-[#171B26]">Clean for AI</div>
                    <div className="text-[10px] text-[#6B6459] font-normal">Purge Headers &amp; Footers</div>
                  </button>

                  <button
                    onClick={() => setAiOptions({ cleanForAI: true, generateSummary: true, generatePrompt: false, generateRAG: false })}
                    className={`p-2.5 rounded-xl border text-left font-medium transition-all cursor-pointer ${
                      aiOptions.generateSummary
                        ? "bg-[#FAF8F3] border-[#2F6F5E] text-[#2F6F5E]"
                        : "bg-white border-[#E4E0D8] text-[#6B6459] hover:bg-[#FAF8F3]"
                    }`}
                  >
                    <div className="font-semibold text-[#171B26]">AI Summary</div>
                    <div className="text-[10px] text-[#6B6459] font-normal">Extract Overview &amp; Key Points</div>
                  </button>

                  <button
                    onClick={() => setAiOptions({ cleanForAI: true, generateSummary: true, generatePrompt: true, generateRAG: true })}
                    className="p-2.5 rounded-xl border border-[#2F6F5E] bg-[#2F6F5E] hover:bg-[#275F50] text-[#F6F4EE] text-left font-medium shadow-xs transition-all cursor-pointer sm:col-span-2 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-xs">Prepare for AI (Recommended)</div>
                      <div className="text-[10px] text-[#F6F4EE]/80 font-normal">Full Clean + Summary + Prompt + RAG Pipeline</div>
                    </div>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Transpile CTA if file selected */}
            {file && !converting && (
              <button
                onClick={runConversion}
                className="w-full flex items-center justify-center gap-2 bg-[#2F6F5E] hover:bg-[#275F50] text-[#F6F4EE] font-semibold py-3 rounded-xl shadow-xs cursor-pointer transition-all text-xs"
              >
                <Zap size={14} className="fill-[#F6F4EE]" />
                <span>Run Action &amp; Transpile Document</span>
              </button>
            )}

            {/* Enhanced Progress Bar - shown during active conversion or completed state */}
            {(converting || (progressStage !== "idle" && file)) && (
              <EnhancedProgressBar
                stage={progressStage}
                percent={progressPercent}
                eta={progressEta}
                speed="1.8 MB/s"
                pages={Math.max(1, Math.round((file?.size || 45000) / (45 * 1024)))}
                step={progressStep}
                file={file}
                isAIEnabled={
                  aiOptions.cleanForAI ||
                  aiOptions.generateSummary ||
                  aiOptions.generatePrompt ||
                  aiOptions.generateRAG
                }
                onRetry={() => {
                  setProgressStage("uploading");
                  setProgressPercent(15);
                  runConversion();
                }}
                onCancel={() => {
                  setConverting(false);
                  setProgressStage("cancelled");
                }}
                onDownload={handleInstantDownload}
                onGenerateSummary={() => {
                  setAiOptions((prev) => ({ ...prev, generateSummary: true }));
                  triggerAlert("info", "AI Summary generation enabled for output.");
                }}
                onGeneratePrompt={() => {
                  setAiOptions((prev) => ({ ...prev, generatePrompt: true }));
                  triggerAlert("info", "AI Prompt generator enabled.");
                }}
                onCreateRAG={() => {
                  setAiOptions((prev) => ({ ...prev, generateRAG: true }));
                  triggerAlert("info", "RAG Dataset compilation enabled.");
                }}
                onExportJSONL={handleExportJSONL}
                onConvertAnother={() => {
                  setFile(null);
                  setConverting(false);
                  setConversionResult("");
                  setEditedMarkdown("");
                  setProgressStage("idle");
                  setProgressPercent(0);
                }}
                onReportIssue={() => {
                  triggerAlert(
                    "info",
                    "Support team notified with diagnostic telemetry logs. Ref: #ERR-" +
                      Math.floor(1000 + Math.random() * 9000)
                  );
                }}
              />
            )}

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#FAF8F3] p-3 py-3.5 rounded-xl border border-[#E4E0D8] text-center shadow-xs">
                <div className="w-6 h-6 bg-white border border-[#E4E0D8] rounded-full flex items-center justify-center mb-1.5 mx-auto">
                  <svg className="w-3 h-3 text-[#2F6F5E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#6B6459]">Privacy</p>
                <p className="text-[9px] text-[#6B6459] mt-0.5 leading-tight">Post-transpile volatile purge</p>
              </div>
              <div className="bg-[#FAF8F3] p-3 py-3.5 rounded-xl border border-[#E4E0D8] text-center shadow-xs">
                <div className="w-6 h-6 bg-white border border-[#E4E0D8] rounded-full flex items-center justify-center mb-1.5 mx-auto">
                  <svg className="w-3 h-3 text-[#2F6F5E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#6B6459]">Speed</p>
                <p className="text-[9px] text-[#6B6459] mt-0.5 leading-tight">Instant memory processing</p>
              </div>
              <div className="bg-[#FAF8F3] p-3 py-3.5 rounded-xl border border-[#E4E0D8] text-center shadow-xs">
                <div className="w-6 h-6 bg-white border border-[#E4E0D8] rounded-full flex items-center justify-center mb-1.5 mx-auto">
                  <svg className="w-3 h-3 text-[#D98F3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#6B6459]">Secure</p>
                <p className="text-[9px] text-[#6B6459] mt-0.5 leading-tight">SSL encrypted connection</p>
              </div>
            </div>
          </div>

          {/* Right Side: Interactive Live Preview Panel (SIGNATURE ELEMENT — MONO FONT THROUGHOUT) */}
          <div className="col-span-12 lg:col-span-7 bg-[#FAF8F3] rounded-xl border border-[#E4E0D8] shadow-xs flex flex-col overflow-hidden text-left h-full min-h-[500px] font-mono preview-panel-reveal">
            <div className="bg-[#F6F4EE] border-b border-[#E4E0D8] px-6 py-4 flex items-center justify-between select-none">
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono font-semibold text-[#171B26]">Preview: <span className="text-[#6B6459] font-normal">output_preview.md</span></span>
                <div className="flex bg-[#E4E0D8]/60 rounded-md p-0.5">
                  <button onClick={() => setMockupMode("editor")} className={`px-3 py-1 text-[10px] font-mono font-semibold rounded cursor-pointer transition-all ${mockupMode === "editor" ? "bg-white shadow-xs text-[#2F6F5E]" : "text-[#6B6459] hover:text-[#171B26]"}`}>Editor</button>
                  <button onClick={() => setMockupMode("preview")} className={`px-3 py-1 text-[10px] font-mono font-semibold rounded cursor-pointer transition-all ${mockupMode === "preview" ? "bg-white shadow-xs text-[#2F6F5E]" : "text-[#6B6459] hover:text-[#171B26]"}`}>Preview</button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 bg-white text-[#2F6F5E] border border-[#E4E0D8] px-2.5 py-1 text-xs font-mono font-medium rounded select-none">
                  Sample Output
                </span>
              </div>
            </div>

            {mockupMode === "editor" ? (
              <div className="flex-grow p-6 font-mono text-xs text-[#171B26] leading-relaxed overflow-y-auto max-h-[380px] space-y-3">
                <p className="text-[#2F6F5E] font-bold"># Welcome to ConvertOneAI</p>
                <p className="text-[#6B6459]">Convert Word and PDF files cleanly with direct code block and table preserving. Drag some documents on the left panel to start compiling instantly!</p>
                
                <p className="text-[#2F6F5E] font-bold pt-2">## Standard Features preserved</p>
                <ul className="space-y-1.5 pl-1 text-[#171B26]">
                  <li>• <strong className="text-[#171B26]">Bold</strong> and <em className="text-[#171B26]">Italic</em> text emphasis</li>
                  <li>• Clean bullet structures &amp; numerical list grids</li>
                  <li>• Pre-formatted syntax code block fences like <code className="bg-[#E4E0D8]/60 px-1 py-0.5 rounded text-[#2F6F5E]">node</code></li>
                  <li>• Aligned Markdown Tables with headers</li>
                </ul>

                <p className="text-[#2F6F5E] font-bold pt-2">### Compilation Specifications</p>
                <div className="border border-[#E4E0D8] rounded-lg p-3.5 bg-white max-w-sm">
                  <p className="pb-1.5 text-[10px] text-[#6B6459] font-mono uppercase tracking-wider">Metric Outcomes</p>
                  <table className="w-full text-[11px] text-[#171B26] font-mono">
                    <thead>
                      <tr className="border-b border-[#E4E0D8]"><th className="text-left font-bold pb-1 text-[#6B6459]">Param</th><th className="text-right font-bold pb-1 text-[#6B6459]">Value</th></tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[#E4E0D8]/60"><td className="py-1">Latency</td><td className="text-right text-[#2F6F5E] font-bold">0.65s</td></tr>
                      <tr className="border-b border-[#E4E0D8]/60"><td className="py-1">Mode Accuracy</td><td className="text-right text-[#2F6F5E] font-bold">99%</td></tr>
                      <tr><td className="py-1">Cache Memory</td><td className="text-right text-[#6B6459]">Volatile Purge</td></tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-[#E4E0D8]/40 border border-[#E4E0D8] rounded-lg p-3 mt-3">
                  <p className="text-[#2F6F5E] font-mono">```javascript</p>
                  <p className="text-[#171B26] pl-4">console.log("Welcome to ConvertOneAI!");</p>
                  <p className="text-[#2F6F5E] font-mono">```</p>
                </div>
              </div>
            ) : (
              <div className="flex-grow overflow-y-auto max-h-[380px] p-6 font-mono text-xs text-[#171B26] space-y-4">
                <MarkdownPreview markdown={mockupMarkdown} />
              </div>
            )}

            <div className="px-6 py-3.5 bg-[#FAF8F3] border-t border-[#E4E0D8] flex items-center justify-between select-none">
              <span className="text-[10px] text-[#6B6459] flex items-center gap-1.5 font-mono font-medium">
                <span className="w-2 h-2 bg-[#2F6F5E] rounded-full animate-pulse"></span>
                Active Engine: Core v2.4 (Stable)
              </span>
              <span className="text-[10px] text-[#6B6459] font-semibold font-mono">Words: 142 | Characters: 894</span>
            </div>
          </div>
        </div>
      ) : (
        <>
        {/* Conversions Completed Workspace UI Layout */}
        <div className="bg-[#FAF8F3] rounded-xl border border-[#E4E0D8] shadow-xs overflow-hidden text-left">
          {/* File Metadata Ribbon indicator */}
          <div className="bg-[#F6F4EE] border-b border-[#E4E0D8] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 select-none font-sans">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6B6459] block pb-0.5">Active Asset Target</span>
              <span className="font-bold text-[#171B26] text-sm flex items-center gap-1.5">
                <FileCheck size={16} className="text-[#2F6F5E]" />
                {file?.name || "unnamed_document"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-[#6B6459] bg-white border border-[#E4E0D8] p-1 px-2 rounded-lg">
                Size: <span className="font-mono text-[#171B26] font-semibold">{(file ? file.size / 1024 : 0).toFixed(1)} KB</span>
              </span>
              {resultDetails && (
                <>
                  <span className="text-xs text-[#2F6F5E] bg-[#FAF8F3] border border-[#E4E0D8] p-1 px-2 rounded-lg font-semibold flex items-center gap-1">
                    <Zap size={10} className="fill-[#2F6F5E]" />
                    Model used: {resultDetails.modeUsed === "ai" ? "Local AI" : "Classic Core Engine"}
                  </span>
                  <span className="text-xs text-[#6B6459] bg-white border border-[#E4E0D8] p-1 px-2 rounded-lg">
                    Speed: <span className="font-mono text-[#171B26] font-semibold">{resultDetails.durationMs}ms</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Split Editing workspace */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Left Pane: Interactive Source code with copy/download */}
            <div className="flex flex-col gap-3 text-left">
              <div className="flex justify-between items-center select-none">
                <h3 className="text-xs font-mono font-semibold text-[#6B6459] uppercase tracking-wider">
                  Formatted Source Editor
                </h3>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleInstantCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#6B6459] hover:text-[#2F6F5E] bg-[#FAF8F3] hover:bg-[#F6F4EE] rounded-lg border border-[#E4E0D8] hover:border-[#2F6F5E] transition-all font-medium cursor-pointer"
                    id="btn-source-copy"
                  >
                    {copiedSuccess ? <Check size={12} className="text-[#2F6F5E]" /> : <Copy size={12} />}
                    <span>{copiedSuccess ? "Copied" : "Copy Source"}</span>
                  </button>

                  <button
                    onClick={handleInstantDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#F6F4EE] bg-[#2F6F5E] hover:bg-[#275F50] rounded-lg shadow-xs transition-all font-semibold cursor-pointer"
                    id="btn-source-download"
                  >
                    <Download size={12} />
                    <span>Download .md</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={editedMarkdown}
                  onChange={(e) => setEditedMarkdown(e.target.value)}
                  className="w-full h-[460px] bg-[#171B26] text-[#F6F4EE] p-5 rounded-xl border border-[#171B26] font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#2F6F5E] resize-none overflow-y-auto"
                  placeholder="Raw Markdown source output appears here. Make edits if needed..."
                  id="raw-editor-workspace"
                />
                {/* Clear and start fresh bar */}
                <div className="absolute bottom-4.5 right-4.5 select-none opacity-80 hover:opacity-100">
                  <button
                    onClick={() => {
                      setFile(null);
                      setConversionResult("");
                      setEditedMarkdown("");
                      setResultDetails(null);
                    }}
                    className="text-[11px] font-mono font-bold text-[#6B6459] hover:text-rose-400 bg-[#171B26] border border-[#6B6459]/40 hover:border-rose-500 p-1 px-2.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Convert Another File
                  </button>
                </div>
              </div>
            </div>

            {/* Right Pane: Live parsed render preview */}
            <MarkdownPreview markdown={editedMarkdown} />
          </div>
        </div>

        {/* AI Workspace - appears after conversion completes */}
        <AIWorkspace markdown={editedMarkdown} fileName={file?.name} />
        </>
      )}
      {/* Featured Top 5 AI Tools Capabilities Section */}
      <section className="bg-[#FAF8F3] rounded-xl border border-[#E4E0D8] p-6 md:p-8 shadow-xs space-y-6 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2F6F5E] block">Platform Capabilities</span>
            <h2 className="text-2xl font-bold font-display text-[#171B26] tracking-tight">
              Featured AI Document Intelligence Tools
            </h2>
            <p className="text-[#6B6459] text-xs md:text-sm font-sans">
              Top document preparation, cleaning, summarizing, prompt engineering, and dataset export capabilities.
            </p>
          </div>
          <button
            onClick={() => setViewMode("tools")}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#2F6F5E] hover:bg-[#275F50] text-[#F6F4EE] text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
          >
            <span>View All AI Tools</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {toolsRegistry.getFeatured().map((tool) => (
            <div
              key={tool.id}
              onClick={() => setViewMode("tools")}
              className="p-4 bg-[#F6F4EE] hover:bg-white border border-[#E4E0D8] hover:border-[#2F6F5E] rounded-xl transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-[#E4E0D8] group-hover:border-[#2F6F5E] transition-colors">
                    <Zap size={16} className="text-[#2F6F5E]" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#2F6F5E] bg-[#FAF8F3] px-2 py-0.5 rounded border border-[#2F6F5E]/30">
                    Featured
                  </span>
                </div>
                <h3 className="text-xs font-bold text-[#171B26] group-hover:text-[#2F6F5E] transition-colors">
                  {tool.title}
                </h3>
                <p className="text-[11px] text-[#6B6459] line-clamp-2 leading-relaxed">
                  {tool.shortDescription}
                </p>
              </div>

              <div className="mt-3 pt-2 text-[11px] font-mono font-bold text-[#2F6F5E] flex items-center gap-1">
                <span>Explore Tool</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Keyword-Optimized Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#FAF8F3] rounded-xl border border-[#E4E0D8] p-6 md:p-8 shadow-xs space-y-4 hover:border-[#2F6F5E] transition-all text-left">
          <div className="w-10 h-10 bg-[#F6F4EE] text-[#2F6F5E] rounded-xl flex items-center justify-center border border-[#E4E0D8]">
            <Zap size={20} className="stroke-[2]" />
          </div>
          <h3 className="text-lg font-bold font-display text-[#171B26] tracking-tight">
            Conversions compile in milliseconds
          </h3>
          <p className="text-[#6B6459] text-xs md:text-sm leading-relaxed font-sans">
            Stop waiting for slow servers or processing queues. Our high-performance online document converter parses heavy documents in under a second. By compiling text structures entirely in local RAM, you get instant, high-speed Word to Markdown and PDF to MD online translations. This makes us the premier free PDF to MD converter for developers and content creators.
          </p>
        </div>

        <div className="bg-[#FAF8F3] rounded-xl border border-[#E4E0D8] p-6 md:p-8 shadow-xs space-y-4 hover:border-[#2F6F5E] transition-all text-left">
          <div className="w-10 h-10 bg-[#F6F4EE] text-[#2F6F5E] rounded-xl flex items-center justify-center border border-[#E4E0D8]">
            <ShieldCheck size={20} className="stroke-[2]" />
          </div>
          <h3 className="text-lg font-bold font-display text-[#171B26] tracking-tight">
            Security backed by immediate data purging
          </h3>
          <p className="text-[#6B6459] text-xs md:text-sm leading-relaxed font-sans">
            Your digital trust remains our highest priority. We focus on secure document processing by operating a zero-storage architecture. All uploaded PDF or Word files exist only in volatile server memory during the active conversion and get instantly purged the second compilation completes. No files, metadata, or logs are ever saved.
          </p>
        </div>

        <div className="bg-[#FAF8F3] rounded-xl border border-[#E4E0D8] p-6 md:p-8 shadow-xs space-y-4 hover:border-[#2F6F5E] transition-all text-left">
          <div className="w-10 h-10 bg-[#F6F4EE] text-[#2F6F5E] rounded-xl flex items-center justify-center border border-[#E4E0D8]">
            <FileText size={20} className="stroke-[2]" />
          </div>
          <h3 className="text-lg font-bold font-display text-[#171B26] tracking-tight">
            Clean, developer-ready Markdown syntax
          </h3>
          <p className="text-[#6B6459] text-xs md:text-sm leading-relaxed font-sans">
            Avoid messy, uncooperative formatting and broken layouts. Our specialized compiler extracts nested lists, complex bold/italic typography, and code blocks perfectly. Built with the spirit of an open-source markdown tool, we map tables into clean Markdown code grids, ensuring your output is ready for documentation hubs, blogs, and static sites instantly.
          </p>
        </div>
      </section>

      {/* Markdown Cheatsheet Section */}
      <section className="bg-[#FAF8F3] rounded-xl border border-[#E4E0D8] p-6 md:p-8 shadow-xs">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-10 select-none">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2F6F5E] block">Structured Syntax Guide</span>
          <h2 className="text-2xl md:text-3xl font-bold font-display text-[#171B26] tracking-tight">
            The Complete Markdown Cheat-Sheet
          </h2>
          <p className="text-[#6B6459] text-sm font-sans max-w-xl mx-auto leading-relaxed">
            Understand core text syntax identifiers for documentation, notes, and repository Readme outlines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {GUIDE_SECTIONS.slice(0, 3).map((guide, idx) => (
            <div key={idx} className="border border-[#E4E0D8] rounded-xl p-5 hover:border-[#2F6F5E] transition-colors flex flex-col justify-between bg-[#F6F4EE]">
              <div>
                <h3 className="font-bold text-[#171B26] text-sm font-sans tracking-wide mb-1.5 flex items-center gap-1.5">
                  <BookOpen size={15} className="text-[#2F6F5E]" />
                  {guide.title}
                </h3>
                <p className="text-[#6B6459] text-xs leading-normal font-sans mb-4">{guide.description}</p>
              </div>

              <div className="bg-[#FAF8F3] p-3 rounded-lg border border-[#E4E0D8]">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6B6459] block pb-1.5">Symbol Syntax</span>
                <pre className="font-mono text-xs text-[#2F6F5E] overflow-x-auto truncate">{guide.syntax}</pre>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8 select-none">
          <button
            onClick={() => setViewMode("guide")}
            className="inline-flex items-center gap-1 px-4 py-2.5 bg-[#FAF8F3] hover:bg-[#F6F4EE] text-xs font-mono font-bold text-[#2F6F5E] hover:text-[#275F50] rounded-xl border border-[#E4E0D8] hover:border-[#2F6F5E] transition-colors cursor-pointer"
          >
            <span>Explore Markdown Syntaxes</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-[#FAF8F3] rounded-xl border border-[#E4E0D8] p-6 md:p-10 shadow-xs space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-3 select-none">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2F6F5E] block">Expert Insights</span>
          <h2 className="text-2xl md:text-3xl font-bold font-display text-[#171B26] tracking-tight">
            Common conversion questions answered
          </h2>
          <p className="text-[#6B6459] text-xs md:text-sm leading-relaxed font-sans">
            Get answers to targeted questions regarding our free Word to Markdown converter and secure document rendering engines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="space-y-2 p-5 bg-[#F6F4EE] border border-[#E4E0D8] rounded-xl hover:bg-white transition-colors">
            <h3 className="font-bold text-[#171B26] text-sm md:text-base flex items-start gap-2">
              <HelpCircle size={18} className="text-[#2F6F5E] mt-0.5 shrink-0" />
              <span>How to convert PDF to Markdown?</span>
            </h3>
            <p className="text-[#6B6459] text-xs md:text-sm leading-relaxed pl-6.5 font-sans">
              To convert a PDF to Markdown, simply drag and drop your file into the ConvertOneAI uploader zone above. The system automatically processes the document's typography, maps headers, and extracts aligned text into clean Markdown. You can edit the output directly in our live editor or download it immediately.
            </p>
          </div>

          <div className="space-y-2 p-5 bg-[#F6F4EE] border border-[#E4E0D8] rounded-xl hover:bg-white transition-colors">
            <h3 className="font-bold text-[#171B26] text-sm md:text-base flex items-start gap-2">
              <HelpCircle size={18} className="text-[#2F6F5E] mt-0.5 shrink-0" />
              <span>Is ConvertOneAI free to use?</span>
            </h3>
            <p className="text-[#6B6459] text-xs md:text-sm leading-relaxed pl-6.5 font-sans">
              Yes, ConvertOneAI is entirely free. You can convert PDF to Markdown and use our Word to Markdown converter without paying any subscription fees, answering captchas, or creating accounts. We believe developer-grade plain-text formatting tools should be accessible to everyone.
            </p>
          </div>

          <div className="space-y-2 p-5 bg-[#F6F4EE] border border-[#E4E0D8] rounded-xl hover:bg-white transition-colors">
            <h3 className="font-bold text-[#171B26] text-sm md:text-base flex items-start gap-2">
              <HelpCircle size={18} className="text-[#2F6F5E] mt-0.5 shrink-0" />
              <span>What Markdown flavor does it output?</span>
            </h3>
            <p className="text-[#6B6459] text-xs md:text-sm leading-relaxed pl-6.5 font-sans">
              Our compiler outputs highly standard, compliant CommonMark and GitHub Flavored Markdown (GFM). This guarantees that your converted code blocks, custom nested tables, headers, and bullet points render perfectly in Jekyll, Hugo, Astro, Obsidian, Notion, GitHub wikis, or static documentation sites.
            </p>
          </div>

          <div className="space-y-2 p-5 bg-[#F6F4EE] border border-[#E4E0D8] rounded-xl hover:bg-white transition-colors">
            <h3 className="font-bold text-[#171B26] text-sm md:text-base flex items-start gap-2">
              <HelpCircle size={18} className="text-[#2F6F5E] mt-0.5 shrink-0" />
              <span>Does ConvertOneAI support complex tables?</span>
            </h3>
            <p className="text-[#6B6459] text-xs md:text-sm leading-relaxed pl-6.5 font-sans">
              Scheduling table translations can be messy. ConvertOneAI excels at converting complex tables and structural grids. Instead of rendering tables as unstructured text, we parse cells into properly aligned GFM markdown pipe tables so your tabular data is immediately usable in any editor.
            </p>
          </div>
        </div>
      </section>

      {/* Trust metrics — Structured Ink dark surface */}
      <section className="bg-[#171B26] text-[#F6F4EE] rounded-xl border border-[#2F6F5E] p-8 md:p-12 text-center relative overflow-hidden select-none">
        <div className="max-w-2xl mx-auto space-y-5 relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight">Designed for Writers, Engineered for Developers</h2>
          <p className="text-[#F6F4EE]/70 text-sm leading-relaxed font-sans max-w-lg mx-auto">
            By processing raw parsing inside on-fly memory logs, ConvertOneAI establishes ultimate trust. Your credentials are fine, files are purged instantly, with no accounts required.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 font-mono font-semibold text-xs text-[#F6F4EE]/80">
            <span className="flex items-center gap-1 bg-[#F6F4EE]/5 border border-[#2F6F5E]/30 p-1 px-2.5 rounded-full"><Lock size={12} /> SSL Encrypted</span>
            <span className="flex items-center gap-1 bg-[#F6F4EE]/5 border border-[#2F6F5E]/30 p-1 px-2.5 rounded-full"><ShieldCheck size={12} /> Zero-Storage Active</span>
            <span className="flex items-center gap-1 bg-[#F6F4EE]/5 border border-[#2F6F5E]/30 p-1 px-2.5 rounded-full"><Smartphone size={12} /> Mobile Adaptive</span>
          </div>
        </div>
      </section>
    </div>
  );
}
