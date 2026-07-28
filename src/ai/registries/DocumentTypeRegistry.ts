/**
 * Document Type Registry
 *
 * Detects document types based on keywords and patterns.
 * Future: ML-based type detection via external service.
 */

import type { DocumentType } from "../../types";

interface DocTypeConfig {
  type: DocumentType;
  name: string;
  icon: string;
  description: string;
  color: string;
  keywords: string[];
  recommendations: string[];
}

/**
 * Document Type Registry — detects document types from text content.
 * Uses keyword matching with scoring. Extensible for future ML-based detection.
 */
export class DocumentTypeRegistry {
  private static types: Map<DocumentType, DocTypeConfig> = new Map();

  /**
   * Initialize built-in document types.
   */
  static initialize(): void {
    const builtIn: DocTypeConfig[] = [
      {
        type: "book",
        name: "Book",
        icon: "BookOpen",
        color: "text-amber-600",
        description: "Full-length book or publication",
        keywords: [
          "chapter", "part", "introduction", "preface", "foreword",
          "bibliography", "index", "appendix", "publishing", "edition",
          "acknowledgments", "prologue", "epilogue",
        ],
        recommendations: [
          "Use AI Cleaner to remove chapter headers/footers for cleaner output",
          "Generate study notes for each chapter",
          "Extract table of contents as structured data",
        ],
      },
      {
        type: "research-paper",
        name: "Research Paper",
        icon: "Search",
        color: "text-blue-600",
        description: "Academic research paper or article",
        keywords: [
          "abstract", "methodology", "results", "discussion", "conclusion",
          "references", "doi", "introduction", "literature review",
          "experiment", "hypothesis", "peer review",
        ],
        recommendations: [
          "Generate a research brief for quick understanding",
          "Extract methodology and findings as structured data",
          "Create flashcards for key findings",
        ],
      },
      {
        type: "resume",
        name: "Resume / CV",
        icon: "User",
        color: "text-green-600",
        description: "Resume, CV, or professional profile",
        keywords: [
          "experience", "education", "skills", "summary", "objective",
          "employment", "qualifications", "certifications", "projects",
          "achievements", "professional",
        ],
        recommendations: [
          "Generate a cover letter from this resume",
          "Extract skills as structured JSON for job matching",
          "Create interview questions based on experience",
        ],
      },
      {
        type: "contract",
        name: "Contract",
        icon: "FileText",
        color: "text-red-600",
        description: "Legal agreement or contract",
        keywords: [
          "agreement", "terms", "conditions", "party", "hereby",
          "whereas", "indemnification", "governing law", "effective date",
          "confidentiality", "termination", "liability",
        ],
        recommendations: [
          "Extract key clauses and obligations",
          "Highlight important dates and deadlines",
          "Generate a plain-language summary for non-legal team members",
        ],
      },
      {
        type: "invoice",
        name: "Invoice",
        icon: "Receipt",
        color: "text-purple-600",
        description: "Invoice or billing document",
        keywords: [
          "invoice", "payment", "due date", "total", "subtotal",
          "tax", "bill to", "invoice number", "amount due",
          "balance", "payment terms",
        ],
        recommendations: [
          "Extract invoice data as structured JSON",
          "Generate a payment reminder prompt",
          "Export as structured data for accounting",
        ],
      },
      {
        type: "educational",
        name: "Educational Material",
        icon: "GraduationCap",
        color: "text-cyan-600",
        description: "Course material, lesson plan, or educational content",
        keywords: [
          "lesson", "module", "course", "learning objectives",
          "assignment", "quiz", "exam", "grade", "curriculum",
          "syllabus", "lecture", "tutorial",
        ],
        recommendations: [
          "Generate study notes for students",
          "Create quiz questions from material",
          "Extract key concepts as flashcards",
        ],
      },
      {
        type: "manual",
        name: "Manual / Guide",
        icon: "Book",
        color: "text-orange-600",
        description: "User manual, installation guide, or documentation",
        keywords: [
          "installation", "setup", "configuration", "user guide",
          "troubleshooting", "instructions", "warning", "caution",
          "step", "procedure", "maintenance",
        ],
        recommendations: [
          "Generate a quick-start guide from the manual",
          "Create troubleshooting FAQ",
          "Extract step-by-step procedures",
        ],
      },
      {
        type: "report",
        name: "Report",
        icon: "BarChart",
        color: "text-indigo-600",
        description: "Business report, analysis, or summary",
        keywords: [
          "executive summary", "findings", "analysis", "recommendations",
          "overview", "quarterly", "annual", "metrics", "kpi",
          "performance", "review", "forecast",
        ],
        recommendations: [
          "Generate an executive summary for stakeholders",
          "Extract key metrics as structured data",
          "Create a presentation outline from findings",
        ],
      },
      {
        type: "unknown",
        name: "General Document",
        icon: "File",
        color: "text-gray-600",
        description: "General or unrecognized document type",
        keywords: [],
        recommendations: [
          "Try AI Cleaner to improve document structure",
          "Generate a summary for quick understanding",
          "Export as Markdown for further processing",
        ],
      },
    ];

    builtIn.forEach((dt) => this.types.set(dt.type, dt));
  }

  /**
   * Register a new document type.
   */
  static register(config: DocTypeConfig): void {
    this.types.set(config.type, config);
  }

  /**
   * Get document type configuration.
   */
  static get(type: DocumentType): DocTypeConfig | undefined {
    return this.types.get(type);
  }

  /**
   * Get all registered types.
   */
  static getAll(): DocTypeConfig[] {
    return Array.from(this.types.values());
  }

  /**
   * Detect document type from text content.
   * Uses keyword frequency scoring.
   * @param text - The document text content
   * @param title - Optional document title for additional context
   */
  static detect(text: string, title?: string): { type: DocumentType; confidence: number } {
    const textLower = text.toLowerCase();
    const titleLower = (title || "").toLowerCase();

    const scores: Map<DocumentType, number> = new Map();

    this.types.forEach((config, type) => {
      if (type === "unknown") return;
      let score = 0;

      // Score from document body keywords
      config.keywords.forEach((keyword) => {
        const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
        const matches = textLower.match(regex);
        if (matches) {
          score += matches.length;
        }
      });

      // Bonus if keyword appears in title
      config.keywords.forEach((keyword) => {
        if (titleLower.includes(keyword)) {
          score += 3;
        }
      });

      // Bonus for first 500 chars (where metadata usually lives)
      const headText = textLower.substring(0, 500);
      config.keywords.forEach((keyword) => {
        if (headText.includes(keyword)) {
          score += 2;
        }
      });

      scores.set(type, score);
    });

    // Find the type with the highest score
    let bestType: DocumentType = "unknown";
    let bestScore = 0;

    scores.forEach((score, type) => {
      if (score > bestScore) {
        bestScore = score;
        bestType = type;
      }
    });

    // Calculate confidence (heuristic)
    const maxPossibleScore = 50;
    const confidence = Math.min(100, Math.round((bestScore / maxPossibleScore) * 100));

    return { type: bestType, confidence };
  }

  /**
   * Get recommendations for a document type.
   */
  static getRecommendations(type: DocumentType): string[] {
    return this.types.get(type)?.recommendations || [];
  }
}

