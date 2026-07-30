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
}: HeaderProps) {
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

        <nav className="flex items-center gap-5 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setViewMode("home")}
            className={`nav-link-item cursor-pointer py-1 whitespace-nowrap ${
              viewMode === "home" || viewMode === "convert-word" || viewMode === "convert-pdf" ? "active" : ""
            }`}
          >
            Converter
          </button>

          <button
            onClick={() => setViewMode("tools")}
            className={`nav-link-item cursor-pointer py-1 flex items-center gap-1.5 whitespace-nowrap ${
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
            className={`nav-link-item cursor-pointer py-1 whitespace-nowrap ${
              viewMode === "guide" ? "active" : ""
            }`}
          >
            Guides &amp; Docs
          </button>

          <button
            onClick={() => setViewMode("blog")}
            className={`nav-link-item cursor-pointer py-1 whitespace-nowrap ${
              viewMode === "blog" ? "active" : ""
            }`}
          >
            Blog
          </button>

          <button
            onClick={() => setViewMode("faq")}
            className={`nav-link-item cursor-pointer py-1 whitespace-nowrap ${
              viewMode === "faq" ? "active" : ""
            }`}
          >
            FAQ
          </button>

          <button
            onClick={() => setViewMode("about")}
            className={`nav-link-item cursor-pointer py-1 whitespace-nowrap ${
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
            className="ml-2 bg-[#171B26] hover:bg-[#2A3040] text-[#F6F4EE] text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs whitespace-nowrap"
          >
            Get Started
          </button>
        </nav>
      </div>
    </header>
  );
}
