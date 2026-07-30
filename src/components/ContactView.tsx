import React, { useState } from "react";
import { Mail, RefreshCw, Send } from "lucide-react";
import { API_BASE } from "../api";

interface ContactViewProps {
  triggerAlert: (type: "success" | "error" | "info", text: string) => void;
}

export default function ContactView({ triggerAlert }: ContactViewProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      triggerAlert("error", "All fields are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      triggerAlert("error", "Invalid email address.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
        triggerAlert("success", "Your message has been sent successfully!");
        // Clear form
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        triggerAlert("error", data.error || "Failed to send message.");
      }
    } catch (err) {
      triggerAlert("error", "A network error occurred. Please try again.");
    } finally {
      setSending(false);
      setTimeout(() => setSent(false), 5000); // Reset sent state after 5s
    }
  };

  return (
    <div className="max-w-xl mx-auto text-left font-sans">
      <div className="text-center space-y-3 pb-6 select-none">
        <div className="inline-block p-3 rounded-full bg-[#FAF8F3] text-[#2F6F5E] mb-1 border border-[#E4E0D8] shadow-xs">
          <Mail size={24} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#171B26] tracking-tight">Contact Support</h1>
        <p className="text-[#6B6459] text-xs sm:text-sm">
          Have feature recommendations, API integrations, or bug filings? Dispatch them straight to our desk.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#FAF8F3] rounded-xl border border-[#E4E0D8] p-6 shadow-xs space-y-4">
        <div className="space-y-1.5 text-left">
          <label htmlFor="contact-name" className="text-xs font-mono font-bold uppercase tracking-wider text-[#6B6459] block">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            id="contact-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2 rounded-lg border border-[#E4E0D8] bg-white text-sm text-[#171B26] focus:outline-none focus:border-[#2F6F5E] disabled:bg-[#E4E0D8]/40 disabled:text-[#6B6459]"
            placeholder="e.g. Liam Cole"
            disabled={sending || sent}
            required
          />
        </div>

        <div className="space-y-1.5 text-left">
          <label htmlFor="contact-email" className="text-xs font-mono font-bold uppercase tracking-wider text-[#6B6459] block">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            id="contact-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2 rounded-lg border border-[#E4E0D8] bg-white text-sm text-[#171B26] focus:outline-none focus:border-[#2F6F5E] disabled:bg-[#E4E0D8]/40 disabled:text-[#6B6459]"
            placeholder="e.g. client@example.com"
            disabled={sending || sent}
            required
          />
        </div>

        <div className="space-y-1.5 text-left">
          <label htmlFor="contact-subject" className="text-xs font-mono font-bold uppercase tracking-wider text-[#6B6459] block">
            Subject <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            id="contact-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3.5 py-2 rounded-lg border border-[#E4E0D8] bg-white text-sm text-[#171B26] focus:outline-none focus:border-[#2F6F5E] disabled:bg-[#E4E0D8]/40 disabled:text-[#6B6459]"
            placeholder="e.g. Invalidation with complex nested tables"
            disabled={sending || sent}
            required
          />
        </div>

        <div className="space-y-1.5 text-left">
          <label htmlFor="contact-msg" className="text-xs font-mono font-bold uppercase tracking-wider text-[#6B6459] block">
            Message <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="contact-msg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full h-32 px-3.5 py-2 rounded-lg border border-[#E4E0D8] bg-white text-sm text-[#171B26] focus:outline-none focus:border-[#2F6F5E] resize-none disabled:bg-[#E4E0D8]/40 disabled:text-[#6B6459]"
            placeholder="Compose your support query or proposal here..."
            disabled={sending || sent}
            required
          />
        </div>

        <button
          type="submit"
          disabled={sending || sent}
          className="w-full bg-[#2F6F5E] hover:bg-[#275F50] text-[#F6F4EE] font-semibold py-2.5 rounded-xl text-sm shadow-xs transition-all flex items-center justify-center gap-2 disabled:bg-[#2F6F5E]/60 disabled:cursor-not-allowed cursor-pointer text-center"
          id="btn-contact-submit"
        >
          {sending ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <Send size={14} />
          )}
          <span>
            {sending
              ? "Sending Message..."
              : sent
                ? "Message Transferred"
                : "Send Message"}
          </span>
        </button>
      </form>
    </div>
  );
}
