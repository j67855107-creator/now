# Refactoring Plan for server.ts

## ✅ 7 Items to Implement

- [x] 1. Consolidate `isProduction` into single authoritative source of truth
- [x] 2. Remove `fs.existsSync(distPath)` from static file condition — only serve `dist/` in production
- [x] 3. Remove `fs.existsSync(indexHtmlPath)` from SPA fallback — only register `*` in production
- [x] 4. Reorder middleware: Health first → API → Vite (dev) or Static+SPA (prod) → 404 → Error
- [x] 5. Remove unused `apiLimiter` from server.ts (the one in api.ts is used)
- [x] 6. Simplify 404 handler — remove duplicate SPA fallback logic
- [x] 7. Remove dead code

## 🔒 Preserved (per user feedback)

- [x] Keep `createApp()` and `startServer()` as exports
- [x] Keep `if (NODE_ENV !== "test")` auto-start pattern
- [x] Add defensive `serverStarted` flag (not as EADDRINUSE mask)
- [x] All existing API endpoints preserved
- [x] All features kept unless incorrect

## 🧪 Testing

- [x] `curl http://localhost:3000/health` — responds immediately
- [x] `curl http://localhost:3000/api/health` — responds immediately
- [x] Development mode: no `dist/` serving, Vite on 5173
- [x] Production mode: `dist/` served, SPA fallback active

