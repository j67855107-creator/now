/**
 * Document Analyzer Service
 *
 * Analyzes document content to extract:
 * - Language detection
 * - Document type (Book, Research Paper, Resume, etc.)
 * - Heading structure
 * - Table count, image count, link count
 * - Footnote/reference count
 * - Reading time
 * - Complexity score
 * - Token count & estimated AI cost
 * - AI Readiness Score
 * - Recommendations
 */

import type { DocumentAnalysis, AIReadinessScore, AIReadinessIssue, DocumentType } from "../../src/types";
import { DocumentTypeRegistry } from "../../src/ai/registries/DocumentTypeRegistry";

// Simple language detection using character frequency analysis
const LANGUAGE_PATTERNS: Record<string, RegExp[]> = {
  en: [/the\s/gi, /\sand\s/gi, /\sof\s/gi, /\sto\s/gi, /\sin\s/gi, /\that\s/gi, /\bwith\b/gi, /\bfor\b/gi],
  es: [/el\s/gi, /\bla\b/gi, /\blos\b/gi, /\blas\b/gi, /\bdel\b/gi, /\bpor\b/gi, /\bpara\b/gi, /\bcomo\b/gi],
  fr: [/le\s/gi, /\bla\b/gi, /\bles\b/gi, /\bdes\b/gi, /\bdu\b/gi, /\bpas\b/gi, /\bavec\b/gi, /\bpour\b/gi],
  de: [/der\s/gi, /\bdie\b/gi, /\bdas\b/gi, /\bund\s/gi, /\bmit\b/gi, /\bein\s/gi, /\bauf\b/gi, /\bist\b/gi],
  it: [/il\s/gi, /\bla\b/gi, /\ble\b/gi, /\bgli\b/gi, /\bdel\b/gi, /\bdella\b/gi, /\bcon\b/gi, /\bper\b/gi],
  pt: [/o\s/gi, /\ba\b/gi, /\bos\b/gi, /\bas\b/gi, /\bdo\b/gi, /\bda\b/gi, /\bpara\b/gi, /\bcom\b/gi],
};

export class DocumentAnalyzerService {
  /**
   * Analyze a document and return comprehensive analysis.
   * @param markdown - The document content (Markdown)
   * @param title - Optional document title
   * @param pageCount - Number of pages (if available)
   */
  static analyze(
    markdown: string,
    title?: string,
    pageCount?: number
  ): { analysis: DocumentAnalysis; readiness: AIReadinessScore } {
    const text = markdown;

    // Count structures
    const wordCount = this.countWords(text);
    const headingCount = this.countHeadings(text);
    const tableCount = this.countTables(text);
    const imageCount = this.countImages(text);
    const linkCount = this.countLinks(text);
    const footnoteCount = this.countFootnotes(text);
    const referenceCount = this.countReferences(text);

    // Detect language
    const language = this.detectLanguage(text);

    // Detect document type
    const docTypeResult = DocumentTypeRegistry.detect(text, title);

    // Calculate metrics
    const readingTimeMinutes = Math.max(1, Math.round(wordCount / 200));
    const complexityScore = this.calculateComplexity(text, wordCount, headingCount, tableCount);
    const estimatedTokens = Math.round(wordCount * 1.3); // Average tokens per word
    const estimatedAICost = Math.round((estimatedTokens / 1000) * 0.01 * 100) / 100; // ~$0.01/1K tokens

    // Get recommendations
    const recommendations = this.generateRecommendations(
      docTypeResult.type,
      complexityScore,
      wordCount,
      readingTimeMinutes,
      tableCount
    );

    const analysis: DocumentAnalysis = {
      type: docTypeResult.type,
      language,
      confidence: docTypeResult.confidence,
      pageCount: pageCount || Math.max(1, Math.ceil(wordCount / 350)),
      wordCount,
      headingCount,
      tableCount,
      imageCount,
      linkCount,
      footnoteCount,
      referenceCount,
      readingTimeMinutes,
      complexityScore,
      estimatedTokens,
      estimatedAICost,
      recommendations,
    };

    // Calculate AI Readiness Score
    const readiness = this.calculateReadiness(text, analysis);

    return { analysis, readiness };
  }

  /**
   * Count words in the document.
   */
  static countWords(text: string): number {
    const cleanText = text
      .replace(/```[\s\S]*?```/g, "") // Remove code blocks
      .replace(/\|.*\|/g, "") // Remove table lines
      .replace(/[#*_`>\[\]()!-]/g, " "); // Remove Markdown syntax

    const words = cleanText.split(/\s+/).filter((w) => w.length > 0);
    return words.length;
  }

  /**
   * Count headings (# through ######).
   */
  static countHeadings(text: string): number {
    const matches = text.match(/^#{1,6}\s+/gm);
    return matches ? matches.length : 0;
  }

  /**
   * Count tables (pipe tables).
   */
  static countTables(text: string): number {
    const lines = text.split("\n");
    let tableCount = 0;
    let inTable = false;

    for (const line of lines) {
      if (line.trim().startsWith("|")) {
        if (!inTable) {
          tableCount++;
          inTable = true;
        }
      } else {
        inTable = false;
      }
    }

    return tableCount;
  }

  /**
   * Count images (![alt](url)).
   */
  static countImages(text: string): number {
    const matches = text.match(/!\[.*?\]\(.*?\)/g);
    return matches ? matches.length : 0;
  }

  /**
   * Count links ([text](url)).
   */
  static countLinks(text: string): number {
    const matches = text.match(/\[([^\]]*)\]\(([^)]*)\)/g);
    return matches ? matches.length : 0;
  }

  /**
   * Count footnotes ([^1] pattern).
   */
  static countFootnotes(text: string): number {
    const matches = text.match(/\[\^\d+\]/g);
    return matches ? matches.length : 0;
  }

  /**
   * Count references (markers like [1], [2,3]).
   */
  static countReferences(text: string): number {
    const matches = text.match(/\[(\d+(?:[,;\s]+\d+)*)\]/g);
    return matches ? matches.length : 0;
  }

  /**
   * Detect document language using keyword frequency.
   */
  private static detectLanguage(text: string): string {
    const scores: Record<string, number> = {};

    Object.entries(LANGUAGE_PATTERNS).forEach(([lang, patterns]) => {
      scores[lang] = 0;
      patterns.forEach((pattern) => {
        const matches = text.match(pattern);
        if (matches) {
          scores[lang] += matches.length;
        }
      });
    });

    // Find language with highest score
    let bestLang = "en";
    let bestScore = 0;

    Object.entries(scores).forEach(([lang, score]) => {
      if (score > bestScore) {
        bestScore = score;
        bestLang = lang;
      }
    });

    return bestLang;
  }

  /**
   * Calculate document complexity score (0-100).
   */
  private static calculateComplexity(
    text: string,
    wordCount: number,
    headingCount: number,
    tableCount: number
  ): number {
    let score = 0;

    // Length factor (more words = more complex, up to 30 points)
    score += Math.min(30, wordCount / 100);

    // Structure factor (more headings = more organized, up to 20 points)
    score += Math.min(20, headingCount * 2);

    // Table factor (tables indicate complex data, up to 20 points)
    score += Math.min(20, tableCount * 5);

    // Technical terms indicator (words with 10+ chars, up to 20 points)
    const words = text.split(/\s+/);
    const longWords = words.filter((w) => w.length >= 10).length;
    score += Math.min(20, (longWords / Math.max(1, words.length)) * 100);

    // Sentence length factor (avg sentence length > 25 = complex, up to 10 points)
    const sentences = text.split(/[.!?]+/);
    const avgSentenceLength = wordCount / Math.max(1, sentences.length);
    if (avgSentenceLength > 25) {
      score += Math.min(10, (avgSentenceLength - 25) * 0.5);
    }

    return Math.min(100, Math.round(score));
  }

  /**
   * Calculate AI Readiness Score (0-100).
   */
  private static calculateReadiness(
    text: string,
    analysis: DocumentAnalysis
  ): AIReadinessScore {
    const issues: AIReadinessIssue[] = [];
    const lines = text.split("\n");

    // Check for repeated headers
    const headerLike = lines.filter(
      (l) => l.trim().length > 0 && l.trim().length < 60 && !l.trim().match(/[.!?]$/) && !l.trim().startsWith("#")
    );
    const headerFreq = new Map<string, number>();
    headerLike.forEach((l) => {
      const t = l.trim();
      headerFreq.set(t, (headerFreq.get(t) || 0) + 1);
    });
    headerFreq.forEach((count, line) => {
      if (count > 3) {
        issues.push({
          type: "repeated-headers",
          severity: "medium",
          description: `"${line}" appears ${count} times — may be a repeated header`,
        });
      }
    });

    // Check for broken paragraphs
    for (let i = 0; i < lines.length - 1; i++) {
      const current = lines[i].trim();
      const next = lines[i + 1].trim();
      if (
        current &&
        next &&
        !current.match(/[.!?]$/) &&
        next[0] === next[0]?.toLowerCase() &&
        !next.startsWith("#") &&
        !next.startsWith("-") &&
        !next.startsWith("|")
      ) {
        issues.push({
          type: "broken-paragraphs",
          severity: "low",
          description: `Line ${i + 1}: paragraph may be broken`,
          line: i + 1,
        });
        break; // Report once
      }
    }

    // Check for page numbers
    lines.forEach((line, index) => {
      if (/^page\s+\d+$/i.test(line.trim())) {
        issues.push({
          type: "page-numbers",
          severity: "low",
          description: `Page number found on line ${index + 1}`,
          line: index + 1,
        });
      }
    });

    // Check for footer text
    const footerPatterns = [/^\s*-\s*\d+\s*-\s*$/, /^\d{1,3}$/];
    lines.forEach((line, index) => {
      if (footerPatterns.some((p) => p.test(line.trim()))) {
        issues.push({
          type: "footer-text",
          severity: "low",
          description: `Possible page number or footer on line ${index + 1}`,
          line: index + 1,
        });
      }
    });

    // Check heading gaps
    let maxLevel = 0;
    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s/);
      if (match) {
        const level = match[1].length;
        if (level > maxLevel + 1 && maxLevel > 0) {
          issues.push({
            type: "heading-gaps",
            severity: "medium",
            description: `Heading gap: H${maxLevel} → H${level} on line ${index + 1}`,
            line: index + 1,
          });
        }
        maxLevel = Math.max(maxLevel, level);
      }
    });

    // Check whitespace issues
    let consecutiveBlankCount = 0;
    for (const line of lines) {
      if (line.trim() === "") {
        consecutiveBlankCount++;
        if (consecutiveBlankCount > 3) {
          issues.push({
            type: "whitespace-issues",
            severity: "low",
            description: "Excessive blank lines detected",
          });
          break;
        }
      } else {
        consecutiveBlankCount = 0;
      }
    }

    // Score calculation
    let score = 100;
    const severityDeductions: Record<string, number> = {
      high: 20,
      medium: 10,
      low: 5,
    };

    issues.forEach((issue) => {
      score -= severityDeductions[issue.severity] || 5;
    });

    // Complexity penalty (very complex docs are less "ready")
    if (analysis.complexityScore > 70) {
      score -= 10;
    }

    // Suggestions
    const suggestions: string[] = [];
    if (issues.some((i) => i.type === "repeated-headers")) {
      suggestions.push("Use Clean for AI to remove repeated headers.");
    }
    if (issues.some((i) => i.type === "broken-paragraphs")) {
      suggestions.push("Enable Clean for AI to merge broken paragraphs.");
    }
    if (issues.some((i) => i.type === "page-numbers")) {
      suggestions.push("Use Clean for AI to remove page numbers.");
    }
    if (issues.some((i) => i.type === "whitespace-issues")) {
      suggestions.push("Normalize whitespace using Clean for AI.");
    }
    if (issues.some((i) => i.type === "heading-gaps")) {
      suggestions.push("Improve heading hierarchy using Clean for AI.");
    }

    return {
      overall: Math.max(0, Math.min(100, score)),
      issues,
      suggestions,
    };
  }

  /**
   * Generate recommendations based on document analysis.
   */
  private static generateRecommendations(
    docType: DocumentType,
    complexityScore: number,
    wordCount: number,
    readingTimeMinutes: number,
    tableCount: number
  ): string[] {
    const recommendations: string[] = [];
    const typeRecs = DocumentTypeRegistry.getRecommendations(docType);
    recommendations.push(...typeRecs);

    if (complexityScore > 60) {
      recommendations.push("This document has high complexity. Consider using AI Summary for a quick overview.");
    }

    if (wordCount > 5000) {
      recommendations.push("Long document detected. RAG Export will help chunk this for AI processing.");
    }

    if (tableCount > 3) {
      recommendations.push("Multiple tables detected. Clean for AI will preserve table structures.");
    }

    if (readingTimeMinutes > 20) {
      recommendations.push("Document exceeds 20 minutes reading time. Generate a summary first.");
    }

    return recommendations;
  }
}

