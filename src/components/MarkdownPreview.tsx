import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface MarkdownPreviewProps {
  markdown: string;
}

export default function MarkdownPreview({ markdown }: MarkdownPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Parse Markdown text to beautifully HTML.
   * Self-contained, robust engine styled with Tailwind CSS.
   */
  const parseMarkdownToHtml = (md: string) => {
    if (!md) return '<p class="text-slate-400 italic font-sans">No content to preview.</p>';

    // Escape basic HTML to prevent XSS
    let escaped = md
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const lines = escaped.split("\n");
    let inList = false;
    let listType: "ul" | "ol" | null = null;
    let inTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];
    let inCodeBlock = false;
    let codeLanguage = "";
    let codeBuffer: string[] = [];
    let inBlockquote = false;
    let bqBuffer: string[] = [];

    const resultHtml: string[] = [];

    const closeList = () => {
      if (inList) {
        resultHtml.push(listType === "ul" ? "</ul>" : "</ol>");
        inList = false;
        listType = null;
      }
    };

    const closeTable = () => {
      if (inTable) {
        let tableHtml = '<div class="overflow-x-auto my-4 rounded-lg border border-slate-200 shadow-sm"><table class="min-w-full divide-y divide-slate-200 text-sm font-sans">';
        
        // Headers
        tableHtml += '<thead class="bg-slate-50">';
        tableHtml += "<tr>";
        tableHeaders.forEach((header) => {
          tableHtml += `<th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">${header.trim()}</th>`;
        });
        tableHtml += "</tr></thead>";

        // Body
        tableHtml += '<tbody class="bg-white divide-y divide-slate-100">';
        tableRows.forEach((row, idx) => {
          const rowBg = idx % 2 === 0 ? "bg-white" : "bg-slate-50/55";
          tableHtml += `<tr class="${rowBg}">`;
          // pad cells if row length is less than header length
          for (let i = 0; i < tableHeaders.length; i++) {
            const cell = row[i] || "";
            tableHtml += `<td class="px-4 py-2.5 text-slate-700 whitespace-nowrap">${cell.trim()}</td>`;
          }
          tableHtml += "</tr>";
        });
        tableHtml += "</tbody></table></div>";

        resultHtml.push(tableHtml);
        inTable = false;
        tableHeaders = [];
        tableRows = [];
      }
    };

    const processInlineFormatting = (text: string): string => {
      let formatted = text;
      // Bold **text** or __text__
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
      formatted = formatted.replace(/__(.*?)__/g, '<strong class="font-bold text-slate-900">$1</strong>');
      
      // Italic *text* or _text_
      formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic text-slate-800">$1</em>');
      formatted = formatted.replace(/_(.*?)_/g, '<em class="italic text-slate-800">$1</em>');

      // Inline code `code`
      formatted = formatted.replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 text-rose-600 font-mono text-xs">$1</code>');

      // Links: [Text](Url)
      formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:text-indigo-800 underline">$1</a>');

      return formatted;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // --- 1. Code Block Fence ---
      if (trimmed.startsWith("```")) {
        if (inCodeBlock) {
          // Close Code Block
          const codeText = codeBuffer.join("\n");
          resultHtml.push(
            `<pre class="my-4 p-4 rounded-lg bg-slate-900 text-indigo-100 font-mono text-xs overflow-x-auto leading-relaxed relative">` +
              `<div class="absolute top-2 right-2 text-[10px] text-slate-500 tracking-wider uppercase font-semibold">${codeLanguage || "code"}</div>` +
              `<code>${codeText}</code>` +
              `</pre>`
          );
          inCodeBlock = false;
          codeBuffer = [];
          codeLanguage = "";
        } else {
          // Open code block
          closeList();
          closeTable();
          inCodeBlock = true;
          codeLanguage = trimmed.substring(3).trim();
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      // --- 2. Blockquotes ---
      if (trimmed.startsWith("&gt;") || trimmed.startsWith(">")) {
        closeList();
        closeTable();
        inBlockquote = true;
        
        let content = trimmed;
        if (trimmed.startsWith("&gt;")) content = trimmed.substring(4).trim();
        else if (trimmed.startsWith(">")) content = trimmed.substring(1).trim();

        bqBuffer.push(processInlineFormatting(content));
        continue;
      } else if (inBlockquote) {
        // If blockquote is active but line is empty or does not start with >, close blockquote
        if (trimmed === "") {
          resultHtml.push(
            `<blockquote class="my-4 pl-4 border-l-4 border-indigo-500 bg-indigo-50/20 py-2.5 pr-2 rounded-r-lg text-slate-700 font-sans italic leading-relaxed">` +
              bqBuffer.join("<br/>") +
              `</blockquote>`
          );
          inBlockquote = false;
          bqBuffer = [];
        } else {
          bqBuffer.push(processInlineFormatting(line));
          continue;
        }
      }

      // --- 3. Empty lines ---
      if (trimmed === "") {
        closeList();
        closeTable();
        continue;
      }

      // --- 4. Horizontal Rule ---
      if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
        closeList();
        closeTable();
        resultHtml.push('<hr class="my-6 border-t border-slate-200" />');
        continue;
      }

      // --- 5. Headings (#) ---
      if (trimmed.startsWith("#")) {
        closeList();
        closeTable();
        const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
        if (headerMatch) {
          const depth = headerMatch[1].length;
          const content = processInlineFormatting(headerMatch[2]);
          if (depth === 1) {
            resultHtml.push(`<h1 class="text-3xl font-bold font-sans tracking-tight text-slate-900 mb-4 mt-6 border-b border-slate-100 pb-2">${content}</h1>`);
          } else if (depth === 2) {
            resultHtml.push(`<h2 class="text-2xl font-semibold font-sans tracking-tight text-slate-800 mb-3 mt-5 pb-1 border-b border-slate-50">${content}</h2>`);
          } else if (depth === 3) {
            resultHtml.push(`<h3 class="text-xl font-medium font-sans text-slate-800 mb-2 mt-4">${content}</h3>`);
          } else {
            resultHtml.push(`<h4 class="text-lg font-medium font-sans text-slate-700 mb-2 mt-3">${content}</h4>`);
          }
          continue;
        }
      }

      // --- 6. Playlists / Unordered lists (-) ---
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
        closeTable();
        if (!inList || listType !== "ul") {
          closeList();
          resultHtml.push('<ul class="list-disc list-inside space-y-1.5 my-3 pl-2.5 font-sans justify-start text-gray-700">');
          inList = true;
          listType = "ul";
        }
        const bulletText = trimmed.substring(2).trim();
        resultHtml.push(`<li class="leading-relaxed justify-start">${processInlineFormatting(bulletText)}</li>`);
        continue;
      }

      // --- 7. Numbered Lists (1.) ---
      const numListMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numListMatch) {
        closeTable();
        if (!inList || listType !== "ol") {
          closeList();
          resultHtml.push('<ol class="list-decimal list-inside space-y-1.5 my-3 pl-2.5 font-sans justify-start text-gray-700">');
          inList = true;
          listType = "ol";
        }
        const listText = numListMatch[2].trim();
        resultHtml.push(`<li class="leading-relaxed justify-start">${processInlineFormatting(listText)}</li>`);
        continue;
      }

      // --- 8. Table Parsing (Pipes) ---
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        closeList();
        const cells = trimmed.split("|").map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
        
        // Skip separators line (e.g. |---|---|)
        const isSeparator = cells.every(cell => /^:?-+:?$/.test(cell));

        if (isSeparator) {
          // skip separator lines
          continue;
        }

        if (!inTable) {
          inTable = true;
          tableHeaders = cells;
          tableRows = [];
        } else {
          tableRows.push(cells);
        }
        continue;
      } else {
        closeTable();
      }

      // --- 9. Standard paragraphs ---
      resultHtml.push(`<p class="leading-relaxed text-gray-700 mb-3 font-sans text-base">${processInlineFormatting(line)}</p>`);
    }

    // Flush remaining open blocks
    closeList();
    closeTable();
    if (inBlockquote) {
      resultHtml.push(
        `<blockquote class="my-4 pl-4 border-l-4 border-indigo-500 bg-indigo-50/20 py-2.5 pr-2 rounded-r-lg text-slate-700 font-sans italic leading-relaxed font-sans">` +
          bqBuffer.join("<br/>") +
          `</blockquote>`
      );
    }

    return resultHtml.join("\n");
  };

  return (
    <div id="workspace-preview" className="relative bg-white rounded-xl border border-slate-200 p-6 shadow-sm min-h-[500px]">
      <div className="flex items-center justify-between border-b border-slate-150 pb-3.5 mb-5 select-none">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-sans">
          Interpreted Live Render
        </h3>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50/50 rounded-lg border border-slate-200 hover:border-indigo-100 transition-all font-medium"
          id="btn-preview-copy"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-500" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy Rendered</span>
            </>
          )}
        </button>
      </div>
      
      {/* Visual render context container */}
      <div 
        className="prose max-w-none text-slate-800 text-left h-[460px] overflow-y-auto pr-2 scrollbar-thin"
        dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(markdown) }}
      />
    </div>
  );
}
