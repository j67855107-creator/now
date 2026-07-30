import { Router, Request, Response } from "express";
import { handleConversion, handleUrlConversion } from "../controllers/convertController";
import { handleContactForm } from "../controllers/contactController";
import { requireApiKey } from "../middleware/authMiddleware";
import { handleAdminLogin, requireAdminAuth, AdminRequest } from "../middleware/adminAuth";
import { getStats } from "../services/statsService";
import {
  handleCleanDocument,
  handleAnalyzeDocument,
  handleGeneratePrompt,
  handleGenerateRAG,
  handleExport,
  handleFullProcess,
  handleCancelProcessing,
  handleGetTemplates,
  handleGetAnalytics,
} from "../controllers/aiController";
import rateLimit from "express-rate-limit";

const router = Router();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

const convertLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Conversion limit reached. Please try again later." },
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many contact submissions. Please try again later." },
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "AI processing limit reached. Please try again later." },
});

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please try again later." },
});

// Admin Login
const adminLoginPath = process.env.ADMIN_LOGIN_PATH || "/auth/admin/login";
router.post(adminLoginPath, adminLoginLimiter, handleAdminLogin);

// Public API
router.get("/stats", apiLimiter, requireApiKey, (req: Request, res: Response) => {
  res.json(getStats());
});

router.post("/convert", convertLimiter, handleConversion);
router.post("/convert/url", convertLimiter, handleUrlConversion);
router.post("/contact", contactLimiter, handleContactForm);

// AI Routes
router.post("/ai/clean", aiLimiter, handleCleanDocument);
router.post("/ai/analyze", aiLimiter, handleAnalyzeDocument);
router.post("/ai/prompt", aiLimiter, handleGeneratePrompt);
router.post("/ai/rag", aiLimiter, handleGenerateRAG);
router.post("/ai/export", aiLimiter, handleExport);
router.post("/ai/process", aiLimiter, handleFullProcess);
router.post("/ai/cancel", aiLimiter, handleCancelProcessing);
router.post("/ai/analytics/track", apiLimiter, (req: Request, res: Response) => {
  res.json({ success: true });
});
router.get("/ai/templates", apiLimiter, handleGetTemplates);

// Admin-only
router.get("/admin/ai/analytics", apiLimiter, requireAdminAuth, (req: Request, res: Response) => {
  handleGetAnalytics(req, res);
});

router.get("/admin/stats", apiLimiter, requireAdminAuth, (req: AdminRequest, res: Response) => {
  res.json(getStats());
});

export default router;
