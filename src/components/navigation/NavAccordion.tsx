import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface NavAccordionProps {
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  isSubAccordion?: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function NavAccordion({
  label,
  icon,
  badge,
  isSubAccordion = false,
  defaultOpen = false,
  children,
}: NavAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`w-full ${isSubAccordion ? "ml-2 border-l border-[#E4E0D8]/60 pl-2 mt-1" : "mt-2"}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={`
          flex items-center justify-between w-full rounded-xl transition-colors duration-200 group
          ${isSubAccordion ? "py-2 px-3 text-[13px]" : "py-2.5 px-3 text-[14px] font-medium"}
          text-[#171B26]/80 hover:bg-[#E4E0D8]/50 hover:text-[#171B26]
        `}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <span className="flex-shrink-0 text-[#6B6459] group-hover:text-[#171B26] transition-colors">
              {icon}
            </span>
          )}
          <span>{label}</span>
          {badge && (
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-[#D98F3D]/50 text-[#D98F3D] uppercase tracking-wider bg-transparent ml-2">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown 
          size={16} 
          className={`text-[#6B6459] transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`} 
        />
      </button>

      {/* Smooth CSS Grid Animation for expand/collapse */}
      <div 
        className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className={`flex flex-col gap-1 ${isSubAccordion ? "pt-1" : "pt-2 pl-2"}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
