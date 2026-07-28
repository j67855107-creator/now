import { DashboardStats, RecentLog, SupportSubmission } from "../../src/types";
export type { SupportSubmission } from "../../src/types";

/**
 * In-memory store for application statistics.
 * This acts as a live, volatile database. Data will reset on server restart.
 */
let stats: DashboardStats = {
  totalConversions: 0,
  classicConversions: 0,
  aiConversions: 0,
  totalSizeKb: 0,
  averageDurationMs: 0,
  recentLogs: [],
  contactSubmissions: [],
};

const MAX_LOGS = 20;

/**
 * Returns the current statistics object.
 * This is what the admin dashboard will display.
 */
export function getStats(): DashboardStats {
  return stats;
}

/**
 * Adds a new conversion log to the statistics.
 * This is called by the conversion controller after a file is processed.
 * @param log - The log entry for the conversion.
 */
export function addConversionLog(log: Omit<RecentLog, "id" | "timestamp">): void {
  const newLog: RecentLog = {
    ...log,
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };

  // Update aggregate stats
  stats.totalConversions++;
  if (newLog.mode === "classic") {
    stats.classicConversions++;
  } else {
    stats.aiConversions++;
  }
  stats.totalSizeKb += newLog.fileSizeKb;

  // Recalculate average duration
  const totalDuration = (stats.averageDurationMs * (stats.totalConversions - 1)) + newLog.durationMs;
  stats.averageDurationMs = Math.round(totalDuration / stats.totalConversions);

  // Add to recent logs and keep the list trimmed
  stats.recentLogs.unshift(newLog);
  if (stats.recentLogs.length > MAX_LOGS) {
    stats.recentLogs.pop();
  }

  console.log(`[Stats Service] Log added for ${newLog.fileName}. Total conversions: ${stats.totalConversions}`);
}

/**
 * Adds a new contact form submission.
 * This is called by the contact controller.
 * @param submission - The contact submission data.
 */
export function addSubmission(submission: SupportSubmission): void {
  if (!stats.contactSubmissions) {
    stats.contactSubmissions = [];
  }
  stats.contactSubmissions.unshift(submission);
  console.log(`[Stats Service] Contact submission from ${submission.name} added.`);
}