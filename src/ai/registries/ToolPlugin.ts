import React from "react";

export type ToolCategory =
  | "conversion"
  | "cleaning"
  | "analysis"
  | "prompting"
  | "rag"
  | "export"
  | "media";

/** Which URL namespace this tool belongs to */
export type ToolUrlGroup = "converters" | "ai-tools";

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
  /**
   * URL namespace. Conversion/media tools live under /converters/*;
   * AI-powered tools live under /ai-tools/*.
   */
  urlGroup: ToolUrlGroup;
  /** Canonical path e.g. "/converters/pdf-to-markdown" or "/ai-tools/document-summary" */
  route: string;
  iconName: string;
  supportedFormats: string[];
  featured?: boolean;
  status: ToolStatus;
  badges: string[];
  metaKeywords: string[];
  canRun(context: ToolPluginContext): boolean;
  execute?(context: ToolPluginContext): Promise<ToolPluginResult>;
  panel?: React.ComponentType<{ markdown: string; fileName?: string }>;
}
