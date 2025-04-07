import { describe, it, expect } from 'vitest'
import { mountBlogPostExcerpt } from './BlogPostExcerpt.test-utils'
import { mockBlogPostExcerpts } from './__fixtures__/BlogPostExcerpt.fixture'
import { BlogPostTitleVariantEnum } from '@/types/blogPost'

describe('BlogPostExcerpt', () => {
  // 1. Rendering tests
  it('renders properly with default props', () => {
    const wrapper = mountBlogPostExcerpt()
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain(mockBlogPostExcerpts.default.content)
  })

  // 2. Props tests
  it('renders with COMPACT variant', () => {
    const wrapper = mountBlogPostExcerpt(mockBlogPostExcerpts.compact)
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain(mockBlogPostExcerpts.compact.content)
  })

  // 3. Content truncation tests
  it('truncates content with FULL variant (default)', () => {
    const wrapper = mountBlogPostExcerpt(mockBlogPostExcerpts.longContent)
    const excerpt = wrapper.text()
    expect(excerpt.length).toBeLessThan(mockBlogPostExcerpts.longContent.content.length)
    expect(excerpt.endsWith('...')).toBe(true)
  })

  it('truncates content with COMPACT variant', () => {
    const wrapper = mountBlogPostExcerpt(mockBlogPostExcerpts.longContentCompact)
    const excerpt = wrapper.text()
    expect(excerpt.length).toBeLessThan(mockBlogPostExcerpts.longContentCompact.content.length)
    expect(excerpt.endsWith('...')).toBe(true)
  })

  it('does not truncate content when it is shorter than the excerpt length', () => {
    const wrapper = mountBlogPostExcerpt(mockBlogPostExcerpts.shortContent)
    expect(wrapper.text()).toBe(mockBlogPostExcerpts.shortContent.content)
    expect(wrapper.text().endsWith('...')).toBe(false)
  })

  // 4. Styling tests
  it('applies correct styling', () => {
    const wrapper = mountBlogPostExcerpt()
    const element = wrapper.find('.blog-post-excerpt')
    expect(element.exists()).toBe(true)

    // Check that the element has the correct styling
    const styles = window.getComputedStyle(element.element)
    expect(styles.marginBottom).toBe('1rem') // --spacing-md is 1rem
    expect(styles.color).toBe('rgb(17, 24, 39)') // --color-text in light mode
    expect(styles.fontFamily).toContain('-apple-system') // --font-family-base
    expect(styles.fontSize).toBe('1rem') // --font-size-base
    expect(styles.lineHeight).toBe('1.5')
  })

  // 5. Accessibility tests
  it('is accessible', () => {
    const wrapper = mountBlogPostExcerpt()
    const element = wrapper.find('.blog-post-excerpt')
    expect(element.exists()).toBe(true)

    // Check that the text is properly structured
    expect(element.text()).toBeTruthy()
  })

  // 6. Edge case tests
  it('handles empty content gracefully', () => {
    const wrapper = mountBlogPostExcerpt({ content: '' })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toBe('')
  })
})
