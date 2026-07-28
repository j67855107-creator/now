/**
 * useAnalytics Hook
 *
 * Anonymous AI feature usage tracking hook.
 * Tracks feature usage without collecting document contents.
 * Only sends feature identifiers and timing data.
 */

import { useCallback, useRef } from "react";

interface AnalyticsEvent {
  feature: string;
  action: string;
  durationMs?: number;
  success?: boolean;
  metadata?: Record<string, string | number | boolean>;
}

const ANALYTICS_ENABLED = import.meta.env.VITE_AI_ANALYTICS !== "false";

export function useAnalytics() {
  const pendingEvents = useRef<AnalyticsEvent[]>([]);
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Track a feature usage event.
   * Events are batched and sent periodically to avoid network spam.
   */
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    if (!ANALYTICS_ENABLED) return;

    pendingEvents.current.push(event);

    // Debounce: send events every 5 seconds
    if (!flushTimer.current) {
      flushTimer.current = setTimeout(() => {
        flushEvents();
      }, 5000);
    }
  }, []);

  /**
   * Track a feature being used with timing.
   * @param feature - Feature identifier (e.g., "cleaner", "prompt")
   * @param action - Action performed (e.g., "used", "downloaded", "copied")
   * @param durationMs - Duration of the operation
   */
  const trackFeature = useCallback((
    feature: string,
    action: string,
    durationMs?: number
  ) => {
    trackEvent({ feature, action, durationMs });
  }, [trackEvent]);

  /**
   * Track a successful feature operation.
   */
  const trackSuccess = useCallback((
    feature: string,
    action: string,
    durationMs?: number
  ) => {
    trackEvent({ feature, action, durationMs, success: true });
  }, [trackEvent]);

  /**
   * Track a failed feature operation.
   */
  const trackFailure = useCallback((
    feature: string,
    action: string,
    error?: string
  ) => {
    trackEvent({
      feature,
      action,
      success: false,
      metadata: error ? { error } : undefined,
    });
  }, [trackEvent]);

  /**
   * Track export/download action.
   */
  const trackExport = useCallback((
    format: string,
    success: boolean
  ) => {
    trackEvent({
      feature: "export",
      action: format,
      success,
    });
  }, [trackEvent]);

  /**
   * Flush pending events to the server.
   */
  const flushEvents = useCallback(async () => {
    if (pendingEvents.current.length === 0) return;

    const events = [...pendingEvents.current];
    pendingEvents.current = [];

    try {
      // For now, send to analytics endpoint if available
      const API_BASE = import.meta.env.VITE_API_URL || "";
      const VITE_API_KEY = import.meta.env.VITE_API_PROTECTION_KEY || "WN3FBAF2GYF";

      await fetch(API_BASE + "/api/ai/analytics/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": VITE_API_KEY,
        },
        body: JSON.stringify({
          events: events.map((e) => ({
            ...e,
            timestamp: Date.now(),
            sessionId: getSessionId(),
          })),
        }),
      }).catch(() => {
        // Silently fail - analytics should never break the app
      });
    } catch {
      // Silently fail
    }
  }, []);

  return {
    trackEvent,
    trackFeature,
    trackSuccess,
    trackFailure,
    trackExport,
    flushEvents,
  };
}

// ─── Session ID (persists for browser session) ─────────────
const SESSION_KEY = "convertoneai_session_id";

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

