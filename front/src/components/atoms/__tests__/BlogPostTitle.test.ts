import { describe, it, expect, vi } from 'vitest'
import { mountBlogPostTitle, createDefaultBlogPostTitleProps } from './BlogPostTitle.test-utils'
import { BlogPostTitleVariantEnum } from '@/types/blogPost'
import { mockBlogPostTitles } from './__fixtures__/BlogPostTitle.fixture'

describe('BlogPostTitle', () => {
  it('renders correctly with default props', () => {
    const wrapper = mountBlogPostTitle()
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Test Blog Post Title')
    expect(wrapper.classes()).toContain('blog-post-title--full')
  })

  it('renders correctly with compact variant', () => {
    const wrapper = mountBlogPostTitle(mockBlogPostTitles.compact)
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Test Blog Post Title')
    expect(wrapper.classes()).toContain('blog-post-title--compact')
  })

  it('renders correctly with a long title', () => {
    const wrapper = mountBlogPostTitle(mockBlogPostTitles.longTitle)
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('This is a very long blog post title that should be properly displayed')
  })

  it('renders correctly with special characters', () => {
    const wrapper = mountBlogPostTitle(mockBlogPostTitles.specialCharacters)
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Special & Characters < > " \' /')
  })

  it('generates a unique ID based on the title', () => {
    const wrapper = mountBlogPostTitle()
    const titleId = wrapper.attributes('id')
    expect(titleId).toBe('blog-title-test-blog-post-title')
  })

  it('generates a unique ID with special characters', () => {
    const wrapper = mountBlogPostTitle(mockBlogPostTitles.specialCharacters)
    const titleId = wrapper.attributes('id')
    expect(titleId).toBe('blog-title-special-characters')
  })

  it('logs a warning when title is empty', () => {
    const consoleSpy = vi.spyOn(console, 'warn')
    mountBlogPostTitle(mockBlogPostTitles.emptyTitle)
    expect(consoleSpy).toHaveBeenCalledWith('BlogPostTitle: Title should not be empty')
    consoleSpy.mockRestore()
  })

  it('uses semantic HTML (h2 element)', () => {
    const wrapper = mountBlogPostTitle()
    expect(wrapper.element.tagName).toBe('H2')
  })

  it('applies the correct CSS classes based on the variant', () => {
    const fullWrapper = mountBlogPostTitle(createDefaultBlogPostTitleProps({ variant: BlogPostTitleVariantEnum.FULL }))
    expect(fullWrapper.classes()).toContain('blog-post-title--full')
    
    const compactWrapper = mountBlogPostTitle(createDefaultBlogPostTitleProps({ variant: BlogPostTitleVariantEnum.COMPACT }))
    expect(compactWrapper.classes()).toContain('blog-post-title--compact')
  })
}) 