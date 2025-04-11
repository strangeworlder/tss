import { describe, it, expect, beforeEach, vi } from '@/test-utils';
import { OfflineStorageService } from '../OfflineStorageService';
import type { IOfflineContent } from '../OfflineStorageService';
import { ScheduledContentStatusEnum } from '@/types/scheduling';
import type { IScheduledContent } from '@/stores/scheduledContentStore';

describe('OfflineStorageService', () => {
  let service: OfflineStorageService;
  const mockContent: IScheduledContent = {
    id: 'test-id',
    type: 'post',
    content: { title: 'Test Post', content: 'Test Content' },
    publishAt: new Date('2023-12-31T12:00:00Z'),
    status: ScheduledContentStatusEnum.SCHEDULED,
    authorId: 'author-id',
    version: 1,
    hasActiveUpdate: false,
    lastModified: new Date(),
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Get a fresh instance of the service
    service = OfflineStorageService.getInstance();
    vi.clearAllMocks();
  });

  describe('getOfflineContent', () => {
    it('returns empty array when no content is stored', () => {
      const content = service.getOfflineContent();
      expect(content).toEqual([]);
    });

    it('returns all stored content', () => {
      service.storeContent(mockContent);
      const content = service.getOfflineContent();
      expect(content).toHaveLength(1);
      expect(content[0].id).toBe('test-id');
    });
  });

  describe('getOfflineContentById', () => {
    it('returns undefined for non-existent content', () => {
      const content = service.getOfflineContentById('non-existent-id');
      expect(content).toBeUndefined();
    });

    it('returns the requested content', () => {
      service.storeContent(mockContent);
      const content = service.getOfflineContentById('test-id');
      expect(content).toBeDefined();
      expect(content?.id).toBe('test-id');
    });
  });

  describe('storeContent', () => {
    it('stores new content', () => {
      service.storeContent(mockContent);
      const stored = service.getOfflineContentById('test-id');
      expect(stored).toBeDefined();
      expect(stored?.content).toEqual(mockContent.content);
    });

    it('updates existing content', () => {
      service.storeContent(mockContent);
      const updatedContent = {
        ...mockContent,
        content: { title: 'Updated Post', content: 'Updated Content' },
      };
      service.storeContent(updatedContent);
      const stored = service.getOfflineContentById('test-id');
      expect(stored?.content).toEqual(updatedContent.content);
    });
  });

  describe('storeTimer', () => {
    it('stores a new timer', () => {
      const publishAt = new Date('2023-12-31T12:00:00Z');
      service.storeTimer('test-id', publishAt);
      const timer = service.getOfflineTimerById('test-id');
      expect(timer).toBeDefined();
      expect(timer?.publishAt).toEqual(publishAt);
      expect(timer?.isActive).toBe(true);
    });

    it('updates existing timer', () => {
      const publishAt = new Date('2023-12-31T12:00:00Z');
      service.storeTimer('test-id', publishAt);
      const newPublishAt = new Date('2023-12-31T13:00:00Z');
      service.storeTimer('test-id', newPublishAt);
      const timer = service.getOfflineTimerById('test-id');
      expect(timer?.publishAt).toEqual(newPublishAt);
    });
  });

  describe('getOfflineTimers', () => {
    it('returns empty array when no timers are stored', () => {
      const timers = service.getOfflineTimers();
      expect(timers).toEqual([]);
    });

    it('returns all stored timers', () => {
      const publishAt = new Date('2023-12-31T12:00:00Z');
      service.storeTimer('test-id', publishAt);
      const timers = service.getOfflineTimers();
      expect(timers).toHaveLength(1);
      expect(timers[0].contentId).toBe('test-id');
    });
  });

  describe('getOfflineTimerById', () => {
    it('returns undefined for non-existent timer', () => {
      const timer = service.getOfflineTimerById('non-existent-id');
      expect(timer).toBeUndefined();
    });

    it('returns the requested timer', () => {
      const publishAt = new Date('2023-12-31T12:00:00Z');
      service.storeTimer('test-id', publishAt);
      const timer = service.getOfflineTimerById('test-id');
      expect(timer).toBeDefined();
      expect(timer?.contentId).toBe('test-id');
    });
  });

  describe('updateOfflineTimer', () => {
    it('updates existing timer', () => {
      const publishAt = new Date('2023-12-31T12:00:00Z');
      service.storeTimer('test-id', publishAt);
      service.updateOfflineTimer('test-id', { isActive: false });
      const timer = service.getOfflineTimerById('test-id');
      expect(timer?.isActive).toBe(false);
    });

    it('does not update non-existent timer', () => {
      service.updateOfflineTimer('non-existent-id', { isActive: false });
      const timer = service.getOfflineTimerById('non-existent-id');
      expect(timer).toBeUndefined();
    });
  });
});
