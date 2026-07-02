# Deployment Guide: Two File Separated Architecture

This project is architected so that the **Frontend** and **Backend** can be cleanly separated into two distinct repositories or deployment targets, exactly as requested:
* **Frontend (React + Vite)** -> Deployed to **Vercel**
* **Backend (Node.js + Express)** -> Deployed to **Railway**

No external APIs, AI tools, or Serverless functions are used for the document processing. Everything runs locally on your own Express backend using local Node.js packages.

---

## 1. Frontend Setup (Vercel)

If you are moving the frontend to its own repository, you will need the following files:

### Required Files:
* `src/` (Entire folder containing React components)
* `index.html`
* `vite.config.ts`
* `tailwind.config.js` or `postcss.config.js` (if applicable)
* `tsconfig.json` & `tsconfig.node.json`
* `package.json`

### Environment Variables on Vercel:
You must point the frontend to your new Railway backend URL by adding this to Vercel's Environment Variables settings:
```
VITE_API_URL=https://your-railway-app-url.railway.app
VITE_API_PROTECTION_KEY=WN3FBAF2GYF
```

### Vercel Build Settings:
* **Framework Preset:** Vite
* **Build Command:** `npx vite build`
* **Output Directory:** `dist`

---

### Run locally (frontend)
```bash
# 1) Install dependencies
npm install

# 2) Build or preview frontend
npx vite build
# or
npx vite preview
```

---


## 2. Backend Setup (Railway)

If you are moving the backend to its own repository, you will need the following files:

### Required Files:
* `server.ts` (The entire Express application)
* `.env` (For environment variables)
* `package.json`

### Environment Variables on Railway:
Add this to your Railway project variables to protect your admin/stats routes:
```
API_PROTECTION_KEY=WN3FBAF2GYF
PORT=3000
```
*(Railway assigns the PORT dynamically but setting a fallback is good practice)*

### Railway Build & Start Settings:
* **Build Command:** `npm run build:backend`
* **Start Command:** `npm run start` (This will execute `node dist/server.cjs`)

---

## Summary of the Architecture
* The **Frontend** uses `fetch()` commands prefixed with `${API_BASE}` (which loads from `VITE_API_URL`).
* The **Backend** exposes all `/api/*` routes and handles CORS properly (added via the `cors` package) to accept requests from the Vercel frontend.
* PDF and DOCX processing is executed entirely on the Railway container's local file system using `pdf-parse` and `mammoth` (no external APIs).
