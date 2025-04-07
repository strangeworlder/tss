import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CommentList from '../CommentList.vue'
import type { IComment } from '@/types/comment'
import { CommentParentTypeEnum } from '@/types/comment'
import { getComments, deleteComment } from '@/api/commentService'
import { COMMENT_CONSTANTS } from '@/constants/comment'

// Mock dependencies
vi.mock('@/api/commentService', () => ({
  getComments: vi.fn(),
  deleteComment: vi.fn(),
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    isAuthenticated: true,
    isAdmin: false,
    currentUser: { id: 'user1', name: 'Test User' },
  }),
}))

vi.mock('@/stores/notification', () => ({
  useNotificationStore: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}))

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
]

describe('CommentList', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.mocked(getComments).mockResolvedValue(mockComments)
  })

  it('renders properly', () => {
    const wrapper = mount(CommentList, {
      props: {
        parentId: 'post1',
        parentType: CommentParentTypeEnum.POST,
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays loading state initially', () => {
    const wrapper = mount(CommentList, {
      props: {
        parentId: 'post1',
        parentType: CommentParentTypeEnum.POST,
      },
    })
    expect(wrapper.find('.comment-list__loading').exists()).toBe(true)
  })

  it('displays comments when loaded', async () => {
    const wrapper = mount(CommentList, {
      props: {
        parentId: 'post1',
        parentType: CommentParentTypeEnum.POST,
      },
    })
    await vi.mocked(getComments).mockResolvedValueOnce(mockComments)
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.comment-list__item')).toHaveLength(2)
  })

  it('displays empty state when no comments', async () => {
    vi.mocked(getComments).mockResolvedValueOnce([])
    const wrapper = mount(CommentList, {
      props: {
        parentId: 'post1',
        parentType: CommentParentTypeEnum.POST,
      },
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.comment-list__empty').text()).toBe(COMMENT_CONSTANTS.EMPTY_MESSAGE)
  })

  it('displays error state when API fails', async () => {
    const errorMessage = 'Failed to load comments'
    vi.mocked(getComments).mockRejectedValueOnce(new Error(errorMessage))
    const wrapper = mount(CommentList, {
      props: {
        parentId: 'post1',
        parentType: CommentParentTypeEnum.POST,
      },
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.comment-list__error').text()).toBe(errorMessage)
  })

  it('shows reply form when reply button is clicked', async () => {
    const wrapper = mount(CommentList, {
      props: {
        parentId: 'post1',
        parentType: CommentParentTypeEnum.POST,
      },
    })
    await wrapper.vm.$nextTick()
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Reply')
      ?.trigger('click')
    expect(wrapper.find('.comment-list__form--reply').exists()).toBe(true)
  })

  it('allows comment deletion for comment author', async () => {
    const wrapper = mount(CommentList, {
      props: {
        parentId: 'post1',
        parentType: CommentParentTypeEnum.POST,
      },
    })
    await wrapper.vm.$nextTick()
    const deleteButton = wrapper.findAll('button').find((button) => button.text() === 'Delete')
    expect(deleteButton?.exists()).toBe(true)
  })

  it('emits comment-deleted event when comment is deleted', async () => {
    const wrapper = mount(CommentList, {
      props: {
        parentId: 'post1',
        parentType: CommentParentTypeEnum.POST,
      },
    })
    await wrapper.vm.$nextTick()
    vi.mocked(deleteComment).mockResolvedValueOnce()
    window.confirm = vi.fn(() => true)
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Delete')
      ?.trigger('click')
    expect(wrapper.emitted('comment-deleted')).toBeTruthy()
  })

  it('handles reply submission correctly', async () => {
    const wrapper = mount(CommentList, {
      props: {
        parentId: 'post1',
        parentType: CommentParentTypeEnum.POST,
      },
    })
    await wrapper.vm.$nextTick()
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Reply')
      ?.trigger('click')
    await wrapper.findComponent({ name: 'CommentForm' }).vm.$emit('submit')
    expect(wrapper.emitted('comment-added')).toBeTruthy()
  })

  it('formats markdown content correctly', async () => {
    const wrapper = mount(CommentList, {
      props: {
        parentId: 'post1',
        parentType: CommentParentTypeEnum.POST,
      },
    })
    await wrapper.vm.$nextTick()
    const content = wrapper.find('.comment-list__content')
    expect(content.html()).toContain('Test content 1')
  })
})
