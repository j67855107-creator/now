- [ ] Update server.ts: replace app.listen/startServer block with export default app + conditional startServer for non-production
- [ ] Add error-handling middleware before `export default app;`
- [ ] Build locally: run `npm run build`
- [ ] Verify `dist/server.cjs` exists after build

