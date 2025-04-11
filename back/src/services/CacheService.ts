import { EventEmitter } from 'node:events';
import type { IScheduledContent } from '../types/scheduling';
import ErrorHandler from './ErrorHandler';
import { ErrorCategory, ErrorSeverity } from './ErrorHandler';

interface ICacheEntry {
  content: IScheduledContent;
  expiresAt: Date;
}

interface ICacheStats {
  size: number;
  maxSize: number;
  expiryMinutes: number;
}

export class CacheService extends EventEmitter {
  private static instance: CacheService;
  private cache: Map<string, ICacheEntry>;
  private maxSize: number;
  private defaultExpiryMinutes: number;

  private constructor() {
    super();
    this.cache = new Map();
    this.maxSize = 1000;
    this.defaultExpiryMinutes = 60;
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Cache scheduled content
   * @param content The scheduled content to cache
   * @param expiryMinutes Optional expiry time in minutes
   */
  public cacheScheduledContent(content: IScheduledContent, expiryMinutes?: number): void {
    if (!content.id || typeof content.id !== 'string') {
      throw new Error('Content ID must be a string');
    }

    try {
      // Remove expired entries before adding new ones
      this.removeExpiredEntries();

      // If cache is at max size, remove oldest entry
      if (this.cache.size >= this.maxSize) {
        const oldestKey = this.cache.keys().next().value;
        if (oldestKey) {
          this.cache.delete(oldestKey);
        }
      }

      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + (expiryMinutes || this.defaultExpiryMinutes));

      this.cache.set(content.id, {
        content,
        expiresAt,
      });

      this.emit('contentCached', { contentId: content.id });
    } catch (error) {
      ErrorHandler.handleError(error as Error, {
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.CACHE,
        context: { operation: 'cacheScheduledContent', contentId: content.id },
      });
    }
  }

  /**
   * Get cached scheduled content
   * @param contentId The ID of the content to retrieve
   * @returns The cached content or null if not found/expired
   */
  public getCachedContent(contentId: string): IScheduledContent | null {
    try {
      const entry = this.cache.get(contentId);
      if (!entry || entry.expiresAt < new Date()) {
        if (entry) {
          this.cache.delete(contentId);
        }
        return null;
      }
      return entry.content;
    } catch (error) {
      ErrorHandler.handleError(error as Error, {
        severity: ErrorSeverity.LOW,
        category: ErrorCategory.CACHE,
        context: { operation: 'getCachedContent', contentId },
      });
      return null;
    }
  }

  /**
   * Invalidate cached content
   * @param contentId The ID of the content to invalidate
   */
  public invalidateCache(contentId: string): void {
    try {
      this.cache.delete(contentId);
      this.emit('cacheInvalidated', { contentId });
    } catch (error) {
      ErrorHandler.handleError(error as Error, {
        severity: ErrorSeverity.LOW,
        category: ErrorCategory.CACHE,
        context: { operation: 'invalidateCache', contentId },
      });
    }
  }

  /**
   * Clean expired cache entries
   */
  private removeExpiredEntries(): void {
    try {
      const now = new Date();
      for (const [key, entry] of this.cache.entries()) {
        if (entry.expiresAt < now) {
          this.cache.delete(key);
        }
      }
    } catch (error) {
      ErrorHandler.handleError(error as Error, {
        severity: ErrorSeverity.LOW,
        category: ErrorCategory.CACHE,
        context: { operation: 'removeExpiredEntries' },
      });
    }
  }

  /**
   * Set the maximum cache size
   * @param size The new maximum cache size
   */
  public setMaxCacheSize(size: number): void {
    if (size > 0) {
      this.maxSize = size;
      if (this.cache.size > size) {
        this.removeExpiredEntries();
      }
      this.emit('maxCacheSizeChanged', { newSize: size });
    }
  }

  /**
   * Set the default cache expiry time
   * @param minutes The new default expiry time in minutes
   */
  public setDefaultExpiry(minutes: number): void {
    if (minutes > 0) {
      this.defaultExpiryMinutes = minutes;
      this.emit('defaultExpiryChanged', { newExpiry: minutes });
    }
  }

  /**
   * Get cache statistics
   * @returns Object containing cache statistics
   */
  public getCacheStats(): ICacheStats {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      expiryMinutes: this.defaultExpiryMinutes,
    };
  }
}

export default CacheService.getInstance();
