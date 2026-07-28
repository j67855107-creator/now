/**
 * Anonymous AI Feature Usage Analytics
 *
 * Tracks feature usage statistics without collecting document contents.
 * Data is in-memory only (resets on server restart).
 * Used to prioritize future AI feature improvements.
 */

import type { AnalyticsEvent } from "../../src/types";

interface FeatureUsage {
  feature: string;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  totalDurationMs: number;
  averageDurationMs: number;
  lastUsed: number;
  firstUsed: number;
}

interface AnalyticsSnapshot {
  totalEvents: number;
  features: Record<string, FeatureUsage>;
  startTime: number;
  uptimeMs: number;
}

export class AnalyticsService {
  private static events: AnalyticsEvent[] = [];
  private static usage: Map<string, FeatureUsage> = new Map();
  private static startTime = Date.now();
  private static maxEvents = 1000;
  private static isEnabled = true;

  /**
   * Enable or disable analytics.
   */
  static setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Track a feature usage event.
   * @param event - The event to track (no document content included)
   */
  static trackEvent(event: Omit<AnalyticsEvent, "timestamp">): void {
    if (!this.isEnabled) return;

    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: Date.now(),
    };

    // Prune if at capacity
    if (this.events.length >= this.maxEvents) {
      this.events.shift();
    }

    this.events.push(fullEvent);
    this.updateFeatureUsage(fullEvent);
  }

  /**
   * Track a feature being used.
   * @param feature - Feature identifier (e.g., "ai-cleaner", "prompt-generator")
   * @param success - Whether the operation succeeded
   * @param durationMs - Duration of the operation
   */
  static trackFeatureUsage(
    feature: string,
    success: boolean,
    durationMs?: number
  ): void {
    this.trackEvent({
      event: `feature:${feature}:${success ? "success" : "failure"}`,
      durationMs,
      metadata: {
        feature,
        success,
      },
    });
  }

  /**
   * Get usage statistics for a specific feature.
   */
  static getFeatureUsage(feature: string): FeatureUsage | undefined {
    return this.usage.get(feature);
  }

  /**
   * Get all feature usage statistics.
   */
  static getAllFeatureUsage(): FeatureUsage[] {
    return Array.from(this.usage.values()).sort(
      (a, b) => b.totalCalls - a.totalCalls
    );
  }

  /**
   * Get a snapshot of all analytics data.
   */
  static getSnapshot(): AnalyticsSnapshot {
    const features: Record<string, FeatureUsage> = {};
    this.usage.forEach((usage, key) => {
      features[key] = usage;
    });

    return {
      totalEvents: this.events.length,
      features,
      startTime: this.startTime,
      uptimeMs: Date.now() - this.startTime,
    };
  }

  /**
   * Get top N most used features.
   */
  static getTopFeatures(n: number = 5): FeatureUsage[] {
    return this.getAllFeatureUsage().slice(0, n);
  }

  /**
   * Get success rate for a feature.
   */
  static getSuccessRate(feature: string): number {
    const usage = this.usage.get(feature);
    if (!usage || usage.totalCalls === 0) return 1;
    return usage.successfulCalls / usage.totalCalls;
  }

  /**
   * Reset all analytics data.
   */
  static reset(): void {
    this.events = [];
    this.usage.clear();
    this.startTime = Date.now();
  }

  /**
   * Update feature usage aggregates from an event.
   */
  private static updateFeatureUsage(event: AnalyticsEvent): void {
    const feature = event.metadata?.feature as string | undefined;
    if (!feature) return;

    let usage = this.usage.get(feature);
    if (!usage) {
      usage = {
        feature,
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        totalDurationMs: 0,
        averageDurationMs: 0,
        lastUsed: event.timestamp,
        firstUsed: event.timestamp,
      };
      this.usage.set(feature, usage);
    }

    usage.totalCalls++;
    usage.lastUsed = event.timestamp;

    if (event.metadata?.success === true) {
      usage.successfulCalls++;
    } else if (event.metadata?.success === false) {
      usage.failedCalls++;
    }

    if (event.durationMs) {
      usage.totalDurationMs += event.durationMs;
      usage.averageDurationMs = Math.round(
        usage.totalDurationMs / usage.totalCalls
      );
    }
  }
}

