// ─── View Modes ─────────────────────────────────────────────
export type ViewMode =
  | "home"
  | "convert-word"
  | "convert-pdf"
  | "analytics"
  | "guide"
  | "blog"
  | "faq"
  | "about"
  | "contact"
  | "privacy"
  | "terms"
  | "admin-login"
  | "admin-dashboard";

// ─── Existing Core Types ────────────────────────────────────
export interface ConversionResult {
  markdown: string;
  modeUsed: "ai" | "classic";
  warning?: string;
  durationMs: number;
}

export interface RecentLog {
  id: string;
  fileName: string;
  fileExt: string;
  fileSizeKb: number;
  mode: "ai" | "classic";
  status: "success" | "failed";
  durationMs: number;
  timestamp: string;
}

export interface SupportSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
  ip?: string;
}

export interface DashboardStats {
  totalConversions: number;
  classicConversions: number;
  aiConversions: number;
  totalSizeKb: number;
  averageDurationMs: number;
  recentLogs: RecentLog[];
  contactSubmissions?: SupportSubmission[];
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  readTime: string;
  author: string;
  image?: string;
}

export interface GuideSection {
  title: string;
  syntax: string;
  preview: string;
  description: string;
}

// ─── AI Processing Pipeline ─────────────────────────────────
export type ProcessingStage =
  | "idle"
  | "uploading"
  | "validating"
  | "extracting"
  | "cleaning"
  | "analyzing"
  | "summarizing"
  | "generating"
  | "exporting"
  | "complete"
  | "error"
  | "cancelled";

export type ProcessingStatus = "idle" | "processing" | "complete" | "error" | "cancelled";

export interface ProgressInfo {
  stage: ProcessingStage;
  percent: number;
  eta: string;
  step: string;
  startTime: number;
}

// ─── AI Options (User-Configurable Pre-Processing) ──────────
export interface AIOptions {
  cleanForAI: boolean;
  generateSummary: boolean;
  generatePrompt: boolean;
  generateRAG: boolean;
  promptConfig?: PromptConfig;
  ragConfig?: RAGConfig;
}

export interface PromptConfig {
  templateId: string;
  providerId: AIProviderId;
}

export interface RAGConfig {
  chunkSize: 256 | 512 | 1024;
  format: RAGExportFormat;
}

// ─── AI Providers ───────────────────────────────────────────
export type AIProviderId = "chatgpt" | "claude" | "gemini" | "notebooklm" | "local";

export interface AIProviderAdapter {
  id: AIProviderId;
  name: string;
  icon: string;
  formatPrompt(template: string, markdown: string, metadata?: Record<string, any>): string;
  isAvailable(): boolean;
}

// ─── Document Analysis ──────────────────────────────────────
export type DocumentType =
  | "book"
  | "research-paper"
  | "resume"
  | "contract"
  | "invoice"
  | "educational"
  | "manual"
  | "report"
  | "unknown";

export interface DocumentAnalysis {
  type: DocumentType;
  language: string;
  confidence: number;
  pageCount: number;
  wordCount: number;
  headingCount: number;
  tableCount: number;
  imageCount: number;
  linkCount: number;
  footnoteCount: number;
  referenceCount: number;
  readingTimeMinutes: number;
  complexityScore: number; // 0-100
  estimatedTokens: number;
  estimatedAICost: number; // USD cents
  recommendations: string[];
}

// ─── AI Readiness Score ─────────────────────────────────────
export interface AIReadinessScore {
  overall: number; // 0-100
  issues: AIReadinessIssue[];
  suggestions: string[];
}

export interface AIReadinessIssue {
  type: "repeated-headers" | "broken-paragraphs" | "page-numbers" | "footer-text" | "table-issues" | "heading-gaps" | "whitespace-issues";
  severity: "low" | "medium" | "high";
  description: string;
  line?: number;
}

// ─── AI Summary ─────────────────────────────────────────────
export interface AISummary {
  short: string;
  detailed: string;
  keywords: string[];
  keyPoints: string[];
}

// ─── Enhanced Conversion Result ─────────────────────────────
export interface AIEnhancedResult {
  markdown: string;
  cleanMarkdown?: string;
  aiMarkdown?: string;
  analysis?: DocumentAnalysis;
  readiness?: AIReadinessScore;
  summary?: AISummary;
  warnings: string[];
}

// ─── Prompt Templates ───────────────────────────────────────
export type PromptTemplateId =
  | "summary"
  | "research"
  | "study-notes"
  | "presentation"
  | "faq"
  | "flashcards"
  | "translation"
  | "extract-data"
  | "explain-like-im-five"
  | "technical-analysis";

export interface PromptTemplate {
  id: PromptTemplateId;
  name: string;
  description: string;
  icon: string;
  template: string;
  providerVariants?: Partial<Record<AIProviderId, string>>;
}

export interface GeneratedPrompt {
  id: string;
  templateId: PromptTemplateId;
  providerId: AIProviderId;
  prompt: string;
  title: string;
  createdAt: string;
}

// ─── RAG Export ─────────────────────────────────────────────
export type RAGExportFormat = "json" | "jsonl" | "markdown" | "txt";

export interface RAGChunk {
  id: string;
  index: number;
  text: string;
  tokens: number;
  metadata: RAGChunkMetadata;
}

export interface RAGChunkMetadata {
  page?: number;
  source: string;
  language: string;
  title: string;
  chunkId: number;
  totalChunks: number;
}

export interface RAGExportResult {
  chunks: RAGChunk[];
  format: RAGExportFormat;
  chunkSize: number;
  totalTokens: number;
  totalChunks: number;
  downloadUrl: string;
}

// ─── Export Center ──────────────────────────────────────────
export type ExportFormatId =
  | "markdown"
  | "clean-markdown"
  | "ai-markdown"
  | "json"
  | "jsonl"
  | "txt"
  | "prompt"
  | "rag-dataset";

export interface ExportFormat {
  id: ExportFormatId;
  name: string;
  description: string;
  icon: string;
  extension: string;
  mimeType: string;
  isEnabled: boolean;
}

// ─── Analytics ──────────────────────────────────────────────
export interface AnalyticsEvent {
  event: string;
  timestamp: number;
  durationMs?: number;
  metadata?: Record<string, string | number | boolean>;
}

// ─── Pipeline Events ────────────────────────────────────────
export type PipelineEventType =
  | "pipeline:start"
  | "pipeline:stage-start"
  | "pipeline:stage-end"
  | "pipeline:progress"
  | "pipeline:complete"
  | "pipeline:error"
  | "pipeline:cancel"
  | "pipeline:retry";

export interface PipelineEvent {
  type: PipelineEventType;
  stage: ProcessingStage;
  percent: number;
  timestamp: number;
  data?: any;
}

// ─── Session Processing History ─────────────────────────────
export interface ProcessingHistoryEntry {
  id: string;
  fileName: string;
  fileSizeKb: number;
  timestamp: number;
  status: ProcessingStatus;
  aiEnhanced: boolean;
  cacheKey: string;
}

// ─── Feature Flags ──────────────────────────────────────────
export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  tier?: "free" | "pro" | "enterprise";
}
