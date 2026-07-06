- [ ] Confirm root cause: verify Railway startup logs / check which port is probed
- [ ] Update server.ts persistence to avoid crashing on read/write failures by falling back to /tmp
- [ ] Add startup log including resolved PORT and chosen persistence file paths
- [ ] Rebuild backend (npm run build:backend)
- [ ] Redeploy and verify GET /api/health responds
- [ ] If still failing, inspect dist/server.cjs + ensure listening port matches Railway

