# Pre-Deployment Production Audit Report — ConvertOneAI

**Audit Date:** June 2025  
**Auditor:** Staff Full-Stack Engineer / DevOps  
**Deployment Targets:** Frontend → Vercel, Backend → Railway  
**Node Version:** 22.12.0 (`.nvmrc`)

---

## Phase 1 — Project Understanding

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL (Frontend)                            │
│  React 19 + Vite 6 + Tailwind CSS 4 + TypeScript               │
│  ┌──────────────┐  ┌──────────┐  ┌──────────────────────────┐  │
│  │ App.tsx       │  │ Views:   │  │ AI Components:           │  │
│  │ - Routing     │  │ Home     │  │ - AIWorkspace            │  │
│  │ - File Upload │  │ Blog     │  │ - PromptGenerator        │  │
│  │ - Auth        │  │ Guide    │  │ - RAGExportPanel         │  │
│  │ - State Mgmt  │  │ Contact  │  │ - AISummaryPanel         │  │
│  └──────────────┘  │ About    │  │ - ExportCenter           │  │
│                     │ Privacy  │  └──────────────────────────┘  │
│                     │ Terms    │                                 │
│                     │ Admin    │                                 │
│                     └──────────┘                                 │
│  API calls → `API_BASE` (from VITE_API_URL)                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RAILWAY (Backend)                             │
│  Express 4 + TypeScript (compiled via esbuild)                   │
│                                                                  │
│  server.ts (Entry Point)                                         │
│  ├── Helmet (security headers)                                   │
│  ├── CORS (configured origins)                                   │
│  ├── express.json (50mb limit)                                   │
│  ├── express.static("dist") [production only]                    │
│  ├── /health endpoint                                            │
│  ├── /api/* routes (from api.ts)                                 │
│  │   ├── POST /auth/admin/login           → adminAuth.ts         │
│  │   ├── GET  /stats                      → statsService.ts      │
│  │   ├── POST /convert                    → convertController.ts │
│  │   ├── POST /contact                    → contactController.ts │
│  │   ├── POST /ai/* (clean, analyze, etc) → aiController.ts     │
│  │   └── GET  /admin/*                    → adminAuth midware    │
│  ├── SPA fallback (dist/index.html)                              │
│  └── 404 catch-all → JSON error                                  │
│                                                                  │
│  Services:                                                       │
│  ├── ProcessingPipeline (EventEmitter singleton)                 │
│  ├── CacheService (in-memory SHA256 TTL cache)                  │
│  ├── AnalyticsService (in-memory feature tracking)              │
│  ├── statsService (in-memory conversion logs)                   │
│  ├── emailService (nodemailer, optional SMTP)                   │
│  ├── DocumentCleanerService                                     │
│  ├── DocumentAnalyzerService                                    │
│  ├── PromptGeneratorService                                     │
│  ├── RAGExportService                                           │
│  └── AIExportService                                            │
└─────────────────────────────────────────────────────────────────┘
```

### Key Identifiers

| Component | Technology | Detail |
|---|---|---|
| Frontend | React 19 + Vite 6 | SPA with client-side routing via `viewMode` state (no React Router) |
| Backend | Express 4 + TypeScript | esbuild-compiled to CJS (`dist/server.cjs`) |
| Database | **None** | All data is in-memory (stats, analytics, cache) |
| Auth | JWT + bcrypt | Admin-only, single user from env vars |
| File Storage | **None** | Volatile in-memory processing only |
| Email | Nodemailer (SMTP) | Optional, Yahoo mail default |
| API Protocol | REST + JSON | Base64 file uploads |

---

## Phase 2 — Backend Audit

### ✅ Critical Issues (Must Fix Before Deployment)

#### CRITICAL-1: `server.ts` L51-56 — CORS debug `console.log` in production

**File:** `server.ts`, lines 31-56  
**Issue:** The CORS callback contains extensive `console.log` statements that will flood production logs with every single request, including origin checks. This is a **debug artifact** left from recent troubleshooting.

**Fix:** Remove all debug console.log calls from the CORS callback. Keep the logic but remove logging.

```typescript
// Replace L31-56 with:
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
```

#### CRITICAL-2: `server.ts` L69-83 — Debug console.log in production paths

**File:** `server.ts`, lines 74-78, 93-94  
**Issue:** `console.log("distPath:", ...)`, `console.log("dist exists:", ...)`, `console.log("SPA fallback registered")`, `console.log("Serving index.html")`, `console.log("404 handler reached for:")` — all are debug artifacts.

**Fix:** Remove all debug console.log calls. Use the existing `[Server]` prefix convention for production logs.

#### CRITICAL-3: `server.ts` — Missing async error handling wrappers

**File:** `server.ts`, L30-56  
**Issue:** The CORS middleware uses a custom `origin` function but does NOT have try-catch. The `callback(new Error("Not allowed by CORS"))` path is correct, but if any unexpected error occurs inside the callback, it will crash the server.

**Fix:** Wrap the origin callback in try-catch:
```typescript
app.use(cors({
  origin(origin, callback) {
    try {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    } catch (err) {
      return callback(err);
    }
  },
  credentials: true,
}));
```

#### CRITICAL-4: `server/routes/api.ts` — `/ai/analytics/track` route is dead / unreachable

**File:** `server/routes/api.ts`, L66  
**Issue:** The route `router.post("/ai/analytics/track", ...)` is defined under the `/api` prefix, making it accessible at `POST /api/ai/analytics/track`. However, the frontend never calls this endpoint — it uses `AnalyticsService` directly on the backend side. This route is **dead code** and should be removed or kept only if the frontend consumes it.

**Fix:** Remove the route:
```typescript
// Remove L66-68:
// router.post("/ai/analytics/track", apiLimiter, (req, res) => { res
