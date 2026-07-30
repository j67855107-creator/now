const fs = require("fs");
const path = require("path");

const distPath = path.resolve(__dirname, "../dist");
const indexPath = path.resolve(distPath, "index.html");

let html = fs.readFileSync(indexPath, "utf-8");

const SEO_SHELL = `
<div id="root">
  <div style="font-family:inherit;min-height:100vh">
    <header>
      <nav aria-label="Main navigation">
        <a href="/" title="ConvertOneAI Home">ConvertOneAI</a>
        <a href="/?view=tools">Tools &amp; AI</a>
        <a href="/?view=guide">Guides &amp; Docs</a>
        <a href="/?view=blog">Blog</a>
        <a href="/?view=faq">FAQ</a>
        <a href="/?view=about">About</a>
      </nav>
    </header>
    <main>
      <h1>Convert PDF &amp; Word Documents to Clean Markdown for AI</h1>
      <p>
        ConvertOneAI is a free enterprise AI document processing platform. 
        Convert PDF, Word (DOCX), HTML, EPUB, and scanned images to clean 
        GitHub Flavored Markdown for ChatGPT, Claude, Gemini, and RAG vector pipelines. 
        100% in-memory processing with zero document retention.
      </p>
      <h2>Supported Document Formats</h2>
      <ul>
        <li>PDF to Markdown — High-accuracy text and table extraction</li>
        <li>Word (DOCX) to Markdown — GFM pipe table conversion</li>
        <li>HTML to Markdown — Semantic structure preservation</li>
        <li>Image OCR to Markdown — Tesseract-powered text extraction</li>
        <li>EPUB, PPTX, XLSX, CSV to Markdown — 24+ formats supported</li>
      </ul>
      <h2>AI Pipeline Features</h2>
      <ul>
        <li>Document cleaning and layout noise removal for LLMs</li>
        <li>RAG vector dataset chunking with JSONL export</li>
        <li>System prompt generator for Claude, ChatGPT, Gemini and DeepSeek</li>
        <li>AI document summary extraction</li>
      </ul>
    </main>
  </div>
</div>`;

// Replace empty root div with populated shell
html = html.replace('<div id="root"></div>', SEO_SHELL);

fs.writeFileSync(indexPath, html, "utf-8");
console.log("[SEO Shell] Successfully injected semantic HTML into dist/index.html");
