import { useState } from "react";
import { Search, Sparkles, ArrowRight, ShieldCheck, FileCheck, FileText, Database, MessageSquare, Zap, Presentation, Table, Code, BookOpen, Eye, Globe, Mic, Video, Download, HelpCircle } from "lucide-react";
import { toolsRegistry } from "../ai/registries/toolsRegistry";
import { ToolCategory, ToolPlugin } from "../ai/registries/ToolPlugin";
import { ViewMode } from "../types";

interface ToolsViewProps {
  setViewMode: (mode: ViewMode) => void;
  onSelectTool: (plugin: ToolPlugin) => void;
}

const categoryLabels: Record<string, string> = {
  all: "All Tools",
  conversion: "Document Conversion",
  cleaning: "AI Cleaning",
  analysis: "AI Analysis",
  prompting: "AI Prompting",
  rag: "RAG & Vector",
  export: "Data Export",
  media: "Audio & Video",
};

export default function ToolsView({ setViewMode, onSelectTool }: ToolsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", ...toolsRegistry.getCategories()];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "FileText": return <FileText size={20} className="text-[#2F6F5E]" />;
      case "MessageSquare": return <MessageSquare size={20} className="text-[#2F6F5E]" />;
      case "Sparkles": return <Sparkles size={20} className="text-[#2F6F5E]" />;
      case "Database": return <Database size={20} className="text-[#2F6F5E]" />;
      case "Zap": return <Zap size={20} className="text-[#2F6F5E]" />;
      case "FileCheck": return <FileCheck size={20} className="text-[#2F6F5E]" />;
      case "Presentation": return <Presentation size={20} className="text-[#2F6F5E]" />;
      case "Table": return <Table size={20} className="text-[#2F6F5E]" />;
      case "Code": return <Code size={20} className="text-[#2F6F5E]" />;
      case "BookOpen": return <BookOpen size={20} className="text-[#2F6F5E]" />;
      case "Eye": return <Eye size={20} className="text-[#2F6F5E]" />;
      case "Globe": return <Globe size={20} className="text-[#2F6F5E]" />;
      case "Mic": return <Mic size={20} className="text-[#2F6F5E]" />;
      case "Video": return <Video size={20} className="text-[#2F6F5E]" />;
      case "Download": return <Download size={20} className="text-[#2F6F5E]" />;
      case "HelpCircle": return <HelpCircle size={20} className="text-[#2F6F5E]" />;
      default: return <Sparkles size={20} className="text-[#2F6F5E]" />;
    }
  };

  let displayedPlugins = toolsRegistry.search(searchQuery);
  if (selectedCategory !== "all") {
    displayedPlugins = displayedPlugins.filter((p) => p.category === selectedCategory);
  }

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Header Banner */}
      <div className="bg-[#FAF8F3] rounded-xl border border-[#E4E0D8] p-6 md:p-8 shadow-xs relative overflow-hidden">
        <div className="max-w-3xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-[#E4E0D8] text-[#2F6F5E] font-mono text-xs">
            <ShieldCheck size={13} />
            <span>// [ extensible plugin platform ]</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-display text-[#171B26] tracking-tight">
            AI Document Intelligence Tools Directory
          </h1>
          <p className="text-[#6B6459] text-sm md:text-base leading-relaxed">
            Discover, convert, clean, analyze, and format documents for AI language models, RAG pipelines, fine-tuning datasets, and prompt generation.
          </p>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="bg-[#FAF8F3] rounded-xl border border-[#E4E0D8] p-5 shadow-xs space-y-3.5">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-3 text-[#6B6459]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search AI tools by name, format (e.g. PDF, RAG, OCR, JSONL), or keyword..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E4E0D8] rounded-xl text-xs font-mono text-[#171B26] placeholder-[#6B6459] focus:outline-none focus:border-[#2F6F5E] transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-mono">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#2F6F5E] text-[#F6F4EE] shadow-xs"
                  : "bg-white border border-[#E4E0D8] text-[#6B6459] hover:bg-[#F6F4EE] hover:text-[#171B26]"
              }`}
            >
              {categoryLabels[cat] || cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedPlugins.map((plugin) => (
          <div
            key={plugin.id}
            onClick={() => onSelectTool(plugin)}
            className="bg-[#FAF8F3] rounded-xl border border-[#E4E0D8] p-5 shadow-xs hover:border-[#2F6F5E] transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 bg-white border border-[#E4E0D8] rounded-xl flex items-center justify-center text-[#2F6F5E]">
                  {getIcon(plugin.iconName)}
                </div>
                <div className="flex items-center gap-1.5 font-mono">
                  {plugin.status === "beta" && (
                    <span className="text-[10px] font-medium text-[#D98F3D] bg-amber-50 px-2 py-0.5 rounded border border-[#D98F3D]/40">
                      Beta
                    </span>
                  )}
                  {plugin.featured && (
                    <span className="text-[10px] font-medium text-[#2F6F5E] bg-[#F6F4EE] px-2 py-0.5 rounded border border-[#2F6F5E]/40">
                      Featured
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#171B26] group-hover:text-[#2F6F5E] transition-colors font-sans">
                  {plugin.title}
                </h3>
                <p className="text-xs text-[#6B6459] mt-1 leading-relaxed line-clamp-2">
                  {plugin.shortDescription}
                </p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {plugin.badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono text-[#6B6459] bg-white border border-[#E4E0D8] px-2 py-0.5 rounded"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-[#E4E0D8] flex items-center justify-between text-xs font-mono font-medium text-[#2F6F5E]">
              <span>Launch Tool</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {displayedPlugins.length === 0 && (
        <div className="bg-[#FAF8F3] rounded-xl border border-[#E4E0D8] p-12 text-center space-y-3 shadow-xs">
          <Sparkles size={32} className="text-[#E4E0D8] mx-auto" />
          <h3 className="text-base font-bold text-[#171B26]">No tools found</h3>
          <p className="text-xs text-[#6B6459] max-w-sm mx-auto">
            No tools match your current search "{searchQuery}". Try searching for PDF, Word, Summary, Prompt, RAG, or Cleaner.
          </p>
          <button
            onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
            className="mt-2 text-xs font-mono font-bold text-[#2F6F5E] hover:text-[#275F50] underline cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
