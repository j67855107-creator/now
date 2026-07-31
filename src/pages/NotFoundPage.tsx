/** NotFoundPage — Route: * */
import React from "react";
import { Link } from "react-router-dom";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <FileQuestion size={64} className="text-[#2F6F5E] mb-6 opacity-80" />
      <h1 className="font-display font-bold text-4xl sm:text-5xl tracking-tight mb-4 text-[#171B26]">
        Page Not Found
      </h1>
      <p className="text-[#171B26]/70 mb-8 max-w-md mx-auto text-lg">
        The tool or page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-[#2F6F5E] text-[#F6F4EE] px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
      >
        <ArrowLeft size={18} />
        Back to Home
      </Link>
    </div>
  );
}
