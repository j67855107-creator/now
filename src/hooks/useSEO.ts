import { useEffect } from "react";
import { ViewMode } from "../types";

interface PageMeta {
  title: string;
  description: string;
}

const META_MAP: Record<ViewMode, PageMeta> = {
  home: {
    title: "ConvertOneAI — AI Document Platform: PDF, Word & 24+ Formats to Markdown",
    description: "Convert PDF, Word (DOCX), HTML, images and 24+ formats to clean Markdown. Clean layout noise, chunk text, and prepare documents for ChatGPT, Claude, Gemini & RAG pipelines.",
  },
  "convert-word": {
    title: "Word to Markdown Converter — Free DOCX to MD Online | ConvertOneAI",
    description: "Convert Microsoft Word (.docx) files to clean GitHub Flavored Markdown (GFM). Preserve tables, bold text, bullet points, and code blocks.",
  },
  "convert-pdf": {
    title: "PDF to Markdown Converter — Accurate PDF Text Extraction | ConvertOneAI",
    description: "Convert PDF documents to clean Markdown format online. Preserve document headers, tables, lists, and formatting without uploading to disk.",
  },
  tools: {
    title: "AI Document Tools Directory — 17+ AI Tools & Converters | ConvertOneAI",
    description: "Explore 17+ AI document tools: PDF/Word converters, document cleaning, AI text summarizer, prompt generator, RAG chunking, and JSONL exporter.",
  },
  guide: {
    title: "Guides & Documentation — Markdown, RAG & JSONL Pipelines | ConvertOneAI",
    description: "Complete technical documentation for document pre-processing, Markdown syntax, RAG vector chunking, and LLM prompt engineering.",
  },
  blog: {
    title: "AI Document Intelligence Blog — Insights & Guides | ConvertOneAI",
    description: "Read deep-dive articles on optimizing token consumption for Claude & ChatGPT, Word vs Markdown workflows, RAG chunking, and LLM document preparation.",
  },
  faq: {
    title: "Frequently Asked Questions — ConvertOneAI Security & Features",
    description: "Get answers about ConvertOneAI security, in-memory conversion processing, supported document formats, and Markdown features.",
  },
  about: {
    title: "About ConvertOneAI — Enterprise AI Document Intelligence",
    description: "Learn about ConvertOneAI's mission to unify document processing, cleaning, and dataset preparation for modern AI language models.",
  },
  contact: {
    title: "Contact & Support | ConvertOneAI Document Platform",
    description: "Get in touch with the ConvertOneAI technical team for support, feature requests, or enterprise inquiries.",
  },
  privacy: {
    title: "Privacy Policy | ConvertOneAI",
    description: "Our privacy policy details our strict 100% in-memory processing architecture and zero document retention guarantee.",
  },
  terms: {
    title: "Terms of Service | ConvertOneAI",
    description: "Review the Terms of Service for using ConvertOneAI's free online document conversion and AI pre-processing tools.",
  },
  analytics: {
    title: "Analytics Dashboard | ConvertOneAI",
    description: "System conversion performance telemetry and metrics.",
  },
  "admin-login": {
    title: "Admin Terminal Login | ConvertOneAI",
    description: "Secure system administration portal.",
  },
  "admin-dashboard": {
    title: "Admin Console | ConvertOneAI",
    description: "System metrics and security logs.",
  },
};

export function useSEO(viewMode: ViewMode) {
  useEffect(() => {
    const meta = META_MAP[viewMode] || META_MAP.home;

    // Update document title
    document.title = meta.title;

    // Update meta description
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      descMeta.setAttribute("content", meta.description);
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute("content", meta.title);
    }

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute("content", meta.description);
    }

    // Update Twitter tags
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) {
      twTitle.setAttribute("content", meta.title);
    }

    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) {
      twDesc.setAttribute("content", meta.description);
    }
  }, [viewMode]);
}
