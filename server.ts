import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import mfromNode from "mammoth";
import TurndownService from "turndown";
import { PDFParse } from "pdf-parse";
import dotenv from "dotenv";
import fs from "fs";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
const PORT = 3000;

// Security Middleware (Helmet)
app.use(helmet({
  contentSecurityPolicy: false, // Handled by frontend or configured for API
  crossOriginEmbedderPolicy: false,
}));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." }
});
const convertLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 conversions per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Conversion limit reached. Please try again later." }
});

// Enable CORS for frontend deployment on Vercel
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"]
  : "*";

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-api-key"]
}));

// Enable gzip/Brotli compression for all text-based assets to satisfy GTmetrix/PageSpeed
app.use(compression());

// Body parsing with strict 15mb limit to handle document files securely
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Path configurations for persistent local storage files
const SUBMISSIONS_FILE = path.join(process.cwd(), "contact_submissions.json");
const STATS_FILE = path.join(process.cwd(), "stats.json");

// Analytics and Metrics State (In-memory persistent log for the session)
// API Key Protection Middleware
const requireApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
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
    console.error("Failed to load support submissions from file:", err);
  }
  
  // Default fallback data
  const defaults: SupportSubmission[] = [
    { id: "msg-1", name: "Marc Dupond", email: "marc.du@example.fr", message: "Bonjour! Do you support batch docx files in a single session?", timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
    { id: "msg-2", name: "Audrey Laurent", email: "audrey@creativecorp.com", message: "Is PDF formatting retained, especially bullet points and indented code blocks?", timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString() }
  ];
  
  try {
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
      { id: "log-1", fileName: "Q3_Strategic_Plan.docx", fileExt: "docx", fileSizeKb: 240, mode: "classic", status: "success", durationMs: 1250, timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString() },
      { id: "log-2", fileName: "Financial_Report_v2.pdf", fileExt: "pdf", fileSizeKb: 1820, mode: "classic", status: "success", durationMs: 420, timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString() },
      { id: "log-3", fileName: "Developer_Quickstart_Guide.pdf", fileExt: "pdf", fileSizeKb: 750, mode: "classic", status: "success", durationMs: 1610, timestamp: new Date(Date.now() - 1000 * 60 * 125).toISOString() },
      { id: "log-4", fileName: "FAQ_Draft.docx", fileExt: "docx", fileSizeKb: 124, mode: "classic", status: "success", durationMs: 85, timestamp: new Date(Date.now() - 1000 * 60 * 190).toISOString() }
    ] as ConversionLog[]
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
      fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(contactSubmissions, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to write cleaned submissions to file:", err);
    }
  }
}

// Initial cleanup
cleanOldSubmissions();
// Periodic cleanup every hour
setInterval(cleanOldSubmissions, 60 * 60 * 1000);

const stats = loadStats();

function recordConversion(fileName: string, fileExt: string, fileSizeKb: number, mode: "classic", status: "success" | "failed", durationMs: number) {
  stats.totalConversions += 1;
  if (status === "success") {
    stats.totalSizeKb += Math.round(fileSizeKb);
    stats.classicConversions += 1;
  }
  
  // Update average duration
  const logCount = stats.recentLogs.length;
  stats.averageDurationMs = Math.round(((stats.averageDurationMs * logCount) + durationMs) / (logCount + 1));

  // Add new log to start
  const newLog: ConversionLog = {
    id: `log-${Date.now()}`,
    fileName,
    fileExt,
    fileSizeKb: Math.round(fileSizeKb * 10) / 10,
    mode,
    status,
    durationMs,
    timestamp: new Date().toISOString()
  };

  stats.recentLogs.unshift(newLog);
  if (stats.recentLogs.length > 50) {
    stats.recentLogs.pop();
  }

  // Persist updated stats state
  try {
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write updated stats to file:", err);
  }
}

// JSON endpoint for analytics stats
app.get("/api/stats", apiLimiter, requireApiKey, (req: Request, res: Response) => {
  // Call cleanup before returning
  cleanOldSubmissions();
  res.json({
    ...stats,
    contactSubmissions
  });
});

// Universal secure download endpoint for key administrators
app.get("/api/admin/download", apiLimiter, (req: Request, res: Response) => {
  const allowedKey = process.env.API_PROTECTION_KEY || "WN3FBAF2GYF";
  const apiKey = req.headers["x-api-key"] || req.query.api_key;
  if (apiKey !== allowedKey) {
    res.status(401).json({ error: "Unauthorized: Invalid API Key" });
    return;
  }

  const requestedFile = req.query.file as string;
  if (!requestedFile) {
    res.status(400).json({ error: "Missing required 'file' query parameter." });
    return;
  }

  if (requestedFile === "stats.json") {
    if (fs.existsSync(STATS_FILE)) {
      res.download(STATS_FILE, "stats.json");
    } else {
      res.setHeader("Content-Disposition", "attachment; filename=stats.json");
      res.setHeader("Content-Type", "application/json");
      res.send(JSON.stringify(stats, null, 2));
    }
  } else if (requestedFile === "contact_submissions.json" || requestedFile === "contact_submission.json") {
    cleanOldSubmissions();
    if (fs.existsSync(SUBMISSIONS_FILE)) {
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

// Create Contact/Support Submit Endpoint
app.post("/api/contact", apiLimiter, (req: Request, res: Response) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    res.status(400).json({ error: "Missing required fields: 'name', 'email', or 'message'." });
    return;
  }

  const newSubmission: SupportSubmission = {
    id: `msg-${Date.now()}`,
    name: name.substring(0, 100),
    email: email.substring(0, 150),
    message: message.substring(0, 1500),
    timestamp: new Date().toISOString()
  };

  cleanOldSubmissions();
  contactSubmissions.unshift(newSubmission);
  
  // Throttle state size
  if (contactSubmissions.length > 50) {
    contactSubmissions.pop();
  }

  // Persist support submissions to file
  try {
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(contactSubmissions, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write updated contact submissions to file:", err);
  }

  res.json({ success: true, message: "Support ticket registered successfully." });
});

// Main Convert Endpoint
app.post("/api/convert", convertLimiter, requireApiKey, async (req: Request, res: Response): Promise<void> => {
  const startTimestamp = Date.now();
  const { fileData, fileName, mimeType } = req.body;

  if (!fileData) {
    res.status(400).json({ error: "Required variable 'fileData' is missing. Please provide a base64 encoded document buffer." });
    return;
  }

  // Sanitize the file name to avoid path redirection or manipulation
  const safeFileName = fileName ? path.basename(fileName).replace(/[^\w.-]/g, "_") : "document";
  const fileExt = fileName ? path.extname(fileName).toLowerCase().substring(1) : "";

  // 1. Strict File extension validation
  const allowedExtensions = ["pdf", "docx"];
  if (!allowedExtensions.includes(fileExt)) {
    res.status(400).json({ 
      error: `Unsupported file extension (.${fileExt}). ConvertOneAI currently only supports parsing native Word (.docx) and PDF (.pdf) documents.` 
    });
    return;
  }

  // 2. Base64 payload validation
  const base64Regex = /^[A-Za-z0-9+/=]+$/;
  const cleanedBase64 = fileData.replace(/\s/g, "");
  if (!base64Regex.test(cleanedBase64)) {
    res.status(400).json({ error: "Malformed payload error: 'fileData' contains non-base64 characters." });
    return;
  }

  // 3. Strict 12MB size limit to avoid Heap crashes or memory exhaust attacks
  const sizeBytes = Buffer.from(cleanedBase64, 'base64').length;
  const fileSizeKb = sizeBytes / 1024;
  const MAX_FILE_SIZE_KB = 12 * 1024; // 12MB limit

  if (fileSizeKb > MAX_FILE_SIZE_KB) {
    res.status(400).json({ 
      error: `File transmission blocked: Doc size (${(fileSizeKb / 1024).toFixed(1)}MB) exceeds the secure 12MB limit for volatile server processing.` 
    });
    return;
  }

  try {
    let outputMarkdown = "";
    let actualMode: "classic" = "classic";

    const buffer = Buffer.from(cleanedBase64, "base64");

    // 4. File Signature (Magic Number) Validation
    const isPDF = buffer.length > 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46; // %PDF
    const isDOCX = buffer.length > 4 && buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04; // PK..

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
      // Classic PDF conversion
      let pdfData;
      try {
        const parser = new PDFParse({ data: buffer });
        pdfData = await parser.getText();
      } catch (pdfErr: any) {
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
      
      // Let's format the plain text basic styling for classic route
      const lines = text.split("\n").map(l => l.trim());
      let inList = false;
      const formattedLines = lines.map((line) => {
        if (!line) return "";
        // Guess headings
        if (line.length < 60 && /^[A-Z0-9\s.,:-]{4,30}$/i.test(line)) {
          inList = false;
          return `\n## ${line}\n`;
        }
        // Guess lists
        if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
          inList = true;
          return `- ${line.substring(1).trim()}`;
        }
        if (inList) {
          inList = false;
          return `\n${line}`;
        }
        return line;
      });
      
      outputMarkdown = `# Document: ${safeFileName || "Converted PDF"}\n\n` + formattedLines.join("\n").replace(/\n{3,}/g, "\n\n");
    } else {
      // Classic Word (.docx) conversion
      let html = "";
      try {
        const result = await mfromNode.convertToHtml({ buffer });
        html = result.value;
      } catch (docxErr: any) {
        throw new Error(
          `Failed to convert Word (.docx) document: ${docxErr.message || docxErr}. Please ensure the file is not corrupted, password-protected, or saved in an older binary .doc format.`
        );
      }
      
      const turndownService = new TurndownService({
        headingStyle: "atx",
        hr: "---",
        bulletListMarker: "-",
        codeBlockStyle: "fenced"
      });

      outputMarkdown = turndownService.turndown(html);
    }

    // Dynamic clean-up
    let cleanMarkdown = outputMarkdown.trim();

    const durationMs = Date.now() - startTimestamp;
    recordConversion(safeFileName || "unnamed_document", fileExt, fileSizeKb, actualMode, "success", durationMs);

    res.json({
      markdown: cleanMarkdown,
      modeUsed: actualMode,
      durationMs
    });

  } catch (error: any) {
    console.error("Conversion error details:", error);
    const durationMs = Date.now() - startTimestamp;
    recordConversion(safeFileName || "unnamed_document", fileExt, fileSizeKb, "classic", "failed", durationMs);

    res.status(500).json({
      error: error.message || "Failed to process the uploaded file. Please verify formatting and try again.",
      stack: process.env.NODE_ENV !== "production" ? error.stack : undefined
    });
  }
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

// Setup Vite Dev Server / Static files handler
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted successfully.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, {
      maxAge: "1y",
      immutable: true,
      setHeaders: (res, path) => {
        if (path.endsWith(".html")) {
          // Do not cache html files to ensure instant delivery of updates
          res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
        } else {
          // Cache js, css, images, fonts and media of content-hash names for 1 year
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      }
    }));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static handler mounted for /dist with advanced HTTP caching headers.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ConvertOneAI server listening on port ${PORT}`);
  });
}

startServer();
