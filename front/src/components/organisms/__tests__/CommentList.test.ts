import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import CommentList from '../CommentList.vue';
import type { IComment } from '@/types/comment';
import { CommentParentTypeEnum } from '@/types/comment';
import { getComments, deleteComment } from '@/api/commentService';
import { COMMENT_CONSTANTS } from '@/constants/comment';

// Mock dependencies
vi.mock('@/api/commentService', () => ({
  getComments: vi.fn(),
  deleteComment: vi.fn(),
}));

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    isAuthenticated: true,
    isAdmin: false,
    currentUser: { id: 'user1', name: 'Test User' },
  }),
}));

vi.mock('@/stores/notification', () => ({
  useNotificationStore: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

const mockComments: IComment[] = [
  {
    _id: '1',
    title: 'Test Comment 1',
    content: 'Test content 1',
    author: { id: 'user1', name: 'Test User' },
    createdAt: '2024-03-20T12:00:00Z',
    parentId: 'post1',
    parentType: CommentParentTypeEnum.POST,
  },
  {
    _id: '2',
    title: 'Test Comment 2',
    content: 'Test content 2',
    author: { id: 'user2', name: 'Other User' },
    createdAt: '2024-03-20T13:00:00Z',
    parentId: 'post1',
    parentType: CommentParentTypeEnum.POST,
  },
];

describe('CommentList', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.mocked(getComments).mockResolvedValue(mockComments);
  });

  it('renders properly', () => {
    const wrapper = mount(CommentList, {
      props: {
        parentId: 'post1',
        parentType: CommentParentTypeEnum.POST,
      },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('displays loading state initially', () => {
    const wrapper = mount(CommentList, {
      props: {
        parentId: 'post1',
        parentType: CommentParentTypeEnum.POST,
      },
    });
    expect(wrapper.find('.comment-list__loading').exists()).toBe(true);
  });

  it('displays comments when loaded', async () => {
    const wrapper = mount(CommentList, {
      props: {
        parentId: 'post1',
        parentType: CommentParentTypeEnum.POST,
      },
    });

    // Wait for the component to update after the mock response
    await wrapper.vm.$nextTick();
    await vi.mocked(getComments).mockResolvedValueOnce(mockComments);
    await wrapper.vm.$nextTick();

    const commentItems = wrapper.findAll('.comment-list__item');
    expect(commentItems).toHaveLength(2);
  });

  it('displays empty state when no comments', async () => {
    vi.mocked(getComments).mockResolvedValueOnce([]);
    const wrapper = mount(CommentList, {
      props: {
        parentId: 'post1',
        parentType: CommentParentTypeEnum.POST,
      },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.comment-list__empty').text()).toBe(COMMENT_CONSTANTS.EMPTY_MESSAGE);
  });

  it('displays error state when API fails', async () => {
    const errorMessage = 'Failed to load comments';
    vi.mocked(getComments).mockRejectedValueOnce(new Error(errorMessage));
    const wrapper = mount(CommentList, {
      props: {
        parentId: 'post1',
        parentType: CommentParentTypeEnum.POST,
      },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.comment-list__error').text()).toBe(errorMessage);
  });

  it('shows reply form when reply button is clicked', async () => {
    const wrapper = mount(CommentList, {
      props: {
        parentId: 'post1',
        parentType: CommentParentTypeEnum.POST,
      },
    });

    // Wait for comments to load
    await wrapper.vm.$nextTick();
    await vi.mocked(getComments).mockResolvedValueOnce(mockComments);
    await wrapper.vm.$nextTick();

    // Find and click the reply button
    const replyButton = wrapper.findAll('button').find((button) => button.text().includes('Reply'));
    expect(replyButton).toBeTruthy();
    await replyButton?.trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.comment-list__form--reply').exists()).toBe(true);
  });

  it('allows comment deletion for comment author', async () => {
    const wrapper = mount(CommentList, {
      props: {
        parentId: 'post1',
        parentType: CommentParentTypeEnum.POST,
      },
    });

    // Wait for comments to load
    await wrapper.vm.$nextTick();
    await vi.mocked(getComments).mockResolvedValueOnce(mockComments);
    await wrapper.vm.$nextTick();

    const deleteButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Delete'));
    expect(deleteButton?.exists()).toBe(true);
  });

  it('emits comment-deleted event when comment is deleted', async () => {
    const wrapper = mount(CommentList, {
      props: {
        parentId: 'post1',
        parentType: CommentParentTypeEnum.POST,
      },
    });

    // Wait for comments to load
    await wrapper.vm.$nextTick();
    await vi.mocked(getComments).mockResolvedValueOnce(mockComments);
    await wrapper.vm.$nextTick();

    // Mock the confirmation dialog
    window.confirm = vi.fn(() => true);

    // Find and click the delete button
    const deleteButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Delete'));
    expect(deleteButton).toBeTruthy();
    await deleteButton?.trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('comment-deleted')).toBeTruthy();
  });

  it('handles reply submission correctly', async () => {
    const wrapper = mount(CommentList, {
      props: {
        parentId: 'post1',
        parentType: CommentParentTypeEnum.POST,
      },
    });

    // Wait for comments to load
    await wrapper.vm.$nextTick();
    await vi.mocked(getComments).mockResolvedValueOnce(mockComments);
    await wrapper.vm.$nextTick();

    // Find and click the reply button
    const replyButton = wrapper.findAll('button').find((button) => button.text().includes('Reply'));
    expect(replyButton).toBeTruthy();
    await replyButton?.trigger('click');
    await wrapper.vm.$nextTick();

    // Find the CommentForm component and emit submit
    const commentForm = wrapper.findComponent({ name: 'CommentForm' });
    expect(commentForm.exists()).toBe(true);
    await commentForm.vm.$emit('submit');
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('comment-added')).toBeTruthy();
  });

  it('formats markdown content correctly', async () => {
    const wrapper = mount(CommentList, {
      props: {
        parentId: 'post1',
        parentType: CommentParentTypeEnum.POST,
      },
    });

    // Wait for comments to load
    await wrapper.vm.$nextTick();
    await vi.mocked(getComments).mockResolvedValueOnce(mockComments);
    await wrapper.vm.$nextTick();

    const content = wrapper.find('.comment-list__content');
    expect(content.html()).toContain('Test content 1');
  });
});
