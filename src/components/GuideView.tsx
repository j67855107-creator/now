import { useState } from "react";
import {
  BookOpen,
  Sparkles,
  Eye,
  Database,
  FileCode,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  Layers,
  Zap,
} from "lucide-react";
import { GUIDE_SECTIONS } from "../data";
import { ViewMode } from "../types";

interface GuideViewProps {
  setViewMode?: (mode: ViewMode) => void;
}

export default function GuideView({ setViewMode }: GuideViewProps) {
  const [activeTab, setActiveTab] = useState<string>("getting-started");

  const tabs = [
    { id: "getting-started", label: "Getting Started", icon: Zap },
    { id: "markdown", label: "Markdown Guide", icon: BookOpen },
    { id: "ai-guides", label: "AI Guides", icon: Sparkles },
    { id: "ocr", label: "OCR Guide", icon: Eye },
    { id: "rag", label: "RAG Guide", icon: Database },
    { id: "jsonl", label: "JSONL Guide", icon: FileCode },
    { id: "faq", label: "FAQ & Support", icon: HelpCircle },
  ];

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Documentation Header */}
      <div className="bg-[#FAF8F3] rounded-xl border border-[#E4E0D8] p-6 md:p-8 shadow-xs relative overflow-hidden">
        <div className="max-w-3xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-[#E4E0D8] text-[#2F6F5E] font-mono font-semibold text-xs">
            <Layers size={13} />
            <span>// [ platform knowledge hub ]</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-display text-[#171B26] tracking-tight">
            ConvertOneAI Platform Guides &amp; Documentation
          </h1>
          <p className="text-[#6B6459] text-sm md:text-base leading-relaxed">
            Master document conversion, AI pre-processing, layout cleaning, RAG vector dataset structuring, and LLM prompt generation.
          </p>
        </div>
      </div>

      {/* Interactive Guide Category Tabs */}
      <div className="bg-[#FAF8F3] rounded-xl border border-[#E4E0D8] p-2.5 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {tabs.map((t) => {
          const IconComp = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-[#2F6F5E] text-[#F6F4EE] shadow-xs"
                  : "bg-white border border-[#E4E0D8] text-[#6B6459] hover:bg-[#F6F4EE] hover:text-[#171B26]"
              }`}
            >
              <IconComp size={14} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: Getting Started */}
      {activeTab === "getting-started" && (
        <div className="bg-[#FAF8F3] rounded-xl border border-[#E4E0D8] p-6 md:p-8 space-y-6 shadow-xs">
          <div>
            <h2 className="text-lg font-semibold text-[#171B26] flex items-center gap-2 font-display">
              <Zap className="text-[#2F6F5E]" size={18} />
              <span>3-Step Quick Start Guide</span>
            </h2>
            <p className="text-xs text-[#6B6459] mt-1">
              Convert and prepare any file for AI language models in under 10 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-[#F6F4EE] border border-[#E4E0D8] rounded-xl p-5 space-y-2">
              <span className="w-7 h-7 rounded-lg bg-[#2F6F5E] text-[#F6F4EE] font-mono font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="font-semibold text-[#171B26] text-xs">Upload Document</h3>
              <p className="text-xs text-[#6B6459] leading-relaxed">
                Drag &amp; drop any PDF, Word (.docx), PPTX, Excel, HTML, EPUB, or image file directly into the workspace dropzone.
              </p>
            </div>

            <div className="bg-[#F6F4EE] border border-[#E4E0D8] rounded-xl p-5 space-y-2">
              <span className="w-7 h-7 rounded-lg bg-[#2F6F5E] text-[#F6F4EE] font-mono font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="font-semibold text-[#171B26] text-xs">Select Pipeline Action</h3>
              <p className="text-xs text-[#6B6459] leading-relaxed">
                Choose Standard Markdown Conversion, Clean for AI, AI Summary, or the full Prepare for AI (RAG &amp; Prompt) pipeline.
              </p>
            </div>

            <div className="bg-[#F6F4EE] border border-[#E4E0D8] rounded-xl p-5 space-y-2">
              <span className="w-7 h-7 rounded-lg bg-[#2F6F5E] text-[#F6F4EE] font-mono font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h3 className="font-semibold text-[#171B26] text-xs">Export &amp; Utilize</h3>
              <p className="text-xs text-[#6B6459] leading-relaxed">
                Download clean .md, export JSONL fine-tuning datasets, generate RAG vector chunks, or send directly to AI models.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: Markdown Guide */}
      {activeTab === "markdown" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {GUIDE_SECTIONS.map((guide, idx) => (
              <div
                key={idx}
                className="bg-[#FAF8F3] rounded-xl border border-[#E4E0D8] p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-semibold text-[#171B26] text-sm flex items-center gap-2 mb-1">
                    <BookOpen size={15} className="text-[#2F6F5E]" />
                    {guide.title}
                  </h3>
                  <p className="text-[#6B6459] text-xs mb-4">{guide.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-[#171B26] p-3.5 rounded-xl border border-[#171B26]/80">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B6459] block pb-1.5 font-mono">
                      Syntax
                    </span>
                    <pre className="font-mono text-xs text-[#2F6F5E] overflow-x-auto leading-normal">
                      {guide.syntax}
                    </pre>
                  </div>

                  <div className="bg-[#F6F4EE] p-3.5 rounded-xl border border-[#E4E0D8] flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6459] block pb-1.5 font-mono">
                        Rendered Output
                      </span>
                      <div className="text-xs text-[#171B26] leading-normal truncate">
                        {guide.title === "Data Tables" ? (
                          <table className="border border-[#E4E0D8] text-[10px] bg-white w-full">
                            <thead>
                              <tr className="bg-[#FAF8F3]">
                                <th className="p-1 border border-[#E4E0D8]">Header A</th>
                                <th className="p-1 border border-[#E4E0D8]">Header B</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="p-1 border border-[#E4E0D8]">Cell 1</td>
                                <td className="p-1 border border-[#E4E0D8]">Cell 2</td>
                              </tr>
                            </tbody>
                          </table>
                        ) : (
                          guide.preview
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: AI Preprocessing Guides */}
      {activeTab === "ai-guides" && (
        <div className="bg-[#FAF8F3] rounded-xl border border-[#E4E0D8] p-6 md:p-8 space-y-6 shadow-xs">
          <div>
            <h2 className="text-xl font-bold font-display text-[#171B26] flex items-center gap-2">
              <Sparkles className="text-[#2F6F5E]" size={20} />
              <span>AI Document Preprocessing &amp; Noise Removal</span>
            </h2>
            <p className="text-sm text-[#6B6459] mt-1">
              Learn how AI Cleaners eliminate context bloat and lower LLM token costs.
            </p>
          </div>

          <div className="space-y-4 text-xs text-[#6B6459] leading-relaxed">
            <div className="bg-[#F6F4EE] p-4 rounded-xl border border-[#E4E0D8] space-y-2">
              <h3 className="font-bold text-[#171B26] text-sm">Purging Page Headers &amp; Footers</h3>
              <p>
                When raw documents are fed into LLMs, repeated headers (e.g. "Chapter 4 - Page 112") create context hallucinations and unnecessary token expenditure. ConvertOneAI automatically strips page numbers, running headers, and margin notes.
              </p>
            </div>
            <div className="bg-[#F6F4EE] p-4 rounded-xl border border-[#E4E0D8] space-y-2">
              <h3 className="font-bold text-[#171B26] text-sm">Preserving Code &amp; Table Structures</h3>
              <p>
                Unlike standard copy-paste, our parser reconstructs multi-column tables into clean GFM Markdown pipe tables and formats code blocks into syntax-fenced markdown fences.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: OCR Guide */}
      {activeTab === "ocr" && (
        <div className="bg-[#FAF8F3] rounded-xl border border-[#E4E0D8] p-6 md:p-8 space-y-6 shadow-xs">
          <div>
            <h2 className="text-xl font-bold font-display text-[#171B26] flex items-center gap-2">
              <Eye className="text-[#2F6F5E]" size={20} />
              <span>Optical Character Recognition (OCR) Guide</span>
            </h2>
            <p className="text-sm text-[#6B6459] mt-1">
              Extract readable, editable text from scanned PDFs and image files (PNG, JPG, WebP).
            </p>
          </div>

          <div className="space-y-3 text-xs text-[#6B6459]">
            <p>
              Scanned PDFs contain images rather than selectable text. ConvertOneAI uses Tesseract OCR to scan character bounds, detect line breaks, and convert image text directly into formatted Markdown.
            </p>
            <div className="bg-[#F6F4EE] border border-[#2F6F5E]/30 p-4 rounded-xl text-[#171B26] space-y-1">
              <span className="font-mono font-bold block text-sm text-[#2F6F5E]">Tips for High Accuracy OCR:</span>
              <ul className="list-disc list-inside space-y-1 text-xs text-[#6B6459]">
                <li>Upload clear, high-resolution scans (300+ DPI recommended).</li>
                <li>Ensure pages are oriented upright.</li>
                <li>For multi-language scans, select the OCR tool from the Tools directory.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: RAG Guide */}
      {activeTab === "rag" && (
        <div className="bg-[#FAF8F3] rounded-xl border border-[#E4E0D8] p-6 md:p-8 space-y-6 shadow-xs">
          <div>
            <h2 className="text-xl font-bold font-display text-[#171B26] flex items-center gap-2">
              <Database className="text-[#2F6F5E]" size={20} />
              <span>Retrieval-Augmented Generation (RAG) Vector Guide</span>
            </h2>
            <p className="text-sm text-[#6B6459] mt-1">
              Chunk documents for vector databases (Pinecone, ChromaDB, Weaviate, Qdrant).
            </p>
          </div>

          <div className="space-y-4 text-xs text-[#6B6459]">
            <p>
              RAG pipelines require document content to be broken into optimal semantic chunks with metadata header breadcrumbs. ConvertOneAI constructs semantic chunk boundaries (500-1000 tokens) with overlap buffers for embedding vector pipelines.
            </p>
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: JSONL Guide */}
      {activeTab === "jsonl" && (
        <div className="bg-[#FAF8F3] rounded-xl border border-[#E4E0D8] p-6 md:p-8 space-y-6 shadow-xs">
          <div>
            <h2 className="text-xl font-bold font-display text-[#171B26] flex items-center gap-2">
              <FileCode className="text-[#2F6F5E]" size={20} />
              <span>JSONL Fine-Tuning Dataset Format Guide</span>
            </h2>
            <p className="text-sm text-[#6B6459] mt-1">
              Format document datasets for OpenAI fine-tuning, Anthropic Claude, and Llama 3 models.
            </p>
          </div>

          <div className="bg-[#171B26] text-[#F6F4EE] p-4 rounded-xl font-mono text-xs overflow-x-auto border border-[#171B26]">
            {`{"text": "# Document Title\\n\\nClean markdown body text...", "fileName": "contract.pdf", "timestamp": "2026-07-30T12:00:00Z"}`}
          </div>
        </div>
      )}

      {/* TAB CONTENT 7: FAQ & Support */}
      {activeTab === "faq" && (
        <div className="bg-[#FAF8F3] rounded-xl border border-[#E4E0D8] p-6 md:p-8 space-y-6 shadow-xs">
          <div>
            <h2 className="text-xl font-bold font-display text-[#171B26] flex items-center gap-2">
              <HelpCircle className="text-[#2F6F5E]" size={20} />
              <span>Frequently Asked Questions</span>
            </h2>
            <p className="text-sm text-[#6B6459] mt-1">
              Quick answers about file privacy, supported formats, and AI features.
            </p>
          </div>

          <div className="space-y-4">
            <div className="border border-[#E4E0D8] rounded-xl p-4 space-y-1 bg-[#F6F4EE]">
              <h3 className="font-bold text-[#171B26] text-sm">Are my documents stored on any server?</h3>
              <p className="text-xs text-[#6B6459]">
                No. All files are processed in secure memory buffers and immediately purged after conversion.
              </p>
            </div>

            <div className="border border-[#E4E0D8] rounded-xl p-4 space-y-1 bg-[#F6F4EE]">
              <h3 className="font-bold text-[#171B26] text-sm">Which document formats are supported?</h3>
              <p className="text-xs text-[#6B6459]">
                PDF, Word (.docx), PowerPoint (.pptx), Excel (.xlsx, .xls, .csv), EPUB, HTML, PNG, JPG, WebP, and BMP.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
