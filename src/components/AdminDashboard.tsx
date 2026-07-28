import { useState, useEffect, useCallback } from "react";
import { LogOut, AlertCircle } from "lucide-react";
import AnalyticsDashboard from "./AnalyticsDashboard";
import { DashboardStats } from "../types";
import { API_BASE } from "../api";

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
}

export default function AdminDashboard({ token, onLogout }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(API_BASE + "/api/admin/stats", {
        headers: { Authorization: "Bearer " + token }
      });
      if (res.status === 401) { onLogout(); return; }
      if (res.ok) {
        const data = await res.json();
        // Ensure contactSubmissions is always an array
        data.contactSubmissions = data.contactSubmissions || [];
        setStats(data);
      }
      else { setError("Failed to fetch admin statistics."); }
    } catch (err) { setError("Network error."); }
    finally { setLoading(false); }
  }, [token, API_BASE, onLogout]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return (
    <div className="space-y-6">
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left select-none animate-fadeIn">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 text-emerald-700 p-2 rounded-lg">
            <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-950">Secure Admin Session Active</h4>
            <p className="text-xs text-emerald-600">Authenticated via JWT. Telemetry and submissions available.</p>
          </div>
        </div>
        <button onClick={onLogout}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer shrink-0">
          <LogOut size={14} /> <span>Logout</span>
        </button>
      </div>
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 flex items-start gap-2 text-sm font-medium">
          <AlertCircle size={16} className="shrink-0 mt-0.5" /> <span>{error}</span>
        </div>
      )}
      {stats && <AnalyticsDashboard stats={stats} loading={loading} onRefresh={fetchStats} token={token} />}
    </div>
  );
}