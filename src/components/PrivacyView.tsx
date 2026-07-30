import { ShieldCheck, Mail, Lock } from "lucide-react";

export default function PrivacyView() {
  return (
    <div className="max-w-3xl mx-auto text-left font-sans space-y-6 leading-relaxed text-sm text-[#6B6459] bg-[#FAF8F3] p-8 md:p-12 rounded-xl border border-[#E4E0D8] shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E4E0D8] pb-5">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2F6F5E] block">Personal Promise</span>
          <h1 className="text-3xl font-bold font-display text-[#171B26] tracking-tight mt-1">PrivacyShield Guarantee</h1>
          <p className="text-xs text-[#6B6459]/70 select-none mt-1">Effective Date: June 22, 2026</p>
        </div>
        <div className="bg-[#F6F4EE] border border-[#2F6F5E]/30 text-[#2F6F5E] px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-mono font-bold shrink-0 shadow-xs">
          <ShieldCheck size={16} />
          <span>Zero-Storage Active</span>
        </div>
      </div>

      <p className="text-[#171B26] font-medium text-base">
        We believe privacy isn't a dense legal loophole—it is a fundamental commitment to you. At ConvertOneAI, we design our software from the ground up to protect your creative work. We promise safety, complete transparency, and honest data practices.
      </p>

      <div className="space-y-6 pt-2">
        {[
          {
            n: 1,
            title: "Your Files Stay Yours",
            body: "We never store, read, or share uploaded documents. Your text, formatted charts, and data belong entirely to you. We act strictly as a temporary rendering channel, compiling your documents and immediately returning the outputs to your browser window.",
          },
          {
            n: 2,
            title: "Automatic, Instant Purging",
            body: "We hold documents strictly within volatile, short-lived RAM. Our backend servers never write your uploads to static disks, databases, index logs, or server hard drives. The absolute moment our conversion script serves the compiled Markdown text, the system completely and irreversibly flushes your file structures from memory.",
          },
          {
            n: 3,
            title: "Fully Encrypted Transfers",
            body: "We shield your documents against online snooping. Our servers enforce strict, high-grade SSL/TLS encryption for all document transmission and active download actions, creating an airtight, end-to-end encrypted tunnel for your transfers.",
          },
          {
            n: 4,
            title: "Zero Retention or Selling",
            body: "We never sell, rent, commercialize, or trade your file content or metadata to marketing agencies, advertisers, or third-party brokers. We maintain an honest, utility-focused operation funded by technology, not by exploiting user data.",
          },
          {
            n: 5,
            title: "Minimalist, Aggregate Statistics Only",
            body: "We collect only anonymous, generalized usage statistics—such as total conversion counts or average translation speeds—solely to check our container loads and ensure continuous server performance. Since ConvertOneAI requires zero logins, standard usage remains entirely anonymous.",
          },
        ].map(({ n, title, body }) => (
          <div key={n} className="relative pl-8 space-y-1 border-l-2 border-[#E4E0D8] transition-colors">
            <div className="absolute -left-2.5 top-0.5 bg-[#2F6F5E] text-[#F6F4EE] rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-mono font-bold">{n}</div>
            <h3 className="text-base font-bold text-[#171B26] tracking-tight">{title}</h3>
            <p className="text-[#6B6459] text-xs md:text-sm">{body}</p>
          </div>
        ))}
      </div>

      <hr className="border-[#E4E0D8] my-4" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-[#6B6459] text-xs md:text-sm">
        <div className="space-y-2">
          <h4 className="font-bold text-[#171B26] flex items-center gap-1.5">
            <Mail size={14} className="text-[#2F6F5E]" />
            <span>Your Privacy Rights</span>
          </h4>
          <p className="leading-relaxed">
            We view privacy as an absolute. You have the right to request clarification on any of our secure workflows. If you ever have questions or security concerns, contact our creators directly via our support form.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-bold text-[#171B26] flex items-center gap-1.5">
            <Lock size={14} className="text-[#2F6F5E]" />
            <span>Compliant Hosting Infrastructure</span>
          </h4>
          <p className="leading-relaxed">
            We host our primary application in secure Cloud Run containers. These environments comply with stringent security audits, including SOC2 Type II, ISO 27001, and GDPR guidelines, ensuring that our execution engines run within secure sandboxed environments.
          </p>
        </div>
      </div>

      <div className="bg-[#F6F4EE] border border-[#E4E0D8] rounded-xl p-4 mt-6 text-center">
        <p className="text-xs text-[#6B6459] italic font-medium leading-relaxed font-sans">
          "We keep our lines of code clean, our architecture temporary, and your document data fully confidential. That is our Shield Guarantee to you, and we back it 100%."
        </p>
      </div>
    </div>
  );
}
