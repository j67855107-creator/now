/**
 * Prompt Generator Service
 *
 * Generates AI-ready prompts from document content.
 * Supports multiple AI providers through adapters.
 * Provider-agnostic: new providers can be added without changing core logic.
 */

import type { PromptTemplateId, AIProviderId, GeneratedPrompt } from "../../src/types";
import { PromptTemplateRegistry } from "../../src/ai/registries/PromptTemplateRegistry";

interface PromptVariables extends Record<string, string> {
  markdown: string;
  title: string;
  wordCount: string;
  readingTime: string;
  language: string;
}

export class PromptGeneratorService {
  /**
   * Generate a prompt from a template.
   * @param templateId - The prompt template ID
   * @param providerId - The AI provider ID
   * @param markdown - The document content
   * @param metadata - Optional metadata (title, wordCount, etc.)
   * @returns The generated prompt
   */
  static generate(
    templateId: PromptTemplateId,
    providerId: AIProviderId,
    markdown: string,
    metadata?: Partial<Record<string, string>>
  ): GeneratedPrompt | null {
    const template = PromptTemplateRegistry.get(templateId);
    if (!template) return null;

    const variables: PromptVariables = {
      markdown,
      title: metadata?.title || "Untitled Document",
      wordCount: metadata?.wordCount || String(this.countWords(markdown)),
      readingTime: metadata?.readingTime || String(Math.max(1, Math.round(this.countWords(markdown) / 200))),
      language: metadata?.language || "English",
    };

    const promptText = PromptTemplateRegistry.getFormattedPrompt(
      templateId,
      providerId,
      variables
    );

    if (!promptText) return null;

    return {
      id: `prompt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      templateId,
      providerId,
      prompt: promptText,
      title: template.name,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Generate all prompts for all templates for a given provider.
   */
  static generateAll(
    providerId: AIProviderId,
    markdown: string,
    metadata?: Partial<Record<string, string>>
  ): GeneratedPrompt[] {
    const templates = PromptTemplateRegistry.getAll();
    const prompts: GeneratedPrompt[] = [];

    templates.forEach((template) => {
      const prompt = this.generate(template.id, providerId, markdown, metadata);
      if (prompt) prompts.push(prompt);
    });

    return prompts;
  }

  /**
   * Format a prompt for a specific provider's chat format.
   */
  static formatForProvider(
    prompt: string,
    providerId: AIProviderId
  ): string {
    switch (providerId) {
      case "chatgpt":
        return this.formatForChatGPT(prompt);
      case "claude":
        return this.formatForClaude(prompt);
      case "gemini":
        return this.formatForGemini(prompt);
      case "notebooklm":
        return this.formatForNotebookLM(prompt);
      case "local":
        return prompt; // Local models get raw prompt
      default:
        return prompt;
    }
  }

  /**
   * Format prompt for ChatGPT (system + user message).
   */
  private static formatForChatGPT(prompt: string): string {
    return `You are a helpful AI assistant specialized in document analysis and processing.

Please respond to the following request based on the document provided.

${prompt}

IMPORTANT: 
- Be thorough and detailed in your response
- Use markdown formatting for readability
- If you need clarification, state what additional information you need`;
  }

  /**
   * Format prompt for Claude (XML-style).
   */
  private static formatForClaude(prompt: string): string {
    return `${prompt}

Please provide a thorough, well-structured response. Use markdown formatting.`;
  }

  /**
   * Format prompt for Gemini (concise).
   */
  private static formatForGemini(prompt: string): string {
    return `You are a document analysis expert. Process the following request:

${prompt}

Provide a comprehensive, structured response.`;
  }

  /**
   * Format prompt for NotebookLM (source-focused).
   */
  private static formatForNotebookLM(prompt: string): string {
    return `Based solely on the provided source document, please address the following:

${prompt}

Base your response ONLY on information explicitly present in the document. Do not add external information unless specifically requested.`;
  }

  /**
   * Count words in text.
   */
  private static countWords(text: string): number {
    return text.split(/\s+/).filter((w) => w.length > 0).length;
  }
}

