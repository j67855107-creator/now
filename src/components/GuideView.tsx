import { BookOpen } from "lucide-react";
import { GUIDE_SECTIONS } from "../data";

export default function GuideView() {
  return (
    <div className="space-y-8 text-left">
      <div className="border-b border-gray-150 pb-5 mb-5 select-none">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block">Documentation Portal</span>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-sans mt-1">Complete Markdown Syntax Guide</h1>
        <p className="text-gray-500 text-sm font-sans mt-0.5 max-w-2xl">
          Master standard and GFM (GitHub Flavored Markdown) spec formatting templates for documents, blogs, and specs layout.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {GUIDE_SECTIONS.map((guide, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-150 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-base font-sans tracking-wide mb-1 flex items-center gap-1.5">
                <BookOpen size={16} className="text-indigo-600" />
                {guide.title}
              </h3>
              <p className="text-gray-500 text-xs leading-normal font-sans mb-4">{guide.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-950">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block pb-1.5">Write Syntax</span>
                <pre className="font-mono text-xs text-rose-400 overflow-x-auto select-all leading-normal">{guide.syntax}</pre>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block pb-1.5">Render Outcome</span>
                  <div className="prose prose-xs max-w-none text-xs text-gray-700 leading-normal truncate">
                    {guide.title === "Data Tables" ? (
                      <table className="border border-gray-200 text-[10px]">
                        <thead><tr className="bg-gray-100"><th>A</th><th>B</th></tr></thead>
                        <tbody><tr><td>Data</td><td>Data</td></tr></tbody>
                      </table>
                    ) : (
                      guide.preview
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Practical Examples */}
      <div className="bg-white rounded-xl border border-gray-150 p-6 shadow-sm font-sans">
        <h3 className="font-bold text-gray-900 text-lg mb-3">Structured Guides for Note-taking</h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          Markdown is highly adopted inside note taking utilities like Notion, Obsidian, Bear, and Logseq. Utilizing standard inline hash symbols preserves text styles seamlessly, allowing direct compatibility and export pathways to PDFs or static HTML files.
        </p>
        <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-600 space-y-2">
          <span className="font-bold text-gray-800">Why Use Markdown for Note-taking?</span>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Future Proof</strong>: Plain text files are readable forever on any modern device.</li>
            <li><strong>Keyboard Friendly</strong>: Write documents without lifting your fingers to grab the cursor.</li>
            <li><strong>Instant Synced Outputs</strong>: Upload notes straight to GitHub portals or personal wikis securely.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
