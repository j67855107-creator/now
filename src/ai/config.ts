/**
 * Centralized AI Configuration for ConvertOneAI.
 * All feature flags, provider settings, pipeline configuration,
 * and AI tool settings are defined here.
 */

import type { AIProviderId, ExportFormatId, RAGExportFormat, FeatureFlag } from "../types";

// ─── Feature Flags ──────────────────────────────────────────
// All AI features are controlled through feature flags.
// Set via environment variables, can be extended for enterprise tiers.

const env = (typeof import.meta !== "undefined" ? import.meta.env : {}) as ImportMetaEnv;

export const FEATURE_FLAGS: Record<string, FeatureFlag> = {
  "ai-cleaner": {
    key: "ai-cleaner",
    name: "AI Document Cleaner",
    description: "Clean documents for AI preprocessing — removes headers, footers, page numbers, duplicates",
    enabled: env.VITE_AI_CLEANER !== "false",
    tier: "free",
  },
  "ai-summary": {
    key: "ai-summary",
    name: "AI Summary Generator",
    description: "Generate short and detailed summaries with keywords extraction",
    enabled: env.VITE_AI_SUMMARY !== "false",
    tier: "free",
  },
  "prompt-generator": {
    key: "prompt-generator",
    name: "AI Prompt Generator",
    description: "Generate ChatGPT/Claude/Gemini prompts from document content",
    enabled: env.VITE_AI_PROMPT !== "false",
    tier: "free",
  },
  "rag-export": {
    key: "rag-export",
    name: "RAG Dataset Export",
    description: "Export document chunks for RAG pipelines (JSON, JSONL, Markdown, TXT)",
    enabled: env.VITE_AI_RAG !== "false",
    tier: "free",
  },
  "ai-assistant": {
    key: "ai-assistant",
    name: "AI Assistant Panel",
    description: "Right-side quick actions panel for AI features",
    enabled: env.VITE_AI_ASSISTANT !== "false",
    tier: "free",
  },
  "ai-analytics": {
    key: "ai-analytics",
    name: "AI Feature Analytics",
    description: "Anonymous feature usage tracking for AI tools",
    enabled: env.VITE_AI_ANALYTICS !== "false",
    tier: "free",
  },
};

// ─── AI Providers Configuration ────────────────────────────
export const AI_PROVIDERS: Record<AIProviderId, {
  id: AIProviderId;
  name: string;
  icon: string;
  color: string;
  description: string;
  modelHint: string;
}> = {
  chatgpt: {
    id: "chatgpt",
    name: "ChatGPT",
    icon: "🤖",
    color: "#10a37f",
    description: "OpenAI GPT-4 / GPT-3.5 — Best for general purpose",
    modelHint: "gpt-4",
  },
  claude: {
    id: "claude",
    name: "Claude",
    icon: "🟣",
    color: "#6b4fa0",
    description: "Anthropic Claude — Best for long documents",
    modelHint: "claude-3-opus",
  },
  gemini: {
    id: "gemini",
    name: "Gemini",
    icon: "🔷",
    color: "#4285f4",
    description: "Google Gemini — Best for multimodal",
    modelHint: "gemini-1.5-pro",
  },
  notebooklm: {
    id: "notebooklm",
    name: "NotebookLM",
    icon: "📓",
    color: "#f9ab00",
    description: "Google NotebookLM — Best for research",
    modelHint: "notebooklm",
  },
  local: {
    id: "local",
    name: "Local LLM",
    icon: "💻",
    color: "#6b7280",
    description: "Local models (Llama, Mistral) — Data stays on device",
    modelHint: "llama-3",
  },
};

// ─── Prompt Templates Metadata ──────────────────────────────
export const PROMPT_TEMPLATES_META = {
  summary: {
    name: "Summary",
    description: "Generate a concise document summary",
    icon: "FileText",
  },
  research: {
    name: "Research",
    description: "Extract research findings and methodology",
    icon: "Search",
  },
  "study-notes": {
    name: "Study Notes",
    description: "Create comprehensive study notes",
    icon: "BookOpen",
  },
  presentation: {
    name: "Presentation",
    description: "Convert document into presentation outline",
    icon: "Monitor",
  },
  faq: {
    name: "FAQ",
    description: "Generate frequently asked questions",
    icon: "HelpCircle",
  },
  flashcards: {
    name: "Flashcards",
    description: "Create Q&A flashcards for review",
    icon: "Layers",
  },
  translation: {
    name: "Translation",
    description: "Translate document content",
    icon: "Globe",
  },
  "extract-data": {
    name: "Extract Data",
    description: "Extract structured data from document",
    icon: "Database",
  },
  "explain-like-im-five": {
    name: "Explain Like I'm 5",
    description: "Simplify complex concepts for beginners",
    icon: "Heart",
  },
  "technical-analysis": {
    name: "Technical Analysis",
    description: "Deep technical breakdown of document",
    icon: "Cpu",
  },
};

// ─── Export Formats Configuration ───────────────────────────
export const EXPORT_FORMATS: ExportFormatId[] = [
  "markdown",
  "clean-markdown",
  "ai-markdown",
  "json",
  "jsonl",
  "txt",
  "prompt",
  "rag-dataset",
];

// ─── RAG Configuration ──────────────────────────────────────
export const RAG_CHUNK_SIZES: number[] = [256, 512, 1024];
export const RAG_EXPORT_FORMATS: RAGExportFormat[] = ["json", "jsonl", "markdown", "txt"];

// ─── Document Type Detection ────────────────────────────────
export const DOCUMENT_TYPE_KEYWORDS: Record<string, string[]> = {
  book: ["chapter", "part", "introduction", "preface", "foreword", "bibliography", "index", "appendix", "publishing", "edition"],
  "research-paper": ["abstract", "methodology", "results", "discussion", "conclusion", "references", "doi", "introduction", "literature review", "experiment"],
  resume: ["experience", "education", "skills", "summary", "objective", "employment", "qualifications", "certifications", "projects"],
  contract: ["agreement", "terms", "conditions", "party", "hereby", "whereas", "indemnification", "governing law", "effective date"],
  invoice: ["invoice", "payment", "due date", "total", "subtotal", "tax", "bill to", "invoice number", "amount due"],
  educational: ["lesson", "module", "course", "learning objectives", "assignment", "quiz", "exam", "grade", "curriculum"],
  manual: ["installation", "setup", "configuration", "user guide", "troubleshooting", "instructions", "warning", "caution"],
  report: ["executive summary", "findings", "analysis", "recommendations", "overview", "quarterly", "annual", "metrics"],
};

// ─── Pipeline Configuration ─────────────────────────────────
export const PIPELINE_CONFIG = {
  // Timeout per stage in milliseconds
  stageTimeout: {
    validating: 10_000,
    extracting: 60_000,
    cleaning: 30_000,
    analyzing: 60_000,
    summarizing: 30_000,
    generating: 60_000,
    exporting: 10_000,
  },
  // Cache TTL in milliseconds (5 minutes)
  cacheTTL: 5 * 60 * 1000,
  // Maximum retries per stage
  maxRetries: 3,
  // Debounce interval for progress events (ms)
  progressDebounceMs: 100,
};

// ─── AI Workspace Configuration ─────────────────────────────
export const AI_WORKSPACE_CONFIG = {
  defaultTab: "summary",
  tabs: [
    { id: "summary", label: "Summary", icon: "FileText" },
    { id: "prompt", label: "Prompt", icon: "MessageSquare" },
    { id: "export", label: "Export", icon: "Download" },
    { id: "rag", label: "RAG", icon: "Database" },
    { id: "metadata", label: "Metadata", icon: "Info" },
  ] as const,
  // AI Assistant visibility
  assistantPanelEnabled: true,
  assistantDefaultOpen: false,
};

// ─── Helper: Check if a feature is enabled ──────────────────
export function isFeatureEnabled(featureKey: string): boolean {
  const flag = FEATURE_FLAGS[featureKey];
  if (!flag) return false;
  return flag.enabled;
}

// ─── Helper: Get all enabled features ───────────────────────
export function getEnabledFeatures(): string[] {
  return Object.entries(FEATURE_FLAGS)
    .filter(([, flag]) => flag.enabled)
    .map(([key]) => key);
}

