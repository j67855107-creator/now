import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import apiRoutes from "./server/routes/api";
import { DocumentTypeRegistry } from "./src/ai/registries/DocumentTypeRegistry";
import { PromptTemplateRegistry } from "./src/ai/registries/PromptTemplateRegistry";
import { ExportRegistry } from "./src/ai/registries/ExportRegistry";

// Only load .env locally. In Railway/production, env vars are injected by the platform.
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const app = express();

// Use Railway-provided PORT if available; never hardcode for container networking.
const PORT = parseInt(String(process.env.PORT ?? "")) || 3000;

app.disable("x-powered-by");
app.set("trust proxy", 1);

// --- Middleware Setup ---

// Security Middleware (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: false, // Handled by frontend or configured for API
    crossOriginEmbedderPolicy: false,
  })
);

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

// Configure CORS for frontend deployment on Vercel and the Railway backend
const isAllowedOrigin = (origin: string | undefined) => {
  if (!origin) return true;

  const explicit = [process.env.FRONTEND_URL].filter(Boolean) as string[];
  const local = ["http://localhost:5173", "http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:5173", "http://127.0.0.1:3000", "http://127.0.0.1:3001"];

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

// Enable gzip/Brotli compression for all text-based assets
app.use(compression());

// Body parsing with strict 50mb limit to handle document files securely
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Path configurations for persistent local storage files
const PERSIST_DIR =
  process.env.PERSIST_DIR ||
  path.join(process.cwd(), process.platform === "win32" ? "tmp" : "tmp");

if (!fs.existsSync(PERSIST_DIR)) {
  fs.mkdirSync(PERSIST_DIR, { recursive: true });
}
const SUBMISSIONS_FILE = path.join(PERSIST_DIR, "contact_submissions.json");
const STATS_FILE = path.join(PERSIST_DIR, "stats.json");

// --- Static File Serving (Production / Standalone Mode) ---
// In production, serve the Vite-built React frontend from the dist/ directory.
// In development, the frontend is served by Vite's dev server on port 5173.
const distPath = path.resolve(process.cwd(), "dist");
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction || fs.existsSync(distPath)) {
  console.log(`[Server] Serving static files from: ${distPath}`);
  app.use(express.static(distPath));
}

// Health check endpoint for Railway
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", service: "convertoneai-api", timestamp: new Date().toISOString() });
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", service: "convertoneai-api", timestamp: new Date().toISOString() });
});

// --- Initialize AI Registries ---
DocumentTypeRegistry.initialize();
PromptTemplateRegistry.initialize();
ExportRegistry.initialize();

// --- API Routes ---
app.use("/api", apiRoutes);

// --- SPA Fallback & Error Handling ---

// SPA fallback: for production/standalone mode, serve index.html for any
// non-API, non-asset request so that React Router can handle client-side routes.
const indexHtmlPath = path.resolve(distPath, "index.html");

if (isProduction || (fs.existsSync(distPath) && fs.existsSync(indexHtmlPath))) {
  console.log("[Server] SPA fallback registered");
  app.get("*", (_req: Request, res: Response) => {
    res.sendFile(indexHtmlPath);
  });
}

// A simple catch-all for 404s (only reached if no static/API/SPA route matched)
app.use((req: Request, res: Response) => {
  // If the request accepts HTML and we're in production, try the SPA fallback
  if ((isProduction || fs.existsSync(indexHtmlPath)) && req.accepts("html")) {
    return res.sendFile(indexHtmlPath);
  }
  res.status(404).json({ error: "Not Found" });
});

// A generic error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("[Server] Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// --- Server Activation ---

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
    console.log("[Server] Vite development middleware mounted successfully.");
  } else {
    console.log("[Server] Running in production mode without Vite middleware.");
  }

  const server = app.listen(runtimePort, "0.0.0.0", () => {
    console.log(`[Server] ConvertOneAI server listening on port ${runtimePort}`);
    console.log(`[Server] Persistence dir: ${PERSIST_DIR}`);
    console.log(`[Server] Admin login endpoint: POST /api${process.env.ADMIN_LOGIN_PATH || "/auth/admin/login"}`);
  });

  const shutdown = (signal: NodeJS.Signals) => {
    console.log(`[Server] Received ${signal}, shutting down gracefully.`);
    server.close(() => process.exit(0));
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  return server;
}

if (process.env.NODE_ENV !== "test") {
  void startServer().catch((error) => {
    console.error("[Server] Failed to start server:", error);
    process.exit(1);
  });
}

