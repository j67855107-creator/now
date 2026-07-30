import { HelpCircle } from "lucide-react";
import { FAQ_ITEMS } from "../data";

export default function FAQView() {
  return (
    <div className="space-y-8 text-left max-w-3xl mx-auto font-sans">
      <div className="text-center space-y-3 select-none">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2F6F5E]">Got Questions?</span>
        <h1 className="text-3xl font-bold font-display text-[#171B26] tracking-tight">Frequently Asked Questions</h1>
        <p className="text-[#6B6459] text-sm max-w-lg mx-auto leading-relaxed">
          Everything you need to understand about ConvertOneAI's security workflows, conversions, and formats.
        </p>
      </div>

      <div className="space-y-4">
        {FAQ_ITEMS.map((item, idx) => (
          <div key={idx} className="bg-[#FAF8F3] rounded-xl border border-[#E4E0D8] p-5 shadow-xs space-y-2.5">
            <h3 className="font-bold text-[#171B26] text-sm sm:text-base flex items-start gap-2.5">
              <HelpCircle size={18} className="text-[#2F6F5E] shrink-0 mt-0.5" />
              <span>{item.question}</span>
            </h3>
            <p className="text-[#6B6459] text-xs sm:text-sm pl-7 leading-relaxed font-sans">
              {item.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
