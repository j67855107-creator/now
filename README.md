# ConvertOneAI — Full-Stack Document-to-Markdown Converter

A high-performance, full-stack application built with React, Vite, Tailwind CSS, and Express. ConvertOneAI translates complex documents (PDF, DOCX) into beautifully styled, standard Markdown, backed by real-time analytics dashboards, and a live contact submissions list.

---

## 🖤 The Heart of This Project

At its core, **ConvertOneAI** was born out of an engineering mission to provide **Zero-Trust Document Parsing**. Document conversion solutions are notoriously bloated, locked behind registration structures, or plagued by user tracking. ConvertOneAI solves this by providing a highly optimized parser that lives entirely in volatile Node.js server-side buffers. File streams are decrypted, compiled to clean Markdown formatting, and immediately disposed of by V8 garbage collection.

---

## 🛠️ Architecture & How It Works

The system operates around a high-speed full-stack loop bridging a lightweight, responsive React client and a stateless. volatile-memory Express handler:

### Architectural Pipeline
```
[User Document: .pdf / .docx] 
       │
       ▼ (Drag & Drop / Picker)
┌────────────────────────────────────────────────────────┐
│ REACT FRONTEND ENGINE                                  │
│ - Base64 Encoder & Payload Optimizer                   │
│ - Render Engine (Classic Preview vs Raw Format)        │
└─────────────────────────────────┬──────────────────────┘
                                  │ Secure API call (headers: API-Key)
                                  ▼
┌────────────────────────────────────────────────────────┐
│ EXPRESS BACKEND CONTROLLER                             │
│ - Strict 12MB Payload Boundary Validation              │
│ - Sanitization filter (regex base64 characters only)   │
│ - Mammoth parsing (.docx -> raw html -> markdown)      │
│ - Pdf-Parse parser (.pdf -> text chunks -> markdown)   │
│ - Volatile Session Stats recorder & RAM Logs Rotator   │
└─────────────────────────────────┬──────────────────────┘
                                  │ Immediate Stream Flush
                                  ▼
[Clean Markdown Stream Output + Telemetry Incremented]
```

### 1. File Upload & Processing Mechanics
* **Direct Buffering**: Once a file is processed on the client side, it is encoded into a Base64 string and sent over HTTPS with a secure API verification header.
* **Stateless Conversion**: In `server.ts`, the payload triggers specialized routers:
  - **MS Word (.docx)**: Utilizes `mammoth` alongside custom `TurndownService` markdown bindings to translate nested tables, headers, and bullet formats elegantly.
  - **Adobe PDF (.pdf)**: Employs `pdf-parse` to strip structural components, mapping headings, code fragments, list items (`•`, `-`), and general spacing structures using line scanning heuristic weights.
* **On-The-Fly Disposal**: The original base64 payload is never stored on disk. It's stored in short-lived Express heap variables, processed, returned, and then immediately freed.

---

## 📂 Codebase Structure Deep-Dive

Here is the exact file manifest comprising ConvertOneAI, illustrating the strict separation of concerns:

```
├── .env.example                       # Reference config for environment parameters
├── server.ts                          # Express backend engine (Parsing, stats collector, support API)
├── tsconfig.json                      # Full Strict TypeScript compiler rules
├── vite.config.ts                     # Bundling settings & reverse proxy setup for Vite
├── README.md                          # Interactive Developer Companion (This file)
├── package.json                       # Scripts, dependencies, and bundle rules
├── metadata.json                      # Application descriptors and capability definitions
│
└── src/
    ├── main.tsx                       # UI mounting script
    ├── App.tsx                        # Core Application layout & routing
    ├── types.ts                       # Unified types for conversions, telemetry metrics & logs
    ├── data.ts                        # Static configurations & blog articles definitions
    ├── index.css                      # Global CSS definitions loading Inter & JetBrains Mono Fonts
    │
    └── components/
        ├── AnalyticsDashboard.tsx    # Live operations board, interactive telemetry & customer inbox
        └── MarkdownPreview.tsx       # Live dual-pane Markdown renderer with highlight features
```

### Module Roles & Mechanics:
* **`server.ts`**: Handles body parsing with a standard `50mb` cushion. Features an API verification middleware requiring safety keys (`WN3FBAF2GYF` by default). Includes internal metrics state trackers recording transaction sizes, throughput KB speeds, and request success rates.
* **`src/App.tsx`**: Governs the application routing lifecycle (`converter`, `analytics`, `blog`, `faq`, `about`, `privacy`, `terms`), manages core dropzone states, custom alerts, and workspace configurations cleanly.
* **`src/components/AnalyticsDashboard.tsx`**: Renders SVG metrics distributions, maps telemetry counts utilizing real data from the Express backend, and lists active customer support inquiries.
* **`src/components/MarkdownPreview.tsx`**: Implements copy/view modes enabling rapid user export patterns toBear, Notion, and Bear seamlessly.

---

## ⚙️ Setup & Development Guide

Follow these steps to run the application in development or build for standalone production containers.

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn package manager

### Environment Configuration
Create a `.env` in the root (matching `.env.example` configurations):
```env
PORT=3000
API_PROTECTION_KEY=WN3FBAF2GYF
```

### Commands Pipeline

```bash
# 1. Install all structural dependencies
npm install

# 2. Run the full-stack development workspace
npm run dev

# 3. Compile the frontend & bundle Node backend.
# The custom build step packages 'server.ts' to CJS inside 'dist/server.cjs'
npm run build

# 4. Boot the highly compiled standalone production server
npm start
```

---

## 🔒 Security & Data Compliance
* **Zero Telemetry**: ConvertOneAI retains no physically identifying variables, cookies, or documents on static storage.
* **Heap Guard**: Strict 12MB size restrictions on the backend prevent raw memory crashes and protect against Denial-of-Service (DoS) buffer overflows.
* **Volatile Store**: Support and logs reside in RAM only, ensuring periodic automatic resets as application containers cycle natively.
