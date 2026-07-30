/**
 * Centralized API configuration.
 * This ensures all components use the same base URL for API requests.
 */

const envApiUrl = import.meta.env.VITE_API_URL || "";

// If VITE_API_URL is set (e.g., "http://localhost:3000"), use it.
// Otherwise, use a relative path, which works well for production builds.
export const API_BASE = envApiUrl.startsWith("http") ? envApiUrl.replace(/\/+$/, "") : "";