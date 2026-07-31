import { ToolPlugin, ToolCategory, ToolPluginContext } from "./ToolPlugin";
import AISummaryPanel from "../components/AISummaryPanel";
import PromptGenerator from "../components/PromptGenerator";
import RAGExportPanel from "../components/RAGExportPanel";
import ExportCenter from "../components/ExportCenter";

class ToolRegistry {
  private plugins: Map<string, ToolPlugin> = new Map();

  constructor() {
    this.registerDefaultPlugins();
  }

  public register(plugin: ToolPlugin): void {
    this.plugins.set(plugin.id, plugin);
  }

  public get(id: string): ToolPlugin | undefined {
    return this.plugins.get(id);
  }

  public getByRoute(route: string): ToolPlugin | undefined {
    const normalized = route.toLowerCase();
    for (const plugin of this.plugins.values()) {
      if (plugin.route.toLowerCase() === normalized) {
        return plugin;
      }
    }
    return undefined;
  }

  public getAll(): ToolPlugin[] {
    return Array.from(this.plugins.values());
  }

  public getFeatured(): ToolPlugin[] {
    return this.getAll().filter((p) => p.featured);
  }

  public getCategories(): ToolCategory[] {
    const categories = new Set<ToolCategory>();
    this.plugins.forEach((p) => categories.add(p.category));
    return Array.from(categories);
  }

  public getByCategory(category: ToolCategory): ToolPlugin[] {
    return this.getAll().filter((p) => p.category === category);
  }

  /** All tools under /converters/* */
  public getConverters(): ToolPlugin[] {
    return this.getAll().filter((p) => p.urlGroup === "converters");
  }

  /** All tools under /ai-tools/* */
  public getAITools(): ToolPlugin[] {
    return this.getAll().filter((p) => p.urlGroup === "ai-tools");
  }

  public search(query: string): ToolPlugin[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.getAll();
    return this.getAll().filter((p) => {
      return (
        p.title.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.fullDescription.toLowerCase().includes(q) ||
        p.badges.some((b) => b.toLowerCase().includes(q)) ||
        p.metaKeywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }

  private registerDefaultPlugins(): void {
    // ─────────────────────────────────────────────────────────
    // AI TOOLS  —  /ai-tools/*
    // ─────────────────────────────────────────────────────────

    // 1. AI Summary
    this.register({
      id: "ai-summary",
      title: "AI Document Summary",
      shortDescription: "Generate concise executive summaries, key takeaways, and structural metrics.",
      fullDescription: "Instantly analyze document structure, word count, reading complexity, and extract key points using AI heuristics.",
      category: "analysis",
      urlGroup: "ai-tools",
      route: "/ai-tools/document-summary",
      iconName: "FileText",
      supportedFormats: ["pdf", "docx", "pptx", "xlsx", "html", "epub", "png", "jpg", "url"],
      featured: true,
      status: "stable",
      badges: ["AI Ready", "Summary", "Analytics"],
      metaKeywords: ["summary", "abstract", "analysis", "key points", "overview"],
      canRun: (ctx) => Boolean(ctx.markdown || ctx.file),
      panel: AISummaryPanel,
    });

    // 2. Prompt Generator
    this.register({
      id: "prompt-generator",
      title: "Prompt Generator",
      shortDescription: "Formulate specialized system, developer, and research prompts for ChatGPT, Claude, Gemini, DeepSeek & Llama.",
      fullDescription: "Transform extracted document content into engineered prompts tailored for major AI models and developer workflows.",
      category: "prompting",
      urlGroup: "ai-tools",
      route: "/ai-tools/prompt-generator",
      iconName: "MessageSquare",
      supportedFormats: ["pdf", "docx", "pptx", "xlsx", "html", "epub", "png", "jpg", "url"],
      featured: true,
      status: "stable",
      badges: ["ChatGPT", "Claude", "Gemini", "DeepSeek", "Prompt Eng"],
      metaKeywords: ["prompt", "chatgpt", "claude", "gemini", "deepseek", "llama", "copilot"],
      canRun: (ctx) => Boolean(ctx.markdown || ctx.file),
      panel: PromptGenerator,
    });

    // 3. Document Cleaner
    this.register({
      id: "document-cleaner",
      title: "Document Cleaner for AI",
      shortDescription: "Purge headers, footers, page numbers, duplicate lines, and repair OCR artifacts for optimal LLM context.",
      fullDescription: "Clean noise from document conversions to increase LLM token efficiency and precision during prompt context assembly.",
      category: "cleaning",
      urlGroup: "ai-tools",
      route: "/ai-tools/document-cleaner",
      iconName: "Sparkles",
      supportedFormats: ["pdf", "docx", "pptx", "xlsx", "html", "epub", "png", "jpg", "url"],
      featured: true,
      status: "stable",
      badges: ["AI Ready", "Cleaner", "Token Opt"],
      metaKeywords: ["clean", "normalize", "headers", "footers", "ocr fix", "noise removal"],
      canRun: (ctx) => Boolean(ctx.markdown || ctx.file),
    });

    // 4. RAG Dataset Export
    this.register({
      id: "rag-export",
      title: "RAG Dataset Export",
      shortDescription: "Chunk documents with semantic metadata for vector databases (Pinecone, Chroma, Qdrant).",
      fullDescription: "Split content into token-bounded chunks enriched with page numbers, document source, and title metadata.",
      category: "rag",
      urlGroup: "ai-tools",
      route: "/ai-tools/rag-export",
      iconName: "Database",
      supportedFormats: ["pdf", "docx", "pptx", "xlsx", "html", "epub", "png", "jpg", "url"],
      featured: true,
      status: "stable",
      badges: ["RAG", "JSONL", "Chunking", "Vector DB"],
      metaKeywords: ["rag", "chunks", "embeddings", "vector db", "jsonl", "pinecone"],
      canRun: (ctx) => Boolean(ctx.markdown || ctx.file),
      panel: RAGExportPanel,
    });

    // 5. Prepare for AI
    this.register({
      id: "prepare-for-ai",
      title: "Prepare for AI Workflow",
      shortDescription: "Execute full end-to-end processing pipeline in one click.",
      fullDescription: "Run Upload → Extract → OCR → Clean → Normalize → Metadata → Chunk → Analyze → Prompt → Export seamlessly.",
      category: "analysis",
      urlGroup: "ai-tools",
      route: "/ai-tools/prepare-for-ai",
      iconName: "Zap",
      supportedFormats: ["pdf", "docx", "pptx", "xlsx", "html", "epub", "png", "jpg", "url"],
      featured: true,
      status: "stable",
      badges: ["One-Click", "Full Pipeline", "Automated"],
      metaKeywords: ["prepare", "pipeline", "one-click", "auto", "workflow"],
      canRun: (ctx) => Boolean(ctx.file || ctx.markdown),
    });

    // 6. JSONL Export
    this.register({
      id: "jsonl-export",
      title: "JSONL Fine-tuning Export",
      shortDescription: "Export document datasets in JSONL format for OpenAI, Anthropic, or Llama fine-tuning.",
      fullDescription: "Format parsed and cleaned text chunks into valid JSON Lines for LLM dataset preparation.",
      category: "export",
      urlGroup: "ai-tools",
      route: "/ai-tools/jsonl-export",
      iconName: "Download",
      supportedFormats: ["pdf", "docx", "pptx", "xlsx", "html", "epub", "png", "jpg", "url"],
      status: "stable",
      badges: ["JSONL", "Fine-Tuning", "Dataset"],
      metaKeywords: ["jsonl", "fine-tuning", "training data", "dataset"],
      canRun: (ctx) => Boolean(ctx.markdown || ctx.file),
      panel: ExportCenter,
    });

    // 7. FAQ & Quiz Generator
    this.register({
      id: "faq-quiz-generator",
      title: "FAQ & Quiz Generator",
      shortDescription: "Extract automatically generated Q&A pairs, flashcards, and quizzes from study documents.",
      fullDescription: "Formulate study notes, flashcards, and multiple-choice questions from document content.",
      category: "analysis",
      urlGroup: "ai-tools",
      route: "/ai-tools/faq-quiz-generator",
      iconName: "HelpCircle",
      supportedFormats: ["pdf", "docx", "pptx", "xlsx", "html", "epub", "png", "jpg", "url"],
      status: "beta",
      badges: ["FAQ", "Quiz", "Flashcards", "Study Notes"],
      metaKeywords: ["faq", "quiz", "flashcards", "study notes", "questions"],
      canRun: (ctx) => Boolean(ctx.markdown || ctx.file),
    });

    // ─────────────────────────────────────────────────────────
    // CONVERTERS  —  /converters/*
    // ─────────────────────────────────────────────────────────

    // 8. PDF to Markdown
    this.register({
      id: "pdf-to-markdown",
      title: "PDF to Markdown",
      shortDescription: "Extract text, headings, tables, and lists from PDF files into clean Markdown.",
      fullDescription: "High-performance PDF parser preserving structure and tables without server storage.",
      category: "conversion",
      urlGroup: "converters",
      route: "/converters/pdf-to-markdown",
      iconName: "FileCheck",
      supportedFormats: ["pdf"],
      status: "stable",
      badges: ["PDF", "Markdown", "Tables"],
      metaKeywords: ["pdf", "pdf to markdown", "convert pdf", "pdf md"],
      canRun: (ctx) => ctx.fileExt === "pdf" || Boolean(ctx.file && ctx.file.name.endsWith(".pdf")),
    });

    // 9. Word to Markdown
    this.register({
      id: "word-to-markdown",
      title: "Word to Markdown",
      shortDescription: "Convert .docx Word files with formatting, tables, and lists intact.",
      fullDescription: "Pristine Word docx conversion to clean GitHub Flavored Markdown.",
      category: "conversion",
      urlGroup: "converters",
      route: "/converters/word-to-markdown",
      iconName: "FileText",
      supportedFormats: ["docx"],
      status: "stable",
      badges: ["DOCX", "Word", "GFM"],
      metaKeywords: ["word", "docx", "word to markdown", "docx md"],
      canRun: (ctx) => ctx.fileExt === "docx" || Boolean(ctx.file && ctx.file.name.endsWith(".docx")),
    });

    // 10. PowerPoint to Markdown
    this.register({
      id: "pptx-to-markdown",
      title: "PowerPoint to Markdown",
      shortDescription: "Extract slide headings, bullet points, and speaker text from PPTX files.",
      fullDescription: "Convert PPTX slide decks into clean structured Markdown outlines.",
      category: "conversion",
      urlGroup: "converters",
      route: "/converters/pptx-to-markdown",
      iconName: "Presentation",
      supportedFormats: ["pptx"],
      status: "stable",
      badges: ["PPTX", "Slides", "Outline"],
      metaKeywords: ["pptx", "powerpoint", "slides", "presentation"],
      canRun: (ctx) => ctx.fileExt === "pptx" || Boolean(ctx.file && ctx.file.name.endsWith(".pptx")),
    });

    // 11. Excel to Markdown
    this.register({
      id: "excel-to-markdown",
      title: "Excel to Markdown",
      shortDescription: "Transform spreadsheet worksheets (.xlsx, .xls, .csv) into aligned GFM markdown pipe tables.",
      fullDescription: "Parse multi-sheet Excel workbooks into pristine Markdown tabular format.",
      category: "conversion",
      urlGroup: "converters",
      route: "/converters/excel-to-markdown",
      iconName: "Table",
      supportedFormats: ["xlsx", "xls", "csv"],
      status: "stable",
      badges: ["XLSX", "Excel", "Tables", "CSV"],
      metaKeywords: ["excel", "xlsx", "xls", "csv", "spreadsheet", "tables"],
      canRun: (ctx) => ["xlsx", "xls", "csv"].includes(ctx.fileExt || ""),
    });

    // 12. HTML to Markdown
    this.register({
      id: "html-to-markdown",
      title: "HTML to Markdown",
      shortDescription: "Convert web articles, HTML markup, and snippets to clean Markdown syntax.",
      fullDescription: "Strip unwanted scripts and styles, leaving pure formatted content.",
      category: "conversion",
      urlGroup: "converters",
      route: "/converters/html-to-markdown",
      iconName: "Code",
      supportedFormats: ["html", "htm"],
      status: "stable",
      badges: ["HTML", "Web", "Clean"],
      metaKeywords: ["html", "web page", "html to markdown"],
      canRun: (ctx) => ["html", "htm"].includes(ctx.fileExt || ""),
    });

    // 13. EPUB to Markdown
    this.register({
      id: "epub-to-markdown",
      title: "EPUB to Markdown",
      shortDescription: "Convert e-books (.epub) into chapter-structured Markdown files.",
      fullDescription: "Extract full text and chapter headings from digital EPUB publications.",
      category: "conversion",
      urlGroup: "converters",
      route: "/converters/epub-to-markdown",
      iconName: "BookOpen",
      supportedFormats: ["epub"],
      status: "stable",
      badges: ["EPUB", "E-Book", "Chapters"],
      metaKeywords: ["epub", "ebook", "book", "epub to markdown"],
      canRun: (ctx) => ctx.fileExt === "epub",
    });

    // 14. Image OCR
    this.register({
      id: "image-ocr",
      title: "Image OCR Text Extractor",
      shortDescription: "Optical Character Recognition (OCR) for PNG, JPG, WEBP, and scanned documents.",
      fullDescription: "In-memory OCR powered by Tesseract engine to recognize printed text from graphics.",
      category: "conversion",
      urlGroup: "converters",
      route: "/converters/image-ocr",
      iconName: "Eye",
      supportedFormats: ["png", "jpg", "jpeg", "webp", "bmp"],
      status: "stable",
      badges: ["OCR", "Image", "Vision"],
      metaKeywords: ["ocr", "image to text", "png to markdown", "jpg to text"],
      canRun: (ctx) => ["png", "jpg", "jpeg", "webp", "bmp"].includes(ctx.fileExt || ""),
    });

    // 15. URL to Markdown
    this.register({
      id: "url-to-markdown",
      title: "URL to Markdown",
      shortDescription: "Scrape and convert online web pages and articles into Markdown.",
      fullDescription: "Fetch live URLs and compile main article body into developer-friendly Markdown.",
      category: "conversion",
      urlGroup: "converters",
      route: "/converters/url-to-markdown",
      iconName: "Globe",
      supportedFormats: ["url"],
      status: "stable",
      badges: ["URL", "Web Scraper", "Live Fetch"],
      metaKeywords: ["url", "link", "website to markdown", "scrape"],
      canRun: (ctx) => Boolean(ctx.url),
    });

    // 16. Audio to Text
    this.register({
      id: "audio-transcribe",
      title: "Audio to Text Transcript",
      shortDescription: "Transcribe voice recordings, interviews, and podcasts into readable text.",
      fullDescription: "Speech recognition for MP3, WAV, M4A audio files.",
      category: "media",
      urlGroup: "converters",
      route: "/converters/audio-to-text",
      iconName: "Mic",
      supportedFormats: ["mp3", "wav", "m4a", "ogg", "flac"],
      status: "beta",
      badges: ["Audio", "Speech-to-Text", "Beta"],
      metaKeywords: ["audio", "transcribe", "speech to text", "voice"],
      canRun: (ctx) => ["mp3", "wav", "m4a", "ogg", "flac"].includes(ctx.fileExt || ""),
    });

    // 17. Video to Transcript
    this.register({
      id: "video-transcript",
      title: "Video Transcript Extractor",
      shortDescription: "Extract dialog and speech transcripts from video files.",
      fullDescription: "Convert MP4, WEBM video tracks into formatted Markdown transcripts.",
      category: "media",
      urlGroup: "converters",
      route: "/converters/video-to-transcript",
      iconName: "Video",
      supportedFormats: ["mp4", "webm", "avi", "mov"],
      status: "beta",
      badges: ["Video", "Transcript", "Beta"],
      metaKeywords: ["video", "transcript", "mp4 to text", "subtitles"],
      canRun: (ctx) => ["mp4", "webm", "avi", "mov"].includes(ctx.fileExt || ""),
    });
  }
}

export const toolsRegistry = new ToolRegistry();
