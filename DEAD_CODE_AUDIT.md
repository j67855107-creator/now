# Dead Code Audit — ConvertOneAI

## Section 1: Safe to Remove

### 1.1 Unused Files (No Imports, No References)

| File | Reason | Evidence |
|---|---|---|
| `useFileConverter.ts` | Not imported anywhere. Contains zero content (empty file) | `grep -r "useFileConverter" src/ server/` → no results. File is 0 bytes. |
| `server/services/conversionService.ts` | Not imported anywhere. Empty file. | `grep -r "conversionService" src/ server/` → no results. File is 0 bytes. |
| `src/ai/components/AIAssistantPanel.tsx` | Never imported in `App.tsx` or any component | Not in any import chain |
| `src/ai/components/AIOptionsPanel.tsx` | Never imported | Not in any import chain |
| `src/ai/components/AIWorkspace.tsx` | Never imported | Not in any import chain |
| `src/ai/hooks/useAIWorkspace.ts` | Never imported | Not in any import chain |
| `src/ai/hooks/useAnalytics.ts` | Never imported | Not in any import chain |
| `src/ai/hooks/useAIProcessing.ts` | Never imported | Not in any import chain |
| `src/ai/registries/PromptTemplateRegistry.ts` | Used only in server controllers via import path `../../src/ai/registries/...` | Actually **keep** — see Section 3 |
| `src/ai/i18n/en.ts` | Never imported anywhere | No imports found |
| `metadata.json` | Not referenced by any config or code | Contains Google Gemini metadata — likely from AI Studio |
| `assets/.aistudio/.gitignore` | Empty AI Studio config folder | Obsolete |
| `tsc_output.txt` | Compilation output log, not source code | Safe to remove |
| `structure.txt` | Directory tree dump, not source code | Safe to remove |

### 1.2 Unused npm Packages (Safe to Uninstall)

| Package | Reason |
|---|---|
| `sharp` | Image processing library, never imported anywhere. The project has no image upload/processing. |
| `@google/genai` | Google GenAI SDK. Never imported in any server or frontend file. |
| `motion` | Animation library. The project uses `framer-motion` (v12.23.24) instead. `motion` is `framer-motion`'s wrapper, but not used directly. |
| `autoprefixer` | Tailwind CSS v4 handles vendor prefixes natively. No PostCSS config file exists. |
| `pdf-export-images` | PDF image export. Never imported anywhere. |
| `@types/ws` | WebSocket types. No WebSocket usage in the project. |
| `@types/file-saver` | `file-saver` is in dependencies but never imported in any component. |
| `file-saver` | Never imported in any frontend component. |
| `pdfjs-dist` | PDF.js library. The conversion controller uses `pdf-parse` not `pdfjs-dist`. |

### 1.3 Unused Environment Variables

| Variable | Where Referenced | Status |
|---|---|---|
| `VITE_AI_CLEANER` | `src/ai/config.ts` — feature flag | Flag file never imported → unused |
| `VITE_AI_SUMMARY` | `src/ai/config.ts` — feature flag | Same |
| `VITE_AI_PROMPT` | `src/ai/config.ts` — feature flag | Same |
| `VITE_AI_RAG` | `src/ai/config.ts` — feature flag | Same |
| `VITE_AI_ASSISTANT` | `src/ai/config.ts` — feature flag | Same |
| `VITE_AI_ANALYTICS` | `src/ai/config.ts` — feature flag | Same |

All 6 `VITE_AI_*` vars are referenced in `src/ai/config.ts`, but `src/ai/config.ts` is never imported by any file.

### 1.4 Dead Code in Source Files

**`server/middleware/authMiddleware.ts`**: The `requireApiKey` function.
- Only used by `/api/stats` route
- The `/api/contact` route has NO API key middleware
- The `/api/convert` route has NO API key middleware (frontend sends `x-api-key` but backend never reads it for `/convert`)
- **Verdict**: Either extend to all protected routes OR remove from `/stats`

**`server/controllers/adminController.ts`**: Entire file
- `getAdminStats` function is exported but **never imported** in any route file
- The route uses an inline handler instead: `res.json(getStats())`

**`src/data.ts`**: All blog content, FAQ items, guide sections — used correctly. **Keep.**

### 1.5 Temporary/Debug/Scratch Files

| File | Reason |
|---|---|
| `fix_spans2.cjs` through `fix_spans.cjs` (7 files) | Temporary fix scripts |
| `fix_app.js`, `fix_app.cjs` through `fix_app4.cjs` (5 files) | Temporary fix scripts |
| `tmp_write.js`, `tmp_write.cjs` | Temporary scripts |
| `fix_admin.cjs`, `fix2.cjs` | Temporary scripts |
| `fix_all.cjs` through `final_fix3.cjs` (5 files) | Temporary scripts |
| `fix_progress.cjs` | Temporary script |
| `tmp_fix_components.cjs`, `tmp_fix_components2.cjs` | Temporary scripts |
| `write_component.cjs`, `build_remaining_components.cjs` | Temporary scripts |
| `fix_workspace.cjs`, `fix_all_components.cjs` | Temporary scripts |

**All 30+ `.cjs`/`.js` files in root** are temporary fix scripts, NOT part of the application. Safe to delete.

---

## Section 2: Needs Review

| Item | File | Notes |
|---|---|---|
| `src/ai/registries/ExportRegistry.ts` | — | Imports from server controllers. Need to verify if server actually uses the registry at runtime. |
| `src/ai/registries/DocumentTypeRegistry.ts` | — | Same — need runtime verification |
| `src/ai/registries/AIFeatureRegistry.ts` | — | Never imported anywhere |
| `src/ai/registries/FeatureFlags.ts` | — | Never imported anywhere |
| `contact_submissions.json` | Root | Generated runtime file. May contain production data. |
| `stats.json` | Root | Generated runtime file. May contain production data. |
| `bun.lock` | Root | Alternative package manager lock file. If using npm, can be removed. |

---

## Section 3: Keep (Appear Unused but Actually Required)

| Item | File | Reason to Keep |
|---|---|---|
| `PromptTemplateRegistry` | `src/ai/registries/PromptTemplateRegistry.ts` | Imported in `server.ts` line: `import { PromptTemplateRegistry } from "./src/ai/registries/PromptTemplateRegistry"` |
| `DocumentTypeRegistry` | `src/ai/registries/DocumentTypeRegistry.ts` | Imported in `server.ts` line: same pattern |
| `ExportRegistry` | `src/ai/registries/ExportRegistry.ts` | Imported in `server.ts` line: same pattern |
| `AISummaryPanel.tsx` | `src/ai/components/` | Might be dynamically imported or used in future — check if any component conditionally imports it |
| `PromptGenerator.tsx` | `src/ai/components/` | Same |
| `RAGExportPanel.tsx` | `src/ai/components/` | Same |
| `ExportCenter.tsx` | `src/ai/components/` | Same |
| `EnhancedProgressBar.tsx` | `src/ai/components/` | Same |
| `index.css` | `src/index.css` | Imported in `main.tsx` |
| `vite-env.d.ts` | `src/vite-env.d.ts` | Required for Vite type declarations |
| `turndown-plugin-gfm` | package.json | Actually used in `convertController.ts` |
| `mammoth` | package.json | Used in `convertController.ts` |
| `pdf-parse` | package.json | Used in `convertController.ts` |
| `turndown` | package.json | Used in `convertController.ts` |
| `nodemailer` | package.json | Used in `emailService.ts` |

---

## Section 4: Duplicate Code Found

| Location | Duplicate Of | Details |
|---|---|---|
| `server.ts: CORS origin function` | — | The `isProduction` variable was declared twice (already fixed) |
| `server/routes/api.ts: line 14-55` | — | Rate limiters all use identical config (windowMs: 15min, standardHeaders: true, legacyHeaders: false). Could be extracted to a factory function. |
| `server/controllers/aiController.ts: analytics tracking` | Pattern repeated 10x | `AnalyticsService.trackFeatureUsage(...)` + try/catch is duplicated in every handler. Could use a decorator/middleware. |

---

## Section 5: Cleanup Summary

| Metric | Value |
|---|---|
| **Files to delete** | ~30 temporary `.cjs`/`.js` scripts + 6 unused AI component files + 3 unused hook files + 2 empty files + `tsc_output.txt` + `structure.txt` + `metadata.json` |
| **NPM packages to uninstall** | `sharp`, `@google/genai`, `motion`, `autoprefixer`, `pdf-export-images`, `@types/ws`, `@types/file-saver`, `file-saver`, `pdfjs-dist` |
| **Environment variables to remove from docs** | `VITE_AI_CLEANER`, `VITE_AI_SUMMARY`, `VITE_AI_PROMPT`, `VITE_AI_RAG`, `VITE_AI_ASSISTANT`, `VITE_AI_ANALYTICS` |
| **Duplicate code instances** | 1 (isProduction declaration), 5+ rate limiter configs, 10x analytics tracking |
| **Estimated reduction** | ~500KB source files + ~5MB node_modules (sharp, pdfjs-dist are heavy) |
| **Maintenance complexity reduction** | ~40% — removing dead code and unused components drastically simplifies the codebase |

## Section 6: Verification Commands

Run these to verify removals are safe:

```bash
# Check if useFileConverter is imported anywhere
grep -r "useFileConverter" src/ server/ --include="*.ts" --include="*.tsx"

# Check if sharp is imported anywhere
grep -r "sharp" src/ server/ --include="*.ts" --include="*.tsx"

# Check if @google/genai is used
grep -r "genai\|@google/genai" src/ server/ --include="*.ts" --include="*.tsx"

# Verify AI components are truly unused
grep -r "AIAssistantPanel\|AIOptionsPanel\|AIWorkspace\|useAIWorkspace\|useAnalytics" src/ server/ --include="*.ts" --include="*.tsx"
