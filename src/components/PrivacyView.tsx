import { ShieldCheck, Mail, Lock } from "lucide-react";

export default function PrivacyView() {
  return (
    <div className="max-w-3xl mx-auto text-left font-sans space-y-6 leading-relaxed text-sm text-gray-700 bg-white p-8 md:p-12 rounded-2xl border border-gray-150 shadow-sm animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-150 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block">Personal Promise</span>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-1">PrivacyShield Guarantee</h1>
          <p className="text-xs text-slate-400 select-none mt-1">Effective Date: June 22, 2026</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-150 text-indigo-600 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold shrink-0 shadow-sm">
          <ShieldCheck size={16} />
          <span>Zero-Storage Active</span>
        </div>
      </div>

      <p className="text-gray-900 font-medium text-base">
        We believe privacy isn’t a dense legal loophole—it is a fundamental commitment to you. At ConvertOneAI, we design our software from the ground up to protect your creative work. We promise safety, complete transparency, and honest data practices.
      </p>

      <div className="space-y-6 pt-2">
        <div className="relative pl-8 space-y-1 border-l-2 border-indigo-100 focus-within:border-indigo-500 transition-colors">
          <div className="absolute -left-2.5 top-0.5 bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">1</div>
          <h3 className="text-base font-bold text-gray-900 tracking-tight">Your Files Stay Yours</h3>
          <p className="text-slate-600 text-xs md:text-sm">
            We never store, read, or share uploaded documents. Your text, formatted charts, and data belong entirely to you. We act strictly as a temporary rendering channel, compiling your documents and immediately returning the outputs to your browser window.
          </p>
        </div>

        <div className="relative pl-8 space-y-1 border-l-2 border-indigo-100 focus-within:border-indigo-500 transition-colors">
          <div className="absolute -left-2.5 top-0.5 bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">2</div>
          <h3 className="text-base font-bold text-gray-900 tracking-tight">Automatic, Instant Purging</h3>
          <p className="text-slate-600 text-xs md:text-sm">
            We hold documents strictly within volatile, short-lived RAM. Our backend servers never write your uploads to static disks, databases, index logs, or server hard drives. The absolute moment our conversion script serves the compiled Markdown text, the system completely and irreversibly flushes your file structures from memory.
          </p>
        </div>

        <div className="relative pl-8 space-y-1 border-l-2 border-indigo-100 focus-within:border-indigo-500 transition-colors">
          <div className="absolute -left-2.5 top-0.5 bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">3</div>
          <h3 className="text-base font-bold text-gray-900 tracking-tight">Fully Encrypted Transfers</h3>
          <p className="text-slate-600 text-xs md:text-sm">
            We shield your documents against online snooping. Our servers enforce strict, high-grade SSL/TLS encryption for all document transmission and active download actions, creating an airtight, end-to-end encrypted tunnels for your transfers.
          </p>
        </div>

        <div className="relative pl-8 space-y-1 border-l-2 border-indigo-100 focus-within:border-indigo-500 transition-colors">
          <div className="absolute -left-2.5 top-0.5 bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">4</div>
          <h3 className="text-base font-bold text-gray-900 tracking-tight">Zero Retention or Selling</h3>
          <p className="text-slate-600 text-xs md:text-sm">
            We never sell, rent, commercialize, or trade your file content or metadata to marketing agencies, advertisers, or third-party brokers. We maintain an honest, utility-focused operation funded by technology, not by exploiting user data.
          </p>
        </div>

        <div className="relative pl-8 space-y-1 border-l-2 border-indigo-100 focus-within:border-indigo-500 transition-colors">
          <div className="absolute -left-2.5 top-0.5 bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">5</div>
          <h3 className="text-base font-bold text-gray-900 tracking-tight">Minimalist, Aggregate Statistics Only</h3>
          <p className="text-slate-600 text-xs md:text-sm">
            We collect only anonymous, generalized usage statistics—such as total conversion counts or average translation speeds—solely to check our container loads and ensure continuous server performance. Since ConvertOneAI requires zero logins, standard usage remains entirely anonymous.
          </p>
        </div>
      </div>

      <hr className="border-gray-100 my-4" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-slate-600 text-xs md:text-sm">
        <div className="space-y-2">
          <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
            <Mail size={14} className="text-indigo-600" />
            <span>Your Privacy Rights</span>
          </h4>
          <p className="leading-relaxed">
            We view privacy as an absolute. You have the right to request clarification on any of our secure workflows. If you ever have questions or security concerns, contact our creators directly via our support form.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
            <Lock size={14} className="text-indigo-600" />
            <span>Compliant Hosting Infrastructure</span>
          </h4>
          <p className="leading-relaxed">
            We host our primary application in secure Cloud Run containers. These environments comply with stringent security audits, including SOC2 Type II, ISO 27001, and GDPR guidelines, ensuring that our execution engines run within secure sandboxed environments.
          </p>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 mt-6 text-center">
        <p className="text-xs text-slate-700 italic font-medium leading-relaxed font-sans">
          "We keep our lines of code clean, our architecture temporary, and your document data fully confidential. That is our Shield Guarantee to you, and we back it 100%."
        </p>
      </div>
    </div>
  );
}
