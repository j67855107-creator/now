# Codebase Cleanup & Optimization

## ✅ Phase 1: Resolve Merge Conflicts
- [x] `tsconfig.json` - resolved
- [x] `vite.config.ts` - resolved
- [x] `src/types.ts` - resolved
- [x] `src/App.tsx` - resolved
- [x] `server.ts` - resolved (merged Railway-ready with AI registries)
- [x] `package.json` - resolved
- [x] `package-lock.json` - resolved

## Phase 2: Cleanup Tasks
- [ ] Delete all temporary fix scripts (*.cjs, *.js in root)
- [ ] Remove unused npm packages (sharp, @google/genai, motion, autoprefixer, pdf-export-images, @types/ws, @types/file-saver, file-saver, pdfjs-dist)
- [ ] Delete unused/empty files (useFileConverter.ts, server/services/conversionService.ts)
- [ ] Remove dead AI components/hooks not used anywhere
- [ ] Remove temporary debug console.log from server.ts

## Phase 3: Verify & Rebuild
- [ ] Run `npx vite build` (frontend build)
- [ ] Run `npm run build:backend`
- [ ] Test server starts correctly

