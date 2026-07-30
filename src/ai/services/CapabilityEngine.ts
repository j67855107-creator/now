import { ToolPluginContext } from "../registries/ToolPlugin";

export type CapabilityStage =
  | "upload"
  | "extract"
  | "ocr"
  | "fetch"
  | "transcribe"
  | "clean"
  | "normalize"
  | "metadata"
  | "chunk"
  | "analyze"
  | "generate-prompt"
  | "export";

export interface CapabilityPipeline {
  inputFormat: string;
  stages: CapabilityStage[];
  recommendedTools: string[];
}

export class CapabilityEngine {
  /**
   * Determine the appropriate processing capability pipeline based on context.
   */
  static getPipeline(context: ToolPluginContext): CapabilityPipeline {
    const ext = (context.fileExt || context.file?.name.split(".").pop() || "").toLowerCase();
    const mime = (context.mimeType || context.file?.type || "").toLowerCase();
    const isUrl = Boolean(context.url || (context.fileName && context.fileName.startsWith("http")));

    if (isUrl) {
      return {
        inputFormat: "url",
        stages: ["fetch", "extract", "clean", "normalize", "metadata", "chunk", "analyze", "generate-prompt", "export"],
        recommendedTools: ["url-to-markdown", "document-cleaner", "ai-summary", "rag-export"],
      };
    }

    if (["png", "jpg", "jpeg", "webp", "bmp", "gif"].includes(ext) || mime.startsWith("image/")) {
      return {
        inputFormat: "image",
        stages: ["upload", "ocr", "clean", "normalize", "metadata", "chunk", "analyze", "generate-prompt", "export"],
        recommendedTools: ["image-ocr", "document-cleaner", "ai-summary", "prompt-generator"],
      };
    }

    if (["mp3", "wav", "m4a", "ogg", "flac"].includes(ext) || mime.startsWith("audio/")) {
      return {
        inputFormat: "audio",
        stages: ["upload", "transcribe", "clean", "normalize", "metadata", "chunk", "analyze", "generate-prompt", "export"],
        recommendedTools: ["audio-transcribe", "document-cleaner", "ai-summary"],
      };
    }

    if (["mp4", "webm", "avi", "mov", "mkv"].includes(ext) || mime.startsWith("video/")) {
      return {
        inputFormat: "video",
        stages: ["upload", "transcribe", "clean", "normalize", "metadata", "chunk", "analyze", "generate-prompt", "export"],
        recommendedTools: ["video-transcript", "document-cleaner", "ai-summary"],
      };
    }

    // Default document pipeline (pdf, docx, pptx, xlsx, epub, html, etc.)
    return {
      inputFormat: ext || "document",
      stages: ["upload", "extract", "clean", "normalize", "metadata", "chunk", "analyze", "generate-prompt", "export"],
      recommendedTools: ["pdf-to-markdown", "word-to-markdown", "ai-summary", "prompt-generator", "rag-export"],
    };
  }
}
