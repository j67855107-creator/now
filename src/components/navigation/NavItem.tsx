import React from "react";
import { Link, useLocation } from "react-router-dom";

interface NavItemProps {
  to: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  isSubItem?: boolean;
  onClick?: () => void;
  isActiveOverride?: boolean;
}

export default function NavItem({
  to,
  label,
  icon,
  badge,
  isSubItem = false,
  onClick,
  isActiveOverride,
}: NavItemProps) {
  const location = useLocation();
  const isActive = isActiveOverride ?? location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        flex items-center justify-between w-full rounded-xl transition-all duration-200 group
        ${isSubItem ? "py-2 px-3 text-[13px]" : "py-2.5 px-3 text-[14px] font-medium"}
        ${isActive 
          ? "bg-[#2F6F5E]/10 text-[#2F6F5E] font-semibold" 
          : "text-[#171B26]/80 hover:bg-[#E4E0D8]/50 hover:text-[#171B26]"}
      `}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <span className={`flex-shrink-0 ${isActive ? "text-[#2F6F5E]" : "text-[#6B6459] group-hover:text-[#171B26]"}`}>
            {icon}
          </span>
        )}
        <span>{label}</span>
      </div>
      
      {badge && (
        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-[#D98F3D]/50 text-[#D98F3D] uppercase tracking-wider bg-transparent">
          {badge}
        </span>
      )}
    </Link>
  );
}
