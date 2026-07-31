/**
 * RootLayout — Shared layout for all public pages.
 *
 * Renders Header, the page content via <Outlet />, Footer, global alert banner,
 * and the cookie consent banner. All state comes from AppContext.
 */

import React from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { useAppContext } from "../contexts/AppContext";
import Header from "../components/Header";

export default function RootLayout() {
  const navigate = useNavigate();
  const {
    alertMessage,
    cookieDismissed,
    setCookieDismissed,
    setViewMode,
    selectPreconfigMode,
    handleToolClick,
    triggerAlert,
  } = useAppContext();

  // We still pass setViewMode / selectPreconfigMode to Header so it compiles.
  // Header is updated separately to use <Link> instead.
  return (
    <div className="min-h-screen bg-transparent text-[#171B26] flex flex-col justify-between font-sans antialiased">
      <Header
        viewMode={"home" as any}
        setViewMode={setViewMode}
        selectPreconfigMode={selectPreconfigMode}
        triggerAlert={triggerAlert}
      />

      {/* Global Alert Banner */}
      {alertMessage && (
        <div className="max-w-7xl mx-auto px-6 mt-4 w-full select-none">
          <div
            className={
              "p-3.5 rounded-xl border flex items-start gap-3 shadow-xs text-xs font-mono font-medium " +
              (alertMessage.type === "success"
                ? "bg-[#FAF8F3] text-[#2F6F5E] border-[#2F6F5E]"
                : alertMessage.type === "error"
                ? "bg-rose-50 text-[#EF4444] border-rose-200"
                : "bg-[#FAF8F3] text-[#2F6F5E] border-[#E4E0D8]")
            }
          >
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>{alertMessage.text}</div>
          </div>
        </div>
      )}

      {/* Page Content */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#171B26] text-[#F6F4EE] border-t-2 border-[#2F6F5E] py-12 select-none text-xs font-sans">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3 text-left">
            <Link to="/" className="flex items-center gap-2 cursor-pointer">
              <span className="font-display font-bold text-[#F6F4EE] text-base tracking-tight">
                ConvertOne<span className="text-[#2F6F5E]">AI</span>
              </span>
            </Link>
            <p className="leading-relaxed text-[#F6F4EE]/70">
              Enterprise AI Document Platform. Convert, clean, chunk, and structure documents for LLMs, RAG pipelines, and AI datasets.
            </p>
            <p className="text-[11px] font-mono text-[#2F6F5E]">
              // unified document intelligence for ai
            </p>
          </div>

          {/* Popular Tools */}
          <div className="text-left space-y-2.5">
            <span className="font-mono font-bold text-[#F6F4EE] text-xs uppercase tracking-wider block">
              Popular Tools
            </span>
            <ul className="space-y-1.5 text-xs text-[#F6F4EE]/70 font-sans">
              <li>
                <Link to="/converters/pdf-to-markdown" className="hover:text-[#F6F4EE] transition-colors">
                  PDF to Markdown
                </Link>
              </li>
              <li>
                <Link to="/converters/word-to-markdown" className="hover:text-[#F6F4EE] transition-colors">
                  Word to Markdown
                </Link>
              </li>
              <li>
                <Link to="/converters/html-to-markdown" className="hover:text-[#F6F4EE] transition-colors">
                  HTML to Markdown
                </Link>
              </li>
              <li>
                <Link to="/converters/image-ocr" className="hover:text-[#F6F4EE] transition-colors">
                  Image OCR
                </Link>
              </li>
              <li>
                <Link to="/ai-tools/document-summary" className="hover:text-[#F6F4EE] transition-colors">
                  AI Document Summary
                </Link>
              </li>
              <li>
                <Link to="/ai-tools/prompt-generator" className="hover:text-[#F6F4EE] transition-colors">
                  Prompt Generator
                </Link>
              </li>
              <li>
                <Link to="/ai-tools/rag-export" className="hover:text-[#F6F4EE] transition-colors">
                  Prepare for AI (RAG)
                </Link>
              </li>
              <li className="pt-1">
                <Link
                  to="/ai-tools"
                  className="hover:text-[#F6F4EE] text-[#2F6F5E] font-mono font-medium transition-colors flex items-center gap-1"
                >
                  View All Tools →
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="text-left space-y-2.5">
            <span className="font-mono font-bold text-[#F6F4EE] text-xs uppercase tracking-wider block">
              Resources
            </span>
            <ul className="space-y-1.5 text-xs text-[#F6F4EE]/70 font-sans">
              <li>
                <Link to="/guides" className="hover:text-[#F6F4EE] transition-colors">
                  Getting Started
                </Link>
              </li>
              <li>
                <Link to="/guides" className="hover:text-[#F6F4EE] transition-colors">
                  Markdown Guide
                </Link>
              </li>
              <li>
                <Link to="/guides" className="hover:text-[#F6F4EE] transition-colors">
                  RAG Guide
                </Link>
              </li>
              <li>
                <Link to="/guides#jsonl" className="hover:text-[#F6F4EE] transition-colors">
                  JSONL Guide
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-[#F6F4EE] transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-[#F6F4EE] transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="text-left space-y-2.5">
            <span className="font-mono font-bold text-[#F6F4EE] text-xs uppercase tracking-wider block">
              Company
            </span>
            <ul className="space-y-1.5 text-xs text-[#F6F4EE]/70 font-sans">
              <li>
                <Link to="/about" className="hover:text-[#F6F4EE] transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-[#F6F4EE] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#F6F4EE] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#F6F4EE] transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-8 mt-8 border-t border-[#6B6459]/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-[#F6F4EE]/50">
          <span>&copy; 2026 ConvertOneAI, Inc. All rights reserved.</span>
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
            <span className="text-[#F6F4EE]/70">24+ Formats</span>
            <span>•</span>
            <span className="text-[#F6F4EE]/70">17+ AI Tools</span>
            <span>•</span>
            <span className="text-[#2F6F5E] font-semibold">AI Document Platform</span>
          </div>
        </div>
      </footer>

      {/* Cookie Consent Banner */}
      {!cookieDismissed && (
        <div className="fixed bottom-0 inset-x-0 w-full bg-[#171B26] text-[#F6F4EE] z-50 p-4 shadow-xl border-t border-[#2F6F5E]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs">
            <p className="text-[#F6F4EE]/80">
              ConvertOneAI uses essential cookies.
              <Link
                to="/privacy"
                className="ml-2 underline cursor-pointer text-[#2F6F5E] hover:text-[#F6F4EE]"
                onClick={() => setCookieDismissed(true)}
              >
                Privacy Policy
              </Link>
            </p>
            <button
              onClick={() => setCookieDismissed(true)}
              className="bg-[#2F6F5E] hover:bg-[#275F50] text-[#F6F4EE] font-medium py-1.5 px-5 rounded-xl shadow-xs cursor-pointer"
            >
              Accept
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
