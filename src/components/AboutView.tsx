import { Check } from "lucide-react";

export default function AboutView() {
  return (
    <div className="space-y-8 text-left max-w-3xl mx-auto font-sans animate-fadeIn">
      <div className="border-b border-gray-150 pb-5 select-none">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block">Our Purpose</span>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-1">Our Mission</h1>
        <p className="text-gray-500 text-sm mt-1">We make documents universally portable and developer-friendly.</p>
      </div>

      <div className="space-y-6 text-slate-600 leading-relaxed text-sm md:text-base">
        <p className="text-gray-900 font-medium">
          Most documentation workflows today depend on clean, responsive plain-text. Yet, much of the world's knowledge remains locked inside heavy, uncooperative PDFs and closed Microsoft Word files.
        </p>

        <p>
          Developers, technical writers, and content teams suffer constant friction. Copying content from a complex document into static site generators, Notion, GitHub wikis, or internal product hubs usually destroys layout structures. Word parser engines too often generate convoluted markup filled with empty elements, broken symbols, and disorganized bullet lists.
        </p>

        <p>
          ConvertOneAI solves this digital gridlock. We created a fast, zero-install workspace where anyone can drop a document and receive optimized, perfectly indexed Markdown instantly. No subscription paywalls, no cookie-consent prompts, and no email sign-up forms. 
        </p>

        <div className="bg-slate-50 p-6 rounded-2xl border border-gray-150 space-y-4">
          <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block">Who We Build For</span>
          <p className="text-xs text-slate-500 leading-relaxed mt-0">
            ConvertOneAI serves technical writers building API references, developers uploading legacy documentation, students converting research PDFs into local obsidian vaults, and creators publishing directly to plain-text blogs. If you work with documents and code, we designed this tool for you.
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">Our Core Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-gray-150 rounded-xl space-y-1">
              <h4 className="text-sm font-bold text-gray-900">1. Simplicity Above All</h4>
              <p className="text-xs text-slate-500">Technology should get out of your way. We offer a clean, focus-driven single-screen editor, delivering pristine plain-text outputs without configuration delays.</p>
            </div>
            <div className="p-4 bg-white border border-gray-150 rounded-xl space-y-1">
              <h4 className="text-sm font-bold text-gray-900">2. Privacy-First Conduct</h4>
              <p className="text-xs text-slate-500">Your documents should never live in a database. We process files strictly inside temporary, volatile memory buffers that flush instantly after translation completes.</p>
            </div>
            <div className="p-4 bg-white border border-gray-150 rounded-xl space-y-1">
              <h4 className="text-sm font-bold text-gray-900">3. Universal Accessibility</h4>
              <p className="text-xs text-slate-500">Quality developer tools belong to everyone. ConvertOneAI compiles, structures, and beautifies files free of charges and annoying pop-up scripts.</p>
            </div>
            <div className="p-4 bg-white border border-gray-150 rounded-xl space-y-1">
              <h4 className="text-sm font-bold text-gray-900">4. Processing Velocity</h4>
              <p className="text-xs text-slate-500">Wait times crush creative rhythm. Our native local rendering code aims to parse standard Word documents and raw structural data within milliseconds.</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">Our Plain-Text Vision</h3>
          <p className="text-sm text-slate-600 mt-2">
            Plain-text forms the resilient foundation of modern web documentation. As we grow, our team plans to support smarter conversions, specialized schema outputs, and broader structures. We build to help the open-text movement thrive, one smooth conversion at a time.
          </p>
          <div className="mt-4 p-4 bg-indigo-50/50 rounded-xl flex items-center gap-3">
            <Check size={16} className="text-indigo-600 shrink-0" />
            <span className="text-xs text-indigo-950 font-medium font-sans">ConvertOneAI is designed with love for the plain-text blogging, static docs, and engineering communities.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
