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
      <div className="max-w-7xl mx-auto h-14 lg:h-16 flex items-center overflow-x-auto scrollbar-hide px-3 lg:px-6 gap-4 lg:gap-0 lg:justify-between">

        {/* Logo — never shrinks */}
        <div
          onClick={() => setViewMode("home")}
          className="flex items-center gap-2 lg:gap-2.5 cursor-pointer group flex-shrink-0"
          id="brand-logo"
        >
          <div className="w-6 h-6 lg:w-7 lg:h-7 bg-[#171B26] rounded-md lg:rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
            <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#F6F4EE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="font-display font-bold text-sm lg:text-lg tracking-tight text-[#171B26] whitespace-nowrap">
            ConvertOne<span className="text-[#2F6F5E]">AI</span>
          </span>
        </div>

        {/* Nav — scrolls horizontally on mobile */}
        <nav className="flex items-center gap-3 lg:gap-5 text-xs font-medium flex-shrink-0">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setViewMode("home"); }}
            className={`nav-link-item cursor-pointer py-1 whitespace-nowrap inline-block ${
              viewMode === "home" || viewMode === "convert-word" || viewMode === "convert-pdf" ? "active" : ""
            }`}
          >
            Converter
          </a>

          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setViewMode("tools"); }}
            className={`nav-link-item cursor-pointer py-1 flex items-center gap-1.5 whitespace-nowrap inline-flex ${
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
            onClick={(e) => { e.preventDefault(); setViewMode("guide"); }}
            className={`nav-link-item cursor-pointer py-1 whitespace-nowrap inline-block ${
              viewMode === "guide" ? "active" : ""
            }`}
          >
            Guides &amp; Docs
          </a>

          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setViewMode("blog"); }}
            className={`nav-link-item cursor-pointer py-1 whitespace-nowrap inline-block ${
              viewMode === "blog" ? "active" : ""
            }`}
          >
            Blog
          </a>

          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setViewMode("faq"); }}
            className={`nav-link-item cursor-pointer py-1 whitespace-nowrap inline-block ${
              viewMode === "faq" ? "active" : ""
            }`}
          >
            FAQ
          </a>

          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setViewMode("about"); }}
            className={`nav-link-item cursor-pointer py-1 whitespace-nowrap inline-block ${
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
            className="ml-1 lg:ml-2 bg-[#171B26] hover:bg-[#2A3040] text-[#F6F4EE] text-[11px] lg:text-xs font-semibold px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg lg:rounded-xl transition-all cursor-pointer shadow-xs whitespace-nowrap flex-shrink-0 inline-block"
          >
            Get Started
          </a>
        </nav>
      </div>
    </header>
  );
}
