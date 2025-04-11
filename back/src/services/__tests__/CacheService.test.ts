import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CacheService } from '../CacheService';
import type { IScheduledContent } from '../../types/scheduling';

describe('CacheService', () => {
  let cacheService: CacheService;
  const mockContent: IScheduledContent = {
    id: 'test-content-1',
    type: 'post',
    publishAt: new Date(),
    status: 'scheduled',
    timezone: 'UTC',
    version: 1,
    authorId: 'user-1',
    content: 'Test content',
  };

  beforeEach(() => {
    // Reset the singleton instance for each test
    (CacheService as any).instance = null;
    cacheService = CacheService.getInstance();
  });

  describe('cacheScheduledContent', () => {
    it('should cache content with default expiry', () => {
      cacheService.cacheScheduledContent(mockContent);
      const cached = cacheService.getCachedContent(mockContent.id);
      expect(cached).toEqual(mockContent);
    });

    it('should cache content with custom expiry', () => {
      const customExpiry = 30; // 30 minutes
      cacheService.cacheScheduledContent(mockContent, customExpiry);
      const cached = cacheService.getCachedContent(mockContent.id);
      expect(cached).toEqual(mockContent);
    });

    it('should emit contentCached event', () => {
      const spy = vi.fn();
      cacheService.on('contentCached', spy);
      cacheService.cacheScheduledContent(mockContent);
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          contentId: mockContent.id,
        })
      );
    });
  });

  describe('getCachedContent', () => {
    it('should return null for non-existent content', () => {
      const cached = cacheService.getCachedContent('non-existent');
      expect(cached).toBeNull();
    });

    it('should return null for expired content', () => {
      cacheService.cacheScheduledContent(mockContent, 0); // Immediate expiry
      const cached = cacheService.getCachedContent(mockContent.id);
      expect(cached).toBeNull();
    });
  });

  describe('invalidateCache', () => {
    it('should remove content from cache', () => {
      cacheService.cacheScheduledContent(mockContent);
      cacheService.invalidateCache(mockContent.id);
      const cached = cacheService.getCachedContent(mockContent.id);
      expect(cached).toBeNull();
    });

    it('should emit cacheInvalidated event', () => {
      const spy = vi.fn();
      cacheService.on('cacheInvalidated', spy);
      cacheService.cacheScheduledContent(mockContent);
      cacheService.invalidateCache(mockContent.id);
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          contentId: mockContent.id,
        })
      );
    });
  });

  describe('setMaxCacheSize', () => {
    it('should update max cache size', () => {
      const newSize = 500;
      cacheService.setMaxCacheSize(newSize);
      const stats = cacheService.getCacheStats();
      expect(stats.maxSize).toBe(newSize);
    });

    it('should emit maxCacheSizeChanged event', () => {
      const spy = vi.fn();
      cacheService.on('maxCacheSizeChanged', spy);
      cacheService.setMaxCacheSize(500);
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          newSize: 500,
        })
      );
    });
  });

  describe('setDefaultExpiry', () => {
    it('should update default expiry time', () => {
      const newExpiry = 120; // 120 minutes
      cacheService.setDefaultExpiry(newExpiry);
      const stats = cacheService.getCacheStats();
      expect(stats.expiryMinutes).toBe(newExpiry);
    });

    it('should emit defaultExpiryChanged event', () => {
      const spy = vi.fn();
      cacheService.on('defaultExpiryChanged', spy);
      cacheService.setDefaultExpiry(120);
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          newExpiry: 120,
        })
      );
    });
  });

  describe('getCacheStats', () => {
    it('should return correct cache statistics', () => {
      cacheService.cacheScheduledContent(mockContent);
      const stats = cacheService.getCacheStats();
      expect(stats).toEqual(
        expect.objectContaining({
          size: 1,
          maxSize: 1000,
          expiryMinutes: 60,
        })
      );
    });
  });
});
