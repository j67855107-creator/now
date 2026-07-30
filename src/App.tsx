import React, { useState, useEffect, useRef } from "react";
import { AlertCircle, Lock, Sparkles, CheckCircle2 } from "lucide-react";
import { ViewMode, BlogPost } from "./types";
import AboutView from "./components/AboutView";
import FAQView from "./components/FAQView";
import GuideView from "./components/GuideView";
import ContactView from "./components/ContactView";
import PrivacyView from "./components/PrivacyView";
import TermsView from "./components/TermsView";
import BlogView from "./components/BlogView";
import Header from "./components/Header";
import ConversionUI from "./components/ConversionUI";
import ToolsView from "./components/ToolsView";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import { DashboardStats } from "./types";
import { API_BASE } from "./api";
import { ToolPlugin } from "./ai/registries/ToolPlugin";
import { toolsRegistry } from "./ai/registries/toolsRegistry";

const VITE_API_PROTECTION_KEY = import.meta.env.VITE_API_PROTECTION_KEY || "WN3FBAF2GYF";
const ADMIN_LOGIN_PATH = import.meta.env.VITE_ADMIN_LOGIN_PATH || "/admin-login-secret-path";

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("home");
  const [selectedTool, setSelectedTool] = useState<ToolPlugin | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [conversionResult, setConversionResult] = useState<string>("");
  const [resultDetails, setResultDetails] = useState<{ modeUsed: "ai" | "classic"; durationMs: number; warning?: string } | null>(null);
  const [editedMarkdown, setEditedMarkdown] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [readingBlog, setReadingBlog] = useState<BlogPost | null>(null);
  const [cookieDismissed, setCookieDismissed] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("admin_token");
    return null;
  });

  useEffect(() => {
    if (adminToken && viewMode === "admin-login") setViewMode("admin-dashboard");
  }, [adminToken, viewMode]);

  // Handle secret admin URL & /tools route sync
  useEffect(() => {
    if (window.location.pathname === ADMIN_LOGIN_PATH) {
      setViewMode("admin-login");
      window.history.replaceState({}, document.title, "/");
    } else if (window.location.pathname.startsWith("/tools")) {
      setViewMode("tools");
    }
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync route selections
  useEffect(() => {
    if (viewMode === "convert-word" || viewMode === "convert-pdf") {
      setFile(null); setConversionResult(""); setEditedMarkdown(""); setResultDetails(null);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [viewMode]);

  const loadingSteps = ["Uploading document securely...","Verifying character bounds...","Preserving lists and tables...","Running local parser...","Constructing markdown..."];
  useEffect(() => {
    if (!converting) return;
    const interval = setInterval(() => setLoadingStep((prev) => (prev + 1) % loadingSteps.length), 1400);
    return () => clearInterval(interval);
  }, [converting]);

  // Fetch telemetry logs
  useEffect(() => {
    if (viewMode === "analytics" || viewMode === "admin-dashboard") {
      fetchStats();
    }
  }, [viewMode]);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/stats`, {
        headers: { "x-api-key": VITE_API_PROTECTION_KEY }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const [dragActive, setDragActive] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFileSelected(e.dataTransfer.files[0]);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleFileSelected(e.target.files[0]);
  };

  const handleFileSelected = (selectedFile: File) => {
    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    if (viewMode === "convert-word" && ext !== "docx") {
      triggerAlert("error", "Word (.docx) files only."); return;
    }
    if (viewMode === "convert-pdf" && ext !== "pdf") {
      triggerAlert("error", "PDF files only."); return;
    }
    const allowed = ["pdf", "docx", "pptx", "xlsx", "xls", "csv", "epub", "html", "htm", "png", "jpg", "jpeg", "webp", "bmp"];
    if (ext && allowed.includes(ext)) {
      setFile(selectedFile); setConversionResult(""); setEditedMarkdown(""); setResultDetails(null);
    } else triggerAlert("error", "Unsupported file type.");
  };
  const selectPreconfigMode = (mode: "docx" | "pdf") => setViewMode(mode === "docx" ? "convert-word" : "convert-pdf");

  const handleToolClick = (toolId: string) => {
    const plugin = toolsRegistry.get(toolId);
    if (plugin) {
      setSelectedTool(plugin);
      if (toolId === "pdf-to-markdown") selectPreconfigMode("pdf");
      else if (toolId === "word-to-markdown") selectPreconfigMode("docx");
      else setViewMode("tools");
    } else {
      setViewMode("tools");
    }
  };

  const runConversion = async () => {
    if (!file) { triggerAlert("error", "Please upload a file."); return; }
    setConverting(true); setLoadingStep(0); setAlertMessage(null);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const resultStr = reader.result as string;
        const base64Content = resultStr.split(",")[1];
        const res = await fetch(API_BASE + "/api/convert", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": VITE_API_PROTECTION_KEY },
          body: JSON.stringify({ fileData: base64Content, fileName: file.name, mimeType: file.type, mode: "classic" })
        });
        if (!res.ok) throw new Error(((await res.json()).error) || "Conversion failed.");
        const data = await res.json();
        setConversionResult(data.markdown); setEditedMarkdown(data.markdown);
        setResultDetails({ modeUsed: data.modeUsed, durationMs: data.durationMs, warning: data.warning });
        triggerAlert(data.warning ? "info" : "success", data.warning || "Successfully parsed into Markdown.");
      } catch (err: any) { triggerAlert("error", err.message); }
      finally { setConverting(false); }
    };
    reader.onerror = () => { triggerAlert("error", "Failed to read file."); setConverting(false); };
    reader.readAsDataURL(file);
  };

  const triggerAlert = (type: "success" | "error" | "info", text: string) => {
    setAlertMessage({ type, text });
    setTimeout(() => setAlertMessage(null), 4000);
  };

  const handleAdminLogin = (token: string) => {
    sessionStorage.setItem("admin_token", token);
    setAdminToken(token);
    setViewMode("admin-dashboard");
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem("admin_token");
    setAdminToken(null);
    setViewMode("home");
    triggerAlert("info", "Logged out of admin terminal successfully.");
  };

  const [convertMode] = useState<"classic" | "ai">("classic");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans antialiased">
      <Header viewMode={viewMode} setViewMode={setViewMode} selectPreconfigMode={selectPreconfigMode} triggerAlert={triggerAlert} />

      {alertMessage && (
        <div className="max-w-7xl mx-auto px-8 mt-4 w-full select-none">
          <div className={"p-4 rounded-xl border flex items-start gap-3 shadow-sm " + (alertMessage.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-150" : alertMessage.type === "error" ? "bg-rose-50 text-rose-800 border-rose-150" : "bg-blue-50 text-blue-800 border-blue-150")}>
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div className="text-sm font-medium">{alertMessage.text}</div>
          </div>
        </div>
      )}

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        {(viewMode === "home" || viewMode === "convert-word" || viewMode === "convert-pdf") && (
          <ConversionUI viewMode={viewMode} setViewMode={setViewMode} file={file} setFile={setFile} converting={converting} setConverting={setConverting} conversionResult={conversionResult} setConversionResult={setConversionResult} editedMarkdown={editedMarkdown} setEditedMarkdown={setEditedMarkdown} resultDetails={resultDetails} setResultDetails={setResultDetails} runConversion={runConversion} triggerAlert={triggerAlert} selectPreconfigMode={selectPreconfigMode} handleFileChange={handleFileChange} handleDrag={handleDrag} handleDrop={handleDrop} fileInputRef={fileInputRef} loadingStep={loadingStep} />
        )}

        {viewMode === "tools" && (
          <ToolsView
            setViewMode={setViewMode}
            onSelectTool={(plugin) => {
              setSelectedTool(plugin);
              if (plugin.category === "conversion") {
                if (plugin.id.includes("word")) selectPreconfigMode("docx");
                else if (plugin.id.includes("pdf")) selectPreconfigMode("pdf");
                else setViewMode("home");
              } else {
                setViewMode("home");
              }
            }}
          />
        )}

        {viewMode === "analytics" && !adminToken && (
          <div className="py-12">
            <div className="max-w-md mx-auto bg-white rounded-2xl border border-gray-150 shadow-sm p-8 text-center space-y-6 animate-fadeIn">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto"><Lock size={28} className="stroke-[1.5]" /></div>
              <h2 className="text-xl font-extrabold text-slate-800">Admin Security Gate</h2>
              <p className="text-xs text-slate-500">Access restricted to authenticated administrators only.</p>
              <button onClick={() => setViewMode("admin-login")} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-2.5 px-4 rounded-xl transition-all cursor-pointer">Authenticate as Admin</button>
            </div>
          </div>
        )}

        {viewMode === "analytics" && adminToken && <AdminDashboard token={adminToken} onLogout={handleAdminLogout} />}
        {viewMode === "admin-login" && <AdminLogin onLoginSuccess={handleAdminLogin} onBack={() => setViewMode("home")} />}
        {viewMode === "admin-dashboard" && (adminToken ? <AdminDashboard token={adminToken} onLogout={handleAdminLogout} /> : (
          <div className="py-12 text-center"><p className="text-slate-500">Session expired.</p><button onClick={() => setViewMode("admin-login")} className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold cursor-pointer">Go to Login</button></div>
        ))}

        {viewMode === "guide" && <GuideView />}
        {viewMode === "blog" && <BlogView readingBlog={readingBlog} setReadingBlog={setReadingBlog} setViewMode={setViewMode} />}
        {viewMode === "faq" && <FAQView />}
        {viewMode === "about" && <AboutView />}
        {viewMode === "contact" && <ContactView triggerAlert={triggerAlert} />}
        {viewMode === "privacy" && <PrivacyView />}
        {viewMode === "terms" && <TermsView />}
      </main>

      <footer className="bg-slate-900 text-gray-400 border-t border-slate-950 py-10 select-none font-sans text-xs">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1 — Brand */}
          <div className="space-y-3.5 text-left">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setViewMode("home")}>
              <span className="font-extrabold text-white text-base tracking-tight">ConvertOne<span className="text-indigo-400">AI</span></span>
            </div>
            <p className="leading-relaxed text-gray-400">
              Enterprise AI Document Intelligence Platform. Parse, clean, chunk, and structure documents for LLMs, RAG pipelines, and fine-tuning datasets.
            </p>
            <p className="text-[11px] font-semibold text-indigo-400">
              Built for AI Document Processing.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-300 bg-indigo-950/80 border border-indigo-800/50 px-2 py-0.5 rounded-md">
                <Sparkles size={10} className="text-indigo-400" /> AI Ready
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-300 bg-emerald-950/80 border border-emerald-800/50 px-2 py-0.5 rounded-md">
                <Lock size={10} className="text-emerald-400" /> Secure
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-300 bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 rounded-md">
                <CheckCircle2 size={10} className="text-slate-400" /> No Registration
              </span>
            </div>
          </div>

          {/* Column 2 — Popular AI Tools */}
          <div className="text-left space-y-2.5">
            <span className="font-bold text-white text-[11px] uppercase tracking-wider block">Popular AI Tools</span>
            <ul className="space-y-1.5">
              <li><button onClick={() => selectPreconfigMode("pdf")} className="hover:text-white transition-colors text-left cursor-pointer">PDF to Markdown</button></li>
              <li><button onClick={() => selectPreconfigMode("docx")} className="hover:text-white transition-colors text-left cursor-pointer">Word to Markdown</button></li>
              <li><button onClick={() => handleToolClick("html-to-markdown")} className="hover:text-white transition-colors text-left cursor-pointer">HTML to Markdown</button></li>
              <li><button onClick={() => handleToolClick("image-ocr")} className="hover:text-white transition-colors text-left cursor-pointer">Image OCR</button></li>
              <li><button onClick={() => handleToolClick("ai-summary")} className="hover:text-white transition-colors text-left cursor-pointer">AI Summary</button></li>
              <li><button onClick={() => handleToolClick("prompt-generator")} className="hover:text-white transition-colors text-left cursor-pointer">Prompt Generator</button></li>
              <li><button onClick={() => handleToolClick("prepare-for-ai")} className="hover:text-white transition-colors text-left cursor-pointer">Prepare for AI</button></li>
              <li className="pt-1"><button onClick={() => setViewMode("tools")} className="hover:text-white text-indigo-400 font-semibold transition-colors flex items-center gap-1 text-left cursor-pointer">View All AI Tools →</button></li>
            </ul>
          </div>

          {/* Column 3 — Resources */}
          <div className="text-left space-y-2.5">
            <span className="font-bold text-white text-[11px] uppercase tracking-wider block">Resources</span>
            <ul className="space-y-1.5">
              <li><button onClick={() => setViewMode("guide")} className="hover:text-white transition-colors text-left cursor-pointer">Markdown Guide</button></li>
              <li><button onClick={() => setViewMode("guide")} className="hover:text-white transition-colors text-left cursor-pointer">RAG Guide</button></li>
              <li><button onClick={() => setViewMode("guide")} className="hover:text-white transition-colors text-left cursor-pointer">JSONL Guide</button></li>
              <li><button onClick={() => setViewMode("blog")} className="hover:text-white transition-colors text-left cursor-pointer">Blog</button></li>
              <li><button onClick={() => setViewMode("faq")} className="hover:text-white transition-colors text-left cursor-pointer">FAQ</button></li>
            </ul>
          </div>

          {/* Column 4 — Company */}
          <div className="text-left space-y-2.5">
            <span className="font-bold text-white text-[11px] uppercase tracking-wider block">Company</span>
            <ul className="space-y-1.5">
              <li><button onClick={() => setViewMode("about")} className="hover:text-white transition-colors text-left cursor-pointer">About</button></li>
              <li><button onClick={() => setViewMode("privacy")} className="hover:text-white transition-colors text-left cursor-pointer">Privacy Policy</button></li>
              <li><button onClick={() => setViewMode("terms")} className="hover:text-white transition-colors text-left cursor-pointer">Terms of Service</button></li>
              <li><button onClick={() => setViewMode("contact")} className="hover:text-white transition-colors text-left cursor-pointer">Contact</button></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="max-w-7xl mx-auto px-6 pt-8 mt-8 border-t border-slate-800/65 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500">
          <span>&copy; 2026 ConvertOneAI, Inc. All rights reserved.</span>
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span className="text-gray-400 font-medium">24+ Supported Formats</span>
            <span className="text-slate-700">•</span>
            <span className="text-gray-400 font-medium">17+ AI Tools</span>
            <span className="text-slate-700">•</span>
            <span className="text-indigo-400 font-semibold">Powered by ConvertOneAI</span>
          </div>
        </div>
      </footer>

      {!cookieDismissed && (
        <div className="fixed bottom-0 inset-x-0 w-full bg-slate-900 border-t border-slate-800 text-white z-50 p-4 shadow-2xl">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-sm">
            <p className="text-slate-300">ConvertOneAI uses essential cookies.<span className="ml-2 underline cursor-pointer text-indigo-400 hover:text-indigo-300" onClick={() => { setViewMode("privacy"); setCookieDismissed(true); window.scrollTo(0, 0); }}>Privacy Policy</span></p>
            <button onClick={() => setCookieDismissed(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-6 rounded-md shadow cursor-pointer">Accept</button>
          </div>
        </div>
      )}

    </div>
  );
}

