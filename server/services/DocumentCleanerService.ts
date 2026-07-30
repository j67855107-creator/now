/**
 * Document Cleaner Service
 *
 * Preprocesses Markdown for optimal AI consumption:
 * - Removes repeated headers and footers
 * - Removes page numbers
 * - Removes duplicated lines
 * - Merges broken paragraphs
 * - Normalizes whitespace
 * - Improves heading hierarchy
 * - Preserves tables
 *
 * Produces "AI-ready" Markdown.
 */

export interface CleanerOptions {
  removeHeaders: boolean;
  removeFooters: boolean;
  removePageNumbers: boolean;
  removeDuplicates: boolean;
  mergeParagraphs: boolean;
  normalizeWhitespace: boolean;
  improveHeadings: boolean;
  preserveTables: boolean;
  removeReferences: boolean;
  removeHtmlTags: boolean;
  removeAdvertisements: boolean;
  encodingRepair: boolean;
}

export const DEFAULT_CLEANER_OPTIONS: CleanerOptions = {
  removeHeaders: true,
  removeFooters: true,
  removePageNumbers: true,
  removeDuplicates: true,
  mergeParagraphs: true,
  normalizeWhitespace: true,
  improveHeadings: true,
  preserveTables: true,
  removeReferences: true,
  removeHtmlTags: true,
  removeAdvertisements: true,
  encodingRepair: true,
};

export class DocumentCleanerService {
  /**
   * Clean a Markdown document for AI consumption.
   * @param markdown - The raw Markdown content
   * @param options - Cleaning options (defaults to all enabled)
   * @returns The cleaned Markdown
   */
  static clean(markdown: string, options: Partial<CleanerOptions> = {}): string {
    const opts = { ...DEFAULT_CLEANER_OPTIONS, ...options };
    let result = markdown;

    if (opts.encodingRepair) result = this.repairEncoding(result);
    if (opts.removeHeaders) result = this.removeRepeatedHeaders(result);
    if (opts.removeFooters) result = this.removeRepeatedFooters(result);
    if (opts.removePageNumbers) result = this.removePageNumbers(result);
    if (opts.removeDuplicates) result = this.removeDuplicatedLines(result);
    if (opts.removeAdvertisements) result = this.removeAdvertisements(result);
    if (opts.removeReferences) result = this.removeReferences(result);
    if (opts.removeHtmlTags) result = this.removeHtmlTags(result);
    if (opts.mergeParagraphs) result = this.mergeBrokenParagraphs(result);
    if (opts.normalizeWhitespace) result = this.normalizeWhitespace(result);
    if (opts.improveHeadings) result = this.improveHeadingHierarchy(result);

    return result;
  }

  /**
   * Repair common broken UTF-8 encoding sequences.
   */
  private static repairEncoding(markdown: string): string {
    return markdown
      .replace(/â€™/g, "'")
      .replace(/â€œ/g, '"')
      .replace(/â€/g, '"')
      .replace(/â€“/g, "–")
      .replace(/â€”/g, "—")
      .replace(/Ã©/g, "é")
      .replace(/Ã/g, "à");
  }

  /**
   * Remove citation brackets and reference markers like [1], [2,3].
   */
  private static removeReferences(markdown: string): string {
    return markdown.replace(/\[\d+(?:[,\s;]+\d+)*\]/g, "");
  }

  /**
   * Remove residual inline HTML tags while preserving table markup if present.
   */
  private static removeHtmlTags(markdown: string): string {
    return markdown.replace(/<\/?(div|span|font|p|br|center|section|article|header|footer)\b[^>]*>/gi, "");
  }

  /**
   * Remove advertisement lines and sponsored links.
   */
  private static removeAdvertisements(markdown: string): string {
    const lines = markdown.split("\n");
    return lines
      .filter((line) => {
        const trimmed = line.trim().toLowerCase();
        if (
          trimmed.startsWith("advertisement") ||
          trimmed.startsWith("sponsored link") ||
          trimmed === "click here to subscribe" ||
          trimmed.includes("all rights reserved. powered by")
        ) {
          return false;
        }
        return true;
      })
      .join("\n");
  }

  /**
   * Remove repeated headers that appear at the top of each page.
   * Pattern: Same text appearing frequently at line beginnings.
   */
  private static removeRepeatedHeaders(markdown: string): string {
    const lines = markdown.split("\n");
    const lineFrequency = new Map<string, number>();
    const threshold = Math.max(3, Math.floor(lines.length * 0.05)); // 5% threshold

    // Count line frequencies (first 3 lines of each "section")
    let sectionCount = 0;
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (trimmed === "") continue;

      // Check if this looks like a header (short, no punctuation)
      if (trimmed.length < 60 && !trimmed.match(/[.!?]$/) && trimmed !== trimmed.toUpperCase()) {
        lineFrequency.set(trimmed, (lineFrequency.get(trimmed) || 0) + 1);
      }

      // Reset counter at section breaks
      if (trimmed.startsWith("#") || trimmed.startsWith("---")) {
        sectionCount = 0;
      }
    }

    // Lines that appear too frequently are likely headers
    const frequentLines = new Set<string>();
    lineFrequency.forEach((count, line) => {
      if (count >= threshold) {
        frequentLines.add(line);
      }
    });

    // Filter out repeated headers (keep first occurrence)
    const seen = new Set<string>();
    return lines
      .filter((line) => {
        const trimmed = line.trim();
        if (frequentLines.has(trimmed)) {
          if (seen.has(trimmed)) return false;
          seen.add(trimmed);
        }
        return true;
      })
      .join("\n");
  }

  /**
   * Remove repeated footers at the bottom of pages.
   * Pattern: Same text appearing repeatedly at end of sections.
   */
  private static removeRepeatedFooters(markdown: string): string {
    const lines = markdown.split("\n");
    const reversedLines = [...lines].reverse();
    const lineFrequency = new Map<string, number>();
    const threshold = Math.max(2, Math.floor(lines.length * 0.03));

    // Analyze last few lines of reversed content
    for (let i = 0; i < reversedLines.length; i++) {
      const trimmed = reversedLines[i].trim();
      if (!trimmed || trimmed.length > 80) continue;
      if (trimmed.match(/page\s*\d+/i) || trimmed.match(/^\d+$/) || trimmed.match(/^\s*-\s*\d+\s*-\s*$/)) continue;
      lineFrequency.set(trimmed, (lineFrequency.get(trimmed) || 0) + 1);
    }

    const frequentLines = new Set<string>();
    lineFrequency.forEach((count, line) => {
      if (count >= threshold) {
        frequentLines.add(line);
      }
    });

    const seen = new Set<string>();
    return lines
      .reverse()
      .filter((line) => {
        const trimmed = line.trim();
        if (frequentLines.has(trimmed)) {
          if (seen.has(trimmed)) return false;
          seen.add(trimmed);
        }
        return true;
      })
      .reverse()
      .join("\n");
  }

  /**
   * Remove page numbers (patterns like "Page 1", "- 1 -", "1", etc.)
   */
  private static removePageNumbers(markdown: string): string {
    const lines = markdown.split("\n");
    return lines
      .filter((line) => {
        const trimmed = line.trim();

        // "Page 1", "Page 1 of 10", "PAGE 1"
        if (/^page\s+\d+(\s+of\s+\d+)?$/i.test(trimmed)) return false;

        // "- 1 -", "- 10 -", "— 1 —"
        if (/^[-—]\s*\d+\s*[-—]$/.test(trimmed)) return false;

        // "| 1 |", "| 12 |"
        if (/^\|\s*\d+\s*\|$/.test(trimmed)) return false;

        // "{1}", "{ 1 }"
        if (/^\{[\s]*\d+[\s]*\}$/.test(trimmed)) return false;

        // Lines that are just a number (between 1-999) on their own line
        if (/^\d{1,3}$/.test(trimmed) && !line.match(/^\s/)) return false;

        // Check if the line is a page number in context (short, centered-like)
        if (/^\s+\d{1,3}\s+$/.test(line)) return false;

        return true;
      })
      .join("\n");
  }

  /**
   * Remove exact duplicate lines (consecutive or near-consecutive).
   */
  private static removeDuplicatedLines(markdown: string): string {
    const lines = markdown.split("\n");
    const result: string[] = [];
    const recentLines: string[] = [];
    const windowSize = 3;

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();

      // Skip empty lines that have empty neighbors (normalize later)
      if (!trimmed && result.length > 0 && result[result.length - 1].trim() === "") {
        continue;
      }

      // Check if this line (or similar) appears in recent window
      const isDuplicate = recentLines.some(
        (recent) => recent === trimmed || (trimmed.length > 20 && this.similarity(recent, trimmed) > 0.85)
      );

      if (isDuplicate) {
        continue;
      }

      result.push(lines[i]);
      recentLines.push(trimmed);
      if (recentLines.length > windowSize) {
        recentLines.shift();
      }
    }

    return result.join("\n");
  }

  /**
   * Merge broken paragraphs (lines that end without period and next line starts with lowercase).
   */
  private static mergeBrokenParagraphs(markdown: string): string {
    const lines = markdown.split("\n");
    const result: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const current = lines[i];
      const trimmed = current.trim();

      // Skip code blocks and tables
      if (trimmed.startsWith("```") || trimmed.startsWith("|")) {
        result.push(current);
        continue;
      }

      // Check if next line should be merged
      if (i + 1 < lines.length) {
        const next = lines[i + 1];
        const nextTrimmed = next.trim();

        // Merge if:
        // 1. Current line doesn't end with sentence-ending punctuation
        // 2. Current line isn't empty
        // 3. Next line starts with lowercase (not a new sentence)
        // 4. Next line isn't a heading, list, code, or table
        if (
          trimmed &&
          !trimmed.match(/[.!?]$/) &&
          nextTrimmed &&
          nextTrimmed[0] === nextTrimmed[0].toLowerCase() &&
          !nextTrimmed.startsWith("#") &&
          !nextTrimmed.startsWith("-") &&
          !nextTrimmed.startsWith("*") &&
          !nextTrimmed.startsWith(">") &&
          !nextTrimmed.startsWith("```") &&
          !nextTrimmed.startsWith("|") &&
          !nextTrimmed.match(/^\d+\./)
        ) {
          result.push(trimmed + " " + nextTrimmed);
          i++; // Skip the next line since we merged it
          continue;
        }
      }

      result.push(current);
    }

    return result.join("\n");
  }

  /**
   * Normalize whitespace (remove extra blank lines, trailing spaces, etc.)
   */
  private static normalizeWhitespace(markdown: string): string {
    let result = markdown;

    // Remove trailing whitespace from each line
    result = result.replace(/[ \t]+$/gm, "");

    // Replace 3+ consecutive blank lines with 2
    result = result.replace(/\n{3,}/g, "\n\n");

    // Ensure single newline at end
    result = result.replace(/\n*$/, "\n");

    // Remove leading blank lines
    result = result.replace(/^\n+/, "");

    return result;
  }

  /**
   * Improve heading hierarchy (ensure no gaps like H1 → H3, fix H1 count to 1).
   */
  private static improveHeadingHierarchy(markdown: string): string {
    const lines = markdown.split("\n");
    const result: string[] = [];

    let hasH1 = false;
    let maxLevel = 0;

    // First pass: detect if there are any H1s
    for (const line of lines) {
      const match = line.match(/^(#{1,6})\s/);
      if (match) {
        const level = match[1].length;
        if (level === 1) hasH1 = true;
      }
    }

    for (const line of lines) {
      const match = line.match(/^(#{1,6})\s/);
      if (!match) {
        result.push(line);
        continue;
      }

      let level = match[1].length;

      // If no H1 exists, promote the first heading to H1
      if (!hasH1 && level === 2) {
        level = 1;
        hasH1 = true;
      }

      // Fix heading gaps: if we jumped from H1 to H3, change H3 to H2
      if (level > maxLevel + 1 && maxLevel > 0) {
        level = maxLevel + 1;
      }

      maxLevel = Math.max(maxLevel, level);
      const hashes = "#".repeat(level);
      result.push(hashes + line.substring(match[1].length));
    }

    return result.join("\n");
  }

  /**
   * Calculate string similarity (Levenshtein-based) for duplicate detection.
   */
  private static similarity(a: string, b: string): number {
    if (a === b) return 1;
    if (a.length < 2 || b.length < 2) return 0;

    const len = Math.max(a.length, b.length);
    const distance = this.levenshteinDistance(a, b);
    return 1 - distance / len;
  }

  /**
   * Calculate Levenshtein distance between two strings.
   */
  private static levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }
}

