import React from "react";

export type ToolCategory =
  | "conversion"
  | "cleaning"
  | "analysis"
  | "prompting"
  | "rag"
  | "export"
  | "media";

export type ToolStatus = "stable" | "beta" | "experimental";

export interface ToolPluginContext {
  file?: File | null;
  markdown?: string;
  fileName?: string;
  fileExt?: string;
  mimeType?: string;
  url?: string;
}

export interface ToolPluginResult {
  success: boolean;
  output?: any;
  error?: string;
}

export interface ToolPlugin {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: ToolCategory;
  route: string;
  iconName: string;
  supportedFormats: string[]; // e.g. ["pdf", "docx", "pptx", "xlsx", "html", "epub", "png", "jpg", "url", "audio", "video"]
  featured?: boolean;
  status: ToolStatus;
  badges: string[];
  metaKeywords: string[];
  canRun(context: ToolPluginContext): boolean;
  execute?(context: ToolPluginContext): Promise<ToolPluginResult>;
  panel?: React.ComponentType<{ markdown: string; fileName?: string }>;
}
