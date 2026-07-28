/**
 * Feature Flag System
 *
 * Provides a centralized way to enable/disable AI features
 * without modifying business logic. Supports environment-based
 * configuration and future enterprise tier controls.
 */

import { FEATURE_FLAGS, isFeatureEnabled } from "../config";
import type { FeatureFlag } from "../../types";

export class FeatureFlagRegistry {
  private static flags: Map<string, FeatureFlag> = new Map(Object.entries(FEATURE_FLAGS));

  /**
   * Check if a feature is enabled.
   * @param key - The feature flag key (e.g., "ai-cleaner")
   */
  static isEnabled(key: string): boolean {
    return isFeatureEnabled(key);
  }

  /**
   * Get all registered feature flags.
   */
  static getAll(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  /**
   * Get all enabled feature flags.
   */
  static getEnabled(): FeatureFlag[] {
    return this.getAll().filter((f) => f.enabled);
  }

  /**
   * Register a new feature flag at runtime.
   * @param flag - The feature flag to register
   */
  static register(flag: FeatureFlag): void {
    this.flags.set(flag.key, flag);
  }

  /**
   * Enable a feature by key.
   * @param key - The feature flag key
   */
  static enable(key: string): void {
    const flag = this.flags.get(key);
    if (flag) {
      flag.enabled = true;
      this.flags.set(key, flag);
    }
  }

  /**
   * Disable a feature by key.
   * @param key - The feature flag key
   */
  static disable(key: string): void {
    const flag = this.flags.get(key);
    if (flag) {
      flag.enabled = false;
      this.flags.set(key, flag);
    }
  }
}

