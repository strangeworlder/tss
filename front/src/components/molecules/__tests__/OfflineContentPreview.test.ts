import { describe, it, expect, beforeEach, vi } from '@/test-utils';
import { mount } from '@vue/test-utils';
import OfflineContentPreview from '../OfflineContentPreview.vue';
import { createServiceMock } from '@/test-utils';
import type { IOfflineContent } from '@/services/OfflineStorageService';
import { ScheduledContentStatusEnum } from '@/types/scheduling';

// Mock the useOfflineStorage composable
vi.mock('@/composables/useOfflineStorage', () => ({
  useOfflineStorage: vi.fn(() => ({
    deleteOfflineContent: vi.fn(),
  })),
}));

// Mock the useNetworkStatus composable
vi.mock('@/composables/useNetworkStatus', () => ({
  useNetworkStatus: vi.fn(() => ({
    isOnline: { value: true },
  })),
}));

describe('OfflineContentPreview', () => {
  let wrapper: any;
  const mockContent: IOfflineContent = {
    id: 'test-id',
    type: 'post',
    content: 'Test content',
    publishAt: new Date('2023-12-31T12:00:00Z'),
    status: ScheduledContentStatusEnum.SCHEDULED,
    authorId: 'author-id',
    version: 1,
    hasActiveUpdate: false,
    lastModified: new Date(),
    syncStatus: 'pending',
    retryCount: 0,
    maxRetries: 3,
  };

  beforeEach(() => {
    wrapper = mount(OfflineContentPreview, {
      props: {
        content: mockContent,
      },
    });
  });

  it('renders correctly with pending sync status', () => {
    expect(wrapper.find('.offline-content-preview').exists()).toBe(true);
    expect(wrapper.find('.offline-content-preview__title').text()).toContain('Post (Offline)');
    expect(wrapper.find('.offline-content-preview__text').text()).toContain('Test content');
    expect(wrapper.find('.offline-content-preview__sync-status').text()).toContain('Pending Sync');
    expect(wrapper.find('.status-pending').exists()).toBe(true);
  });

  it('renders correctly with failed sync status', () => {
    const failedContent = { ...mockContent, syncStatus: 'failed', syncError: 'Network error' };
    wrapper = mount(OfflineContentPreview, {
      props: {
        content: failedContent,
      },
    });

    expect(wrapper.find('.offline-content-preview__sync-status').text()).toContain('Sync Failed');
    expect(wrapper.find('.status-error').exists()).toBe(true);
    expect(wrapper.find('.offline-content-preview__error').exists()).toBe(true);
    expect(wrapper.find('.offline-content-preview__error p').text()).toContain('Network error');
  });

  it('renders correctly with conflict sync status', () => {
    const conflictContent = { ...mockContent, syncStatus: 'conflict' };
    wrapper = mount(OfflineContentPreview, {
      props: {
        content: conflictContent,
      },
    });

    expect(wrapper.find('.offline-content-preview__sync-status').text()).toContain(
      'Conflict Detected'
    );
    expect(wrapper.find('.status-warning').exists()).toBe(true);
    expect(wrapper.find('.offline-content-preview__conflict').exists()).toBe(true);
    expect(wrapper.find('.offline-content-preview__conflict-actions').exists()).toBe(true);
  });

  it('emits edit event when edit button is clicked', async () => {
    await wrapper.find('.offline-content-preview__actions button:first-child').trigger('click');
    expect(wrapper.emitted('edit')).toBeTruthy();
    expect(wrapper.emitted('edit')[0]).toEqual(['test-id']);
  });

  it('emits delete event when delete button is clicked', async () => {
    await wrapper.find('.offline-content-preview__actions button:last-child').trigger('click');
    expect(wrapper.emitted('delete')).toBeTruthy();
    expect(wrapper.emitted('delete')[0]).toEqual(['test-id']);
  });

  it('emits retry event when retry button is clicked', async () => {
    const failedContent = { ...mockContent, syncStatus: 'failed' };
    wrapper = mount(OfflineContentPreview, {
      props: {
        content: failedContent,
      },
    });

    await wrapper.find('.offline-content-preview__actions button:nth-child(2)').trigger('click');
    expect(wrapper.emitted('retry')).toBeTruthy();
    expect(wrapper.emitted('retry')[0]).toEqual(['test-id']);
  });

  it('emits resolveConflict event when conflict resolution button is clicked', async () => {
    const conflictContent = { ...mockContent, syncStatus: 'conflict' };
    wrapper = mount(OfflineContentPreview, {
      props: {
        content: conflictContent,
      },
    });

    await wrapper
      .find('.offline-content-preview__conflict-actions button:first-child')
      .trigger('click');
    expect(wrapper.emitted('resolveConflict')).toBeTruthy();
    expect(wrapper.emitted('resolveConflict')[0]).toEqual([
      { contentId: 'test-id', resolution: 'local' },
    ]);

    await wrapper
      .find('.offline-content-preview__conflict-actions button:last-child')
      .trigger('click');
    expect(wrapper.emitted('resolveConflict')[1]).toEqual([
      { contentId: 'test-id', resolution: 'server' },
    ]);
  });

  it('shows retry button only when online and sync failed', () => {
    // Mock offline status
    vi.mock('@/composables/useNetworkStatus', () => ({
      useNetworkStatus: vi.fn(() => ({
        isOnline: { value: false },
      })),
    }));

    const failedContent = { ...mockContent, syncStatus: 'failed' };
    wrapper = mount(OfflineContentPreview, {
      props: {
        content: failedContent,
      },
    });

    expect(wrapper.find('.offline-content-preview__actions button:nth-child(2)').exists()).toBe(
      false
    );
  });
});
