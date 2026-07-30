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
      case "FileText": return <FileText size={20} className="text-indigo-600" />;
      case "MessageSquare": return <MessageSquare size={20} className="text-indigo-600" />;
      case "Sparkles": return <Sparkles size={20} className="text-indigo-600" />;
      case "Database": return <Database size={20} className="text-indigo-600" />;
      case "Zap": return <Zap size={20} className="text-indigo-600" />;
      case "FileCheck": return <FileCheck size={20} className="text-indigo-600" />;
      case "Presentation": return <Presentation size={20} className="text-indigo-600" />;
      case "Table": return <Table size={20} className="text-indigo-600" />;
      case "Code": return <Code size={20} className="text-indigo-600" />;
      case "BookOpen": return <BookOpen size={20} className="text-indigo-600" />;
      case "Eye": return <Eye size={20} className="text-indigo-600" />;
      case "Globe": return <Globe size={20} className="text-indigo-600" />;
      case "Mic": return <Mic size={20} className="text-indigo-600" />;
      case "Video": return <Video size={20} className="text-indigo-600" />;
      case "Download": return <Download size={20} className="text-indigo-600" />;
      case "HelpCircle": return <HelpCircle size={20} className="text-indigo-600" />;
      default: return <Sparkles size={20} className="text-indigo-600" />;
    }
  };

  let displayedPlugins = toolsRegistry.search(searchQuery);
  if (selectedCategory !== "all") {
    displayedPlugins = displayedPlugins.filter((p) => p.category === selectedCategory);
  }

  return (
    <div className="space-y-8 text-left font-sans animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 md:p-10 text-white shadow-lg relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 font-semibold text-xs tracking-wider uppercase">
            <ShieldCheck size={14} />
            <span>Extensible Plugin Platform</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            AI Document Intelligence Tools Directory
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Discover, convert, clean, analyze, and format documents for AI language models, RAG pipelines, fine-tuning datasets, and prompt generation.
          </p>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search AI tools by name, format (e.g. PDF, RAG, OCR, JSONL), or keyword..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {categoryLabels[cat] || cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedPlugins.map((plugin) => (
          <div
            key={plugin.id}
            onClick={() => onSelectTool(plugin)}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  {getIcon(plugin.iconName)}
                </div>
                <div className="flex items-center gap-1.5">
                  {plugin.status === "beta" && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Beta
                    </span>
                  )}
                  {plugin.featured && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                      Featured
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors font-sans">
                  {plugin.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                  {plugin.shortDescription}
                </p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {plugin.badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">
              <span>Launch Tool</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {displayedPlugins.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Sparkles size={32} className="text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No tools found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No tools match your current search "{searchQuery}". Try searching for PDF, Word, Summary, Prompt, RAG, or Cleaner.
          </p>
          <button
            onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
            className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 underline cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
