/**
 * Session-Level Processing Cache
 *
 * Avoids repeating expensive operations for the same document
 * within the same session. Cache is cleared on process exit.
 *
 * Key: fileHash + options hash
 * Value: cached processing results
 * TTL: Configurable (default 5 minutes)
 */

import crypto from "crypto";

interface CacheEntry {
  key: string;
  data: any;
  createdAt: number;
  expiresAt: number;
  accessCount: number;
}

export class CacheService {
  private static cache: Map<string, CacheEntry> = new Map();
  private static defaultTTL = 5 * 60 * 1000; // 5 minutes
  private static maxEntries = 100;
  private static cleanupInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Initialize the cache service with periodic cleanup.
   */
  static initialize(ttlMs?: number, maxEntries?: number): void {
    if (ttlMs) this.defaultTTL = ttlMs;
    if (maxEntries) this.maxEntries = maxEntries;

    // Clean up expired entries every 60 seconds
    if (!this.cleanupInterval) {
      this.cleanupInterval = setInterval(() => this.cleanup(), 60_000);
    }
  }

  /**
   * Generate a cache key from content and options.
   */
  static generateKey(content: string, options?: Record<string, any>): string {
    const hash = crypto.createHash("sha256");
    hash.update(content);
    if (options) {
      hash.update(JSON.stringify(options));
    }
    return hash.digest("hex");
  }

  /**
   * Get a cached value.
   */
  static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    entry.accessCount++;
    return entry.data as T;
  }

  /**
   * Set a cached value.
   */
  static set(key: string, data: any, ttlMs?: number): void {
    // Eviction: remove oldest if at capacity
    if (this.cache.size >= this.maxEntries) {
      this.evictOldest();
    }

    const now = Date.now();
    this.cache.set(key, {
      key,
      data,
      createdAt: now,
      expiresAt: now + (ttlMs || this.defaultTTL),
      accessCount: 0,
    });
  }

  /**
   * Check if a key exists and is not expired.
   */
  static has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Invalidate a specific cache entry.
   */
  static invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries.
   */
  static clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics.
   */
  static getStats(): { size: number; maxEntries: number; hitRate: number } {
    let hits = 0;
    let totalAccesses = 0;
    this.cache.forEach((entry) => {
      totalAccesses += entry.accessCount;
      if (entry.accessCount > 0) hits++;
    });

    return {
      size: this.cache.size,
      maxEntries: this.maxEntries,
      hitRate: totalAccesses > 0 ? (hits / totalAccesses) * 100 : 0,
    };
  }

  /**
   * Remove expired entries.
   */
  private static cleanup(): void {
    const now = Date.now();
    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    });
  }

  /**
   * Evict the oldest entry (by creation time) when cache is full.
   */
  private static evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    this.cache.forEach((entry, key) => {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Stop the cleanup interval.
   */
  static destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

