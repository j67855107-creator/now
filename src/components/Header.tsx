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
  const navLinks = [
    {
      label: "Converter",
      active: viewMode === "home" || viewMode === "convert-word" || viewMode === "convert-pdf",
      onClick: () => setViewMode("home"),
    },
    {
      label: "Tools & AI",
      badge: "New",
      active: viewMode === "tools",
      onClick: () => setViewMode("tools"),
    },
    {
      label: "Guides & Docs",
      active: viewMode === "guide",
      onClick: () => setViewMode("guide"),
    },
    {
      label: "Blog",
      active: viewMode === "blog",
      onClick: () => setViewMode("blog"),
    },
    {
      label: "FAQ",
      active: viewMode === "faq",
      onClick: () => setViewMode("faq"),
    },
    {
      label: "About",
      active: viewMode === "about",
      onClick: () => setViewMode("about"),
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F6F4EE]/90 backdrop-blur-md border-b border-[#E4E0D8] select-none">
      {/* ── Desktop: single row ── */}
      <div className="hidden lg:flex max-w-7xl mx-auto px-6 h-16 items-center justify-between">
        {/* Logo */}
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

        {/* Nav */}
        <nav className="flex items-center gap-5 text-xs font-medium">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={link.onClick}
              className={`nav-link-item cursor-pointer py-1 flex items-center gap-1.5 ${link.active ? "active" : ""}`}
            >
              <span>{link.label}</span>
              {link.badge && (
                <span className="text-[10px] bg-[#E4E0D8]/60 text-[#D98F3D] font-mono font-bold px-1.5 py-0.5 rounded border border-[#E4E0D8]">
                  {link.badge}
                </span>
              )}
            </button>
          ))}
          <button
            onClick={() => { setViewMode("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="ml-2 bg-[#171B26] hover:bg-[#2A3040] text-[#F6F4EE] text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Get Started
          </button>
        </nav>
      </div>

      {/* ── Mobile: two rows ── */}
      <div className="lg:hidden">
        {/* Row 1 — Logo + Get Started */}
        <div className="flex items-center justify-between px-4 h-14">
          <div
            onClick={() => setViewMode("home")}
            className="flex items-center gap-2 cursor-pointer group"
            id="brand-logo-mobile"
          >
            <div className="w-6 h-6 bg-[#171B26] rounded-md flex items-center justify-center transition-transform group-hover:scale-105">
              <svg className="w-3.5 h-3.5 text-[#F6F4EE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-display font-bold text-base tracking-tight text-[#171B26]">
              ConvertOne<span className="text-[#2F6F5E]">AI</span>
            </span>
          </div>
          <button
            onClick={() => { setViewMode("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="bg-[#171B26] hover:bg-[#2A3040] text-[#F6F4EE] text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs"
          >
            Get Started
          </button>
        </div>

        {/* Row 2 — Scrollable nav links */}
        <div className="border-t border-[#E4E0D8]/60 overflow-x-auto scrollbar-hide">
          <nav className="flex items-center gap-0 px-2 text-[11px] font-medium" style={{ width: "max-content" }}>
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={link.onClick}
                className={`nav-link-item cursor-pointer px-3 py-2.5 flex items-center gap-1 whitespace-nowrap ${link.active ? "active" : ""}`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[9px] bg-[#E4E0D8]/60 text-[#D98F3D] font-mono font-bold px-1 py-0.5 rounded border border-[#E4E0D8]">
                    {link.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
