import { Request, Response } from "express";
import { getStats } from "../services/statsService";

/**
 * GET /api/admin/stats
 * Fetches and returns application statistics.
 * Protected by admin authentication middleware.
 */
export async function getAdminStats(req: Request, res: Response) {
  try {
    const currentStats = getStats();
    const stats = {
      ...currentStats,
      contactSubmissions: currentStats.contactSubmissions || [],
    };
    res.json(stats);
  } catch (error) {
    console.error("[Admin Controller] Error fetching stats:", error);
    res.status(500).json({ error: "Internal server error while fetching stats." });
  }
}

// In the future, you can add more admin-specific controllers here, such as:
// - export async function getAdminUsers(req: Request, res: Response) { ... }
// - export async function deleteUser(req: Request, res: Response) { ... }