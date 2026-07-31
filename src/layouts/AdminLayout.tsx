/** AdminLayout — Minimal layout for admin-only pages (no public header/footer). */

import React from "react";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#F6F4EE] text-[#171B26] flex flex-col font-sans antialiased">
      <Outlet />
    </div>
  );
}
