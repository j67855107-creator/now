/** AnalyticsPage — Route: /analytics */
import React, { useEffect } from "react";
import { useAppContext } from "../contexts/AppContext";
import AnalyticsDashboard from "../components/AnalyticsDashboard";

export default function AnalyticsPage() {
  const { stats, statsLoading, fetchStats } = useAppContext();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchStats();
  }, [fetchStats]);

  if (!stats) {
    return <div className="flex justify-center p-12 text-[#6B6459]">Loading stats...</div>;
  }

  return <AnalyticsDashboard stats={stats} loading={statsLoading} onRefresh={fetchStats} />;
}
