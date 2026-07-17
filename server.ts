import express, { NextFunction, Request, Response } from "express";
import path from "path";
import mammoth from "mammoth";
import TurndownService from "turndown";
import * as pdfParseNS from "pdf-parse";


import dotenv from "dotenv";
import fs from "fs";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Only load .env locally. In Railway/production, env vars are injected by the platform.
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const app = express();

// Use Railway-provided PORT if available; never hardcode for container networking.
const PORT = parseInt(String(process.env.PORT ?? "")) || 3000;


app.disable("x-powered-by");
app.set("trust proxy", 1);

// Security Middleware (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: false, // Handled by frontend or configured for API
    crossOriginEmbedderPolicy: false,
  })
);

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
const convertLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 conversions per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Conversion limit reached. Please try again later." },
});

// Enable CORS for frontend deployment on Vercel and the Railway backend
const isAllowedOrigin = (origin: string | undefined) => {
  if (!origin) return true;

  const explicit = [process.env.FRONTEND_URL].filter(Boolean) as string[];
  const local = ["http://localhost:5173", "http://localhost:3000"];

  // Allow the exact Vercel URL AND any subdomain under vercel.app
  // e.g. https://foo.vercel.app and https://bar.foo.vercel.app
  if (explicit.includes(origin) || local.includes(origin)) return true;
  if (/https:\/\/.+\.vercel\.app$/i.test(origin)) return true;

  return false;
};


app.use(
  cors({
    origin: isAllowedOrigin,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-api-key"],
    credentials: true,
  })
);

// Enable gzip/Brotli compression for all text-based assets to satisfy GTmetrix/PageSpeed
app.use(compression());

// Body parsing with strict 15mb limit to handle document files securely
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Path configurations for persistent local storage files
// In many container environments process.cwd() may be read-only. Never allow
// persistence failures to crash startup.
const PERSIST_DIR =
  process.env.PERSIST_DIR || 
  path.join(process.cwd(), process.platform === "win32" ? "tmp" : "tmp");


if (!fs.existsSync(PERSIST_DIR)) {
  fs.mkdirSync(PERSIST_DIR, { recursive: true });
}
const SUBMISSIONS_FILE = path.join(PERSIST_DIR, "contact_submissions.json");
const STATS_FILE = path.join(PERSIST_DIR, "stats.json");

// pdf-parse default export is callable: pdfParse(buffer)
// (esbuild + CJS/ESM interop can otherwise break the constructor-style usage)
// pdf-parse is loaded via default export (callable): pdfParse(buffer)
// If bundling/interop changes, this keeps the reference alive for tree-shaking.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _pdfParseType = (pdfParseNS as any).default || (pdfParseNS as any);



// Analytics and Metrics State (In-memory persistent log for the session)

// API Key Protection Middleware
const requireApiKey = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const allowedKey = process.env.API_PROTECTION_KEY || "WN3FBAF2GYF";
  const apiKey = req.headers["x-api-key"] || req.query.api_key;
  if (apiKey === allowedKey) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized: Invalid API Key" });
  }
};

interface ConversionLog {
  id: string;
  fileName: string;
  fileExt: string;
  fileSizeKb: number;
  mode: "classic";
  status: "success" | "failed";
  durationMs: number;
  timestamp: string;
}

interface SupportSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
}

// Loads submissions persistently from a file, creating default values if it doesn't exist
function loadSubmissions(): SupportSubmission[] {
  try {
    if (fs.existsSync(SUBMISSIONS_FILE)) {
      const data = fs.readFileSync(SUBMISSIONS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    // Never crash startup due to telemetry persistence failures.
    console.error("Failed to load support submissions from file:", err);
  }

  // Default fallback data
  const defaults: SupportSubmission[] = [
    {
      id: "msg-1",
      name: "Marc Dupond",
      email: "marc.du@example.fr",
      message: "Bonjour! Do you support batch docx files in a single session?",
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      id: "msg-2",
      name: "Audrey Laurent",
      email: "audrey@creativecorp.com",
      message:
        "Is PDF formatting retained, especially bullet points and indented code blocks?",
      timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    },
  ];

  try {
    fs.mkdirSync(path.dirname(SUBMISSIONS_FILE), { recursive: true });
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(defaults, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write initial submissions file:", err);
  }

  return defaults;
}

// Loads statistics persistently from a file, creating default values if it doesn't exist
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
        timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      },
      {
        id: "log-2",
        fileName: "Financial_Report_v2.pdf",
        fileExt: "pdf",
        fileSizeKb: 1820,
        mode: "classic",
        status: "success",
        durationMs: 420,
        timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
      },
      {
        id: "log-3",
        fileName: "Developer_Quickstart_Guide.pdf",
        fileExt: "pdf",
        fileSizeKb: 750,
        mode: "classic",
        status: "success",
        durationMs: 1610,
        timestamp: new Date(Date.now() - 1000 * 60 * 125).toISOString(),
      },
      {
        id: "log-4",
        fileName: "FAQ_Draft.docx",
        fileExt: "docx",
        fileSizeKb: 124,
        mode: "classic",
        status: "success",
        durationMs: 85,
        timestamp: new Date(Date.now() - 1000 * 60 * 190).toISOString(),
      },
    ] as ConversionLog[],
  };

  try {
    if (fs.existsSync(STATS_FILE)) {
      const data = fs.readFileSync(STATS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Failed to load stats from file:", err);
  }

  try {
    fs.writeFileSync(STATS_FILE, JSON.stringify(defaultStats, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write initial stats file:", err);
  }

  return defaultStats;
}

const contactSubmissions: SupportSubmission[] = loadSubmissions();

function cleanOldSubmissions() {
  const now = Date.now();
  const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;

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
      fs.writeFileSync(
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
setInterval(cleanOldSubmissions, 60 * 60 * 1000);

const stats = loadStats();

function recordConversion(
  fileName: string,
  fileExt: string,
  fileSizeKb: number,
  mode: "classic",
  status: "success" | "failed",
  durationMs: number
) {
  stats.totalConversions += 1;
  if (status === "success") {
    stats.totalSizeKb += Math.round(fileSizeKb);
    stats.classicConversions += 1;
  }

  const logCount = stats.recentLogs.length;
  stats.averageDurationMs = Math.round(
    (stats.averageDurationMs * logCount + durationMs) / (logCount + 1)
  );

  const newLog: ConversionLog = {
    id: `log-${Date.now()}`,
    fileName,
    fileExt,
    fileSizeKb: Math.round(fileSizeKb * 10) / 10,
    mode,
    status,
    durationMs,
    timestamp: new Date().toISOString(),
  };

  stats.recentLogs.unshift(newLog);
  if (stats.recentLogs.length > 50) {
    stats.recentLogs.pop();
  }

  try {
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write updated stats to file:", err);
  }
}

app.get("/", (req: Request, res: Response) => {
  res.status(200).type("text/plain").send("ConvertOneAI API is running. Check /api/health");
});

app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "convertoneai-api",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "convertoneai-api",
    timestamp: new Date().toISOString(),
  });
});


app.get("/api/stats", apiLimiter, requireApiKey, (req: Request, res: Response) => {
  cleanOldSubmissions();
  res.json({
    ...stats,
    contactSubmissions,
  });
});

app.post("/api/convert", convertLimiter, async (req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    const { fileData, fileName, mimeType, mode } = req.body;

    if (!fileData || !fileName) {
      return res.status(400).json({
        error: "Missing file data or file name",
      });
    }

    const buffer = Buffer.from(fileData, "base64");

    let markdown = "";

    // Word DOCX conversion
    if (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.toLowerCase().endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({
        buffer,
      });

      const turndown = new TurndownService();

      markdown = turndown.turndown(result.value);
    }

    // PDF conversion
    else if (
      mimeType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")
    ) {
      const pdfParse = (pdfParseNS as any).default || (pdfParseNS as any);

      const data = await pdfParse(buffer);

      markdown = data.text;
    } else {
      return res.status(400).json({
        error: "Unsupported file type",
      });
    }

    const durationMs = Date.now() - startTime;

    res.json({
      markdown,
      modeUsed: mode || "classic",
      durationMs,
      warning: null,
    });
  } catch (error: any) {
    console.error("Conversion error:", error);

    res.status(500).json({
      error: "Failed to convert document",
    });
  }
});

app.get("/api/admin/download", apiLimiter, (req: Request, res: Response) => {
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

  const allowedFiles: Record<string, string> = {
    "stats.json": STATS_FILE,
    "contact_submissions.json": SUBMISSIONS_FILE,
  };

  const filePath = allowedFiles[requestedFile];
  if (!filePath) {
    res.status(400).json({
      error: "Unsupported file requested. Allowed values are 'stats.json' or 'contact_submissions.json'.",
    });
    return;
  }

  if (!fs.existsSync(filePath)) {
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


// Dynamic SEO files serving
app.get("/robots.txt", (req: Request, res: Response) => {
  res.type("text/plain");
  res.send(`User-agent: *
Allow: /
Sitemap: ${process.env.APP_URL || "https://convertoneai.com"}/sitemap.xml
`);
});

app.get("/sitemap.xml", (req: Request, res: Response) => {
  res.type("application/xml");
  const siteUrl = process.env.APP_URL || "https://convertoneai.com";
  const currentDate = new Date().toISOString().split("T")[0];
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

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

export function createApp() {
  return app;
}

export async function startServer(port = PORT) {
  // Prefer Railway/runtime PORT if supplied.
  const runtimePort = parseInt(String(process.env.PORT ?? "")) || port;

  const isRailway = Boolean(process.env.RAILWAY_PROJECT_ID || process.env.RAILWAY_SERVICE_ID || process.env.RAILWAY_ENVIRONMENT_NAME);
  const isDevelopment = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "dev" || (!process.env.NODE_ENV && !isRailway);


  if (isDevelopment) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
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

  const shutdown = (signal: NodeJS.Signals) => {
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
