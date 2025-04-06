/**
 * CommentForm Component Tests
 * 
 * Tests the CommentForm component's functionality, form validation, error handling,
 * and interaction with the comment service. The component handles both new comments
 * and replies with proper validation and error state management.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CommentForm from '../CommentForm.vue'
import type { IComment } from '@/types/comment'
import { CommentParentTypeEnum } from '@/types/comment'
import { createComment } from '@/api/commentService'

// Mock dependencies
vi.mock('@/api/commentService', () => ({
  createComment: vi.fn().mockResolvedValue({
    _id: '1',
    title: 'Test Comment',
    content: 'Test content',
    author: { id: '1', name: 'Test User' },
    createdAt: '2024-03-20T12:00:00Z',
    parentId: 'post1',
    parentType: CommentParentTypeEnum.POST
  })
}))

const mockComment: IComment = {
  _id: '1',
  title: 'Test Comment',
  content: 'Test content',
  author: { id: '1', name: 'Test User' },
  createdAt: '2024-03-20T12:00:00Z',
  parentId: 'post1',
  parentType: CommentParentTypeEnum.POST
}

describe('CommentForm', () => {
  const defaultProps = {
    parentId: 'post-123',
    parentType: CommentParentTypeEnum.POST
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders properly', () => {
    const wrapper = mount(CommentForm, {
      props: defaultProps
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders as reply form when isReply is true', () => {
    const wrapper = mount(CommentForm, {
      props: {
        ...defaultProps,
        isReply: true
      }
    })
    expect(wrapper.find('.comment-form__title').text()).toBe('Reply')
  })

  it('validates form before submission', async () => {
    const wrapper = mount(CommentForm, {
      props: defaultProps
    })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('error')).toBeTruthy()
    expect(createComment).not.toHaveBeenCalled()
  })

  it('submits form with valid data', async () => {
    const wrapper = mount(CommentForm, {
      props: defaultProps
    })
    await wrapper.find('input[name="title"]').setValue('Test Title')
    await wrapper.find('textarea[name="content"]').setValue('Test Content')
    await wrapper.find('form').trigger('submit')
    expect(createComment).toHaveBeenCalledWith({
      title: 'Test Title',
      content: 'Test Content',
      parentId: 'post-123',
      parentType: CommentParentTypeEnum.POST
    })
    expect(wrapper.emitted('submit')).toBeTruthy()
  })

  it('handles API errors during submission', async () => {
    vi.mocked(createComment).mockRejectedValueOnce(new Error('API Error'))
    const wrapper = mount(CommentForm, {
      props: defaultProps
    })
    await wrapper.find('input[name="title"]').setValue('Test Title')
    await wrapper.find('textarea[name="content"]').setValue('Test Content')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('error')).toBeTruthy()
  })

  it('emits cancel event when cancel button is clicked', async () => {
    const wrapper = mount(CommentForm, {
      props: {
        ...defaultProps,
        isReply: true
      }
    })
    await wrapper.find('button[type="button"]').trigger('click')
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('disables submit button while submitting', async () => {
    vi.mocked(createComment).mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)))
    const wrapper = mount(CommentForm, {
      props: defaultProps
    })
    await wrapper.find('input[name="title"]').setValue('Test Title')
    await wrapper.find('textarea[name="content"]').setValue('Test Content')
    const submitPromise = wrapper.find('form').trigger('submit')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
    await submitPromise
  })

  it('validates title is required', async () => {
    const wrapper = mount(CommentForm, {
      props: defaultProps
    })
    await wrapper.find('textarea[name="content"]').setValue('Test Content')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.text()).toContain('Title is required')
    expect(createComment).not.toHaveBeenCalled()
  })

  it('validates content is required', async () => {
    const wrapper = mount(CommentForm, {
      props: defaultProps
    })
    await wrapper.find('input[name="title"]').setValue('Test Title')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.text()).toContain('Content is required')
    expect(createComment).not.toHaveBeenCalled()
  })
}) 