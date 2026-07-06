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
var pdfParseNS = __toESM(require("pdf-parse"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_compression = __toESM(require("compression"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_helmet = __toESM(require("helmet"), 1);
var import_express_rate_limit = __toESM(require("express-rate-limit"), 1);
if (process.env.NODE_ENV !== "production") {
  import_dotenv.default.config();
}
var app = (0, import_express.default)();
var PORT = parseInt(String(process.env.PORT ?? "")) || 3e3;
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(
  (0, import_helmet.default)({
    contentSecurityPolicy: false,
    // Handled by frontend or configured for API
    crossOriginEmbedderPolicy: false
  })
);
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
  const explicit = [process.env.FRONTEND_URL].filter(Boolean);
  const local = ["http://localhost:5173", "http://localhost:3000"];
  if (explicit.includes(origin) || local.includes(origin)) return true;
  if (/https:\/\/.+\.vercel\.app$/i.test(origin)) return true;
  return false;
};
app.use(
  (0, import_cors.default)({
    origin: isAllowedOrigin,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-api-key"],
    credentials: true
  })
);
app.use((0, import_compression.default)());
app.use(import_express.default.json({ limit: "15mb" }));
app.use(import_express.default.urlencoded({ limit: "15mb", extended: true }));
var PERSIST_DIR = process.env.PERSIST_DIR || import_path.default.join(process.cwd(), process.platform === "win32" ? "tmp" : "tmp");
if (!import_fs.default.existsSync(PERSIST_DIR)) {
  import_fs.default.mkdirSync(PERSIST_DIR, { recursive: true });
}
var SUBMISSIONS_FILE = import_path.default.join(PERSIST_DIR, "contact_submissions.json");
var STATS_FILE = import_path.default.join(PERSIST_DIR, "stats.json");
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
    {
      id: "msg-1",
      name: "Marc Dupond",
      email: "marc.du@example.fr",
      message: "Bonjour! Do you support batch docx files in a single session?",
      timestamp: new Date(Date.now() - 1e3 * 60 * 120).toISOString()
    },
    {
      id: "msg-2",
      name: "Audrey Laurent",
      email: "audrey@creativecorp.com",
      message: "Is PDF formatting retained, especially bullet points and indented code blocks?",
      timestamp: new Date(Date.now() - 1e3 * 60 * 360).toISOString()
    }
  ];
  try {
    import_fs.default.mkdirSync(import_path.default.dirname(SUBMISSIONS_FILE), { recursive: true });
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
      {
        id: "log-1",
        fileName: "Q3_Strategic_Plan.docx",
        fileExt: "docx",
        fileSizeKb: 240,
        mode: "classic",
        status: "success",
        durationMs: 1250,
        timestamp: new Date(Date.now() - 1e3 * 60 * 18).toISOString()
      },
      {
        id: "log-2",
        fileName: "Financial_Report_v2.pdf",
        fileExt: "pdf",
        fileSizeKb: 1820,
        mode: "classic",
        status: "success",
        durationMs: 420,
        timestamp: new Date(Date.now() - 1e3 * 60 * 42).toISOString()
      },
      {
        id: "log-3",
        fileName: "Developer_Quickstart_Guide.pdf",
        fileExt: "pdf",
        fileSizeKb: 750,
        mode: "classic",
        status: "success",
        durationMs: 1610,
        timestamp: new Date(Date.now() - 1e3 * 60 * 125).toISOString()
      },
      {
        id: "log-4",
        fileName: "FAQ_Draft.docx",
        fileExt: "docx",
        fileSizeKb: 124,
        mode: "classic",
        status: "success",
        durationMs: 85,
        timestamp: new Date(Date.now() - 1e3 * 60 * 190).toISOString()
      }
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
      import_fs.default.writeFileSync(
        SUBMISSIONS_FILE,
        JSON.stringify(contactSubmissions, null, 2),
        "utf-8"
      );
    } catch (err) {
      console.error("Failed to write cleaned submissions to file:", err);
    }
  }
}
cleanOldSubmissions();
setInterval(cleanOldSubmissions, 60 * 60 * 1e3);
var stats = loadStats();
app.get("/", (req, res) => {
  res.status(200).type("text/plain").send("ConvertOneAI API is running. Check /api/health");
});
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "convertoneai-api",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "convertoneai-api",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
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
  const requestedFile = String(req.query.file || "").trim();
  if (!requestedFile) {
    res.status(400).json({ error: "Missing required 'file' query parameter." });
    return;
  }
  const allowedFiles = {
    "stats.json": STATS_FILE,
    "contact_submissions.json": SUBMISSIONS_FILE
  };
  const filePath = allowedFiles[requestedFile];
  if (!filePath) {
    res.status(400).json({
      error: "Unsupported file requested. Allowed values are 'stats.json' or 'contact_submissions.json'."
    });
    return;
  }
  if (!import_fs.default.existsSync(filePath)) {
    res.status(404).json({ error: `File not found: ${requestedFile}` });
    return;
  }
  res.download(filePath, requestedFile, (downloadError) => {
    if (downloadError) {
      console.error(`Failed to download ${requestedFile}:`, downloadError);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to download the requested file." });
      }
    }
  });
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
async function startServer(port = PORT) {
  const runtimePort = parseInt(String(process.env.PORT ?? "")) || port;
  const isRailway = Boolean(process.env.RAILWAY_PROJECT_ID || process.env.RAILWAY_SERVICE_ID || process.env.RAILWAY_ENVIRONMENT_NAME);
  const isDevelopment = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "dev" || !process.env.NODE_ENV && !isRailway;
  if (isDevelopment) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted successfully.");
  } else {
    console.log("Running in production mode without Vite middleware.");
  }
  const server = app.listen(runtimePort, "0.0.0.0", () => {
    console.log(`ConvertOneAI server listening on port ${runtimePort}`);
    console.log(`Persistence dir: ${PERSIST_DIR}`);
    console.log(`SUBMISSIONS_FILE: ${SUBMISSIONS_FILE}`);
    console.log(`STATS_FILE: ${STATS_FILE}`);
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
