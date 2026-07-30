import express, { Request, Response, NextFunction } from "express";
import http from "http";
import cors from "cors";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import helmet from "helmet";
import compression from "compression";
import apiRoutes from "./server/routes/api";
import { DocumentTypeRegistry } from "./src/ai/registries/DocumentTypeRegistry";
import { PromptTemplateRegistry } from "./src/ai/registries/PromptTemplateRegistry";
import { ExportRegistry } from "./src/ai/registries/ExportRegistry";

// ---------------------------------------------------------------------------
// Environment & Configuration
// ---------------------------------------------------------------------------

// Only load .env locally. In Railway/production, env vars are injected by the platform.
const isProduction = process.env.NODE_ENV === "production";

if (!isProduction) {
  dotenv.config();
}

const app = express();

// Use Railway-provided PORT if available; never hardcode for container networking.
const PORT = parseInt(String(process.env.PORT ?? "")) || 3001;

app.disable("x-powered-by");
app.set("trust proxy", 1);

// ---------------------------------------------------------------------------
// Security Middleware
// ---------------------------------------------------------------------------

app.use(
  helmet({
    contentSecurityPolicy: false, // Handled by frontend or configured for API
    crossOriginEmbedderPolicy: false,
  })
);

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------

const isAllowedOrigin = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  if (!origin) return callback(null, true);

  const explicit = [process.env.FRONTEND_URL].filter(Boolean) as string[];
  const local = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
  ];

  if (explicit.includes(origin) || local.includes(origin)) return callback(null, true);
  if (/https:\/\/.+\.vercel\.app$/i.test(origin)) return callback(null, true);

  return callback(null, false);
};

app.use(
  cors({
    origin: isAllowedOrigin,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-api-key"],
    credentials: true,
  })
);

// ---------------------------------------------------------------------------
// Compression & Body Parsing
// ---------------------------------------------------------------------------

// Enable gzip/Brotli compression for all text-based assets
app.use(compression());

// Body parsing with strict 50mb limit to handle document files securely
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ---------------------------------------------------------------------------
// Persistent Storage Paths
// ---------------------------------------------------------------------------

const PERSIST_DIR =
  process.env.PERSIST_DIR ||
  path.join(process.cwd(), process.platform === "win32" ? "tmp" : "tmp");

if (!fs.existsSync(PERSIST_DIR)) {
  fs.mkdirSync(PERSIST_DIR, { recursive: true });
}

// ---------------------------------------------------------------------------
// Health Endpoints (must respond immediately, no middleware interference)
// ---------------------------------------------------------------------------

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "convertoneai-api",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "convertoneai-api",
    timestamp: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// Initialize AI Registries
// ---------------------------------------------------------------------------

DocumentTypeRegistry.initialize();
PromptTemplateRegistry.initialize();
ExportRegistry.initialize();

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------

app.use("/api", apiRoutes);

// ---------------------------------------------------------------------------
// Development vs Production Middleware
// ---------------------------------------------------------------------------
// Critical ordering rule:
//   Development: API → Vite middleware → 404 → Error
//   Production:  API → Express static dist/ → SPA fallback * → 404 → Error
// The two modes are MUTUALLY EXCLUSIVE. Never both active at the same time.

const distPath = path.resolve(process.cwd(), "dist");
const indexHtmlPath = path.resolve(distPath, "index.html");

if (isProduction) {
  // ---------------------------------------------------------------
  // PRODUCTION MODE: Express serves the built frontend from dist/
  // ---------------------------------------------------------------
  console.log(`[Server] Serving static files from: ${distPath}`);
  app.use(express.static(distPath));

  // SPA fallback: serve index.html for any non-API, non-asset request
  // so React Router can handle client-side routes.
  console.log("[Server] SPA fallback registered");
  app.get("*", (_req: Request, res: Response) => {
    res.sendFile(indexHtmlPath);
  });
} else {
  // ---------------------------------------------------------------
  // DEVELOPMENT MODE: Vite middleware handles all frontend requests
  // No dist/ static files, no Express SPA fallback.
  // Vite middleware is LAZILY mounted inside startServer() to allow
  // importing createApp() for testing without Vite.
  // ---------------------------------------------------------------
  console.log("[Server] Running in development mode. Vite middleware will be mounted on start.");
  app.use((req, res, next) => {
    if (app.locals.vite) {
      app.locals.vite(req, res, next);
    } else {
      next();
    }
  });
}

// ---------------------------------------------------------------------------
// 404 Handler (only reached if no route matched)
// ---------------------------------------------------------------------------

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

// ---------------------------------------------------------------------------
// Global Error Handler
// ---------------------------------------------------------------------------

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[Server] Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// ---------------------------------------------------------------------------
// Server Factory & Activator
// ---------------------------------------------------------------------------

export function createApp() {
  return app;
}

let serverStarted = false;

export async function startServer(port = PORT) {
  if (serverStarted) {
    console.warn("[Server] startServer() called more than once. Ignoring duplicate call.");
    return;
  }
  serverStarted = true;

  // Prefer Railway/runtime PORT if supplied.
  const runtimePort = parseInt(String(process.env.PORT ?? "")) || port;

  // ---------------------------------------------------------------
  // IMPORTANT: Bind the port FIRST, THEN create Vite.
  // If port binding fails (EADDRINUSE), we reject and exit BEFORE
  // Vite is ever created, preventing HMR port (24680) leaks.
  // ---------------------------------------------------------------
  const server: http.Server = await new Promise((resolve, reject) => {
    const srv = app.listen(runtimePort, () => {
      resolve(srv);
    });
    srv.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        console.error(
          `[Server] FATAL: Port ${runtimePort} is already in use. ` +
          "Is another instance already running?\n" +
          `  Kill it with: taskkill /F /PID <PID>\n` +
          `  Find it with:  netstat -ano | findstr :${runtimePort}`
        );
      } else {
        console.error(`[Server] FATAL: Failed to listen on port ${runtimePort}:`, err.message);
      }
      reject(err);
    });
  });

  // ---------------------------------------------------------------
  // Only now that we own the port, start Vite in development mode.
  // If Vite creation fails, close the server and exit.
  // ---------------------------------------------------------------
  if (!isProduction) {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.locals.vite = vite.middlewares;
      console.log("[Server] Vite development middleware mounted successfully.");
    } catch (viteErr) {
      console.error("[Server] FATAL: Failed to create Vite dev server:", viteErr);
      server.close();
      process.exit(1);
    }
  }

  console.log(`[Server] ConvertOneAI server listening on port ${runtimePort}`);
  console.log(`[Server] Persistence dir: ${PERSIST_DIR}`);
  console.log(
    `[Server] Admin login endpoint: POST /api${process.env.ADMIN_LOGIN_PATH || "/auth/admin/login"}`
  );

  const shutdown = (signal: NodeJS.Signals) => {
    console.log(`[Server] Received ${signal}, shutting down gracefully.`);
    serverStarted = false;
    server.close(() => process.exit(0));
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  return server;
}

// ---------------------------------------------------------------------------
// Auto-start (only when not in test)
// ---------------------------------------------------------------------------

if (process.env.NODE_ENV !== "test") {
  void startServer().catch((error) => {
    console.error("[Server] Failed to start server:", error);
    process.exit(1);
  });
}
