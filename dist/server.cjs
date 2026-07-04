var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  createApp: () => createApp,
  startServer: () => startServer
});
module.exports = __toCommonJS(server_exports);
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_mammoth = __toESM(require("mammoth"), 1);
var import_turndown = __toESM(require("turndown"), 1);
var import_pdf_parse = require("pdf-parse");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_compression = __toESM(require("compression"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_helmet = __toESM(require("helmet"), 1);
var import_express_rate_limit = __toESM(require("express-rate-limit"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var DEFAULT_PORT = Number.parseInt(process.env.PORT || "3000", 10) || 3e3;
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use((0, import_helmet.default)({
  contentSecurityPolicy: false,
  // Handled by frontend or configured for API
  crossOriginEmbedderPolicy: false
}));
var apiLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 100,
  // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." }
});
var convertLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 30,
  // Limit each IP to 30 conversions per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Conversion limit reached. Please try again later." }
});
var isAllowedOrigin = (origin) => {
  if (!origin) return true;
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000"
  ].filter(Boolean);
  if (allowedOrigins.includes(origin)) return true;
  return /https:\/\/.*\.vercel\.app$/i.test(origin) || /https:\/\/.*\.up\.railway\.app$/i.test(origin);
};
app.use((0, import_cors.default)({
  origin: isAllowedOrigin,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-api-key"]
}));
app.use((0, import_compression.default)());
app.use(import_express.default.json({ limit: "15mb" }));
app.use(import_express.default.urlencoded({ limit: "15mb", extended: true }));
var SUBMISSIONS_FILE = import_path.default.join(process.cwd(), "contact_submissions.json");
var STATS_FILE = import_path.default.join(process.cwd(), "stats.json");
var requireApiKey = (req, res, next) => {
  const allowedKey = process.env.API_PROTECTION_KEY || "WN3FBAF2GYF";
  const apiKey = req.headers["x-api-key"] || req.query.api_key;
  if (apiKey === allowedKey) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized: Invalid API Key" });
  }
};
function loadSubmissions() {
  try {
    if (import_fs.default.existsSync(SUBMISSIONS_FILE)) {
      const data = import_fs.default.readFileSync(SUBMISSIONS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Failed to load support submissions from file:", err);
  }
  const defaults = [
    { id: "msg-1", name: "Marc Dupond", email: "marc.du@example.fr", message: "Bonjour! Do you support batch docx files in a single session?", timestamp: new Date(Date.now() - 1e3 * 60 * 120).toISOString() },
    { id: "msg-2", name: "Audrey Laurent", email: "audrey@creativecorp.com", message: "Is PDF formatting retained, especially bullet points and indented code blocks?", timestamp: new Date(Date.now() - 1e3 * 60 * 360).toISOString() }
  ];
  try {
    import_fs.default.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(defaults, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write initial submissions file:", err);
  }
  return defaults;
}
function loadStats() {
  const defaultStats = {
    totalConversions: 184,
    classicConversions: 184,
    aiConversions: 0,
    totalSizeKb: 14590,
    averageDurationMs: 650,
    recentLogs: [
      { id: "log-1", fileName: "Q3_Strategic_Plan.docx", fileExt: "docx", fileSizeKb: 240, mode: "classic", status: "success", durationMs: 1250, timestamp: new Date(Date.now() - 1e3 * 60 * 18).toISOString() },
      { id: "log-2", fileName: "Financial_Report_v2.pdf", fileExt: "pdf", fileSizeKb: 1820, mode: "classic", status: "success", durationMs: 420, timestamp: new Date(Date.now() - 1e3 * 60 * 42).toISOString() },
      { id: "log-3", fileName: "Developer_Quickstart_Guide.pdf", fileExt: "pdf", fileSizeKb: 750, mode: "classic", status: "success", durationMs: 1610, timestamp: new Date(Date.now() - 1e3 * 60 * 125).toISOString() },
      { id: "log-4", fileName: "FAQ_Draft.docx", fileExt: "docx", fileSizeKb: 124, mode: "classic", status: "success", durationMs: 85, timestamp: new Date(Date.now() - 1e3 * 60 * 190).toISOString() }
    ]
  };
  try {
    if (import_fs.default.existsSync(STATS_FILE)) {
      const data = import_fs.default.readFileSync(STATS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Failed to load stats from file:", err);
  }
  try {
    import_fs.default.writeFileSync(STATS_FILE, JSON.stringify(defaultStats, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write initial stats file:", err);
  }
  return defaultStats;
}
var contactSubmissions = loadSubmissions();
function cleanOldSubmissions() {
  const now = Date.now();
  const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1e3;
  let hasChanges = false;
  for (let i = contactSubmissions.length - 1; i >= 0; i--) {
    const submissionTime = new Date(contactSubmissions[i].timestamp).getTime();
    if (now - submissionTime > FORTY_EIGHT_HOURS) {
      contactSubmissions.splice(i, 1);
      hasChanges = true;
    }
  }
  if (hasChanges) {
    try {
      import_fs.default.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(contactSubmissions, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to write cleaned submissions to file:", err);
    }
  }
}
cleanOldSubmissions();
setInterval(cleanOldSubmissions, 60 * 60 * 1e3);
var stats = loadStats();
function recordConversion(fileName, fileExt, fileSizeKb, mode, status, durationMs) {
  stats.totalConversions += 1;
  if (status === "success") {
    stats.totalSizeKb += Math.round(fileSizeKb);
    stats.classicConversions += 1;
  }
  const logCount = stats.recentLogs.length;
  stats.averageDurationMs = Math.round((stats.averageDurationMs * logCount + durationMs) / (logCount + 1));
  const newLog = {
    id: `log-${Date.now()}`,
    fileName,
    fileExt,
    fileSizeKb: Math.round(fileSizeKb * 10) / 10,
    mode,
    status,
    durationMs,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  stats.recentLogs.unshift(newLog);
  if (stats.recentLogs.length > 50) {
    stats.recentLogs.pop();
  }
  try {
    import_fs.default.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write updated stats to file:", err);
  }
}
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "convertoneai-api", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get("/api/stats", apiLimiter, requireApiKey, (req, res) => {
  cleanOldSubmissions();
  res.json({
    ...stats,
    contactSubmissions
  });
});
app.get("/api/admin/download", apiLimiter, (req, res) => {
  const allowedKey = process.env.API_PROTECTION_KEY || "WN3FBAF2GYF";
  const apiKey = req.headers["x-api-key"] || req.query.api_key;
  if (apiKey !== allowedKey) {
    res.status(401).json({ error: "Unauthorized: Invalid API Key" });
    return;
  }
  const requestedFile = req.query.file;
  if (!requestedFile) {
    res.status(400).json({ error: "Missing required 'file' query parameter." });
    return;
  }
  if (requestedFile === "stats.json") {
    if (import_fs.default.existsSync(STATS_FILE)) {
      res.download(STATS_FILE, "stats.json");
    } else {
      res.setHeader("Content-Disposition", "attachment; filename=stats.json");
      res.setHeader("Content-Type", "application/json");
      res.send(JSON.stringify(stats, null, 2));
    }
  } else if (requestedFile === "contact_submissions.json" || requestedFile === "contact_submission.json") {
    cleanOldSubmissions();
    if (import_fs.default.existsSync(SUBMISSIONS_FILE)) {
      res.download(SUBMISSIONS_FILE, "contact_submission.json");
    } else {
      res.setHeader("Content-Disposition", "attachment; filename=contact_submission.json");
      res.setHeader("Content-Type", "application/json");
      res.send(JSON.stringify(contactSubmissions, null, 2));
    }
  } else {
    res.status(404).json({ error: "The requested telemetry/support database file does not exist on disk." });
  }
});
app.post("/api/contact", apiLimiter, (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    res.status(400).json({ error: "Missing required fields: 'name', 'email', or 'message'." });
    return;
  }
  const newSubmission = {
    id: `msg-${Date.now()}`,
    name: name.substring(0, 100),
    email: email.substring(0, 150),
    message: message.substring(0, 1500),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  cleanOldSubmissions();
  contactSubmissions.unshift(newSubmission);
  if (contactSubmissions.length > 50) {
    contactSubmissions.pop();
  }
  try {
    import_fs.default.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(contactSubmissions, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write updated contact submissions to file:", err);
  }
  res.json({ success: true, message: "Support ticket registered successfully." });
});
app.post("/api/convert", convertLimiter, requireApiKey, async (req, res) => {
  const startTimestamp = Date.now();
  const { fileData, fileName, mimeType } = req.body;
  if (!fileData) {
    res.status(400).json({ error: "Required variable 'fileData' is missing. Please provide a base64 encoded document buffer." });
    return;
  }
  const safeFileName = fileName ? import_path.default.basename(fileName).replace(/[^\w.-]/g, "_") : "document";
  const fileExt = fileName ? import_path.default.extname(fileName).toLowerCase().substring(1) : "";
  const allowedExtensions = ["pdf", "docx"];
  if (!allowedExtensions.includes(fileExt)) {
    res.status(400).json({
      error: `Unsupported file extension (.${fileExt}). ConvertOneAI currently only supports parsing native Word (.docx) and PDF (.pdf) documents.`
    });
    return;
  }
  const base64Regex = /^[A-Za-z0-9+/=]+$/;
  const cleanedBase64 = fileData.replace(/\s/g, "");
  if (!base64Regex.test(cleanedBase64)) {
    res.status(400).json({ error: "Malformed payload error: 'fileData' contains non-base64 characters." });
    return;
  }
  const sizeBytes = Buffer.from(cleanedBase64, "base64").length;
  const fileSizeKb = sizeBytes / 1024;
  const MAX_FILE_SIZE_KB = 12 * 1024;
  if (fileSizeKb > MAX_FILE_SIZE_KB) {
    res.status(400).json({
      error: `File transmission blocked: Doc size (${(fileSizeKb / 1024).toFixed(1)}MB) exceeds the secure 12MB limit for volatile server processing.`
    });
    return;
  }
  try {
    let outputMarkdown = "";
    let actualMode = "classic";
    const buffer = Buffer.from(cleanedBase64, "base64");
    const isPDF = buffer.length > 4 && buffer[0] === 37 && buffer[1] === 80 && buffer[2] === 68 && buffer[3] === 70;
    const isDOCX = buffer.length > 4 && buffer[0] === 80 && buffer[1] === 75 && buffer[2] === 3 && buffer[3] === 4;
    if (!isPDF && !isDOCX) {
      res.status(400).json({ error: "Invalid file signature. The uploaded file is not a valid PDF or DOCX document." });
      return;
    }
    if (isPDF && fileExt !== "pdf") {
      res.status(400).json({ error: "File signature mismatch. Expected DOCX but found PDF." });
      return;
    }
    if (isDOCX && fileExt !== "docx") {
      res.status(400).json({ error: "File signature mismatch. Expected PDF but found DOCX." });
      return;
    }
    if (isPDF) {
      let pdfData;
      try {
        const parser = new import_pdf_parse.PDFParse({ data: buffer });
        pdfData = await parser.getText();
      } catch (pdfErr) {
        throw new Error(
          `Failed to parse PDF document: ${pdfErr.message || pdfErr}. This can happen if the file is encrypted, password-protected, or corrupted.`
        );
      }
      const text = pdfData.text || "";
      if (!text.trim()) {
        throw new Error(
          "Unreadable document content: No readable text was extracted from this PDF document. This often indicates the PDF contains image-only scans rather than native document text layers."
        );
      }
      const lines = text.split("\n").map((l) => l.trim());
      let inList = false;
      const formattedLines = lines.map((line) => {
        if (!line) return "";
        if (line.length < 60 && /^[A-Z0-9\s.,:-]{4,30}$/i.test(line)) {
          inList = false;
          return `
## ${line}
`;
        }
        if (line.startsWith("\u2022") || line.startsWith("-") || line.startsWith("*")) {
          inList = true;
          return `- ${line.substring(1).trim()}`;
        }
        if (inList) {
          inList = false;
          return `
${line}`;
        }
        return line;
      });
      outputMarkdown = `# Document: ${safeFileName || "Converted PDF"}

` + formattedLines.join("\n").replace(/\n{3,}/g, "\n\n");
    } else {
      let html = "";
      try {
        const result = await import_mammoth.default.convertToHtml({ buffer });
        html = result.value;
      } catch (docxErr) {
        throw new Error(
          `Failed to convert Word (.docx) document: ${docxErr.message || docxErr}. Please ensure the file is not corrupted, password-protected, or saved in an older binary .doc format.`
        );
      }
      const turndownService = new import_turndown.default({
        headingStyle: "atx",
        hr: "---",
        bulletListMarker: "-",
        codeBlockStyle: "fenced"
      });
      outputMarkdown = turndownService.turndown(html);
    }
    let cleanMarkdown = outputMarkdown.trim();
    const durationMs = Date.now() - startTimestamp;
    recordConversion(safeFileName || "unnamed_document", fileExt, fileSizeKb, actualMode, "success", durationMs);
    res.json({
      markdown: cleanMarkdown,
      modeUsed: actualMode,
      durationMs
    });
  } catch (error) {
    console.error("Conversion error details:", error);
    const durationMs = Date.now() - startTimestamp;
    recordConversion(safeFileName || "unnamed_document", fileExt, fileSizeKb, "classic", "failed", durationMs);
    res.status(500).json({
      error: error.message || "Failed to process the uploaded file. Please verify formatting and try again.",
      stack: process.env.NODE_ENV !== "production" ? error.stack : void 0
    });
  }
});
app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send(`User-agent: *
Allow: /
Sitemap: ${process.env.APP_URL || "https://convertoneai.com"}/sitemap.xml
`);
});
app.get("/sitemap.xml", (req, res) => {
  res.type("application/xml");
  const siteUrl = process.env.APP_URL || "https://convertoneai.com";
  const currentDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/word-to-markdown</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${siteUrl}/pdf-to-markdown</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${siteUrl}/markdown-guide</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${siteUrl}/blog</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${siteUrl}/faq</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${siteUrl}/about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`);
});
app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({ error: "Internal server error" });
});
function createApp() {
  return app;
}
async function startServer(port = DEFAULT_PORT) {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted successfully.");
  }
  const server = app.listen(port, "0.0.0.0", () => {
    console.log(`ConvertOneAI server listening on port ${port}`);
  });
  const shutdown = (signal) => {
    console.log(`Received ${signal}, shutting down gracefully.`);
    server.close(() => process.exit(0));
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
  return server;
}
if (process.env.NODE_ENV !== "test") {
  void startServer().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createApp,
  startServer
});
//# sourceMappingURL=server.cjs.map
