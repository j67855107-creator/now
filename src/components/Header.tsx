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
    <header className="sticky top-0 z-40 bg-[#F6F4EE]/90 backdrop-blur-md border-b border-[#E4E0D8] select-none">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div
          onClick={() => setViewMode("home")}
          className="flex items-center gap-2.5 cursor-pointer group"
          id="brand-logo"
        >
          <div className="w-7 h-7 bg-[#171B26] rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
            <svg className="w-4 h-4 text-[#F6F4EE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-[#171B26]">
            ConvertOne<span className="text-[#2F6F5E]">AI</span>
          </span>
        </div>

        <nav className="hidden lg:flex items-center gap-5 text-xs font-medium">
          <button
            onClick={() => setViewMode("home")}
            className={`nav-link-item cursor-pointer py-1 ${
              viewMode === "home" || viewMode === "convert-word" || viewMode === "convert-pdf" ? "active" : ""
            }`}
          >
            Converter
          </button>

          <button
            onClick={() => setViewMode("tools")}
            className={`nav-link-item cursor-pointer py-1 flex items-center gap-1.5 ${
              viewMode === "tools" ? "active" : ""
            }`}
          >
            <span>Tools &amp; AI</span>
            <span className="text-[10px] bg-[#E4E0D8]/60 text-[#D98F3D] font-mono font-bold px-1.5 py-0.5 rounded border border-[#E4E0D8]">
              New
            </span>
          </button>

          <button
            onClick={() => setViewMode("guide")}
            className={`nav-link-item cursor-pointer py-1 ${
              viewMode === "guide" ? "active" : ""
            }`}
          >
            Guides &amp; Docs
          </button>

          <button
            onClick={() => setViewMode("blog")}
            className={`nav-link-item cursor-pointer py-1 ${
              viewMode === "blog" ? "active" : ""
            }`}
          >
            Blog
          </button>

          <button
            onClick={() => setViewMode("faq")}
            className={`nav-link-item cursor-pointer py-1 ${
              viewMode === "faq" ? "active" : ""
            }`}
          >
            FAQ
          </button>

          <button
            onClick={() => setViewMode("about")}
            className={`nav-link-item cursor-pointer py-1 ${
              viewMode === "about" ? "active" : ""
            }`}
          >
            About
          </button>

          <button
            onClick={() => {
              setViewMode("home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="ml-2 bg-[#171B26] hover:bg-[#2A3040] text-[#F6F4EE] text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Get Started
          </button>
        </nav>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-[#6B6459] hover:text-[#171B26] hover:bg-[#E4E0D8]/40 rounded-lg cursor-pointer"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#F6F4EE] border-t border-[#E4E0D8] px-6 py-4 space-y-1.5 text-left">
          <button
            onClick={() => { setViewMode("home"); setMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 text-xs font-medium text-[#171B26] hover:bg-[#E4E0D8]/50 rounded-lg cursor-pointer"
          >
            Converter
          </button>
          <button
            onClick={() => { setViewMode("tools"); setMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 text-xs font-medium text-[#2F6F5E] bg-[#E4E0D8]/40 rounded-lg cursor-pointer flex items-center justify-between"
          >
            <span>Tools &amp; AI Directory</span>
            <span className="text-[10px] font-mono font-bold bg-[#D98F3D] text-white px-2 py-0.5 rounded-full">New</span>
          </button>
          <button
            onClick={() => { selectPreconfigMode("docx"); setMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 text-xs font-medium text-[#6B6459] hover:bg-[#E4E0D8]/50 rounded-lg cursor-pointer"
          >
            Word to Markdown
          </button>
          <button
            onClick={() => { selectPreconfigMode("pdf"); setMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 text-xs font-medium text-[#6B6459] hover:bg-[#E4E0D8]/50 rounded-lg cursor-pointer"
          >
            PDF to Markdown
          </button>
          <button
            onClick={() => { setViewMode("guide"); setMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 text-xs font-medium text-[#6B6459] hover:bg-[#E4E0D8]/50 rounded-lg cursor-pointer"
          >
            Guides &amp; Docs
          </button>
          <button
            onClick={() => { setViewMode("blog"); setMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 text-xs font-medium text-[#6B6459] hover:bg-[#E4E0D8]/50 rounded-lg cursor-pointer"
          >
            Blog
          </button>
          <button
            onClick={() => { setViewMode("faq"); setMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 text-xs font-medium text-[#6B6459] hover:bg-[#E4E0D8]/50 rounded-lg cursor-pointer"
          >
            FAQ
          </button>
          <button
            onClick={() => { setViewMode("about"); setMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 text-xs font-medium text-[#6B6459] hover:bg-[#E4E0D8]/50 rounded-lg cursor-pointer"
          >
            About
          </button>
          <button
            onClick={() => { setViewMode("home"); setMobileMenuOpen(false); }}
            className="block w-full text-center py-2.5 text-xs font-semibold text-[#F6F4EE] bg-[#171B26] hover:bg-[#2A3040] rounded-xl shadow-xs cursor-pointer"
          >
            Get Started
          </button>
        </div>
      )}
    </header>
  );
}
