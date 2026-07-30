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

  const handleNavClick = (mode: ViewMode, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setViewMode(mode);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F6F4EE]/90 backdrop-blur-md border-b border-[#E4E0D8] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Brand Logo */}
        <a
          href="/"
          onClick={(e) => handleNavClick("home", e)}
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
        </a>

        {/* Desktop Navigation (lg and above) */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-medium">
          <a
            href="#"
            onClick={(e) => handleNavClick("home", e)}
            className={`nav-link-item cursor-pointer py-1 whitespace-nowrap ${
              viewMode === "home" || viewMode === "convert-word" || viewMode === "convert-pdf" ? "active" : ""
            }`}
          >
            Converter
          </a>

          <a
            href="#"
            onClick={(e) => handleNavClick("tools", e)}
            className={`nav-link-item cursor-pointer py-1 flex items-center gap-1.5 whitespace-nowrap ${
              viewMode === "tools" ? "active" : ""
            }`}
          >
            <span>Tools &amp; AI</span>
            <span className="text-[10px] bg-[#E4E0D8]/60 text-[#D98F3D] font-mono font-bold px-1.5 py-0.5 rounded border border-[#E4E0D8]">
              New
            </span>
          </a>

          <a
            href="#"
            onClick={(e) => handleNavClick("guide", e)}
            className={`nav-link-item cursor-pointer py-1 whitespace-nowrap ${
              viewMode === "guide" ? "active" : ""
            }`}
          >
            Guides &amp; Docs
          </a>

          <a
            href="#"
            onClick={(e) => handleNavClick("blog", e)}
            className={`nav-link-item cursor-pointer py-1 whitespace-nowrap ${
              viewMode === "blog" ? "active" : ""
            }`}
          >
            Blog
          </a>

          <a
            href="#"
            onClick={(e) => handleNavClick("faq", e)}
            className={`nav-link-item cursor-pointer py-1 whitespace-nowrap ${
              viewMode === "faq" ? "active" : ""
            }`}
          >
            FAQ
          </a>

          <a
            href="#"
            onClick={(e) => handleNavClick("about", e)}
            className={`nav-link-item cursor-pointer py-1 whitespace-nowrap ${
              viewMode === "about" ? "active" : ""
            }`}
          >
            About
          </a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setViewMode("home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="ml-2 bg-[#171B26] hover:bg-[#2A3040] text-[#F6F4EE] text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs whitespace-nowrap"
          >
            Get Started
          </a>
        </nav>

        {/* Mobile Hamburger Toggle Button (mobile only) */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2.5 text-[#171B26] hover:bg-[#E4E0D8]/50 rounded-xl transition-colors cursor-pointer focus:outline-none"
          aria-label="Toggle Navigation Menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Dropdown Panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#F6F4EE] border-b border-[#E4E0D8] px-6 py-4 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <a
            href="#"
            onClick={(e) => handleNavClick("home", e)}
            className={`block px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              viewMode === "home" || viewMode === "convert-word" || viewMode === "convert-pdf"
                ? "bg-[#2F6F5E] text-[#F6F4EE] font-semibold"
                : "text-[#171B26] hover:bg-[#E4E0D8]/60"
            }`}
          >
            Converter
          </a>

          <a
            href="#"
            onClick={(e) => handleNavClick("tools", e)}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              viewMode === "tools"
                ? "bg-[#2F6F5E] text-[#F6F4EE] font-semibold"
                : "text-[#171B26] hover:bg-[#E4E0D8]/60"
            }`}
          >
            <span>Tools &amp; AI</span>
            <span className="text-[10px] bg-[#D98F3D] text-white font-mono font-bold px-2 py-0.5 rounded-full">
              New
            </span>
          </a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              selectPreconfigMode("docx");
              setMobileMenuOpen(false);
            }}
            className="block px-3.5 py-2 rounded-xl text-xs font-medium text-[#6B6459] hover:bg-[#E4E0D8]/60 hover:text-[#171B26] transition-all pl-6"
          >
            ↳ Word to Markdown
          </a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              selectPreconfigMode("pdf");
              setMobileMenuOpen(false);
            }}
            className="block px-3.5 py-2 rounded-xl text-xs font-medium text-[#6B6459] hover:bg-[#E4E0D8]/60 hover:text-[#171B26] transition-all pl-6"
          >
            ↳ PDF to Markdown
          </a>

          <a
            href="#"
            onClick={(e) => handleNavClick("guide", e)}
            className={`block px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              viewMode === "guide"
                ? "bg-[#2F6F5E] text-[#F6F4EE] font-semibold"
                : "text-[#171B26] hover:bg-[#E4E0D8]/60"
            }`}
          >
            Guides &amp; Docs
          </a>

          <a
            href="#"
            onClick={(e) => handleNavClick("blog", e)}
            className={`block px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              viewMode === "blog"
                ? "bg-[#2F6F5E] text-[#F6F4EE] font-semibold"
                : "text-[#171B26] hover:bg-[#E4E0D8]/60"
            }`}
          >
            Blog
          </a>

          <a
            href="#"
            onClick={(e) => handleNavClick("faq", e)}
            className={`block px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              viewMode === "faq"
                ? "bg-[#2F6F5E] text-[#F6F4EE] font-semibold"
                : "text-[#171B26] hover:bg-[#E4E0D8]/60"
            }`}
          >
            FAQ
          </a>

          <a
            href="#"
            onClick={(e) => handleNavClick("about", e)}
            className={`block px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              viewMode === "about"
                ? "bg-[#2F6F5E] text-[#F6F4EE] font-semibold"
                : "text-[#171B26] hover:bg-[#E4E0D8]/60"
            }`}
          >
            About
          </a>

          <div className="pt-2">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setViewMode("home");
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="block w-full text-center bg-[#171B26] hover:bg-[#2A3040] text-[#F6F4EE] text-sm font-semibold py-3 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Get Started
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
