/**
 * Prompt Template Registry
 *
 * Stores all prompt templates with provider-specific variants.
 * New prompt templates can be added by registering them.
 * Supports 4 AI providers: ChatGPT, Claude, Gemini, Local LLM.
 */

import type { PromptTemplate, PromptTemplateId, AIProviderId } from "../../types";

export class PromptTemplateRegistry {
  private static templates: Map<PromptTemplateId, PromptTemplate> = new Map();

  /**
   * Initialize built-in prompt templates.
   */
  static initialize(): void {
    const builtIn: PromptTemplate[] = [
      {
        id: "summary",
        name: "Summary",
        description: "Generate a concise document summary",
        icon: "FileText",
        template: `Please provide a comprehensive summary of the following document.

DOCUMENT:
{{markdown}}

Please include:
1. A one-paragraph executive summary
2. Key findings or main points
3. Important conclusions

DOCUMENT METADATA:
- Title: {{title}}
- Word count: {{wordCount}}
- Estimated reading time: {{readingTime}} minutes`,
        providerVariants: {
          claude: `I need you to summarize the following document for me.

DOCUMENT CONTENT:
{{markdown}}

Please structure your summary as:
1. **Executive Summary** (2-3 sentences)
2. **Key Points** (bullet points)
3. **Conclusions**

About this document: "{{title}}" ({{wordCount}} words, ~{{readingTime}} min read)`,
          gemini: `Analyze this document and create a structured summary.

Document:
{{markdown}}

Return: executive summary, key points, and conclusions.
Metadata: title="{{title}}", words={{wordCount}}, reading_time={{readingTime}}min`,
          local: `Summarize this document:

{{markdown}}

Document title: {{title}}
Words: {{wordCount}}`,
        },
      },
      {
        id: "research",
        name: "Research",
        description: "Extract research findings and methodology",
        icon: "Search",
        template: `Analyze the following document from a research perspective.

DOCUMENT:
{{markdown}}

Please extract:
1. Research question or objective
2. Methodology used
3. Key findings and results
4. Limitations
5. Future research directions

Format as a structured research brief.`,
      },
      {
        id: "study-notes",
        name: "Study Notes",
        description: "Create comprehensive study notes",
        icon: "BookOpen",
        template: `Convert the following document into well-structured study notes.

DOCUMENT:
{{markdown}}

Format:
## Key Concepts
- ...

## Important Definitions
- ...

## Examples
- ...

## Summary Points
1. ...
2. ...

## Review Questions
1. ?
2. ?`,
      },
      {
        id: "presentation",
        name: "Presentation",
        description: "Convert document into presentation outline",
        icon: "Monitor",
        template: `Create a presentation outline from the following document.

DOCUMENT:
{{markdown}}

Format:
# Slide 1: Title Slide
- Title: [title]
- Subtitle: [key theme]

# Slide 2: Overview
- ...

# Slide 3-N: Content Slides
- Key point 1
- Supporting detail
- Example

# Final Slide: Conclusion
- Takeaway
- Next steps`,
      },
      {
        id: "faq",
        name: "FAQ",
        description: "Generate frequently asked questions",
        icon: "HelpCircle",
        template: `Generate a comprehensive FAQ based on the following document.

DOCUMENT:
{{markdown}}

Format each Q&A as:
## Q: [Question]
**A:** [Answer with reference to document section]

Generate 5-10 FAQs covering the most important topics.
Include page/section references where applicable.`,
      },
      {
        id: "flashcards",
        name: "Flashcards",
        description: "Create Q&A flashcards for review",
        icon: "Layers",
        template: `Create flashcards from the following document for study review.

DOCUMENT:
{{markdown}}

Format each flashcard as:
**Front:** [Question or prompt]
**Back:** [Answer or explanation]

Generate at least 10 flashcards. Cover:
- Key definitions
- Important concepts
- Notable facts
- Relationships between ideas`,
      },
      {
        id: "translation",
        name: "Translation",
        description: "Translate document content",
        icon: "Globe",
        template: `Translate the following document into [TARGET_LANGUAGE].

DOCUMENT:
{{markdown}}

Requirements:
- Preserve all formatting (headings, lists, code blocks, tables)
- Maintain technical accuracy
- Keep proper nouns unchanged
- Preserve original structure and hierarchy

Source language: {{language}}
Target language: [Specify target language]`,
      },
      {
        id: "extract-data",
        name: "Extract Data",
        description: "Extract structured data from document",
        icon: "Database",
        template: `Extract structured data from the following document.

DOCUMENT:
{{markdown}}

Extract and organize:
1. **Entities**: People, organizations, locations, dates
2. **Metrics**: Numbers, statistics, measurements
3. **Relationships**: How entities are connected
4. **Categories**: Topics, themes, classifications

Output as structured JSON format when possible.`,
      },
      {
        id: "explain-like-im-five",
        name: "Explain Like I'm 5",
        description: "Simplify complex concepts",
        icon: "Heart",
        template: `Explain the following document as if I'm 5 years old.

DOCUMENT:
{{markdown}}

Requirements:
- Use simple words (no jargon)
- Short sentences
- Fun analogies and examples
- Break down complex ideas into tiny pieces
- Use comparisons a child would understand

Start with: "Imagine you're playing with building blocks..." or similar analogy.`,
      },
      {
        id: "technical-analysis",
        name: "Technical Analysis",
        description: "Deep technical breakdown",
        icon: "Cpu",
        template: `Perform a comprehensive technical analysis of the following document.

DOCUMENT:
{{markdown}}

Analysis structure:
1. **Architecture Overview**
   - System components
   - Data flow

2. **Technical Specifications**
   - Key technologies referenced
   - Performance metrics
   - Scalability considerations

3. **Implementation Details**
   - Code/algorithm analysis
   - API endpoints or interfaces
   - Data structures

4. **Security Considerations**
   - Potential vulnerabilities
   - Authentication/authorization
   - Data privacy

5. **Recommendations**
   - Improvements
   - Best practices
   - Optimization opportunities`,
      },
    ];

    builtIn.forEach((tpl) => this.templates.set(tpl.id, tpl));
  }

  /**
   * Register a new prompt template.
   */
  static register(template: PromptTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Get a template by ID.
   */
  static get(id: PromptTemplateId): PromptTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * Get all registered templates.
   */
  static getAll(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get a formatted prompt for a specific provider.
   * Falls back to the base template if no provider variant exists.
   */
  static getFormattedPrompt(
    id: PromptTemplateId,
    providerId: AIProviderId,
    variables: Record<string, string>
  ): string | null {
    const template = this.templates.get(id);
    if (!template) return null;

    // Try provider variant first, fall back to base template
    let promptText = template.providerVariants?.[providerId] || template.template;

    // Replace variables
    Object.entries(variables).forEach(([key, value]) => {
      promptText = promptText.replace(new RegExp(`{{${key}}}`, "g"), value || "");
    });

    return promptText;
  }
}

