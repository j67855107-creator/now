import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ViewMode } from "../types";

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectPreconfigMode: (mode: "docx" | "pdf") => void;
  triggerAlert: (type: "success" | "error" | "info", text: string) => void;
}

export default function Header({
  viewMode,
  setViewMode,
  selectPreconfigMode,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
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

        <nav className="hidden lg:flex items-center gap-1.5 text-sm font-medium">
          <button onClick={() => setViewMode("home")}
            className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${viewMode === "home" ? "text-indigo-600 border-b-2 border-indigo-600 rounded-none pb-1" : "text-slate-600 hover:text-slate-900"}`}>Convert</button>
          <button onClick={() => selectPreconfigMode("docx")}
            className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${viewMode === "convert-word" ? "text-indigo-600 border-b-2 border-indigo-600 rounded-none pb-1" : "text-slate-600 hover:text-slate-900"}`}>Word to MD</button>
          <button onClick={() => selectPreconfigMode("pdf")}
            className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${viewMode === "convert-pdf" ? "text-indigo-600 border-b-2 border-indigo-600 rounded-none pb-1" : "text-slate-600 hover:text-slate-900"}`}>PDF to MD</button>
          <button onClick={() => setViewMode("guide")}
            className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${viewMode === "guide" ? "text-indigo-600 border-b-2 border-indigo-600 rounded-none pb-1" : "text-slate-600 hover:text-slate-900"}`}>Markdown Guide</button>
          <button onClick={() => setViewMode("blog")}
            className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${viewMode === "blog" ? "text-indigo-600 border-b-2 border-indigo-600 rounded-none pb-1" : "text-slate-600 hover:text-slate-900"}`}>Blog</button>
          <button onClick={() => setViewMode("faq")}
            className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${viewMode === "faq" ? "text-indigo-600 border-b-2 border-indigo-600 rounded-none pb-1" : "text-slate-600 hover:text-slate-900"}`}>FAQ</button>
          <button onClick={() => setViewMode("about")}
            className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${viewMode === "about" ? "text-indigo-600 border-b-2 border-indigo-600 rounded-none pb-1" : "text-slate-600 hover:text-slate-900"}`}>About</button>
          <button onClick={() => setViewMode("contact")}
            className="ml-4 bg-slate-900 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-sm cursor-pointer">Get Started</button>
        </nav>

        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg cursor-pointer"
          aria-label="Toggle Menu">
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 px-6 py-4 space-y-2">
          <button onClick={() => { setViewMode("home"); setMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg cursor-pointer">Home Launcher</button>
          <button onClick={() => { selectPreconfigMode("docx"); setMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg cursor-pointer">Word to Markdown</button>
          <button onClick={() => { selectPreconfigMode("pdf"); setMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg cursor-pointer">PDF to Markdown</button>
          <button onClick={() => { setViewMode("guide"); setMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg cursor-pointer">Markdown Guide</button>
          <button onClick={() => { setViewMode("blog"); setMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg cursor-pointer">Blog Articles</button>
          <button onClick={() => { setViewMode("faq"); setMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg cursor-pointer">FAQ Support</button>
          <button onClick={() => { setViewMode("about"); setMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg cursor-pointer">Mission About</button>
          <button onClick={() => { setViewMode("contact"); setMobileMenuOpen(false); }}
            className="block w-full text-center py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow cursor-pointer">Get Started</button>
        </div>
      )}
    </header>
  );
}
