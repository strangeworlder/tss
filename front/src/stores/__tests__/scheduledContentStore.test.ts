/// <reference types="vitest" />
import { describe, it, expect, beforeEach, vi } from '@/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { useScheduledContentStore } from '../scheduledContentStore';
import type { IScheduledContent } from '../scheduledContentStore';
import { TimerService } from '@/services/TimerService';
import { useBackgroundTimer } from '@/services/BackgroundTimerService';
import { ScheduledContentStatusEnum } from '@/types/scheduling';
import { useNetworkStatus } from '@/composables/useNetworkStatus';

vi.mock('@/services/TimerService', () => ({
  TimerService: {
    getInstance: vi.fn(() => ({
      createTimer: vi.fn(),
      removeTimer: vi.fn(),
      updateTimer: vi.fn(),
    })),
  },
}));

vi.mock('@/services/BackgroundTimerService', () => ({
  useBackgroundTimer: vi.fn(() => ({
    initializeFromOfflineStorage: vi.fn(),
  })),
}));

vi.mock('@/composables/useNetworkStatus', () => ({
  useNetworkStatus: vi.fn(() => ({
    online: {
      value: false,
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    },
  })),
}));

describe('scheduledContentStore', () => {
  const mockScheduledContent: IScheduledContent = {
    id: '1',
    type: 'post' as const,
    content: 'Test content',
    publishAt: new Date().toISOString(),
    status: ScheduledContentStatusEnum.PENDING,
    authorId: 'user1',
    version: 1,
    hasActiveUpdate: false,
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  describe('getters', () => {
    it('should filter scheduled posts', () => {
      const store = useScheduledContentStore();
      store.$patch({
        scheduledContent: [
          { ...mockScheduledContent, type: 'post' },
          { ...mockScheduledContent, id: '2', type: 'comment' },
        ],
      });

      expect(store.scheduledPosts).toHaveLength(1);
      expect(store.scheduledPosts[0].type).toBe('post');
    });

    it('should filter scheduled comments', () => {
      const store = useScheduledContentStore();
      store.$patch({
        scheduledContent: [
          { ...mockScheduledContent, type: 'post' },
          { ...mockScheduledContent, id: '2', type: 'comment' },
        ],
      });

      expect(store.scheduledComments).toHaveLength(1);
      expect(store.scheduledComments[0].type).toBe('comment');
    });

    it('should get content by id', () => {
      const store = useScheduledContentStore();
      store.$patch({
        scheduledContent: [mockScheduledContent],
      });

      const content = store.getContentById(mockScheduledContent.id);
      expect(content).toEqual(mockScheduledContent);
    });
  });

  describe('actions', () => {
    it('should fetch scheduled content', async () => {
      const store = useScheduledContentStore();
      const mockResponse = {
        data: [mockScheduledContent],
      };

      (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await store.fetchScheduledContent();

      expect(store.scheduledContent).toHaveLength(1);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });

    it('should add scheduled content', async () => {
      const store = useScheduledContentStore();
      const mockResponse = {
        data: mockScheduledContent,
      };

      (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const { id, ...newContent } = mockScheduledContent;
      await store.addScheduledContent(newContent);

      expect(store.scheduledContent).toHaveLength(1);
      expect(store.scheduledContent[0].id).toBe('1');
    });

    it('should update scheduled content', async () => {
      const store = useScheduledContentStore();
      store.$patch({
        scheduledContent: [mockScheduledContent],
      });

      const mockResponse = {
        data: {
          ...mockScheduledContent,
          content: 'Updated content',
        },
      };

      (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await store.updateScheduledContent('1', { content: 'Updated content' });

      expect(store.scheduledContent[0].content).toBe('Updated content');
    });

    it('should cancel scheduled content', async () => {
      const store = useScheduledContentStore();
      store.$patch({
        scheduledContent: [mockScheduledContent],
      });

      (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await store.cancelScheduledContent('1');

      expect(store.scheduledContent).toHaveLength(0);
    });

    it('should cleanup store state', () => {
      const store = useScheduledContentStore();
      store.$patch({
        scheduledContent: [mockScheduledContent],
        loading: true,
        error: 'Some error',
      });

      store.cleanup();

      expect(store.scheduledContent).toHaveLength(0);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });
  });
});
