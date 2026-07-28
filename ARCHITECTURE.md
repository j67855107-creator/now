# ConvertOneAI — AI Document Processing Platform Architecture

## Dependency Graph & System Architecture

---

## 1. Processing Pipeline (Event-Driven)

```
FILE_UPLOADED
    │
    ▼
┌──────────────────────────────────────────────────────────────────┐
│ PROCESSING PIPELINE (server/services/ProcessingPipeline.ts)       │
│ Event-driven, stage-based, configurable order                    │
│ Cache-aware, observable, retriable                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Stage 1: VALIDATE ──────────────────────────────────────────┐   │
│    ├─ MIME type validation                                    │   │
│    ├─ Magic bytes verification                                │   │
│    ├─ File size enforcement (50MB limit)                      │   │
│    └─ Virus/malware scan (placeholder)                        │   │
│                                                                   │
│  Stage 2: EXTRACT ───────────────────────────────────────────┐   │
│    ├─ PDF → pdf-parse (text + metadata)                      │   │
│    └─ DOCX → mammoth + TurndownService (HTML → Markdown)     │   │
│                                                                   │
│  Stage 3: CLEAN (if AI Cleaner enabled) ─────────────────────┐   │
│    ├─ Remove repeated headers                                │   │
│    ├─ Remove repeated footers                                │   │
│    ├─ Remove page numbers                                    │   │
│    ├─ Remove duplicated lines                                │   │
│    ├─ Merge broken paragraphs                                │   │
│    ├─ Normalize whitespace                                   │   │
│    ├─ Improve heading hierarchy                              │   │
│    └─ Preserve tables                                        │   │
│                                                                   │
│  Stage 4: ANALYZE ──────────────────────────────────────────┐   │
│    ├─ Detect document language                               │   │
│    ├─ Detect document type (Book, Paper, Resume, etc.)      │   │
│    ├─ Extract heading structure                              │   │
│    ├─ Count tables, images, links, footnotes, references    │   │
│    ├─ Calculate reading time                                 │   │
│    ├─ Calculate complexity score                             │   │
│    ├─ Estimate token count & AI cost                         │   │
│    └─ Generate AI Readiness Score                            │   │
│                                                                   │
│  Stage 5: SUMMARIZE (if enabled) ───────────────────────────┐   │
│    ├─ Short summary (2-3 sentences)                         │   │
│    ├─ Detailed summary (paragraph)                          │   │
│    └─ Extract keywords                                      │   │
│                                                                   │
│  Stage 6: GENERATE OUTPUTS ─────────────────────────────────┐   │
│    ├─ Clean Markdown (from Stage 3)                         │   │
│    ├─ AI Markdown (optimized for LLM)                       │   │
│    ├─ Prompts (via PromptGeneratorService)                  │   │
│    │    └─ Provider adapters: ChatGPT, Claude, Gemini, L.L. │   │
│    ├─ RAG chunks (via RAGExportService)                     │   │
│    │    └─ Chunk sizes: 256, 512, 1024                     │   │
│    └─ Export formats (via ExportRegistry)                   │   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
    │
    ▼
EXPORT_READY → AI Workspace displays results
```

---

## 2. Component Dependency Graph

```
App.tsx
  └── Header (UNCHANGED)
  └── ConversionUI (UNCHANGED layout + NEW <AIWorkspace />)
  │     └── Upload Zone [UNCHANGED]
  │     │     └── AIOptionsPanel [NEW] (collapsible, pre-conversion)
  │     └── Conversion Result Area [UNCHANGED]
  │     │     └── Metadata Ribbon [UNCHANGED]
  │     │     └── Editor + Preview [UNCHANGED]
  │     │     └── Copy/Download Buttons [UNCHANGED]
  │     └── AIWorkspace [NEW] (below editor, post-conversion)
  │           ├── EnhancedProgressBar [NEW] (during conversion)
  │           ├── ExportCenter [NEW]
  │           │     ├── [UNCHANGED] Copy Button
  │           │     ├── [UNCHANGED] Download Button
  │           │     └── ▼ Advanced Export (collapsible)
  │           │           ├── Export Button × N (from ExportRegistry)
  │           ├── AISummaryPanel [NEW] (collapsible)
  │           │     ├── Short Summary
  │           │     ├── Detailed Summary
  │           │     ├── Keywords
  │           │     ├── Document Stats (words, headings, tables)
  │           │     ├── AI Readiness Score
  │           │     └── Document Type Badge
  │           ├── PromptGenerator [NEW] (tab/collapsible)
  │           │     ├── Template Grid (from PromptTemplateRegistry)
  │           │     ├── Preview Area
  │           │     ├── Provider Selector (ChatGPT/Claude/Gemini)
  │           │     ├── Copy Prompt
  │           │     └── Download Prompt
  │           ├── RAGExportPanel [NEW] (collapsible)
  │           │     ├── Format Selector (JSON/JSONL/MD/TXT)
  │           │     ├── Chunk Size (256/512/1024)
  │           │     ├── Metadata Preview
  │           │     └── Download
  │           └── AIAssistantPanel [NEW] (desktop: right sidebar, mobile: below)
  │                 ├── Quick Actions
  │                 ├── AI Readiness Badge
  │                 └── Document Type Badge
  └── Footer (UNCHANGED)
```

---

## 3. Service Dependency Graph (Backend)

```
ProcessingPipeline.ts [CORE ORCHESTRATOR]
  ├── depends on: EventEmitter (built-in)
  ├── depends on: CacheService (session cache)
  ├── emits: pipeline:stage-start, pipeline:stage-end, pipeline:complete, pipeline:error
  │
  ├── DocumentCleanerService.ts
  │     └── Stateless utility functions
  │
  ├── DocumentAnalyzerService.ts
  │     └── depends on: DocumentTypeRegistry
  │     └── depends on: Language detector (heuristic)
  │
  ├── PromptGeneratorService.ts
  │     └── depends on: PromptTemplateRegistry
  │     └── depends on: ProviderAdapter interface
  │     │     ├── ChatGPTAdapter
  │     │     ├── ClaudeAdapter
  │     │     ├── GeminiAdapter
  │     │     └── LocalLLMAdapter
  │
  ├── RAGExportService.ts
  │     └── Stateless chunking engine
  │
  └── AIExportService.ts
        └── depends on: ExportRegistry
        └── Orchestrates final output formatting

AnalyticsService.ts
  └── Anonymous feature usage tracking
  └── No document content stored

CacheService.ts [NEW]
  └── Session-scoped processing cache
  └── Map<string, CacheEntry> with TTL
  └── Key: fileHash + options hash
```

---

## 4. Registry Architecture

```
src/ai/registries/
├── ExportRegistry.ts
│     ├── register(name, handler, icon, description)
│     ├── get(name)
│     ├── getAll()
│     ├── Built-in: Markdown, CleanMarkdown, AIMarkdown, JSON, JSONL, TXT, Prompt, RAG
│     └── Future: NotionExport, ObsidianExport, VectorDBExport
│
├── AIFeatureRegistry.ts
│     ├── register(name, config, component)
│     ├── isEnabled(name) ← checks feature flags
│     ├── getAll()
│     ├── Built-in: Cleaner, Summary, PromptGenerator, RAG, AIAssistant
│     └── Future: OCR, Translation, ImageCaptioning, QuizGenerator
│
├── PromptTemplateRegistry.ts
│     ├── register(name, templateFn, providerAdapters)
│     ├── get(name, provider)
│     ├── getAll()
│     ├── Built-in: 10 templates × 4 providers = 40 variants
│     └── Future: Custom prompts from user
│
├── DocumentTypeRegistry.ts
│     ├── register(name, patterns, icon, recommendations)
│     ├── detect(text) → DocumentType
│     ├── getAll()
│     ├── Built-in: 8 types
│     └── Future: ML-based type detection
│
└── FeatureFlags.ts
      ├── isFeatureEnabled(featureName)
      ├── Configurable via environment variables
      └── Future: Enterprise tier controls
```

---

## 5. API Flow Diagram

```
Client                           Server
  │                                │
  │  POST /api/convert             │
  │  ──────────────────────────►   │
  │    { fileData, fileName,       │
  │      mimeType, mode,           │
  │      aiOptions }               │
  │                                │
  │                      ┌─────────┴────────┐
  │                      │ ProcessingPipeline│
  │                      │ - Validate        │
  │                      │ - Extract         │
  │                      │ - Clean (opt)     │
  │                      │ - Analyze         │
  │                      │ - Summarize (opt) │
  │                      │ - Generate        │
  │                      └─────────┬────────┘
  │                                │
  │  ◄──────────────────────────  │
  │  { markdown, metadata,        │
  │    summary, analysis,         │
  │    readiness, docType }       │
  │                                │
  │  POST /api/ai/prompt           │
  │  ──────────────────────────►   │
  │    { template, provider,       │
  │      markdown, metadata }      │
  │  ◄──────────────────────────  │
  │  { prompt }                    │
  │                                │
  │  POST /api/ai/rag              │
  │  ──────────────────────────►   │
  │    { markdown, chunkSize,      │
  │      format, metadata }        │
  │  ◄──────────────────────────  │
  │  { chunks, metadata }          │
  │                                │
  │  POST /api/ai/export           │
  │  ──────────────────────────►   │
  │    { format, markdown,         │
  │      options }                 │
  │  ◄──────────────────────────  │
  │  { file, contentType }         │
```

---

## 6. Data Flow (State Management)

```
useAIWorkspace Hook (src/ai/hooks/useAIWorkspace.ts)
├── State:
│     ├── aiOptions: AIOptions (clean, summarize, prompt, rag flags)
│     ├── processingState: 'idle' | 'processing' | 'complete' | 'error'
│     ├── progress: ProgressInfo (stage, percentage, eta, step)
│     ├── summary: AISummary | null
│     ├── analysis: DocumentAnalysis | null
│     ├── documentType: DocumentType | null
│     ├── prompts: Prompt[] | null
│     ├── ragOutput: RAGOutput | null
│     ├── exports: ExportOutput[] | null
│     └── history: ProcessingHistory[] (session only)
│
├── Actions:
│     ├── setAIOptions(options)
│     ├── runProcessing(file, mode)
│     ├── cancelProcessing()
│     ├── retryProcessing()
│     ├── generatePrompt(template, provider)
│     ├── generateRAG(chunkSize, format)
│     ├── exportOutput(format)
│     └── clearHistory()
│
└── Events emitted:
      ├── onProgress(stage, percent, eta)
      ├── onComplete(result)
      ├── onError(error)
      └── onCancel()
```

---

## 7. File Structure (New `src/ai/` directory)

```
src/ai/
├── config.ts                        # Centralized AI configuration + feature flags
├── types.ts                         # Re-exported AI-specific types
│
├── registries/
│   ├── ExportRegistry.ts
│   ├── AIFeatureRegistry.ts
│   ├── PromptTemplateRegistry.ts
│   └── DocumentTypeRegistry.ts
│
├── hooks/
│   ├── useAIWorkspace.ts            # Main AI workspace state
│   ├── useAIProcessing.ts           # Pipeline interaction
│   └── useAnalytics.ts              # Anonymous feature tracking
│
├── components/
│   ├── AIWorkspace.tsx              # Orchestrator (tab-based + collapsible)
│   ├── AIOptionsPanel.tsx           # Pre-conversion AI options in upload zone
│   ├── EnhancedProgressBar.tsx       # Premium animated progress
│   ├── AISummaryPanel.tsx           # Summary + Document Intelligence
│   ├── ExportCenter.tsx             # Export with registry-driven options
│   ├── PromptGenerator.tsx          # Prompt templates UI
│   ├── RAGExportPanel.tsx           # RAG export controls
│   └── AIAssistantPanel.tsx         # Right sidebar quick actions
│
└── i18n/
    └── en.ts                        # English translations (centralized strings)
```

---

## 8. Circular Dependency Verification

```
No circular dependencies:

App.tsx → ConversionUI → AIWorkspace
                               ├── AIOptionsPanel
                               ├── EnhancedProgressBar
                               ├── AISummaryPanel
                               ├── ExportCenter
                               ├── PromptGenerator
                               ├── RAGExportPanel
                               └── AIAssistantPanel

All components import from:
  - src/ai/hooks/ (no cross-hook imports)
  - src/ai/registries/ (no cross-registry imports)
  - src/ai/config.ts (leaf node)
  - src/types.ts (leaf node)

Backend:
  ProcessingPipeline → [services] → [registries]
  No service imports another service
  All services are leaf nodes or import from registries only
```

---

## 9. Progressive Disclosure Flow

```
DEFAULT USER JOURNEY (No AI visible):
  1. Upload file to dropzone
  2. Click "Convert" 
  3. See progress bar
  4. Get Markdown result
  5. Copy / Download
  6. Done ✓

POWER USER JOURNEY (AI features visible):
  1. Upload file to dropzone
  2. ▼ Click "AI Options" (collapsed by default)
  3. Toggle: Clean for AI | Generate Summary | Generate Prompt | Generate RAG
  4. Click "Convert"
  5. See Enhanced Progress Bar with real stages
  6. Get Markdown result + AI Workspace appears below
  7. Switch between tabs: Summary | Prompt | Export | RAG
  8. Advanced export options available
  9. Done ✓
```

---

## 10. Performance & Security

```
PERFORMANCE:
  - Lazy-loaded AI components (dynamic import)
  - Memoized expensive computations
  - Session cache prevents re-processing same file
  - Stage-based processing with cancellation support
  - Debounced analytics events

SECURITY:
  - All file validation before processing (MIME, magic bytes, size)
  - No permanent file storage
  - Session cache cleared on tab close
  - Rate limiting on all AI endpoints
  - Timeout enforcement per pipeline stage
  - Memory limits for large documents
```

---

*This architecture supports 20+ future AI features (OCR, Translation, Audio, Video, Image, Vision AI, Flashcards, Quiz, Mind Maps, Notion Export, Obsidian Export, Knowledge Graph, Vector Database Export) without modifying core code.*

