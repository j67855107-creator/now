import React from "react";
import { Link } from "react-router-dom";
import NavItem from "./NavItem";
import NavAccordion from "./NavAccordion";
import { 
  Home, 
  FileBox, 
  Sparkles, 
  BookOpen, 
  Building2,
  FileText,
  Type,
  Image as ImageIcon,
  Headphones,
  Video,
  FileCode2,
  Book,
  Table,
  TerminalSquare
} from "lucide-react";
import { useAppContext } from "../../contexts/AppContext";

interface MobileMenuProps {
  onClose: () => void;
}

export default function MobileMenu({ onClose }: MobileMenuProps) {
  const { selectPreconfigMode } = useAppContext();

  // Helper to handle converter specific selections
  const handleConverterSelect = (mode: "docx" | "pdf") => {
    selectPreconfigMode(mode);
    onClose();
  };

  return (
    <div className="lg:hidden absolute top-[64px] left-0 right-0 bg-[#F6F4EE] border-b border-[#E4E0D8] shadow-lg animate-in slide-in-from-top-2 duration-200 z-30 flex flex-col max-h-[calc(100vh-64px)] overflow-y-auto">
      <div className="p-4 space-y-1">
        
        {/* 1. Home */}
        <NavItem to="/" label="Home" icon={<Home size={18} />} onClick={onClose} />

        {/* Divider */}
        <div className="h-px bg-[#E4E0D8]/60 my-2 mx-2" />

        {/* 2. Converters (Category Grouped) */}
        <NavAccordion label="Converters" icon={<FileBox size={18} />}>
          
          <NavAccordion label="PDF" isSubAccordion>
            <NavItem to="/converters/pdf-to-markdown" label="PDF to Markdown" isSubItem onClick={() => handleConverterSelect("pdf")} />
            {/* Future stubs */}
            <NavItem to="/converters/pdf-to-word" label="PDF to Word" isSubItem badge="Soon" onClick={onClose} />
            <NavItem to="/converters/merge-pdf" label="Merge PDF" isSubItem badge="Soon" onClick={onClose} />
          </NavAccordion>
          
          <NavAccordion label="Word" isSubAccordion>
            <NavItem to="/converters/word-to-markdown" label="Word to Markdown" isSubItem onClick={() => handleConverterSelect("docx")} />
            <NavItem to="/converters/word-to-pdf" label="Word to PDF" isSubItem badge="Soon" onClick={onClose} />
          </NavAccordion>

          <NavAccordion label="Images" isSubAccordion>
            <NavItem to="/converters/image-ocr" label="Image OCR (Text)" isSubItem onClick={onClose} />
            <NavItem to="/converters/webp-to-png" label="WEBP to PNG" isSubItem badge="Soon" onClick={onClose} />
          </NavAccordion>

          <NavAccordion label="Media (Audio/Video)" isSubAccordion>
            <NavItem to="/converters/audio-to-text" label="Audio to Text" isSubItem badge="Beta" onClick={onClose} />
            <NavItem to="/converters/video-to-transcript" label="Video Transcript" isSubItem badge="Beta" onClick={onClose} />
          </NavAccordion>

          <NavAccordion label="Spreadsheets" isSubAccordion>
            <NavItem to="/converters/excel-to-markdown" label="Excel to Markdown" isSubItem onClick={onClose} />
          </NavAccordion>
          
          <NavAccordion label="eBooks & Web" isSubAccordion>
            <NavItem to="/converters/epub-to-markdown" label="EPUB to Markdown" isSubItem onClick={onClose} />
            <NavItem to="/converters/html-to-markdown" label="HTML to Markdown" isSubItem onClick={onClose} />
            <NavItem to="/converters/url-to-markdown" label="URL to Markdown" isSubItem onClick={onClose} />
          </NavAccordion>

        </NavAccordion>

        {/* 3. AI Tools */}
        <NavAccordion label="AI Tools" icon={<Sparkles size={18} />}>
          <NavItem to="/ai-tools/document-summary" label="Document Summary" isSubItem onClick={onClose} />
          <NavItem to="/ai-tools/prompt-generator" label="Prompt Generator" isSubItem onClick={onClose} />
          <NavItem to="/ai-tools/document-cleaner" label="AI Cleaner" isSubItem onClick={onClose} />
          <NavItem to="/ai-tools/rag-export" label="RAG Dataset Export" isSubItem onClick={onClose} />
          <NavItem to="/ai-tools/prepare-for-ai" label="Prepare for AI" isSubItem onClick={onClose} />
          <NavItem to="/ai-tools/jsonl-export" label="JSONL Export" isSubItem onClick={onClose} />
          <NavItem to="/ai-tools/faq-quiz-generator" label="FAQ & Quiz Gen" isSubItem badge="Beta" onClick={onClose} />
        </NavAccordion>

        {/* Divider */}
        <div className="h-px bg-[#E4E0D8]/60 my-2 mx-2" />

        {/* 4. Learn / Resources */}
        <NavAccordion label="Learn & Resources" icon={<BookOpen size={18} />}>
          <NavAccordion label="Guides" isSubAccordion>
            <NavItem to="/guides" label="Getting Started" isSubItem onClick={onClose} />
            <NavItem to="/guides" label="Markdown Guide" isSubItem onClick={onClose} />
            <NavItem to="/guides" label="RAG Guide" isSubItem onClick={onClose} />
          </NavAccordion>
          <NavAccordion label="Blog" isSubAccordion>
            <NavItem to="/blog" label="Latest Articles" isSubItem onClick={onClose} />
            <NavItem to="/blog" label="Tutorials" isSubItem onClick={onClose} />
            <NavItem to="/blog" label="Release Notes" isSubItem badge="New" onClick={onClose} />
          </NavAccordion>
        </NavAccordion>

        {/* 5. Company */}
        <NavAccordion label="Company" icon={<Building2 size={18} />}>
          <NavItem to="/about" label="About Us" isSubItem onClick={onClose} />
          <NavItem to="/faq" label="FAQ" isSubItem onClick={onClose} />
          <NavItem to="/contact" label="Contact Support" isSubItem onClick={onClose} />
          <NavItem to="/privacy" label="Privacy Policy" isSubItem onClick={onClose} />
          <NavItem to="/terms" label="Terms of Service" isSubItem onClick={onClose} />
        </NavAccordion>

      </div>
      
      {/* Bottom Action */}
      <div className="p-4 bg-[#F6F4EE] border-t border-[#E4E0D8] sticky bottom-0">
        <Link
          to="/"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full bg-[#171B26] hover:bg-[#2A3040] text-[#F6F4EE] text-sm font-semibold py-3 rounded-xl shadow-xs transition-all duration-200"
        >
          <TerminalSquare size={16} />
          Get Started
        </Link>
      </div>
    </div>
  );
}
