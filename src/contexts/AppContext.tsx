/**
 * AppContext — Centralized application state.
 *
 * Extracts all shared state from the old App.tsx god component into a context
 * so any page or layout component can access it without prop-drilling.
 *
 * ViewMode is preserved as a bridge type: each page derives the correct
 * ViewMode from its own route and passes it to components that still expect it.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type RefObject,
} from "react";
import { useNavigate } from "react-router-dom";
import { type ViewMode, type BlogPost, type DashboardStats } from "../types";
import { type ToolPlugin } from "../ai/registries/ToolPlugin";
import { toolsRegistry } from "../ai/registries/toolsRegistry";
import { API_BASE } from "../api";

const VITE_API_PROTECTION_KEY =
  import.meta.env.VITE_API_PROTECTION_KEY || "WN3FBAF2GYF";

// ─── ViewMode → Route mapping ───────────────────────────────
/** Maps legacy ViewMode values to their canonical URL paths. */
export const VIEW_MODE_TO_PATH: Record<ViewMode, string> = {
  home: "/",
  "convert-word": "/converters/word-to-markdown",
  "convert-pdf": "/converters/pdf-to-markdown",
  tools: "/ai-tools",
  guide: "/guides",
  blog: "/blog",
  faq: "/faq",
  about: "/about",
  contact: "/contact",
  privacy: "/privacy",
  terms: "/terms",
  analytics: "/analytics",
  "admin-login": "/",   // handled via secret path
  "admin-dashboard": "/", // handled via separate route
};

// ─── Context shape ───────────────────────────────────────────
export interface AppContextType {
  // Conversion state
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  converting: boolean;
  setConverting: React.Dispatch<React.SetStateAction<boolean>>;
  loadingStep: number;
  conversionResult: string;
  setConversionResult: React.Dispatch<React.SetStateAction<string>>;
  editedMarkdown: string;
  setEditedMarkdown: React.Dispatch<React.SetStateAction<string>>;
  resultDetails: { modeUsed: "ai" | "classic"; durationMs: number; warning?: string } | null;
  setResultDetails: React.Dispatch<React.SetStateAction<AppContextType["resultDetails"]>>;
  runConversion: () => Promise<void>;

  // File input
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrag: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  dragActive: boolean;

  // Selected AI tool
  selectedTool: ToolPlugin | null;
  setSelectedTool: React.Dispatch<React.SetStateAction<ToolPlugin | null>>;
  handleToolClick: (toolId: string) => void;

  // Legacy viewMode bridge — used by components that haven't been migrated yet
  setViewMode: (mode: ViewMode) => void;
  selectPreconfigMode: (mode: "docx" | "pdf") => void;

  // Alerts
  alertMessage: { type: "success" | "error" | "info"; text: string } | null;
  triggerAlert: (type: "success" | "error" | "info", text: string) => void;

  // Blog reading state
  readingBlog: BlogPost | null;
  setReadingBlog: React.Dispatch<React.SetStateAction<BlogPost | null>>;

  // Cookie banner
  cookieDismissed: boolean;
  setCookieDismissed: React.Dispatch<React.SetStateAction<boolean>>;

  // Admin
  adminToken: string | null;
  handleAdminLogin: (token: string) => void;
  handleAdminLogout: () => void;

  // Analytics / Stats
  stats: DashboardStats | null;
  statsLoading: boolean;
  fetchStats: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────
const AppContext = createContext<AppContextType | null>(null);

export function useAppContext(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used inside <AppProvider>");
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────
export function AppProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  // Conversion state
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [conversionResult, setConversionResult] = useState("");
  const [editedMarkdown, setEditedMarkdown] = useState("");
  const [resultDetails, setResultDetails] = useState<AppContextType["resultDetails"]>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tool
  const [selectedTool, setSelectedTool] = useState<ToolPlugin | null>(null);

  // Alert
  const [alertMessage, setAlertMessage] = useState<AppContextType["alertMessage"]>(null);

  // Blog
  const [readingBlog, setReadingBlog] = useState<BlogPost | null>(null);

  // Cookie
  const [cookieDismissed, setCookieDismissed] = useState(false);

  // Admin
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("admin_token");
    return null;
  });

  // Stats
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Loading step cycle while converting
  const loadingSteps = [
    "Uploading document securely...",
    "Verifying character bounds...",
    "Preserving lists and tables...",
    "Running local parser...",
    "Constructing markdown...",
  ];
  useEffect(() => {
    if (!converting) return;
    const interval = setInterval(
      () => setLoadingStep((prev) => (prev + 1) % loadingSteps.length),
      1400
    );
    return () => clearInterval(interval);
  }, [converting]);

  // ── Alerts ───────────────────────────────────────────────
  const triggerAlert = useCallback(
    (type: "success" | "error" | "info", text: string) => {
      setAlertMessage({ type, text });
      setTimeout(() => setAlertMessage(null), 4000);
    },
    []
  );

  // ── File handling ─────────────────────────────────────────
  const handleFileSelected = useCallback(
    (selectedFile: File, viewMode?: ViewMode) => {
      const ext = selectedFile.name.split(".").pop()?.toLowerCase();
      if (viewMode === "convert-word" && ext !== "docx") {
        triggerAlert("error", "Word (.docx) files only.");
        return;
      }
      if (viewMode === "convert-pdf" && ext !== "pdf") {
        triggerAlert("error", "PDF files only.");
        return;
      }
      const allowed = [
        "pdf", "docx", "pptx", "xlsx", "xls", "csv",
        "epub", "html", "htm", "png", "jpg", "jpeg", "webp", "bmp",
      ];
      if (ext && allowed.includes(ext)) {
        setFile(selectedFile);
        setConversionResult("");
        setEditedMarkdown("");
        setResultDetails(null);
      } else {
        triggerAlert("error", "Unsupported file type.");
      }
    },
    [triggerAlert]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files?.[0]) handleFileSelected(e.dataTransfer.files[0]);
    },
    [handleFileSelected]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) handleFileSelected(e.target.files[0]);
    },
    [handleFileSelected]
  );

  // ── Navigation bridge (ViewMode → route) ─────────────────
  const setViewMode = useCallback(
    (mode: ViewMode) => {
      const path = VIEW_MODE_TO_PATH[mode];
      if (path && path !== "/") navigate(path);
      else navigate("/");
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [navigate]
  );

  const selectPreconfigMode = useCallback(
    (mode: "docx" | "pdf") => {
      setFile(null);
      setConversionResult("");
      setEditedMarkdown("");
      setResultDetails(null);
      if (mode === "docx") navigate("/converters/word-to-markdown");
      else navigate("/converters/pdf-to-markdown");
    },
    [navigate]
  );

  // ── Tool click handler ────────────────────────────────────
  const handleToolClick = useCallback(
    (toolId: string) => {
      const plugin = toolsRegistry.get(toolId);
      if (plugin) {
        setSelectedTool(plugin);
        if (toolId === "pdf-to-markdown") {
          navigate("/converters/pdf-to-markdown");
        } else if (toolId === "word-to-markdown") {
          navigate("/converters/word-to-markdown");
        } else if (plugin.panel) {
          navigate("/");
        } else {
          navigate(plugin.route);
        }
      } else {
        navigate("/ai-tools");
      }
    },
    [navigate]
  );

  // ── Conversion runner ─────────────────────────────────────
  const runConversion = useCallback(async () => {
    if (!file) {
      triggerAlert("error", "Please upload a file.");
      return;
    }
    setConverting(true);
    setLoadingStep(0);
    setAlertMessage(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const resultStr = reader.result as string;
        const base64Content = resultStr.split(",")[1];
        const res = await fetch(API_BASE + "/api/convert", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": VITE_API_PROTECTION_KEY,
          },
          body: JSON.stringify({
            fileData: base64Content,
            fileName: file.name,
            mimeType: file.type,
            mode: "classic",
          }),
        });
        if (!res.ok) throw new Error(((await res.json()).error) || "Conversion failed.");
        const data = await res.json();
        setConversionResult(data.markdown);
        setEditedMarkdown(data.markdown);
        setResultDetails({
          modeUsed: data.modeUsed,
          durationMs: data.durationMs,
          warning: data.warning,
        });
        triggerAlert(
          data.warning ? "info" : "success",
          data.warning || "Successfully parsed into Markdown."
        );
      } catch (err: any) {
        triggerAlert("error", err.message);
      } finally {
        setConverting(false);
      }
    };
    reader.onerror = () => {
      triggerAlert("error", "Failed to read file.");
      setConverting(false);
    };
    reader.readAsDataURL(file);
  }, [file, triggerAlert]);

  // ── Stats / analytics ─────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/stats`, {
        headers: { "x-api-key": VITE_API_PROTECTION_KEY },
      });
      if (res.ok) setStats(await res.json());
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Admin ─────────────────────────────────────────────────
  const handleAdminLogin = useCallback((token: string) => {
    sessionStorage.setItem("admin_token", token);
    setAdminToken(token);
    navigate("/admin-dashboard");
  }, [navigate]);

  const handleAdminLogout = useCallback(() => {
    sessionStorage.removeItem("admin_token");
    setAdminToken(null);
    navigate("/");
    triggerAlert("info", "Logged out of admin terminal successfully.");
  }, [navigate, triggerAlert]);

  const value: AppContextType = {
    file, setFile,
    converting, setConverting,
    loadingStep,
    conversionResult, setConversionResult,
    editedMarkdown, setEditedMarkdown,
    resultDetails, setResultDetails,
    runConversion,
    fileInputRef,
    handleFileChange,
    handleDrag,
    handleDrop,
    dragActive,
    selectedTool, setSelectedTool,
    handleToolClick,
    setViewMode,
    selectPreconfigMode,
    alertMessage,
    triggerAlert,
    readingBlog, setReadingBlog,
    cookieDismissed, setCookieDismissed,
    adminToken,
    handleAdminLogin,
    handleAdminLogout,
    stats, statsLoading, fetchStats,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
