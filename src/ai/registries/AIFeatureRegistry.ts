/**
 * AI Feature Registry
 *
 * All AI features are registered here. Future AI tools
 * (OCR, Translation, ImageCaptioning, QuizGenerator, etc.)
 * can be added by registering them — no component changes.
 *
 * Each feature has:
 * - A unique key
 * - Configuration
 * - Feature flag reference
 * - Component to render (optional)
 */

import type { FeatureFlag } from "../../types";
import type { ComponentType } from "react";
import { FeatureFlagRegistry } from "./FeatureFlags";

export interface AFeatureRegistration {
  key: string;
  name: string;
  description: string;
  icon: string;
  order: number;
  component?: ComponentType<any>;
  flagKey: string;
  config?: Record<string, any>;
}

export class AIFeatureRegistry {
  private static features: Map<string, AFeatureRegistration> = new Map();

  static initialize(): void {
    const builtIn: AFeatureRegistration[] = [
      { key: "cleaner", name: "Clean for AI", description: "Remove headers, footers, page numbers, and normalize whitespace", icon: "Sparkles", order: 1, flagKey: "ai-cleaner" },
      { key: "summary", name: "AI Summary", description: "Generate short/detailed summaries, keywords, and key points", icon: "FileText", order: 2, flagKey: "ai-summary" },
      { key: "prompt", name: "Generate Prompt", description: "Create AI prompts for ChatGPT, Claude, Gemini, and more", icon: "MessageSquare", order: 3, flagKey: "prompt-generator" },
      { key: "rag", name: "RAG Export", description: "Export document chunks for RAG pipelines", icon: "Database", order: 4, flagKey: "rag-export" },
      { key: "assistant", name: "AI Assistant", description: "Quick actions panel for AI features", icon: "Bot", order: 5, flagKey: "ai-assistant" },
    ];
    builtIn.forEach((feat) => this.features.set(feat.key, feat));
  }

  static register(feature: AFeatureRegistration): void { this.features.set(feature.key, feature); }
  static get(key: string): AFeatureRegistration | undefined { return this.features.get(key); }
  static getAll(): AFeatureRegistration[] { return Array.from(this.features.values()).sort((a, b) => a.order - b.order); }
  static getEnabled(): AFeatureRegistration[] { return this.getAll().filter((f) => FeatureFlagRegistry.isEnabled(f.flagKey)); }
}
