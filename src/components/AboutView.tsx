import { Check } from "lucide-react";

export default function AboutView() {
  return (
    <div className="space-y-8 text-left max-w-3xl mx-auto font-sans">
      <div className="border-b border-[#E4E0D8] pb-5 select-none">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2F6F5E] block">Our Purpose</span>
        <h1 className="text-3xl font-bold font-display text-[#171B26] tracking-tight mt-1">Our Mission</h1>
        <p className="text-[#6B6459] text-sm mt-1">We make documents universally portable and developer-friendly.</p>
      </div>

      <div className="space-y-6 text-[#6B6459] leading-relaxed text-sm md:text-base">
        <p className="text-[#171B26] font-medium">
          Most documentation workflows today depend on clean, responsive plain-text. Yet, much of the world's knowledge remains locked inside heavy, uncooperative PDFs and closed Microsoft Word files.
        </p>

        <p>
          Developers, technical writers, and content teams suffer constant friction. Copying content from a complex document into static site generators, Notion, GitHub wikis, or internal product hubs usually destroys layout structures. Word parser engines too often generate convoluted markup filled with empty elements, broken symbols, and disorganized bullet lists.
        </p>

        <p>
          ConvertOneAI solves this digital gridlock. We created a fast, zero-install workspace where anyone can drop a document and receive optimized, perfectly indexed Markdown instantly. No subscription paywalls, no cookie-consent prompts, and no email sign-up forms.
        </p>

        <div className="bg-[#FAF8F3] p-6 rounded-xl border border-[#E4E0D8] space-y-4">
          <span className="font-mono font-bold text-[#171B26] text-xs uppercase tracking-wider block">Who We Build For</span>
          <p className="text-xs text-[#6B6459] leading-relaxed mt-0">
            ConvertOneAI serves technical writers building API references, developers uploading legacy documentation, students converting research PDFs into local obsidian vaults, and creators publishing directly to plain-text blogs. If you work with documents and code, we designed this tool for you.
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <h3 className="text-lg font-bold font-display text-[#171B26] tracking-tight">Our Core Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#FAF8F3] border border-[#E4E0D8] rounded-xl space-y-1">
              <h4 className="text-sm font-bold text-[#171B26]">1. Simplicity Above All</h4>
              <p className="text-xs text-[#6B6459]">Technology should get out of your way. We offer a clean, focus-driven single-screen editor, delivering pristine plain-text outputs without configuration delays.</p>
            </div>
            <div className="p-4 bg-[#FAF8F3] border border-[#E4E0D8] rounded-xl space-y-1">
              <h4 className="text-sm font-bold text-[#171B26]">2. Privacy-First Conduct</h4>
              <p className="text-xs text-[#6B6459]">Your documents should never live in a database. We process files strictly inside temporary, volatile memory buffers that flush instantly after translation completes.</p>
            </div>
            <div className="p-4 bg-[#FAF8F3] border border-[#E4E0D8] rounded-xl space-y-1">
              <h4 className="text-sm font-bold text-[#171B26]">3. Universal Accessibility</h4>
              <p className="text-xs text-[#6B6459]">Quality developer tools belong to everyone. ConvertOneAI compiles, structures, and beautifies files free of charges and annoying pop-up scripts.</p>
            </div>
            <div className="p-4 bg-[#FAF8F3] border border-[#E4E0D8] rounded-xl space-y-1">
              <h4 className="text-sm font-bold text-[#171B26]">4. Processing Velocity</h4>
              <p className="text-xs text-[#6B6459]">Wait times crush creative rhythm. Our native local rendering code aims to parse standard Word documents and raw structural data within milliseconds.</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#E4E0D8]">
          <h3 className="text-lg font-bold font-display text-[#171B26] tracking-tight">Our Plain-Text Vision</h3>
          <p className="text-sm text-[#6B6459] mt-2">
            Plain-text forms the resilient foundation of modern web documentation. As we grow, our team plans to support smarter conversions, specialized schema outputs, and broader structures. We build to help the open-text movement thrive, one smooth conversion at a time.
          </p>
          <div className="mt-4 p-4 bg-[#FAF8F3] rounded-xl flex items-center gap-3 border border-[#E4E0D8]">
            <Check size={16} className="text-[#2F6F5E] shrink-0" />
            <span className="text-xs text-[#171B26] font-medium font-sans">ConvertOneAI is designed with love for the plain-text blogging, static docs, and engineering communities.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
