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

  const handleInstantCopy = () => {
    if (!editedMarkdown) return;
    navigator.clipboard.writeText(editedMarkdown);
    setCopiedSuccess(true);
    triggerAlert("success", "Markdown successfully copied to your system clipboard!");
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  const handleInstantDownload = () => {
    if (!editedMarkdown) return;
    const blob = new Blob([editedMarkdown], { type: "text/markdown;charset=utf-8;" });
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
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-xs tracking-wider uppercase font-sans border border-indigo-100 mb-2">
                <ShieldCheck size={12} className="stroke-[2.5]" />
                <span>Volatile Memory • 100% Secure</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight font-sans">
                {viewMode === "convert-word" && <>Word to Markdown converter | Free &amp; Clean MD</>}
                {viewMode === "convert-pdf" && <>Convert PDF to Markdown | Online Document Converter</>}
                {viewMode === "home" && <>Convert PDF to Markdown &amp; Word Documents Instantly</>}
              </h1>
              <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-lg font-sans">
                {viewMode === "convert-word" && "Extract clean structures, tabular data, and lists from Word documents. Experience docx to markdown free translations instantly."}
                {viewMode === "convert-pdf" && "Repurpose your PDFs into lightweight, plain-text assets. Enjoy premium PDF to MD online rendering with our secure converter."}
                {viewMode === "home" && "Transform files with our secure online document converter. Experience seamless docx to markdown free translations and pristine, high-fidelity PDF to MD online conversions with zero registrations."}
              </p>
            </div>

            {/* Upload Zone */}
            <div
              onDragEnter={handleDragOverLocal}
              onDragOver={handleDragOverLocal}
              onDragLeave={handleDragOverLocal}
              onDrop={handleDropLocal}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col bg-white border-2 border-dashed rounded-2xl p-8 items-center justify-center text-center group transition-all relative cursor-pointer min-h-[260px] ${
                dragActiveLocal ? "border-indigo-500 bg-indigo-50/20" : "border-slate-300 hover:border-indigo-400 bg-opacity-50"
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
                  ".docx,.pdf"
                }
                onChange={handleFileChange}
              />

              {/* Loader Carousel layer */}
              {converting ? (
                <div className="absolute inset-0 bg-white/95 rounded-2xl z-20 flex flex-col items-center justify-center p-6 select-none">
                  <div className="relative flex items-center justify-center mb-4">
                    <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                    <FileText size={18} className="text-indigo-600 absolute animate-pulse" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight font-sans">Processing File...</h3>
                  <p className="text-slate-500 text-[11px] mt-1.5 text-center font-sans max-w-[220px]">
                    {loadingSteps[loadingStep]}
                  </p>
                </div>
              ) : null}

              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>

              <div className="space-y-1">
                <p className="text-base font-bold text-slate-800">
                  {file ? "File selected & ready" : "Drop your file here"}
                </p>
                <p className="text-slate-400 text-xs">
                  {file ? `${file.name} (${(file.size / 1024).toFixed(1)} KB)` : `Supports .docx, .pdf up to 50MB`}
                </p>
              </div>

              {file ? (
                <button
                  type="button"
                  className="mt-5 bg-indigo-600 text-white px-5 py-2 rounded-xl font-semibold shadow hover:bg-indigo-700 transition-all text-xs cursor-pointer"
                >
                  Ready to Transpile
                </button>
              ) : (
                <button
                  type="button"
                  className="mt-5 bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-medium shadow-sm hover:bg-slate-50 transition-all text-xs cursor-pointer"
                >
                  Choose File
                </button>
              )}
            </div>

            {/* AI Options Panel - shown when file is selected */}
            {file && !converting && (
              <AIOptionsPanel options={aiOptions} onChange={setAiOptions} />
            )}

            {/* Transpile CTA if file selected */}
            {file && !converting && (
              <button
                onClick={runConversion}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-md cursor-pointer transition-all text-sm animate-bounce"
              >
                <Zap size={15} className="fill-white animate-pulse" />
                <span>Transpile into Markdown Now</span>
              </button>
            )}

            {/* Enhanced Progress Bar - shown during conversion */}
            {converting && (
              <EnhancedProgressBar
                stage={progressStage}
                percent={progressPercent}
                eta={progressEta}
                step={progressStep}
                onCancel={() => {
                  setConverting(false);
                  setProgressStage("cancelled");
                }}
              />
            )}

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-3 py-3.5 rounded-xl border border-slate-200/60 shadow-sm text-center">
                <div className="w-7 h-7 bg-green-50 rounded-full flex items-center justify-center mb-1.5 mx-auto">
                  <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Privacy</p>
                <p className="text-[9px] text-slate-500 mt-0.5 leading-tight">Post-transpile volatile purge</p>
              </div>
              <div className="bg-white p-3 py-3.5 rounded-xl border border-slate-200/60 shadow-sm text-center">
                <div className="w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center mb-1.5 mx-auto">
                  <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Speed</p>
                <p className="text-[9px] text-slate-500 mt-0.5 leading-tight">Instant memory processing</p>
              </div>
              <div className="bg-white p-3 py-3.5 rounded-xl border border-slate-200/60 shadow-sm text-center">
                <div className="w-7 h-7 bg-amber-50 rounded-full flex items-center justify-center mb-1.5 mx-auto">
                  <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Secure</p>
                <p className="text-[9px] text-slate-500 mt-0.5 leading-tight">SSL encrypted connection</p>
              </div>
            </div>
          </div>

          {/* Right Side: Interactive Preview mockup of the Theme */}
          <div className="col-span-12 lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xl flex flex-col overflow-hidden text-left h-full min-h-[500px]">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between select-none">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-slate-700">Preview: <span className="text-slate-400 font-normal">output_preview.md</span></span>
                <div className="flex bg-slate-200/70 rounded-lg p-0.5">
                  <button onClick={() => setMockupMode("editor")} className={`px-3 py-1 text-[10px] font-bold rounded-md cursor-pointer transition-all ${mockupMode === "editor" ? "bg-white shadow-sm text-indigo-700" : "text-slate-500 hover:text-slate-700"}`}>Editor</button>
                  <button onClick={() => setMockupMode("preview")} className={`px-3 py-1 text-[10px] font-bold rounded-md cursor-pointer transition-all ${mockupMode === "preview" ? "bg-white shadow-sm text-indigo-700" : "text-slate-500 hover:text-slate-700"}`}>Preview</button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 text-xs font-bold font-sans rounded-md select-none">
                  Sample Output
                </span>
              </div>
            </div>

            {mockupMode === "editor" ? (
              <div className="flex-grow p-6 font-mono text-xs text-slate-700 leading-relaxed overflow-y-auto bg-slate-50/20 max-h-[380px]">
                <p className="text-indigo-600 font-semibold"># Welcome to ConvertOneAI</p>
                <p className="mt-3">Convert Word and PDF files cleanly with direct code block and table preserving. Drag some documents on the left panel to start compiling instantly!</p>
                
                <p className="mt-4 text-indigo-600 font-semibold">## Standard Features preserved</p>
                <ul className="mt-2 space-y-1.5 pl-1">
                  <li>• **Bold** and *Italic* text emphasis</li>
                  <li>• Clean bullet structures & numerical list grids</li>
                  <li>• Pre-formatted syntax code block fences like `node`</li>
                  <li>• Aligned Markdown Tables with headers</li>
                </ul>

                <p className="mt-5 text-indigo-600 font-semibold">### Compilation Specifications</p>
                <div className="border border-slate-200 rounded-lg p-3.5 mt-2 bg-white max-w-sm">
                  <p className="pb-1 text-[10px] text-slate-400 font-sans font-bold uppercase tracking-wider">Metric Outcomes</p>
                  <table className="w-full text-[11px] text-slate-600 font-sans">
                    <thead>
                      <tr className="border-b border-slate-100"><th className="text-left font-semibold pb-1">Param</th><th className="text-right font-semibold pb-1">Value</th></tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100/60"><td className="py-1">Latency</td><td className="text-right font-mono text-slate-900 font-semibold">0.65s</td></tr>
                      <tr className="border-b border-slate-100/60"><td className="py-1">Mode Accuracy</td><td className="text-right text-indigo-600 font-semibold">99%</td></tr>
                      <tr><td className="py-1">Cache Memory</td><td className="text-right text-slate-500 font-medium">Volatile Purge</td></tr>
                    </tbody>
                  </table>
                </div>

                <p className="mt-5 text-indigo-400">```javascript</p>
                <p className="text-slate-500 pl-4">console.log("Welcome to ConvertOneAI!");</p>
                <p className="text-indigo-400">```</p>
              </div>
            ) : (
              <div className="flex-grow overflow-y-auto bg-slate-50/20 max-h-[380px] p-6 relative">
                <MarkdownPreview markdown={mockupMarkdown} />
              </div>
            )}

            <div className="px-6 py-3.5 bg-white border-t border-slate-150 flex items-center justify-between select-none">
              <span className="text-[10px] text-slate-400 flex items-center gap-1.5 font-sans font-medium">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Active Engine: Core v2.4 (Stable)
              </span>
              <span className="text-[10px] text-slate-400 font-semibold font-sans">Words: 142 | Characters: 894</span>
            </div>
          </div>
        </div>
      ) : (
        <>
        {/* Conversions Completed Workspace UI Layout */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden text-left">
          {/* File Metadata Ribbon indicator */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4.5 flex flex-col md:flex-row md:items-center justify-between gap-3 select-none font-sans">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block pb-0.5">Active Asset Target</span>
              <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <FileCheck size={16} className="text-indigo-600" />
                {file?.name || "unnamed_document"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-slate-500 bg-white border border-slate-200 p-1 px-2 rounded-lg">
                Size: <span className="font-mono text-slate-800 font-semibold">{(file ? file.size / 1024 : 0).toFixed(1)} KB</span>
              </span>
              {resultDetails && (
                <>
                  <span className="text-xs text-indigo-700 bg-indigo-50/70 border border-indigo-100 p-1 px-2 rounded-lg font-semibold flex items-center gap-1">
                    <Zap size={10} className="fill-indigo-300" />
                    Model used: {resultDetails.modeUsed === "ai" ? "Local AI" : "Classic Core Engine"}
                  </span>
                  <span className="text-xs text-slate-500 bg-white border border-slate-200 p-1 px-2 rounded-lg">
                    Speed: <span className="font-mono text-slate-800 font-semibold">{resultDetails.durationMs}ms</span>
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
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-sans">
                  Formatted Source Editor
                </h3>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleInstantCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50/50 rounded-lg border border-slate-200 hover:border-indigo-100 transition-all font-medium cursor-pointer"
                    id="btn-source-copy"
                  >
                    {copiedSuccess ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    <span>{copiedSuccess ? "Copied" : "Copy Source"}</span>
                  </button>

                  <button
                    onClick={handleInstantDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all font-semibold cursor-pointer"
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
                  className="w-full h-[460px] bg-slate-900 text-indigo-100 p-5 rounded-xl border border-slate-950 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none overflow-y-auto"
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
                    className="text-[11px] font-bold text-slate-400 hover:text-rose-500 bg-slate-800 border border-slate-700 hover:border-rose-950 p-1 px-2.5 rounded-lg transition-colors cursor-pointer"
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

      {/* Core Keyword-Optimized SEO Features (Speed, Privacy, Output Quality) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4 hover:border-indigo-100 transition-all text-left">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Zap size={20} className="stroke-[2]" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-sans tracking-tight">
            Conversions compile in milliseconds
          </h3>
          <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-sans">
            Stop waiting for slow servers or processing queues. Our high-performance online document converter parses heavy documents in under a second. By compiling text structures entirely in local RAM, you get instant, high-speed Word to Markdown and PDF to MD online translations. This makes us the premier free PDF to MD converter for developers and content creators.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4 hover:border-indigo-100 transition-all text-left">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <ShieldCheck size={20} className="stroke-[2]" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-sans tracking-tight">
            Security backed by immediate data purging
          </h3>
          <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-sans">
            Your digital trust remains our highest priority. We focus on secure document processing by operating a zero-storage architecture. All uploaded PDF or Word files exist only in volatile server memory during the active conversion and get instantly purged the second compilation completes. No files, metadata, or logs are ever saved.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4 hover:border-indigo-100 transition-all text-left">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <FileText size={20} className="stroke-[2]" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-sans tracking-tight">
            Clean, developer-ready Markdown syntax
          </h3>
          <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-sans">
            Avoid messy, uncooperative formatting and broken layouts. Our specialized compiler extracts nested lists, complex bold/italic typography, and code blocks perfectly. Built with the spirit of an open-source markdown tool, we map tables into clean Markdown code grids, ensuring your output is ready for documentation hubs, blogs, and static sites instantly.
          </p>
        </div>
      </section>

      {/* General Educational Guide sections (Structured Syntax Guide) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-10 select-none">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block">Structured Syntax Guide</span>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight font-sans">
            The Complete Markdown Cheat-Sheet
          </h2>
          <p className="text-slate-500 text-sm font-sans max-w-xl mx-auto leading-relaxed">
            Understand core text syntax identifiers for documentation, notes, and repository Readme outlines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {GUIDE_SECTIONS.slice(0, 3).map((guide, idx) => (
            <div key={idx} className="border border-gray-150 rounded-xl p-5 hover:border-indigo-100 transition-colors flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-sm font-sans tracking-wide mb-1.5 flex items-center gap-1.5">
                  <BookOpen size={15} className="text-indigo-600" />
                  {guide.title}
                </h3>
                <p className="text-gray-400 text-xs leading-normal font-sans mb-4">{guide.description}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block pb-1.5">Symbol Syntax</span>
                <pre className="font-mono text-xs text-rose-600 overflow-x-auto truncate">{guide.syntax}</pre>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8 select-none">
          <button
            onClick={() => setViewMode("guide")}
            className="inline-flex items-center gap-1 px-4 py-2.5 bg-gray-50 hover:bg-indigo-50/50 text-xs font-bold text-indigo-700 hover:text-indigo-800 rounded-lg border border-gray-200 hover:border-indigo-100 transition-colors cursor-pointer"
          >
            <span>Explore Markdown Syntaxes</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </section>

      {/* On-Page Home FAQ Section addressing long-tail searches (Self-contained and secure Accordion style) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 md:p-10 shadow-sm space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-3 select-none">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block">Expert Insights</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
            Common conversion questions answered
          </h2>
          <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-sans">
            Get answers to targeted questions regarding our free Word to Markdown converter and secure document rendering engines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="space-y-2 p-5 bg-slate-50 border border-slate-150 rounded-xl hover:bg-slate-50/50 transition-colors">
            <h3 className="font-bold text-slate-900 text-sm md:text-base flex items-start gap-2">
              <HelpCircle size={18} className="text-indigo-600 mt-0.5 shrink-0" />
              <span>How to convert PDF to Markdown?</span>
            </h3>
            <p className="text-slate-600 text-xs md:text-sm leading-relaxed pl-6.5 font-sans">
              To convert a PDF to Markdown, simply drag and drop your file into the ConvertOneAI uploader zone above. The system automatically processes the document's typography, maps headers, and extracts aligned text into clean Markdown. You can edit the output directly in our live editor or download it immediately.
            </p>
          </div>

          <div className="space-y-2 p-5 bg-slate-50 border border-slate-150 rounded-xl hover:bg-slate-50/50 transition-colors">
            <h3 className="font-bold text-slate-900 text-sm md:text-base flex items-start gap-2">
              <HelpCircle size={18} className="text-indigo-600 mt-0.5 shrink-0" />
              <span>Is ConvertOneAI free to use?</span>
            </h3>
            <p className="text-slate-600 text-xs md:text-sm leading-relaxed pl-6.5 font-sans">
              Yes, ConvertOneAI is entirely free. You can convert PDF to Markdown and use our Word to Markdown converter without paying any subscription fees, answering captchas, or creating accounts. We believe developer-grade plain-text formatting tools should be accessible to everyone.
            </p>
          </div>

          <div className="space-y-2 p-5 bg-slate-50 border border-slate-150 rounded-xl hover:bg-slate-50/50 transition-colors">
            <h3 className="font-bold text-slate-900 text-sm md:text-base flex items-start gap-2">
              <HelpCircle size={18} className="text-indigo-600 mt-0.5 shrink-0" />
              <span>What Markdown flavor does it output?</span>
            </h3>
            <p className="text-slate-600 text-xs md:text-sm leading-relaxed pl-6.5 font-sans">
              Our compiler outputs highly standard, compliant CommonMark and GitHub Flavored Markdown (GFM). This guarantees that your converted code blocks, custom nested tables, headers, and bullet points render perfectly in Jekyll, Hugo, Astro, Obsidian, Notion, GitHub wikis, or static documentation sites.
            </p>
          </div>

          <div className="space-y-2 p-5 bg-slate-50 border border-slate-150 rounded-xl hover:bg-slate-50/50 transition-colors">
            <h3 className="font-bold text-slate-900 text-sm md:text-base flex items-start gap-2">
              <HelpCircle size={18} className="text-indigo-600 mt-0.5 shrink-0" />
              <span>Does ConvertOneAI support complex tables?</span>
            </h3>
            <p className="text-slate-600 text-xs md:text-sm leading-relaxed pl-6.5 font-sans">
              Scheduling table translations can be messy. ConvertOneAI excels at converting complex tables and structural grids. Instead of rendering tables as unstructured text, we parse cells into properly aligned GFM markdown pipe tables so your tabular data is immediately usable in any editor.
            </p>
          </div>
        </div>
      </section>

      {/* Quick trust metrics signals section */}
      <section className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-8 md:p-12 text-center relative overflow-hidden select-none">
        <div className="absolute inset-0 bg-grid-white/[0.03] pointer-events-none" />
        <div className="max-w-2xl mx-auto space-y-5 relative z-10">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-sans">Designed for Writers, Engineered for Developers</h2>
          <p className="text-indigo-200 text-sm leading-relaxed font-sans max-w-lg mx-auto">
            By processing raw parsing inside on-fly memory logs, ConvertOneAI establishes ultimate trust. Your credentials are fine, files are purged instantly, with no accounts required.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 font-sans font-semibold text-xs text-indigo-100">
            <span className="flex items-center gap-1 bg-white/5 p-1 px-2.5 rounded-full"><Lock size={12} /> SSL Encrypted</span>
            <span className="flex items-center gap-1 bg-white/5 p-1 px-2.5 rounded-full"><ShieldCheck size={12} /> Clean & Unchecked</span>
            <span className="flex items-center gap-1 bg-white/5 p-1 px-2.5 rounded-full"><Smartphone size={12} /> Mobile Adaptive</span>
          </div>
        </div>
      </section>
    </div>
  );
}
