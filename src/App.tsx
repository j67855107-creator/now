import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FileText,
  Upload,
  Zap,
  BookOpen,
  HelpCircle,
  FileCheck,
  ShieldCheck,
  Smartphone,
  Check,
  Copy,
  Download,
  AlertCircle,
  Mail,
  Send,
  Lock,
  Unlock,
  ArrowRight,
  Menu,
  X,
  Gauge,
  ExternalLink,
  ChevronDown
} from "lucide-react";

import { ViewMode, DashboardStats, BlogPost, GuideSection } from "./types";
import { FAQ_ITEMS, BLOG_POSTS, GUIDE_SECTIONS } from "./data";
import MarkdownPreview from "./components/MarkdownPreview";
import AnalyticsDashboard from "./components/AnalyticsDashboard";

import imgBlog1 from "./assets/images/cloudconvert-banner.webp";
import imgBlog2 from "./assets/images/word-to-markdown-teams.webp";
import imgBlog3 from "./assets/images/pdf-llm-feeding.webp";
import imgBlog4 from "./assets/images/markdown-cheatsheet.webp";
import imgBlog5 from "./assets/images/chatgpt-blog-image.webp";
import imgBlog6 from "./assets/images/word_to_markdown_screenshot.webp";
import imgBlog7 from "./assets/images/comparison_table_screenshot.webp";
import imgBlog8 from "./assets/images/what-is-markdown.webp";

const IMAGE_MAP: Record<string, string> = {
  "imgBlog1": imgBlog1,
  "imgBlog2": imgBlog2,
  "imgBlog3": imgBlog3,
  "imgBlog4": imgBlog4,
  "imgBlog5": imgBlog5,
  "imgBlog6": imgBlog6,
  "imgBlog7": imgBlog7,
  "imgBlog8": imgBlog8,
  "pdf_vs_markdown": imgBlog2,
  "word_to_markdown_screenshot": imgBlog6,
  "comparison_table": imgBlog7,
  "markdown_cheat_sheet": imgBlog8
};

const VITE_API_PROTECTION_KEY = import.meta.env.VITE_API_PROTECTION_KEY || "WN3FBAF2GYF";
const envApiUrl = import.meta.env.VITE_API_URL || "";
const API_BASE = envApiUrl.startsWith("http") ? envApiUrl.replace(/\/+$/, "") : "";



export default function App() {
  // Navigation & Page State
  const [viewMode, setViewMode] = useState<ViewMode>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Conversion Tool Workspace States
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [convertMode, setConvertMode] = useState<"classic" | "ai">("classic");
  const [converting, setConverting] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [conversionResult, setConversionResult] = useState<string>("");
  const [resultDetails, setResultDetails] = useState<{ modeUsed: "ai" | "classic"; durationMs: number; warning?: string } | null>(null);

  // Workspace Interactive Editor State
  const [editedMarkdown, setEditedMarkdown] = useState<string>("");

  // Simulated Alert Banners
  const [alertMessage, setAlertMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Contact Form State
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [contactSent, setContactSent] = useState(false);

  // Stats Database
  const [stats, setStats] = useState<DashboardStats>({
    totalConversions: 200,
    classicConversions: 120,
    aiConversions: 80,
    totalSizeKb: 15400,
    averageDurationMs: 650,
    recentLogs: []
  });
  const [statsLoading, setStatsLoading] = useState(false);

  // Blog Reader active overlay
  const [readingBlog, setReadingBlog] = useState<BlogPost | null>(null);

  // Custom copy notifications
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Cookie compliance
  const [cookieDismissed, setCookieDismissed] = useState(false);

  // Admin Authentication State
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [adminAuthError, setAdminAuthError] = useState("");
  const [showAdminEntry, setShowAdminEntry] = useState(false);

  // Mockup view mode state
  const [mockupMode, setMockupMode] = useState<"editor" | "preview">("editor");

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

  // Check query parameter for admin entry visibility
  useEffect(() => {
    if (typeof window !== "undefined") {
      const queryParams = new URLSearchParams(window.location.search);
      if (queryParams.get("admin") === "users") {
        setShowAdminEntry(true);
      }
    }
  }, []);



  // Standalone premium zero-dependency blog markdown and dynamic anchor links parser
  const renderBlogMarkdown = (content: string) => {
    const lines = content.split("\n");
    let inList = false;
    let listItems: string[] = [];
    let inTable = false;
    let tableRows: string[][] = [];
    let inCode = false;
    let codeBlock: string[] = [];

    const elements: React.ReactNode[] = [];
    let inScriptBlock = false;

    const flushList = (key: string) => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${key}`} className="list-disc pl-5 my-3.5 space-y-1.5 text-gray-650">
            {listItems.map((item, i) => (
              <li key={i}>{parseInlineFormatting(item)}</li>
            ))}
          </ul>
        );
        listItems = [];
      }
      inList = false;
    };

    const flushTable = (key: string) => {
      if (tableRows.length > 0) {
        let headers: string[] = [];
        let rows: string[][] = [];
        const filteredRows = tableRows.filter(row => !row.every(cell => /^:?-+:?$/.test(cell.trim())));
        if (tableRows[0]) {
          headers = tableRows[0];
          rows = filteredRows.slice(1);
        } else {
          rows = filteredRows;
        }

        elements.push(
          <div key={`table-wrapper-${key}`} className="my-5 overflow-x-auto border border-gray-150 rounded-xl bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-slate-50">
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider font-sans border-r border-gray-150 last:border-0">
                      {parseInlineFormatting(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {rows.map((row, ri) => (
                  <tr key={ri} className="hover:bg-slate-50/40">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-4 py-3 text-xs text-gray-600 border-r border-gray-150 last:border-0 font-sans">
                        {parseInlineFormatting(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
      }
      inTable = false;
    };

    const flushCode = (key: string) => {
      if (codeBlock.length > 0) {
        elements.push(
          <pre key={`code-${key}`} className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-xs font-mono my-4 border border-slate-800 leading-normal">
            <code>{codeBlock.join("\n")}</code>
          </pre>
        );
        codeBlock = [];
      }
      inCode = false;
    };

    const parseInlineFormatting = (text: string): React.ReactNode => {
      const parts = text.split(/(\[link: [^\]]+\]|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
      return parts.map((part, idx) => {
        if (part.startsWith("[link: ") && part.endsWith("]")) {
          const linkType = part.slice(7, -1).trim();
          const normalizedLink = linkType.toLowerCase();
          if (normalizedLink.includes("homepage")) {
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setViewMode("home");
                  setReadingBlog(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-indigo-600 hover:text-indigo-800 font-semibold underline decoration-dotted inline cursor-pointer pr-1"
              >
                ConvertOneAI Home
              </button>
            );
          } else if (normalizedLink.includes("pdf to markdown") || normalizedLink.includes("pdf to md")) {
            const targetPost = BLOG_POSTS.find(p => p.id === "blog-5-pdf-to-markdown-guide");
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (targetPost) {
                    setReadingBlog(targetPost);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className="text-indigo-600 hover:text-indigo-800 font-semibold underline decoration-dotted inline cursor-pointer text-left pr-1"
              >
                converting PDF to Markdown Guide
              </button>
            );
          } else if (normalizedLink.includes("token saving") || normalizedLink.includes("claude")) {
            const targetPost = BLOG_POSTS.find(p => p.id === "blog-4");
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (targetPost) {
                    setReadingBlog(targetPost);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className="text-indigo-600 hover:text-indigo-800 font-semibold underline decoration-dotted inline cursor-pointer text-left pr-1"
              >
                Claude AI optimization guide
              </button>
            );
          } else if (normalizedLink.includes("word to markdown") || normalizedLink.includes("word to md")) {
            const targetPost = BLOG_POSTS.find(p => p.id === "blog-6-word-to-markdown-guide");
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (targetPost) {
                    setReadingBlog(targetPost);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className="text-indigo-600 hover:text-indigo-800 font-semibold underline decoration-dotted inline cursor-pointer text-left pr-1"
              >
                Word to Markdown converter guide
              </button>
            );
          }
        } else if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={idx} className="bg-slate-100 text-indigo-600 text-xs font-mono px-1.5 py-0.5 rounded border border-slate-200">
              {part.slice(1, -1)}
            </code>
          );
        } else if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={idx} className="font-semibold text-gray-950">{part.slice(2, -2)}</strong>;
        } else if (part.startsWith("*") && part.endsWith("*")) {
          return <em key={idx} className="italic text-gray-800">{part.slice(1, -1)}</em>;
        }
        return part;
      });
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith("<script")) {
        inScriptBlock = true;
        continue;
      }
      if (trimmedLine.includes("</script")) {
        inScriptBlock = false;
        continue;
      }
      if (inScriptBlock) {
        continue;
      }

      if (trimmedLine.startsWith("**SEO Title:**") || trimmedLine.startsWith("**Meta Description:**") || trimmedLine.startsWith("SEO Title:") || trimmedLine.startsWith("Meta Description:")) {
        continue;
      }

      if (trimmedLine.startsWith("```")) {
        if (inCode) {
          flushCode(`line-${i}`);
        } else {
          flushList(`line-${i}`);
          flushTable(`line-${i}`);
          inCode = true;
        }
        continue;
      }

      if (inCode) {
        codeBlock.push(line);
        continue;
      }

      if (trimmedLine.startsWith("# ")) {
        flushList(`line-${i}`);
        flushTable(`line-${i}`);
        elements.push(
          <h1 key={`h1-${i}`} className="text-2xl font-bold tracking-tight text-gray-900 font-sans mt-6 mb-3 border-b border-gray-100 pb-2">
            {parseInlineFormatting(trimmedLine.slice(2))}
          </h1>
        );
        continue;
      }

      if (trimmedLine.startsWith("## ")) {
        flushList(`line-${i}`);
        flushTable(`line-${i}`);
        elements.push(
          <h2 key={`h2-${i}`} className="text-xl font-bold tracking-tight text-gray-900 font-sans mt-6 mb-3">
            {parseInlineFormatting(trimmedLine.slice(3))}
          </h2>
        );
        continue;
      }

      if (trimmedLine.startsWith("### ")) {
        flushList(`line-${i}`);
        flushTable(`line-${i}`);
        elements.push(
          <h3 key={`h3-${i}`} className="text-lg font-bold tracking-tight text-gray-950 font-sans mt-5 mb-2">
            {parseInlineFormatting(trimmedLine.slice(4))}
          </h3>
        );
        continue;
      }

      if (trimmedLine.startsWith("|") && trimmedLine.endsWith("|")) {
        flushList(`line-${i}`);
        if (!inTable) {
          inTable = true;
        }
        const cells = trimmedLine.split("|").map(cell => cell.trim()).filter((_, index, arr) => index > 0 && index < arr.length - 1);
        tableRows.push(cells);
        continue;
      } else if (inTable) {
        flushTable(`line-${i}`);
      }

      if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ") || trimmedLine.startsWith("• ")) {
        if (!inList) {
          inList = true;
        }
        listItems.push(trimmedLine.substring(2));
        continue;
      } else if (trimmedLine.match(/^\d+\.\s/)) {
        if (!inList) {
          inList = true;
        }
        const prefixMatch = trimmedLine.match(/^\d+\.\s/);
        listItems.push(trimmedLine.substring(prefixMatch ? prefixMatch[0].length : 2));
        continue;
      } else if (inList) {
        flushList(`line-${i}`);
      }

      const imgMatch = trimmedLine.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) {
        flushList(`line-${i}`);
        flushTable(`line-${i}`);
        const alt = imgMatch[1];
        const rawSrc = imgMatch[2];
        const src = IMAGE_MAP[rawSrc] || rawSrc;
        elements.push(
          <div key={`img-${i}`} className="my-6 w-full rounded-xl overflow-hidden border border-slate-150 shadow-sm p-2 bg-slate-50/75 flex flex-col items-center select-none">
            <div className="watermark-container">
              <img loading="lazy" 
                src={src} 
                alt={alt} 
                className="w-full h-auto max-h-[480px] object-contain rounded-lg pointer-events-none" 
                referrerPolicy="no-referrer" 
              />
            </div>
            {alt && <span className="text-xs text-slate-400 font-sans mt-2">{alt}</span>}
          </div>
        );
        continue;
      }

      if (trimmedLine.startsWith("> ")) {
        elements.push(
          <blockquote key={`quote-${i}`} className="border-l-4 border-indigo-500 bg-indigo-50/50 p-4 rounded-r-xl italic my-4 text-gray-600 font-sans text-sm">
            {parseInlineFormatting(trimmedLine.slice(2))}
          </blockquote>
        );
        continue;
      }

      if (trimmedLine.length > 0) {
        elements.push(
          <p key={`p-${i}`} className="font-sans leading-relaxed text-gray-700 text-sm mb-3">
            {parseInlineFormatting(line)}
          </p>
        );
      } else {
        elements.push(<div key={`spacer-${i}`} className="h-2 select-none" />);
      }
    }

    flushList("final");
    flushTable("final");
    flushCode("final");

    return elements;
  };

  // File picker reference
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync route selections
  useEffect(() => {
    // Reset workspace state when active tools shift
    if (viewMode === "convert-word") {
      setFile(null);
      setConversionResult("");
      setEditedMarkdown("");
      setResultDetails(null);
    } else if (viewMode === "convert-pdf") {
      setFile(null);
      setConversionResult("");
      setEditedMarkdown("");
      setResultDetails(null);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [viewMode]);



  // Loading Steps Carousel captions
  const loadingSteps = [
    "Uploading document securely to Express heap memory...",
    "Verifying character bounds and layout coordinates...",
    "Preserving lists and mapping complex visual tabulations...",
    "Running local classic layout parser...",
    "Constructing standard markdown, purging server cache buffers..."
  ];

  useEffect(() => {
    if (!converting) return;
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
    }, 1400);
    return () => clearInterval(interval);
  }, [converting]);



  // Fetch telemetry logs
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/stats`, {
        headers: {
          "x-api-key": VITE_API_PROTECTION_KEY
        }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch analytics logs:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [viewMode]);

  // Handle drag and drop boundaries
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (selectedFile: File) => {
    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    
    // Check view filters
    if (viewMode === "convert-word" && ext !== "docx") {
      triggerAlert("error", "The current workspace is configured for Word (.docx) files only. Please switch tabs or utilize classic upload.");
      return;
    }
    if (viewMode === "convert-pdf" && ext !== "pdf") {
      triggerAlert("error", "The current workspace is configured for PDF documents only. Please select a valid PDF file.");
      return;
    }

    if (ext === "pdf" || ext === "docx") {
      setFile(selectedFile);
      setConversionResult("");
      setEditedMarkdown("");
      setResultDetails(null);
    } else {
      triggerAlert("error", "Unsupported file type. Please upload Word (.docx) or PDF papers.");
    }
  };

  const selectPreconfigMode = (mode: "docx" | "pdf") => {
    setViewMode(mode === "docx" ? "convert-word" : "convert-pdf");
  };

  // Run File Convert Loop
  const runConversion = async () => {
    if (!file) {
      triggerAlert("error", "Please upload or drag a file to convert.");
      return;
    }

    setConverting(true);
    setLoadingStep(0);
    setAlertMessage(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const resultString = reader.result as string;
        const base64Content = resultString.split(",")[1];

        const reqBody = {
          fileData: base64Content,
          fileName: file.name,
          mimeType: file.type,
          mode: convertMode
        };

        const response = await fetch(`${API_BASE}/api/convert`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": VITE_API_PROTECTION_KEY
          },
          body: JSON.stringify(reqBody)
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Server connection failed during conversion.");
        }

        const resData = await response.json();
        setConversionResult(resData.markdown);
        setEditedMarkdown(resData.markdown);
        setResultDetails({
          modeUsed: resData.modeUsed,
          durationMs: resData.durationMs,
          warning: resData.warning
        });

        if (resData.warning) {
          triggerAlert("info", resData.warning);
        } else {
          triggerAlert("success", "Successfully parsed into pristine Markdown.");
        }

        fetchStats(); // update graph counts

      } catch (err: any) {
        console.error("Markdown conversion failed:", err);
        triggerAlert("error", err.message || "An unexpected error occurred during document conversion.");
      } finally {
        setConverting(false);
      }
    };

    reader.onerror = () => {
      triggerAlert("error", "Failed to properly serialize file. Please re-generate and try again.");
      setConverting(false);
    };

    reader.readAsDataURL(file);
  };

  // Utilities
  const triggerAlert = (type: "success" | "error" | "info", text: string) => {
    setAlertMessage({ type, text });
    setTimeout(() => {
      setAlertMessage(null);
    }, 10000);
  };

  const handleInstantCopy = () => {
    navigator.clipboard.writeText(editedMarkdown);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  const handleInstantDownload = () => {
    if (!editedMarkdown) return;
    const baseName = file ? file.name.substring(0, file.name.lastIndexOf('.')) : "document";
    const blob = new Blob([editedMarkdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${baseName}_converted.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerAlert("success", `Downloaded ${baseName}_converted.md happily.`);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMsg) {
      triggerAlert("error", "Please fill in all input boxes before sending.");
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          message: contactMsg
        })
      });

      if (res.ok) {
        setContactSent(true);
        triggerAlert("success", "Message received successfully. Our support team will get in touch with you shortly.");
        setContactName("");
        setContactEmail("");
        setContactMsg("");
        fetchStats(); // Update the backend synchronized state to register new contact
      } else {
        const err = await res.json();
        triggerAlert("error", err.error || "Failed to deliver support request. Please try again.");
      }
    } catch (err) {
      triggerAlert("error", "Network error: Support transmission server is currently unreachable.");
    } finally {
      setTimeout(() => {
        setContactSent(false);
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-indigo-105 selection:text-indigo-900 font-sans leading-normal antialiased">
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 select-none shadow-sm">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <div 
            onClick={() => setViewMode("home")}
            className="flex items-center gap-2.5 cursor-pointer group"
            id="brand-logo"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-sans font-extrabold text-xl tracking-tight text-slate-800 transition-colors">
              ConvertOne<span className="text-indigo-600">Ai</span>
            </span>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1.5 text-sm font-medium">
            <button
              onClick={() => setViewMode("home")}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all ${viewMode === "home" ? "text-indigo-600 border-b-2 border-indigo-600 rounded-none pb-1" : "text-slate-600 hover:text-slate-900"}`}
            >
              Convert
            </button>
            <button
              onClick={() => selectPreconfigMode("docx")}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all ${viewMode === "convert-word" ? "text-indigo-600 border-b-2 border-indigo-600 rounded-none pb-1" : "text-slate-600 hover:text-slate-900"}`}
            >
              Word → MD
            </button>
            <button
              onClick={() => selectPreconfigMode("pdf")}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all ${viewMode === "convert-pdf" ? "text-indigo-600 border-b-2 border-indigo-600 rounded-none pb-1" : "text-slate-600 hover:text-slate-900"}`}
            >
              PDF → MD
            </button>
            {isAdmin && (
              <button
                onClick={() => setViewMode("analytics")}
                className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${viewMode === "analytics" ? "text-indigo-600 border-b-2 border-indigo-600 rounded-none pb-1" : "text-slate-600 hover:text-slate-900"}`}
              >
                <Gauge size={14} />
                <span>Telemetry Logs</span>
              </button>
            )}
            <button
              onClick={() => setViewMode("guide")}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all ${viewMode === "guide" ? "text-indigo-600 border-b-2 border-indigo-600 rounded-none pb-1" : "text-slate-600 hover:text-slate-900"}`}
            >
              Markdown Guide
            </button>
            <button
              onClick={() => setViewMode("blog")}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all ${viewMode === "blog" ? "text-indigo-600 border-b-2 border-indigo-600 rounded-none pb-1" : "text-slate-600 hover:text-slate-900"}`}
            >
              Blog
            </button>
            <button
              onClick={() => setViewMode("faq")}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all ${viewMode === "faq" ? "text-indigo-600 border-b-2 border-indigo-600 rounded-none pb-1" : "text-slate-600 hover:text-slate-900"}`}
            >
              FAQ
            </button>
            <button
              onClick={() => setViewMode("about")}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all ${viewMode === "about" ? "text-indigo-600 border-b-2 border-indigo-600 rounded-none pb-1" : "text-slate-600 hover:text-slate-900"}`}
            >
              About
            </button>
            <button
              onClick={() => setViewMode("contact")}
              className="ml-4 bg-slate-900 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-950/20"
            >
              Get Started
            </button>
            {(showAdminEntry || isAdmin) && (
              <button
                onClick={() => {
                  if (isAdmin) {
                    setIsAdmin(false);
                    setViewMode("home");
                    triggerAlert("info", "Logged out of admin console successfully.");
                  } else {
                    setViewMode("analytics");
                  }
                }}
                title={isAdmin ? "System Admin: Authenticated" : "Restrict access to server diagnostics"}
                className={`ml-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 border cursor-pointer select-none ${
                  isAdmin
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                {isAdmin ? <Unlock size={12} className="text-emerald-600 animate-pulse" /> : <Lock size={12} className="text-slate-500" />}
                <span>{isAdmin ? "Admin Active" : "Admin Panel"}</span>
              </button>
            )}
          </nav>

          {/* Mobile hamburger activator */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown list */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 px-6 py-4 space-y-2 text-left justify-start shadow-inner">
            <button
              onClick={() => { setViewMode("home"); setMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg"
            >
              Home Launcher
            </button>
            <button
              onClick={() => { selectPreconfigMode("docx"); setMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg"
            >
              Word → Markdown
            </button>
            <button
              onClick={() => { selectPreconfigMode("pdf"); setMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg"
            >
              PDF → Markdown
            </button>
            {isAdmin && (
              <button
                onClick={() => { setViewMode("analytics"); setMobileMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 text-sm font-semibold text-indigo-700 bg-indigo-50 rounded-lg flex items-center gap-1.5"
              >
                <Gauge size={14} />
                <span>Telemetry Dashboard</span>
              </button>
            )}
            {(showAdminEntry || isAdmin) && (
              <button
                onClick={() => {
                  if (isAdmin) {
                    setIsAdmin(false);
                    setViewMode("home");
                    triggerAlert("info", "Logged out of admin terminal successfully.");
                  } else {
                    setViewMode("analytics");
                  }
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg flex items-center gap-1.5"
              >
                {isAdmin ? <Unlock size={14} className="text-emerald-500 animate-pulse" /> : <Lock size={14} className="text-slate-500" />}
                <span>{isAdmin ? "Admin Logout" : "Admin Workspace Login"}</span>
              </button>
            )}
            <button
              onClick={() => { setViewMode("guide"); setMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg"
            >
              Markdown Guide
            </button>
            <button
              onClick={() => { setViewMode("blog"); setMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg"
            >
              Blog Articles
            </button>
            <button
              onClick={() => { setViewMode("faq"); setMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg"
            >
              FAQ Support
            </button>
            <button
              onClick={() => { setViewMode("about"); setMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg"
            >
              Mission About
            </button>
            <button
              onClick={() => { setViewMode("contact"); setMobileMenuOpen(false); }}
              className="block w-full text-center py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow"
            >
              Get Started
            </button>
          </div>
        )}
      </header>

      {/* 2. Global Alert Messages */}
      {alertMessage && (
        <div className="max-w-7xl mx-auto px-8 mt-4 w-full select-none">
          <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-sm ${
            alertMessage.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-150" :
            alertMessage.type === "error" ? "bg-rose-50 text-rose-800 border-rose-150" :
            "bg-blue-50 text-blue-800 border-blue-150"
          }`}>
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div className="text-sm font-medium">{alertMessage.text}</div>
          </div>
        </div>
      )}

      {/* 3. Main Body Context Router */}
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        
        {/* VIEW: HOME PAGE / SINGLE-PAGE LAUNCHER */}
        {(viewMode === "home" || viewMode === "convert-word" || viewMode === "convert-pdf") && (
          <div className="space-y-12">
            
            {!conversionResult ? (
              /* SIDE-BY-SIDE GRID THEME FROM "PROFESSIONAL POLISH" */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Uploader + Title + Badges (col-span-12 on small, col-span-5 on lg) */}
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
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col bg-white border-2 border-dashed rounded-2xl p-8 items-center justify-center text-center group transition-all relative cursor-pointer min-h-[260px] ${
                      dragActive ? "border-indigo-500 bg-indigo-50/20" : "border-slate-300 hover:border-indigo-400 bg-opacity-50"
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

                    {/* Loader Carousel layer integrated directly inside the dropzone area for pristine inline visuals! */}
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
                        className="mt-5 bg-indigo-600 text-white px-5 py-2 rounded-xl font-semibold shadow hover:bg-indigo-700 transition-all text-xs"
                      >
                        Ready to Transpile
                      </button>
                    ) : (
                      <button 
                        type="button" 
                        className="mt-5 bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-medium shadow-sm hover:bg-slate-50 transition-all text-xs"
                      >
                        Choose File
                      </button>
                    )}
                  </div>

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

                {/* Right Side: Interactive Preview mockup of the Theme (col-span-12 on small, col-span-7 on lg) */}
                <div className="col-span-12 lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xl flex flex-col overflow-hidden text-left h-full min-h-[500px]">
                  <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between select-none">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-semibold text-slate-700">Preview: <span className="text-slate-400 font-normal">output_preview.md</span></span>
                      <div className="flex bg-slate-200/70 rounded-lg p-0.5">
                        <button onClick={() => setMockupMode("editor")} className={`px-3 py-1 text-[10px] font-bold rounded-md cursor-pointer transition-colors ${mockupMode === "editor" ? "bg-white shadow-sm text-indigo-700" : "text-slate-500 hover:text-slate-700"}`}>Editor</button>
                        <button onClick={() => setMockupMode("preview")} className={`px-3 py-1 text-[10px] font-bold rounded-md cursor-pointer transition-colors ${mockupMode === "preview" ? "bg-white shadow-sm text-indigo-700" : "text-slate-500 hover:text-slate-700"}`}>Preview</button>
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
              
              /* Conversions Completed Workspace UI Layout */
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
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50/50 rounded-lg border border-slate-200 hover:border-indigo-100 transition-all font-medium"
                          id="btn-source-copy"
                        >
                          {copiedSuccess ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          <span>{copiedSuccess ? "Copied" : "Copy Source"}</span>
                        </button>
                        
                        <button
                          onClick={handleInstantDownload}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all font-semibold"
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
                          className="text-[11px] font-bold text-slate-400 hover:text-rose-500 bg-slate-800 border border-slate-700 hover:border-rose-950 p-1 px-2.5 rounded-lg transition-colors"
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
            )}

            {/* Core Keyword-Optimized SEO Features (Speed, Privacy, Output Quality) */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4 hover:border-indigo-100 transition-all">
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

              <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4 hover:border-indigo-100 transition-all">
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

              <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4 hover:border-indigo-100 transition-all">
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
                  className="inline-flex items-center gap-1 px-4 py-2.5 bg-gray-50 hover:bg-indigo-50/50 text-xs font-bold text-indigo-700 hover:text-indigo-800 rounded-lg border border-gray-200 hover:border-indigo-100 transition-colors"
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
        )}

        {/* VIEW: TELEMETRY & ANALYTICS DASHBOARD */}
        {viewMode === "analytics" && (
          isAdmin ? (
            <div className="space-y-6">
              {/* Active Admin session alert banner */}
              <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left select-none animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 text-emerald-700 p-2 rounded-lg">
                    <Unlock size={18} className="animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950">Administrative Session Active</h4>
                    <p className="text-xs text-emerald-600">Full telemetry streams, transaction speed counts, and direct user enquiries logged successfully.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsAdmin(false);
                    setViewMode("home");
                    triggerAlert("info", "Logged out of admin terminal successfully.");
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Terminate Admin Session
                </button>
              </div>

              <AnalyticsDashboard
                stats={stats}
                loading={statsLoading}
                onRefresh={fetchStats}
              />
            </div>
          ) : (
            <div className="max-w-md mx-auto bg-white rounded-2xl border border-gray-150 shadow-sm p-8 text-left space-y-6 select-none my-8 animate-fadeIn">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner relative">
                  <Lock size={28} className="stroke-[1.5]" />
                  <div className="absolute top-0 right-0 w-3 h-3 bg-indigo-600 rounded-full animate-ping" />
                  <div className="absolute top-0 right-0 w-3 h-3 bg-indigo-600 rounded-full" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800 tracking-tight font-sans">Admin Security Gate</h2>
                  <p className="text-xs text-slate-400 font-sans mt-1">ConvertOneAI Protected Terminal</p>
                </div>
              </div>

              <div className="text-xs text-slate-500 leading-relaxed text-center font-sans space-y-2">
                <p>
                  This space records live volatile server telemetry counts, memory usage logs, transaction micro-speeds, and customer support contact tickets.
                </p>
                <p className="font-semibold text-slate-600">
                  Access is strictly locked for general public users to enforce ultimate zero-identity privacy.
                </p>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (adminPasswordInput === "admin123" || adminPasswordInput.toLowerCase() === "admin") {
                    setIsAdmin(true);
                    setAdminAuthError("");
                    triggerAlert("success", "Welcome back, System Admin. Real-Time Telemetry Decrypted.");
                  } else {
                    setAdminAuthError("Invalid server passcode. Access denied.");
                  }
                }}
                className="space-y-4 font-sans"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Security Passkey</label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={adminPasswordInput}
                      onChange={(e) => {
                        setAdminPasswordInput(e.target.value);
                        setAdminAuthError("");
                      }}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm font-sans placeholder-slate-300 transition-all text-center tracking-widest font-bold focus:outline-none"
                    />
                  </div>
                  {adminAuthError && (
                    <p className="text-[10.5px] font-semibold text-rose-600 text-center animate-shake">
                      ⚠️ {adminAuthError}
                    </p>
                  )}
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-2.5 px-4 rounded-xl transition-colors shadow-sm cursor-pointer"
                  >
                    Authenticate Security Credentials
                  </button>
                  
                  <div className="border-t border-slate-100 pt-3 flex flex-col items-center gap-1">
                    <span className="text-[9.5px] text-slate-400">Evaluate Developer Mode?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setAdminPasswordInput("admin123");
                        setIsAdmin(true);
                        setAdminAuthError("");
                        triggerAlert("success", "Evaluation login successful! Telemetry unlocked.");
                      }}
                      className="text-[11px] text-indigo-600 hover:text-indigo-700 font-bold underline cursor-pointer"
                    >
                      Bypass to Admin (Passkey: admin123)
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )
        )}

        {/* VIEW: MARKDOWN GUIDE PAGE */}
        {viewMode === "guide" && (
          <div className="space-y-8 text-left">
            <div className="border-b border-gray-150 pb-5 mb-5 select-none">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block">Documentation Portal</span>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-sans mt-1">Complete Markdown Syntax Guide</h1>
              <p className="text-gray-500 text-sm font-sans mt-0.5 max-w-2xl">
                Master standard and GFM (GitHub Flavored Markdown) spec formatting templates for documents, blogs, and specs layout.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {GUIDE_SECTIONS.map((guide, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-gray-150 p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base font-sans tracking-wide mb-1 flex items-center gap-1.5">
                      <BookOpen size={16} className="text-indigo-600" />
                      {guide.title}
                    </h3>
                    <p className="text-gray-500 text-xs leading-normal font-sans mb-4">{guide.description}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-950">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block pb-1.5">Write Syntax</span>
                      <pre className="font-mono text-xs text-rose-400 overflow-x-auto select-all leading-normal">{guide.syntax}</pre>
                    </div>

                    <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block pb-1.5">Render Outcome</span>
                        <div className="prose prose-xs max-w-none text-xs text-gray-700 leading-normal truncate">
                          {guide.title === "Data Tables" ? (
                            <table className="border border-gray-200 text-[10px]">
                              <thead><tr className="bg-gray-100"><th>A</th><th>B</th></tr></thead>
                              <tbody><tr><td>Data</td><td>Data</td></tr></tbody>
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

            {/* Practical Examples */}
            <div className="bg-white rounded-xl border border-gray-150 p-6 shadow-sm font-sans">
              <h3 className="font-bold text-gray-900 text-lg mb-3">Structured Guides for Note-taking</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Markdown is highly adopted inside note taking utilities like Notion, Obsidian, Bear, and Logseq. Utilizing standard inline hash symbols preserves text styles seamlessly, allowing direct compatibility and export pathways to PDFs or static HTML files.
              </p>
              <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-600 space-y-2">
                <span className="font-bold text-gray-800">Why Use Markdown for Note-taking?</span>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Future Proof</strong>: Plain text files are readable forever on any modern device.</li>
                  <li><strong>Keyboard Friendly</strong>: Write documents without lifting your fingers to grab the cursor.</li>
                  <li><strong>Instant Synced Outputs</strong>: Upload notes straight to GitHub portals or personal wikis securely.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: BLOG ARTICLES LIST */}
        {viewMode === "blog" && (
          <div className="space-y-8 text-left">
            <div className="border-b border-gray-150 pb-5 mb-5 select-none">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-605 block">Industry Perspectives</span>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-sans mt-1">ConvertOneAI Blog & Guides</h1>
              <p className="text-gray-500 text-sm font-sans mt-0.5">Explore best practices around structural document transitions, RAG optimizations, and technical documentation layouts.</p>
            </div>

            {readingBlog ? (
              // Active Blog Article Reader view
              <article className="bg-white rounded-2xl border border-gray-150 p-6 md:p-10 shadow-sm max-w-3xl mx-auto space-y-6">
                <button
                  onClick={() => setReadingBlog(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 pb-2.5 border-b border-gray-100 w-full mb-3 select-none"
                >
                  ← Return to Blog Index
                </button>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs text-gray-400 select-none">
                    <span>{readingBlog.publishedAt}</span>
                    <span>•</span>
                    <span>{readingBlog.readTime}</span>
                    <span>•</span>
                    <span>By {readingBlog.author}</span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 font-sans tracking-tight">{readingBlog.title}</h1>
                </div>

                {readingBlog.image && (
                  <div className="w-full rounded-xl overflow-hidden border border-gray-150 shadow-sm relative bg-slate-50/50 flex items-center justify-center p-1 md:p-2">
                    <div className="watermark-container flex items-center justify-center">
                      <img loading="lazy" 
                        src={readingBlog.image} 
                        alt={readingBlog.title} 
                        className="w-full h-auto max-h-[550px] object-contain rounded-lg"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}

                <div className="prose prose-indigo max-w-none text-gray-700 text-sm leading-relaxed font-sans mt-2">
                  {renderBlogMarkdown(readingBlog.content)}
                </div>

                <div className="pt-6 border-t border-gray-100 select-none">
                  <button
                    onClick={() => setReadingBlog(null)}
                    className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-xs font-bold rounded-lg border border-gray-200 text-gray-600 transition-colors"
                  >
                    Close Article
                  </button>
                </div>
              </article>
            ) : (
              // General Grid list
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {BLOG_POSTS.map((post) => (
                  <article key={post.id} className="bg-white rounded-xl border border-gray-150 shadow-sm overflow-hidden flex flex-col justify-between group hover:border-indigo-150 transition-all">
                    {post.image && (
                      <div className="h-44 w-full overflow-hidden border-b border-gray-100 relative">
                        <div className="watermark-container w-full h-full">
                          <img loading="lazy" 
                            src={post.image} 
                            alt={post.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>
                    )}
                    <div className="p-6 text-left space-y-3">
                      <div className="flex items-center gap-2 text-[11px] text-gray-400">
                        <span>{post.publishedAt}</span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-indigo-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-500 text-xs leading-relaxed font-sans line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="px-6 py-4.5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between select-none">
                      <span className="text-xs text-gray-400">By {post.author}</span>
                      <button
                        onClick={() => setReadingBlog(post)}
                        className="text-xs font-bold text-indigo-600 group-hover:text-indigo-800 transition-colors inline-flex items-center gap-1"
                      >
                        <span>Read More</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW: FAQ PAGE */}
        {viewMode === "faq" && (
          <div className="space-y-8 text-left max-w-3xl mx-auto">
            <div className="text-center space-y-3 select-none">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Got Questions?</span>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-sans">Frequently Asked Questions</h1>
              <p className="text-gray-500 text-sm max-w-lg mx-auto leading-relaxed">Everything you need to understand about ConvertOneAI's security workflows, conversions, and formats.</p>
            </div>

            <div className="space-y-4">
              {FAQ_ITEMS.map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-gray-150 p-5.5 shadow-sm space-y-2.5">
                  <h3 className="font-bold text-gray-900 text-sm. sm:text-base flex items-start gap-2.5">
                    <HelpCircle size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                    <span>{item.question}</span>
                  </h3>
                  <p className="text-gray-500 text-xs sm:text-sm pl-7 leading-relaxed font-sans">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: MISSION & ABOUT PAGE */}
        {viewMode === "about" && (
          <div className="space-y-8 text-left max-w-3xl mx-auto font-sans animate-fadeIn">
            <div className="border-b border-gray-150 pb-5 select-none">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block">Our Purpose</span>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-1">Our Mission</h1>
              <p className="text-gray-500 text-sm mt-1">We make documents universally portable and developer-friendly.</p>
            </div>

            <div className="space-y-6 text-slate-600 leading-relaxed text-sm md:text-base">
              <p className="text-gray-900 font-medium">
                Most documentation workflows today depend on clean, responsive plain-text. Yet, much of the world's knowledge remains locked inside heavy, uncooperative PDFs and closed Microsoft Word files.
              </p>

              <p>
                Developers, technical writers, and content teams suffer constant friction. Copying content from a complex document into static site generators, Notion, GitHub wikis, or internal product hubs usually destroys layout structures. Word parser engines too often generate convoluted markup filled with empty elements, broken symbols, and disorganized bullet lists.
              </p>

              <p>
                ConvertOneAI solves this digital gridlock. We created a fast, zero-install workspace where anyone can drop a document and receive optimized, perfectly indexed Markdown instantly. No subscription paywalls, no cookie-consent prompts, and no email sign-up forms. 
              </p>

              <div className="bg-slate-50 p-6 rounded-2xl border border-gray-150 space-y-4">
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block">Who We Build For</span>
                <p className="text-xs text-slate-500 leading-relaxed mt-0">
                  ConvertOneAI serves technical writers building API references, developers uploading legacy documentation, students converting research PDFs into local obsidian vaults, and creators publishing directly to plain-text blogs. If you work with documents and code, we designed this tool for you.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Our Core Values</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white border border-gray-150 rounded-xl space-y-1">
                    <h4 className="text-sm font-bold text-gray-900">1. Simplicity Above All</h4>
                    <p className="text-xs text-slate-500">Technology should get out of your way. We offer a clean, focus-driven single-screen editor, delivering pristine plain-text outputs without configuration delays.</p>
                  </div>
                  <div className="p-4 bg-white border border-gray-150 rounded-xl space-y-1">
                    <h4 className="text-sm font-bold text-gray-900">2. Privacy-First Conduct</h4>
                    <p className="text-xs text-slate-500">Your documents should never live in a database. We process files strictly inside temporary, volatile memory buffers that flush instantly after translation completes.</p>
                  </div>
                  <div className="p-4 bg-white border border-gray-150 rounded-xl space-y-1">
                    <h4 className="text-sm font-bold text-gray-900">3. Universal Accessibility</h4>
                    <p className="text-xs text-slate-500">Quality developer tools belong to everyone. ConvertOneAI compiles, structures, and beautifies files free of charges and annoying pop-up scripts.</p>
                  </div>
                  <div className="p-4 bg-white border border-gray-150 rounded-xl space-y-1">
                    <h4 className="text-sm font-bold text-gray-900">4. Processing Velocity</h4>
                    <p className="text-xs text-slate-500">Wait times crush creative rhythm. Our native local rendering code aims to parse standard Word documents and raw structural data within milliseconds.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Our Plain-Text Vision</h3>
                <p className="text-sm text-slate-600 mt-2">
                  Plain-text forms the resilient foundation of modern web documentation. As we grow, our team plans to support smarter conversions, specialized schema outputs, and broader structures. We build to help the open-text movement thrive, one smooth conversion at a time.
                </p>
                <div className="mt-4 p-4 bg-indigo-50/50 rounded-xl flex items-center gap-3">
                  <Check size={16} className="text-indigo-600 shrink-0" />
                  <span className="text-xs text-indigo-950 font-medium font-sans">ConvertOneAI is designed with love for the plain-text blogging, static docs, and engineering communities.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: SUPPORT/CONTACT FORM */}
        {viewMode === "contact" && (
          <div className="max-w-xl mx-auto text-left font-sans">
            <div className="text-center space-y-3 pb-6 select-none">
              <div className="inline-block p-3 rounded-full bg-indigo-50 text-indigo-600 mb-1 border border-indigo-100 shadow-sm">
                <Mail size={24} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Contact support</h1>
              <p className="text-gray-500 text-xs sm:text-sm">Have feature recommendations, API integrations, or bug filings? Dispatch them straight to our desk.</p>
            </div>

            <form onSubmit={handleContactSubmit} className="bg-white rounded-xl border border-gray-150 p-6 shadow-sm space-y-4">
              <div className="space-y-1.5 text-left">
                <label htmlFor="contact-name" className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Your Human Name</label>
                <input
                  type="text"
                  id="contact-name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Liam Cole"
                  disabled={contactSent}
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label htmlFor="contact-email" className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Mail Address</label>
                <input
                  type="email"
                  id="contact-email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. client@example.com"
                  disabled={contactSent}
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label htmlFor="contact-msg" className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Message Details</label>
                <textarea
                  id="contact-msg"
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                  className="w-full h-32 px-3.5 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Compose your support query or proposal here..."
                  disabled={contactSent}
                />
              </div>

              <button
                type="submit"
                disabled={contactSent}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-sm shadow transition-all flex items-center justify-center gap-2 disabled:bg-indigo-400 cursor-pointer text-center"
                id="btn-contact-submit"
              >
                <Send size={14} />
                <span>{contactSent ? "Message Transferred" : "Send Information Pack"}</span>
              </button>
            </form>
          </div>
        )}

        {/* VIEW: PRIVACY POLICY */}
        {viewMode === "privacy" && (
          <div className="max-w-3xl mx-auto text-left font-sans space-y-6 leading-relaxed text-sm text-gray-700 bg-white p-8 md:p-12 rounded-2xl border border-gray-150 shadow-sm animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-150 pb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block">Personal Promise</span>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-1">PrivacyShield Guarantee</h1>
                <p className="text-xs text-slate-400 select-none mt-1">Effective Date: June 22, 2026</p>
              </div>
              <div className="bg-indigo-50 border border-indigo-150 text-indigo-600 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold shrink-0 shadow-sm">
                <ShieldCheck size={16} />
                <span>Zero-Storage Active</span>
              </div>
            </div>

            <p className="text-gray-900 font-medium text-base">
              We believe privacy isn’t a dense legal loophole—it is a fundamental commitment to you. At ConvertOneAI, we design our software from the ground up to protect your creative work. We promise safety, complete transparency, and honest data practices.
            </p>

            <div className="space-y-6 pt-2">
              <div className="relative pl-8 space-y-1 border-l-2 border-indigo-100 focus-within:border-indigo-500 transition-colors">
                <div className="absolute -left-2.5 top-0.5 bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">1</div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">Your Files Stay Yours</h3>
                <p className="text-slate-600 text-xs md:text-sm">
                  We never store, read, or share uploaded documents. Your text, formatted charts, and data belong entirely to you. We act strictly as a temporary rendering channel, compiling your documents and immediately returning the outputs to your browser window.
                </p>
              </div>

              <div className="relative pl-8 space-y-1 border-l-2 border-indigo-100 focus-within:border-indigo-500 transition-colors">
                <div className="absolute -left-2.5 top-0.5 bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">2</div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">Automatic, Instant Purging</h3>
                <p className="text-slate-600 text-xs md:text-sm">
                  We hold documents strictly within volatile, short-lived RAM. Our backend servers never write your uploads to static disks, databases, index logs, or server hard drives. The absolute moment our conversion script serves the compiled Markdown text, the system completely and irreversibly flushes your file structures from memory.
                </p>
              </div>

              <div className="relative pl-8 space-y-1 border-l-2 border-indigo-100 focus-within:border-indigo-500 transition-colors">
                <div className="absolute -left-2.5 top-0.5 bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">3</div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">Fully Encrypted Transfers</h3>
                <p className="text-slate-600 text-xs md:text-sm">
                  We shield your documents against online snooping. Our servers enforce strict, high-grade SSL/TLS encryption for all document transmission and active download actions, creating an airtight, end-to-end encrypted tunnels for your transfers.
                </p>
              </div>

              <div className="relative pl-8 space-y-1 border-l-2 border-indigo-100 focus-within:border-indigo-500 transition-colors">
                <div className="absolute -left-2.5 top-0.5 bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">4</div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">Zero Retention or Selling</h3>
                <p className="text-slate-600 text-xs md:text-sm">
                  We never sell, rent, commercialize, or trade your file content or metadata to marketing agencies, advertisers, or third-party brokers. We maintain an honest, utility-focused operation funded by technology, not by exploiting user data.
                </p>
              </div>

              <div className="relative pl-8 space-y-1 border-l-2 border-indigo-100 focus-within:border-indigo-500 transition-colors">
                <div className="absolute -left-2.5 top-0.5 bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">5</div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">Minimalist, Aggregate Statistics Only</h3>
                <p className="text-slate-600 text-xs md:text-sm">
                  We collect only anonymous, generalized usage statistics—such as total conversion counts or average translation speeds—solely to check our container loads and ensure continuous server performance. Since ConvertOneAI requires zero logins, standard usage remains entirely anonymous.
                </p>
              </div>
            </div>

            <hr className="border-gray-100 my-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-slate-600 text-xs md:text-sm">
              <div className="space-y-2">
                <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Mail size={14} className="text-indigo-600" />
                  <span>Your Privacy Rights</span>
                </h4>
                <p className="leading-relaxed">
                  We view privacy as an absolute. You have the right to request clarification on any of our secure workflows. If you ever have questions or security concerns, contact our creators directly via our support form.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Lock size={14} className="text-indigo-600" />
                  <span>Compliant Hosting Infrastructure</span>
                </h4>
                <p className="leading-relaxed">
                  We host our primary application in secure Cloud Run containers. These environments comply with stringent security audits, including SOC2 Type II, ISO 27001, and GDPR guidelines, ensuring that our execution engines run within secure sandboxed environments.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 mt-6 text-center">
              <p className="text-xs text-slate-700 italic font-medium leading-relaxed font-sans">
                "We keep our lines of code clean, our architecture temporary, and your document data fully confidential. That is our Shield Guarantee to you, and we back it 100%."
              </p>
            </div>
          </div>
        )}

        {/* VIEW: TERMS OF SERVICE */}
        {viewMode === "terms" && (
          <div className="max-w-3xl mx-auto text-left font-sans space-y-6 leading-relaxed text-sm text-gray-700 bg-white p-8 md:p-12 rounded-2xl border border-gray-150 shadow-sm animate-fadeIn">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight border-b border-gray-150 pb-5">Terms of Service</h1>
            <p className="text-xs text-slate-400 select-none">Effective Date: June 22, 2026</p>

            <p className="text-slate-600 font-medium">
              Welcome to ConvertOneAI. Please read these Terms of Service (“Terms”) carefully before using our website and services.
            </p>

            <div className="space-y-6 font-sans">
              <section className="space-y-2">
                <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  <span className="text-indigo-600">1.</span> Acceptance of Terms
                </h3>
                <p className="text-slate-600 text-xs md:text-sm">
                  By accessing or using ConvertOneAI (the “Service”), you agree to be bound by these Terms and our Privacy Policy. If you do not agree with any part of these terms, you are not permitted to access or use our file conversion services. Your continued use of the Service constitutes your ongoing acceptance of these Terms.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  <span className="text-indigo-600">2.</span> Description of Service
                </h3>
                <p className="text-slate-600 text-xs md:text-sm">
                  ConvertOneAI provides a smart, web-based utility that extracts content from PDF and Word (.docx) documents and converts them into clean, standardized Markdown format. While we aim to provide high-quality structural translations of tables, headers, and formatted lists, our conversion processes depend heavily on the source document formatting. The Service handles files up to a generous 50MB file restriction, but may contain functional limitations when processing heavily nested formats or low-resolution scanned pages.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  <span className="text-indigo-600">3.</span> Acceptable Use
                </h3>
                <p className="text-slate-600 text-xs md:text-sm">
                  You are free to use our Service for both personal and professional conversions. However, you agree to use ConvertOneAI only for lawful operations. Specifically, you agree not to:
                </p>
                <ul className="list-disc pl-5 text-slate-600 text-xs md:text-sm space-y-1">
                  <li>Attempt to disrupt or compromise our server performance, API endpoints, or security configurations.</li>
                  <li>Upload, transmit, or process files containing malicious code, viruses, malware, or Trojan horses.</li>
                  <li>Convert any content that violates third-party intellectual property, privacy rights, or local and international regulations.</li>
                  <li>Use automated scrapers, bots, or script sequences to abuse or strain the conversion platform.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  <span className="text-indigo-600">4.</span> File Handling
                </h3>
                <p className="text-slate-600 text-xs md:text-sm">
                  Your data privacy and digital trust are of the utmost importance. Under our volatile processing design, all uploaded documents are processed securely in temporary RAM memory solely during the active conversion transaction. No files are preserved, cached, stored, or distributed on our servers once your Markdown output is compiled. All input files are immediately and permanently cleared from volatile memory upon completion.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  <span className="text-indigo-600">5.</span> Intellectual Property
                </h3>
                <p className="text-slate-600 text-xs md:text-sm">
                  We respect your creative output and ownership rights:
                </p>
                <ul className="list-disc pl-5 text-slate-600 text-xs md:text-sm space-y-1">
                  <li><strong>Your Files and Output:</strong> You retain absolute, full ownership of all source files uploaded and all resulting Markdown materials compiled by the Service. We assert no claims, licenses, or intellectual ownership over your data.</li>
                  <li><strong>Our Platform Rights:</strong> The software, user interfaces, stylistic layout designs, custom code, logos, and the trademark "ConvertOneAI" remain the exclusive property of ConvertOneAI. You are granted a limited, subjective, non-transferable license to access our platform for conversion purposes only.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  <span className="text-indigo-600">6.</span> Disclaimer of Warranties
                </h3>
                <p className="text-slate-600 text-xs md:text-sm">
                  ConvertOneAI is provided strictly on an "as-is" and "as-available" basis without representations of any kind, whether express or implied. Due to the high structural variance of custom formatting across word processors, we do not guarantee 100% conversion accuracy, font retention, or perfect formatting preservation. We disclaim all implied warranties of merchantability, fitness for a specific purpose, and non-infringement.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  <span className="text-indigo-600">7.</span> Limitation of Liability
                </h3>
                <p className="text-slate-600 text-xs md:text-sm">
                  To the maximum extent permitted by applicable laws, in no event shall ConvertOneAI, its developers, or its affiliates be held liable for any damages, metadata discrepancies, data loss, conversion errors, or business disruptions arising from your use of or inability to use this Service. Users are encouraged to maintain independent backups of critical files.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  <span className="text-indigo-600">8.</span> Changes to Terms
                </h3>
                <p className="text-slate-600 text-xs md:text-sm">
                  We reserve the right to review and update these Terms at any time to reflect software upgrades, regulatory shifts, or operational updates. When revisions occur, we will adjust the "Effective Date" at the top of this page. For significant updates, we will place an alert on the website interface. Your continued access to the platform following updates signifies your clear agreement to the revised Terms.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  <span className="text-indigo-600">9.</span> Governing Law
                </h3>
                <p className="text-slate-600 text-xs md:text-sm">
                  These Terms and all disputes arising from your use of ConvertOneAI shall be governed by, and interpreted in accordance with, the laws of the State of California, United States, without regard to its conflict of law principles. Any legal actions must be filed in the competent courts located therein.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  <span className="text-indigo-600">10.</span> Contact Us
                </h3>
                <p className="text-slate-600 text-xs md:text-sm">
                  If you have questions, concerns, or feedback regarding these Terms, please reach out to us. You can submit an inquiry directly through the <strong>Contact Support</strong> form available under our navigation menu.
                </p>
              </section>
            </div>
          </div>
        )}

      </main>

      {/* Static Reserved Advertisement Banner */}


      {/* 4. Footer Information Loops */}
      <footer className="bg-slate-900 text-gray-400 border-t border-slate-950 py-10 select-none font-sans text-xs">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Card Column */}
          <div className="space-y-3.5 text-left">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setViewMode("home")}>
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white p-1.5 rounded-lg shadow">
                <FileCheck size={14} className="stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">
                ConvertOne<span className="text-indigo-400">Ai</span>
              </span>
            </div>
            <p className="leading-relaxed leading-normal text-gray-500">
              The professional document-to-markdown platform focusing on secure, volatile transpile runs with high-contrast UI designs.
            </p>
          </div>

          {/* Quick links loops */}
          <div className="text-left space-y-2.5">
            <span className="font-bold text-white text-[11px] uppercase tracking-wider block">Conversion Tools</span>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => selectPreconfigMode("docx")} className="hover:text-white transition-colors">
                  Convert Word to MD
                </button>
              </li>
              <li>
                <button onClick={() => selectPreconfigMode("pdf")} className="hover:text-white transition-colors">
                  Convert PDF to MD
                </button>
              </li>
              {(showAdminEntry || isAdmin) && (
                isAdmin ? (
                  <li>
                    <button onClick={() => setViewMode("analytics")} className="hover:text-white transition-colors flex items-center gap-1.5 text-emerald-400">
                      <Gauge size={12} />
                      <span>Telemetry Logs (Unlocked)</span>
                    </button>
                  </li>
                ) : (
                  <li>
                    <button onClick={() => setViewMode("analytics")} className="hover:text-white transition-colors flex items-center gap-1.5 text-slate-500 hover:text-slate-400">
                      <Lock size={12} />
                      <span>Admin Diagnostics Console</span>
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Educational Resources */}
          <div className="text-left space-y-2.5">
            <span className="font-bold text-white text-[11px] uppercase tracking-wider block">Developer Specs</span>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => setViewMode("guide")} className="hover:text-white transition-colors">
                  Markdown Guide
                </button>
              </li>
              <li>
                <button onClick={() => setViewMode("blog")} className="hover:text-white transition-colors">
                  Blog & Perspective
                </button>
              </li>
              <li>
                <button onClick={() => setViewMode("faq")} className="hover:text-white transition-colors">
                  Frequently Asked
                </button>
              </li>
            </ul>
          </div>

          {/* Privacy & legal bounds */}
          <div className="text-left space-y-2.5">
            <span className="font-bold text-white text-[11px] uppercase tracking-wider block">Legal Bounds</span>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => setViewMode("about")} className="hover:text-white transition-colors font-medium text-gray-400">
                  Our Mission
                </button>
              </li>
              <li>
                <button onClick={() => setViewMode("privacy")} className="hover:text-white transition-colors">
                  PrivacyShield Guarantee
                </button>
              </li>
              <li>
                <button onClick={() => setViewMode("terms")} className="hover:text-white transition-colors">
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Legal copyright bar */}
        <div className="max-w-7xl mx-auto px-6 pt-8 mt-8 border-t border-slate-800/65 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-gray-500">
          <span>&copy; 2026 ConvertOneAI, Inc. All rights protected.</span>
          <span className="flex items-center gap-1">
            <Lock size={12} className="text-indigo-500" />
            <span>Secure In-Memory Volatile Processing</span>
          </span>
        </div>
      </footer>

      {/* Global Cookie Consent Banner */}
      {!cookieDismissed && (
        <div className="fixed bottom-0 inset-x-0 w-full bg-slate-900 border-t border-slate-800 text-white z-50 p-4 shadow-2xl transition-transform animate-in slide-in-from-bottom">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-sm">
            <p className="text-slate-300">
              ConvertOneAI utilizes essential technical cookies and anonymous analytics to ensure optimal routing and session performance. By remaining on this domain, you accept our standard cookie procedures.
              <span className="ml-2 underline cursor-pointer text-indigo-400 hover:text-indigo-300" onClick={() => { setViewMode("privacy"); setCookieDismissed(true); window.scrollTo(0,0); }}>Read Privacy Policy</span>
            </p>
            <button 
              onClick={() => setCookieDismissed(true)} 
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-6 rounded-md transition-colors shadow whitespace-nowrap shrink-0"
            >
              Accept & Close
            </button>
          </div>
        </div>
      )}


    </div>
  );
}
