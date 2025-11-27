/**
 * Simple in-memory cache with TTL support
 * Helps avoid rate limiting from SheetDB API
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private pendingUpdates: Map<string, any[]> = new Map();
  private updateTimers: Map<string, NodeJS.Timeout> = new Map();
  
  // Default TTL: 30 seconds
  private defaultTTL = 30 * 1000;
  
  // Batch update delay: 3 seconds
  private batchDelay = 3000;

  /**
   * Get cached data if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  /**
   * Set cache with optional TTL
   */
  set<T>(key: string, data: T, ttlMs?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs || this.defaultTTL
    });
  }

  /**
   * Invalidate a cache key
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all cache keys matching a pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Queue an update for batching
   * Updates are collected and sent together after a delay
   */
  queueUpdate(batchKey: string, update: any, onFlush: (updates: any[]) => Promise<void>): void {
    const pending = this.pendingUpdates.get(batchKey) || [];
    pending.push(update);
    this.pendingUpdates.set(batchKey, pending);

    // Clear existing timer
    const existingTimer = this.updateTimers.get(batchKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer to flush updates
    const timer = setTimeout(async () => {
      const updates = this.pendingUpdates.get(batchKey) || [];
      if (updates.length > 0) {
        this.pendingUpdates.set(batchKey, []);
        try {
          await onFlush(updates);
        } catch (error) {
          console.error('Batch update failed:', error);
          // Re-queue failed updates
          const current = this.pendingUpdates.get(batchKey) || [];
          this.pendingUpdates.set(batchKey, [...updates, ...current]);
        }
      }
      this.updateTimers.delete(batchKey);
    }, this.batchDelay);

    this.updateTimers.set(batchKey, timer);
  }

  /**
   * Get pending updates count
   */
  getPendingCount(batchKey: string): number {
    return (this.pendingUpdates.get(batchKey) || []).length;
  }

  /**
   * Force flush pending updates immediately
   */
  async flushUpdates(batchKey: string, onFlush: (updates: any[]) => Promise<void>): Promise<void> {
    const timer = this.updateTimers.get(batchKey);
    if (timer) {
      clearTimeout(timer);
      this.updateTimers.delete(batchKey);
    }

    const updates = this.pendingUpdates.get(batchKey) || [];
    if (updates.length > 0) {
      this.pendingUpdates.set(batchKey, []);
      await onFlush(updates);
    }
  }
}

// Export singleton instance
export const cache = new SimpleCache();

// Cache keys
export const CACHE_KEYS = {
  STATS: 'stats',
  SHEET_DATA: 'sheet_data',
  SHEET_STATS: 'sheet_stats',
  CERTIFICATES: 'certificates',
  EVENTS: 'events',
  LOGS: 'logs'
} as const;

// Batch keys
export const BATCH_KEYS = {
  SHEET_UPDATES: 'sheet_updates',
  CERTIFICATE_UPDATES: 'certificate_updates'
} as const;
