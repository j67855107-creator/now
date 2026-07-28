import { useState } from "react";
import { Lock, AlertCircle, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { API_BASE } from "../api";

interface AdminLoginProps {
  onLoginSuccess: (token: string) => void;
  onBack: () => void;
}

export default function AdminLogin({ onLoginSuccess, onBack }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const ADMIN_LOGIN_API_PATH = import.meta.env.VITE_ADMIN_LOGIN_API_PATH || "/auth/admin/login";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api${ADMIN_LOGIN_API_PATH}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password: password.trim() })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        onLoginSuccess(data.token);
      } else {
        setError(data.error || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("Network error. Could not connect to admin server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-left space-y-6 select-none animate-fadeIn">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner relative">
            <Lock size={28} className="stroke-[1.5]" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight font-sans">Admin Login</h2>
            <p className="text-xs text-slate-400 font-sans mt-1">ConvertOneAI Administration</p>
          </div>
        </div>
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 flex items-start gap-2 text-sm font-medium">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Username</label>
            <input type="text" placeholder="Enter admin username" value={username}
              onChange={(e) => { setUsername(e.target.value); setError(""); }}
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm font-sans placeholder-slate-300 transition-all focus:outline-none"
              autoComplete="username" disabled={loading} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} placeholder="..." value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm font-sans placeholder-slate-300 transition-all focus:outline-none pr-10"
                autoComplete="current-password" disabled={loading} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer" tabIndex={-1}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-sm py-2.5 px-4 rounded-xl transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed">
            {loading ? "Authenticating..." : "Sign In to Admin Panel"}
          </button>
        </form>
        <div className="border-t border-slate-100 pt-3 flex justify-center">
          <button type="button" onClick={onBack}
            className="flex items-center gap-1.5 text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer">
            <ArrowLeft size={14} />
            <span>Back to ConvertOneAI</span>
          </button>
        </div>
      </div>
    </div>
  );
}
