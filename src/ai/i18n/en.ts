/**
 * Centralized English Translations for the AI Workspace
 *
 * All user-facing strings for AI features are defined here.
 * Prepares the platform for future i18n support.
 * To add a language: copy this file, translate values, import dynamically.
 */

export const AI_STRINGS = {
  // ─── AI Options Panel (Pre-Conversion) ───────────────────
  aiOptions: {
    title: "AI Options",
    subtitle: "Enhance your document with AI-powered features",
    toggleClean: "Clean for AI",
    toggleCleanDesc: "Remove headers, footers, page numbers, and normalize formatting",
    toggleSummary: "Generate AI Summary",
    toggleSummaryDesc: "Short and detailed summaries with keywords extraction",
    togglePrompt: "Generate AI Prompt",
    togglePromptDesc: "Create prompts for ChatGPT, Claude, Gemini, and more",
    toggleRAG: "Generate RAG Dataset",
    toggleRAGDesc: "Export document chunks optimized for RAG pipelines",
    collapsed: "AI Options",
    expand: "Show AI options",
    collapse: "Hide AI options",
  },

  // ─── Enhanced Progress Bar ───────────────────────────────
  progress: {
    uploading: "Uploading document...",
    validating: "Validating file...",
    extracting: "Extracting text...",
    cleaning: "Cleaning document for AI...",
    analyzing: "Analyzing document structure...",
    summarizing: "Generating summaries...",
    generating: "Preparing AI outputs...",
    exporting: "Preparing exports...",
    complete: "Completed Successfully",
    error: "Processing Failed",
    cancelled: "Processing Cancelled",
    retry: "Retry",
    cancel: "Cancel",
    estimatedTime: "Estimated time remaining: {{time}}",
    processingStep: "Step {{current}} of {{total}}",
  },

  // ─── AI Summary Panel ────────────────────────────────────
  summary: {
    title: "AI Summary",
    collapsed: "Show AI Summary",
    expand: "AI Summary & Document Intelligence",
    shortSummary: "Short Summary",
    detailedSummary: "Detailed Summary",
    keywords: "Keywords",
    keyPoints: "Key Points",
    readingTime: "Reading Time",
    wordCount: "Word Count",
    headingCount: "Heading Count",
    tableCount: "Table Count",
    aiReadiness: "AI Readiness Score",
    documentType: "Document Type",
    recommendations: "Recommendations",
    minutes: "{{count}} min",
    words: "{{count}} words",
    headings: "{{count}} headings",
    tables: "{{count}} tables",
    noSummary: "No summary generated. Toggle 'Generate AI Summary' in AI Options.",
    regenerate: "Regenerate Summary",
  },

  // ─── Export Center ───────────────────────────────────────
  export: {
    title: "Advanced Export",
    subtitle: "Export your document in various formats",
    collapsed: "Show Advanced Export",
    expand: "Advanced Export",
    copy: "Copy",
    downloaded: "Downloaded",
    copied: "Copied to clipboard",
    download: "Download",
    formatLabel: "Format",
    exportAction: "Export as {{format}}",
    advancedTitle: "Export Options",
    basicActions: "Quick Actions",
    advancedFormats: "All Formats",
    noContent: "No content to export.",
  },

  // ─── Prompt Generator ────────────────────────────────────
  prompt: {
    title: "Generate AI Prompt",
    collapsed: "Show Prompt Generator",
    expand: "AI Prompt Generator",
    subtitle: "Select a template and provider to generate an AI-ready prompt",
    selectTemplate: "Select a prompt template",
    selectProvider: "Select AI provider",
    generatePrompt: "Generate Prompt",
    copyPrompt: "Copy Prompt",
    downloadPrompt: "Download Prompt",
    promptPreview: "Prompt Preview",
    providerLabel: "Provider",
    templateLabel: "Template",
    noContent: "No content for prompt generation.",
    generating: "Generating prompt...",
    generated: "Prompt generated successfully",
    failGenerate: "Failed to generate prompt",
    customize: "Customize your prompt",
  },

  // ─── RAG Export Panel ────────────────────────────────────
  rag: {
    title: "RAG Dataset Export",
    collapsed: "Show RAG Export",
    expand: "RAG Dataset Export",
    subtitle: "Export document chunks optimized for Retrieval-Augmented Generation",
    chunkSize: "Chunk Size",
    chunkSizeDesc: "Number of tokens per chunk",
    format: "Export Format",
    formatDesc: "Output format for the dataset",
    includeMetadata: "Include Metadata",
    includeMetadataDesc: "Page, source, language, title, chunk ID",
    generateExport: "Generate RAG Dataset",
    downloadExport: "Download Dataset",
    chunks: "{{count}} chunks",
    totalTokens: "{{count}} tokens total",
    noContent: "No content for RAG export.",
    generating: "Generating RAG dataset...",
    generated: "RAG dataset generated",
    failGenerate: "Failed to generate RAG dataset",
    tokensPerChunk: "{{size}} tokens/chunk",
    metadata: "Metadata",
  },

  // ─── AI Assistant Panel ──────────────────────────────────
  assistant: {
    title: "AI Assistant",
    collapsed: "Show AI Assistant",
    expand: "AI Assistant",
    quickActions: "Quick Actions",
    cleanDocument: "Clean Document",
    generateSummary: "Generate Summary",
    generatePrompt: "Generate Prompt",
    exportRAG: "Export RAG Dataset",
    aiReadiness: "AI Readiness",
    documentType: "Detected Type",
    noDocument: "Convert a document to enable AI features",
    processing: "Processing...",
  },

  // ─── AI Readiness ────────────────────────────────────────
  readiness: {
    score: "AI Readiness Score: {{score}}/100",
    excellent: "Excellent",
    good: "Good",
    fair: "Fair",
    poor: "Poor",
    issues: "Issues Found",
    suggestions: "Suggestions",
    noIssues: "No issues found. Your document is AI-ready!",
    issueCount: "{{count}} issue(s) found",
  },

  // ─── Document Types ──────────────────────────────────────
  documentTypes: {
    book: "Book",
    "research-paper": "Research Paper",
    resume: "Resume / CV",
    contract: "Contract",
    invoice: "Invoice",
    educational: "Educational Material",
    manual: "Manual / Guide",
    report: "Report",
    unknown: "General Document",
  },

  // ─── Common Actions ──────────────────────────────────────
  common: {
    loading: "Loading...",
    error: "An error occurred",
    retry: "Retry",
    cancel: "Cancel",
    close: "Close",
    done: "Done",
    processing: "Processing...",
    success: "Success",
    fail: "Failed",
    copied: "Copied!",
    downloaded: "Downloaded!",
    back: "Back",
    next: "Next",
    skip: "Skip",
    learnMore: "Learn more",
  },

  // ─── Pipeline Stages (for progress display) ──────────────
  pipelineStages: {
    idle: "Ready",
    uploading: "Uploading document...",
    validating: "Validating file...",
    extracting: "Extracting text...",
    cleaning: "Cleaning document for AI...",
    analyzing: "Analyzing document structure...",
    summarizing: "Generating summaries...",
    generating: "Preparing AI outputs...",
    exporting: "Preparing exports...",
    complete: "Completed Successfully ✓",
    error: "Processing Failed ✗",
    cancelled: "Cancelled",
  },

  // ─── Errors ──────────────────────────────────────────────
  errors: {
    noFile: "Please upload a file first.",
    noContent: "No content to process.",
    processingFailed: "AI processing failed. Please try again.",
    timeout: "Processing timed out. The document may be too large.",
    unsupported: "Unsupported file type.",
    networkError: "Network error. Please check your connection.",
    retryFailed: "Retry failed. Please try again later.",
    serverError: "Server error. Please try again later.",
  },

  // ─── Tooltips / Help Text ────────────────────────────────
  tooltips: {
    cleanForAI: "Removes repeated headers, footers, page numbers, and normalizes whitespace for optimal AI consumption",
    aiReadiness: "Measures how well your document is formatted for AI processing. Higher scores mean better AI comprehension.",
    ragExport: "Chunks your document into smaller pieces optimized for RAG (Retrieval-Augmented Generation) pipelines",
    promptGeneration: "Generates AI-ready prompts tailored for ChatGPT, Claude, Gemini, and other AI models",
    exportFormats: "Choose from multiple export formats including Markdown, JSON, JSONL, TXT, and more",
  },
};

/**
 * Helper to replace template variables in strings.
 * Example: t("Hello {{name}}", { name: "World" }) → "Hello World"
 */
export function t(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  let result = template;
  Object.entries(vars).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{{${key}}}`, "g"), String(value));
  });
  return result;
}

