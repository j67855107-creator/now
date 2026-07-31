import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { ViewMode } from "../types"; // Kept for interface compatibility
import { useAppContext } from "../contexts/AppContext";
import MobileMenu from "./navigation/MobileMenu";

interface HeaderProps {
  // Legacy props kept for compatibility, though we'll use Link and useLocation directly
  viewMode?: ViewMode;
  setViewMode?: (mode: ViewMode) => void;
  selectPreconfigMode?: (mode: "docx" | "pdf") => void;
  triggerAlert?: (type: "success" | "error" | "info", text: string) => void;
}

export default function Header({
  selectPreconfigMode,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const path = location.pathname;
  const ctx = useAppContext();
  
  // Safe fallback to context if not passed as prop
  const handleSelectPreconfigMode = selectPreconfigMode || ctx.selectPreconfigMode;

  const isActive = (paths: string[]) => paths.includes(path);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E4E0D8] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to="/"
          onClick={() => setMobileMenuOpen(false)}
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
        </Link>

        {/* Desktop Navigation (lg and above) */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-medium">
          <Link
            to="/"
            className={`nav-link-item cursor-pointer py-1 whitespace-nowrap ${
              isActive(["/", "/converters/word-to-markdown", "/converters/pdf-to-markdown"]) ? "active" : ""
            }`}
          >
            Converter
          </Link>

          <Link
            to="/ai-tools"
            className={`nav-link-item cursor-pointer py-1 flex items-center gap-1.5 whitespace-nowrap ${
              isActive(["/ai-tools"]) ? "active" : ""
            }`}
          >
            <span>Tools &amp; AI</span>
            <span className="text-[10px] bg-[#E4E0D8]/60 text-[#D98F3D] font-mono font-bold px-1.5 py-0.5 rounded border border-[#E4E0D8]">
              New
            </span>
          </Link>

          <Link
            to="/guides"
            className={`nav-link-item cursor-pointer py-1 whitespace-nowrap ${
              isActive(["/guides"]) ? "active" : ""
            }`}
          >
            Guides &amp; Docs
          </Link>

          <Link
            to="/blog"
            className={`nav-link-item cursor-pointer py-1 whitespace-nowrap ${
              isActive(["/blog"]) ? "active" : ""
            }`}
          >
            Blog
          </Link>

          <Link
            to="/faq"
            className={`nav-link-item cursor-pointer py-1 whitespace-nowrap ${
              isActive(["/faq"]) ? "active" : ""
            }`}
          >
            FAQ
          </Link>

          <Link
            to="/about"
            className={`nav-link-item cursor-pointer py-1 whitespace-nowrap ${
              isActive(["/about"]) ? "active" : ""
            }`}
          >
            About
          </Link>

          <Link
            to="/"
            className="ml-2 bg-[#171B26] hover:bg-[#2A3040] text-[#F6F4EE] text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs whitespace-nowrap"
          >
            Get Started
          </Link>
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
      {mobileMenuOpen && <MobileMenu onClose={() => setMobileMenuOpen(false)} />}
    </header>
  );
}
