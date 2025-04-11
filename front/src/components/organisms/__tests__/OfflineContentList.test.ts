import { describe, it, expect, beforeEach, vi } from '@/test-utils';
import { mount } from '@vue/test-utils';
import OfflineContentList from '../OfflineContentList.vue';
import type { IOfflineContent } from '@/services/OfflineStorageService';
import { ScheduledContentStatusEnum } from '@/types/scheduling';

// Mock the useOfflineStorage composable
vi.mock('@/composables/useOfflineStorage', () => ({
  useOfflineStorage: vi.fn(() => ({
    getAllOfflineContent: vi.fn(() => mockOfflineContent),
  })),
}));

// Mock data
const mockOfflineContent: IOfflineContent[] = [
  {
    id: 'post-1',
    type: 'post',
    content: 'Test post 1',
    publishAt: new Date('2023-12-31T12:00:00Z'),
    status: ScheduledContentStatusEnum.SCHEDULED,
    authorId: 'author-id',
    version: 1,
    hasActiveUpdate: false,
    lastModified: new Date('2023-12-30T10:00:00Z'),
    syncStatus: 'pending',
    retryCount: 0,
    maxRetries: 3,
  },
  {
    id: 'post-2',
    type: 'post',
    content: 'Test post 2',
    publishAt: new Date('2023-12-31T14:00:00Z'),
    status: ScheduledContentStatusEnum.SCHEDULED,
    authorId: 'author-id',
    version: 1,
    hasActiveUpdate: false,
    lastModified: new Date('2023-12-30T12:00:00Z'),
    syncStatus: 'failed',
    syncError: 'Network error',
    retryCount: 1,
    maxRetries: 3,
  },
  {
    id: 'comment-1',
    type: 'comment',
    content: 'Test comment 1',
    publishAt: new Date('2023-12-31T13:00:00Z'),
    status: ScheduledContentStatusEnum.SCHEDULED,
    authorId: 'author-id',
    version: 1,
    hasActiveUpdate: false,
    lastModified: new Date('2023-12-30T11:00:00Z'),
    syncStatus: 'conflict',
    retryCount: 0,
    maxRetries: 3,
  },
];

describe('OfflineContentList', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(OfflineContentList, {
      props: {
        filter: 'all',
        sortBy: 'date',
        initialSortOrder: 'desc',
      },
    });
  });

  it('renders correctly with content', () => {
    expect(wrapper.find('.offline-content-list').exists()).toBe(true);
    expect(wrapper.find('.offline-content-list__title').text()).toContain('Offline Content');
    expect(wrapper.findAll('.offline-content-preview').length).toBe(3);
  });

  it('renders empty state when no content is available', () => {
    // Mock empty content
    vi.mocked(useOfflineStorage).mockReturnValue({
      getAllOfflineContent: vi.fn(() => []),
    });

    wrapper = mount(OfflineContentList, {
      props: {
        filter: 'all',
        sortBy: 'date',
        initialSortOrder: 'desc',
      },
    });

    expect(wrapper.find('.offline-content-list__empty').exists()).toBe(true);
    expect(wrapper.find('.offline-content-list__empty').text()).toContain(
      'No offline content available'
    );
  });

  it('filters content by type', async () => {
    await wrapper.setProps({ filter: 'post' });
    expect(wrapper.findAll('.offline-content-preview').length).toBe(2);

    await wrapper.setProps({ filter: 'comment' });
    expect(wrapper.findAll('.offline-content-preview').length).toBe(1);

    await wrapper.setProps({ filter: 'all' });
    expect(wrapper.findAll('.offline-content-preview').length).toBe(3);
  });

  it('sorts content by date', async () => {
    await wrapper.setProps({ sortBy: 'date', initialSortOrder: 'desc' });

    // In descending order, the most recent should be first
    const previews = wrapper.findAll('.offline-content-preview');
    expect(previews[0].props('content').id).toBe('post-2');

    await wrapper.setProps({ initialSortOrder: 'asc' });

    // In ascending order, the oldest should be first
    const updatedPreviews = wrapper.findAll('.offline-content-preview');
    expect(updatedPreviews[0].props('content').id).toBe('post-1');
  });

  it('sorts content by status', async () => {
    await wrapper.setProps({ sortBy: 'status', initialSortOrder: 'asc' });

    // In ascending order, 'conflict' should come before 'failed' and 'pending'
    const previews = wrapper.findAll('.offline-content-preview');
    expect(previews[0].props('content').syncStatus).toBe('conflict');

    await wrapper.setProps({ initialSortOrder: 'desc' });

    // In descending order, 'pending' should come before 'failed' and 'conflict'
    const updatedPreviews = wrapper.findAll('.offline-content-preview');
    expect(updatedPreviews[0].props('content').syncStatus).toBe('pending');
  });

  it('sorts content by type', async () => {
    await wrapper.setProps({ sortBy: 'type', initialSortOrder: 'asc' });

    // In ascending order, 'comment' should come before 'post'
    const previews = wrapper.findAll('.offline-content-preview');
    expect(previews[0].props('content').type).toBe('comment');

    await wrapper.setProps({ initialSortOrder: 'desc' });

    // In descending order, 'post' should come before 'comment'
    const updatedPreviews = wrapper.findAll('.offline-content-preview');
    expect(updatedPreviews[0].props('content').type).toBe('post');
  });

  it('emits edit event when edit button is clicked', async () => {
    const firstPreview = wrapper.find('.offline-content-preview');
    await firstPreview.vm.$emit('edit', 'post-1');

    expect(wrapper.emitted('edit')).toBeTruthy();
    expect(wrapper.emitted('edit')[0]).toEqual(['post-1']);
  });

  it('emits delete event when delete button is clicked', async () => {
    const firstPreview = wrapper.find('.offline-content-preview');
    await firstPreview.vm.$emit('delete', 'post-1');

    expect(wrapper.emitted('delete')).toBeTruthy();
    expect(wrapper.emitted('delete')[0]).toEqual(['post-1']);
  });

  it('emits retry event when retry button is clicked', async () => {
    const secondPreview = wrapper.findAll('.offline-content-preview')[1];
    await secondPreview.vm.$emit('retry', 'post-2');

    expect(wrapper.emitted('retry')).toBeTruthy();
    expect(wrapper.emitted('retry')[0]).toEqual(['post-2']);
  });

  it('emits resolveConflict event when conflict resolution is selected', async () => {
    const thirdPreview = wrapper.findAll('.offline-content-preview')[2];
    await thirdPreview.vm.$emit('resolveConflict', { contentId: 'comment-1', resolution: 'local' });

    expect(wrapper.emitted('resolveConflict')).toBeTruthy();
    expect(wrapper.emitted('resolveConflict')[0]).toEqual([
      { contentId: 'comment-1', resolution: 'local' },
    ]);
  });
});
