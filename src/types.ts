export type ViewMode =
  | "home"
  | "convert-word"
  | "convert-pdf"
  | "analytics"
  | "guide"
  | "blog"
  | "faq"
  | "about"
  | "contact"
  | "privacy"
  | "terms";

export interface ConversionResult {
  markdown: string;
  modeUsed: "ai" | "classic";
  warning?: string;
  durationMs: number;
}

export interface RecentLog {
  id: string;
  fileName: string;
  fileExt: string;
  fileSizeKb: number;
  mode: "ai" | "classic";
  status: "success" | "failed";
  durationMs: number;
  timestamp: string;
}

export interface SupportSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
}

export interface DashboardStats {
  totalConversions: number;
  classicConversions: number;
  aiConversions: number;
  totalSizeKb: number;
  averageDurationMs: number;
  recentLogs: RecentLog[];
  contactSubmissions?: SupportSubmission[];
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  readTime: string;
  author: string;
  image?: string;
}

export interface GuideSection {
  title: string;
  syntax: string;
  preview: string;
  description: string;
}
