import React from "react";
import { ArrowRight } from "lucide-react";
import { BlogPost, ViewMode } from "../types";
import { BLOG_POSTS } from "../data";

import imgBlog1 from "../assets/images/cloudconvert-banner.webp";
import imgBlog2 from "../assets/images/word-to-markdown-teams.webp";
import imgBlog3 from "../assets/images/pdf-llm-feeding.webp";
import imgBlog4 from "../assets/images/markdown-cheatsheet.webp";
import imgBlog5 from "../assets/images/chatgpt-blog-image.webp";
import imgBlog6 from "../assets/images/word_to_markdown_screenshot.webp";
import imgBlog7 from "../assets/images/comparison_table_screenshot.webp";
import imgBlog8 from "../assets/images/what-is-markdown.webp";

const IMAGE_MAP: Record<string, string> = {
  "imgBlog1": imgBlog1,
  "imgBlog2": imgBlog2,
  "imgBlog3": imgBlog3,
  "imgBlog4": imgBlog4,
  "imgBlog5": imgBlog5,
  "imgBlog6": imgBlog6,
  "imgBlog7": imgBlog7,
  "imgBlog8": imgBlog8,
  "pdf_vs_markdown": imgBlog2,
  "word_to_markdown_screenshot": imgBlog6,
  "comparison_table": imgBlog7,
  "markdown_cheat_sheet": imgBlog8
};

interface BlogViewProps {
  readingBlog: BlogPost | null;
  setReadingBlog: (blog: BlogPost | null) => void;
  setViewMode: (mode: ViewMode) => void;
}

export default function BlogView({ readingBlog, setReadingBlog, setViewMode }: BlogViewProps) {
  // Standalone premium zero-dependency blog markdown and dynamic anchor links parser
  const renderBlogMarkdown = (content: string) => {
    const lines = content.split("\n");
    let inList = false;
    let listItems: string[] = [];
    let inTable = false;
    let tableRows: string[][] = [];
    let inCode = false;
    let codeBlock: string[] = [];

    const elements: React.ReactNode[] = [];
    let inScriptBlock = false;

    const flushList = (key: string) => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${key}`} className="list-disc pl-5 my-3.5 space-y-1.5 text-gray-650">
            {listItems.map((item, i) => (
              <li key={i}>{parseInlineFormatting(item)}</li>
            ))}
          </ul>
        );
        listItems = [];
      }
      inList = false;
    };

    const flushTable = (key: string) => {
      if (tableRows.length > 0) {
        let headers: string[] = [];
        let rows: string[][] = [];
        const filteredRows = tableRows.filter(row => !row.every(cell => /^:?-+:?$/.test(cell.trim())));
        if (tableRows[0]) {
          headers = tableRows[0];
          rows = filteredRows.slice(1);
        } else {
          rows = filteredRows;
        }

        elements.push(
          <div key={`table-wrapper-${key}`} className="my-5 overflow-x-auto border border-gray-150 rounded-xl bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-slate-50">
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider font-sans border-r border-gray-150 last:border-0">
                      {parseInlineFormatting(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {rows.map((row, ri) => (
                  <tr key={ri} className="hover:bg-slate-50/40">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-4 py-3 text-xs text-gray-600 border-r border-gray-150 last:border-0 font-sans">
                        {parseInlineFormatting(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
      }
      inTable = false;
    };

    const flushCode = (key: string) => {
      if (codeBlock.length > 0) {
        elements.push(
          <pre key={`code-${key}`} className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-xs font-mono my-4 border border-slate-800 leading-normal">
            <code>{codeBlock.join("\n")}</code>
          </pre>
        );
        codeBlock = [];
      }
      inCode = false;
    };

    const parseInlineFormatting = (text: string): React.ReactNode => {
      const parts = text.split(/(\[link: [^\]]+\]|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
      return parts.map((part, idx) => {
        if (part.startsWith("[link: ") && part.endsWith("]")) {
          const linkType = part.slice(7, -1).trim();
          const normalizedLink = linkType.toLowerCase();
          if (normalizedLink.includes("homepage")) {
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setViewMode("home");
                  setReadingBlog(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-indigo-600 hover:text-indigo-800 font-semibold underline decoration-dotted inline cursor-pointer pr-1"
              >
                ConvertOneAI Home
              </button>
            );
          } else if (normalizedLink.includes("pdf to markdown") || normalizedLink.includes("pdf to md")) {
            const targetPost = BLOG_POSTS.find(p => p.id === "blog-5-pdf-to-markdown-guide");
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (targetPost) {
                    setReadingBlog(targetPost);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className="text-indigo-600 hover:text-indigo-800 font-semibold underline decoration-dotted inline cursor-pointer text-left pr-1"
              >
                converting PDF to Markdown Guide
              </button>
            );
          } else if (normalizedLink.includes("token saving") || normalizedLink.includes("claude")) {
            const targetPost = BLOG_POSTS.find(p => p.id === "blog-4");
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (targetPost) {
                    setReadingBlog(targetPost);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className="text-indigo-600 hover:text-indigo-800 font-semibold underline decoration-dotted inline cursor-pointer text-left pr-1"
              >
                Claude AI optimization guide
              </button>
            );
          } else if (normalizedLink.includes("word to markdown") || normalizedLink.includes("word to md")) {
            const targetPost = BLOG_POSTS.find(p => p.id === "blog-6-word-to-markdown-guide");
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (targetPost) {
                    setReadingBlog(targetPost);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className="text-indigo-600 hover:text-indigo-800 font-semibold underline decoration-dotted inline cursor-pointer text-left pr-1"
              >
                Word to Markdown converter guide
              </button>
            );
          }
        } else if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={idx} className="bg-slate-100 text-indigo-600 text-xs font-mono px-1.5 py-0.5 rounded border border-slate-200">
              {part.slice(1, -1)}
            </code>
          );
        } else if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={idx} className="font-semibold text-gray-950">{part.slice(2, -2)}</strong>;
        } else if (part.startsWith("*") && part.endsWith("*")) {
          return <em key={idx} className="italic text-gray-800">{part.slice(1, -1)}</em>;
        }
        return part;
      });
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith("<script")) {
        inScriptBlock = true;
        continue;
      }
      if (trimmedLine.includes("</script")) {
        inScriptBlock = false;
        continue;
      }
      if (inScriptBlock) {
        continue;
      }

      if (trimmedLine.startsWith("**SEO Title:**") || trimmedLine.startsWith("**Meta Description:**") || trimmedLine.startsWith("SEO Title:") || trimmedLine.startsWith("Meta Description:")) {
        continue;
      }

      if (trimmedLine.startsWith("```")) {
        if (inCode) {
          flushCode(`line-${i}`);
        } else {
          flushList(`line-${i}`);
          flushTable(`line-${i}`);
          inCode = true;
        }
        continue;
      }

      if (inCode) {
        codeBlock.push(line);
        continue;
      }

      if (trimmedLine.startsWith("# ")) {
        flushList(`line-${i}`);
        flushTable(`line-${i}`);
        elements.push(
          <h1 key={`h1-${i}`} className="text-2xl font-bold tracking-tight text-gray-900 font-sans mt-6 mb-3 border-b border-gray-100 pb-2">
            {parseInlineFormatting(trimmedLine.slice(2))}
          </h1>
        );
        continue;
      }

      if (trimmedLine.startsWith("## ")) {
        flushList(`line-${i}`);
        flushTable(`line-${i}`);
        elements.push(
          <h2 key={`h2-${i}`} className="text-xl font-bold tracking-tight text-gray-900 font-sans mt-6 mb-3">
            {parseInlineFormatting(trimmedLine.slice(3))}
          </h2>
        );
        continue;
      }

      if (trimmedLine.startsWith("### ")) {
        flushList(`line-${i}`);
        flushTable(`line-${i}`);
        elements.push(
          <h3 key={`h3-${i}`} className="text-lg font-bold tracking-tight text-gray-950 font-sans mt-5 mb-2">
            {parseInlineFormatting(trimmedLine.slice(4))}
          </h3>
        );
        continue;
      }

      if (trimmedLine.startsWith("|") && trimmedLine.endsWith("|")) {
        flushList(`line-${i}`);
        if (!inTable) {
          inTable = true;
        }
        const cells = trimmedLine.split("|").map(cell => cell.trim()).filter((_, index, arr) => index > 0 && index < arr.length - 1);
        tableRows.push(cells);
        continue;
      } else if (inTable) {
        flushTable(`line-${i}`);
      }

      if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ") || trimmedLine.startsWith("• ")) {
        if (!inList) {
          inList = true;
        }
        listItems.push(trimmedLine.substring(2));
        continue;
      } else if (trimmedLine.match(/^\d+\.\s/)) {
        if (!inList) {
          inList = true;
        }
        const prefixMatch = trimmedLine.match(/^\d+\.\s/);
        listItems.push(trimmedLine.substring(prefixMatch ? prefixMatch[0].length : 2));
        continue;
      } else if (inList) {
        flushList(`line-${i}`);
      }

      const imgMatch = trimmedLine.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) {
        flushList(`line-${i}`);
        flushTable(`line-${i}`);
        const alt = imgMatch[1];
        const rawSrc = imgMatch[2];
        const src = IMAGE_MAP[rawSrc] || rawSrc;
        elements.push(
          <div key={`img-${i}`} className="my-6 w-full rounded-xl overflow-hidden border border-slate-150 shadow-sm p-2 bg-slate-50/75 flex flex-col items-center select-none">
            <div className="watermark-container">
              <img loading="lazy" 
                src={src} 
                alt={alt} 
                className="w-full h-auto max-h-[480px] object-contain rounded-lg pointer-events-none" 
                referrerPolicy="no-referrer" 
              />
            </div>
            {alt && <span className="text-xs text-slate-400 font-sans mt-2">{alt}</span>}
          </div>
        );
        continue;
      }

      if (trimmedLine.startsWith("> ")) {
        elements.push(
          <blockquote key={`quote-${i}`} className="border-l-4 border-indigo-500 bg-indigo-50/50 p-4 rounded-r-xl italic my-4 text-gray-600 font-sans text-sm">
            {parseInlineFormatting(trimmedLine.slice(2))}
          </blockquote>
        );
        continue;
      }

      if (trimmedLine.length > 0) {
        elements.push(
          <p key={`p-${i}`} className="font-sans leading-relaxed text-gray-700 text-sm mb-3">
            {parseInlineFormatting(line)}
          </p>
        );
      } else {
        elements.push(<div key={`spacer-${i}`} className="h-2 select-none" />);
      }
    }

    flushList("final");
    flushTable("final");
    flushCode("final");

    return elements;
  };

  return (
    <div className="space-y-8 text-left">
      <div className="border-b border-gray-150 pb-5 mb-5 select-none">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-605 block">Industry Perspectives</span>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-sans mt-1">ConvertOneAI Blog &amp; Guides</h1>
        <p className="text-gray-500 text-sm font-sans mt-0.5">Explore best practices around structural document transitions, RAG optimizations, and technical documentation layouts.</p>
      </div>

      {readingBlog ? (
        // Active Blog Article Reader view
        <article className="bg-white rounded-2xl border border-gray-150 p-6 md:p-10 shadow-sm max-w-3xl mx-auto space-y-6">
          <button
            onClick={() => setReadingBlog(null)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 pb-2.5 border-b border-gray-100 w-full mb-3 select-none"
          >
            ← Return to Blog Index
          </button>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs text-gray-400 select-none">
              <span>{readingBlog.publishedAt}</span>
              <span>•</span>
              <span>{readingBlog.readTime}</span>
              <span>•</span>
              <span>By {readingBlog.author}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 font-sans tracking-tight">{readingBlog.title}</h1>
          </div>

          {readingBlog.image && (
            <div className="w-full rounded-xl overflow-hidden border border-gray-150 shadow-sm relative bg-slate-50/50 flex items-center justify-center p-1 md:p-2">
              <div className="watermark-container flex items-center justify-center">
                <img loading="lazy" 
                  src={IMAGE_MAP[readingBlog.image] || readingBlog.image} 
                  alt={readingBlog.title} 
                  className="w-full h-auto max-h-[550px] object-contain rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}

          <div className="prose prose-indigo max-w-none text-gray-700 text-sm leading-relaxed font-sans mt-2">
            {renderBlogMarkdown(readingBlog.content)}
          </div>

          <div className="pt-6 border-t border-gray-100 select-none">
            <button
              onClick={() => setReadingBlog(null)}
              className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-xs font-bold rounded-lg border border-gray-200 text-gray-600 transition-colors"
            >
              Close Article
            </button>
          </div>
        </article>
      ) : (
        // General Grid list
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BLOG_POSTS.map((post) => (
            <article key={post.id} className="bg-white rounded-xl border border-gray-150 shadow-sm overflow-hidden flex flex-col justify-between group hover:border-indigo-150 transition-all">
              {post.image && (
                <div className="h-44 w-full overflow-hidden border-b border-gray-100 relative">
                  <div className="watermark-container w-full h-full">
                    <img loading="lazy" 
                      src={IMAGE_MAP[post.image] || post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              )}
              <div className="p-6 text-left space-y-3">
                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                  <span>{post.publishedAt}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-indigo-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed font-sans line-clamp-3">
                  {post.excerpt}
                </p>
              </div>

              <div className="px-6 py-4.5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between select-none">
                <span className="text-xs text-gray-400">By {post.author}</span>
                <button
                  onClick={() => setReadingBlog(post)}
                  className="text-xs font-bold text-indigo-600 group-hover:text-indigo-800 transition-colors inline-flex items-center gap-1"
                >
                  <span>Read More</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
