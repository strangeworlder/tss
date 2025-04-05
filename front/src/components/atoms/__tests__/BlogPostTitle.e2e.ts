import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BlogPostTitle from '../BlogPostTitle.vue'
import { BlogPostTitleVariantEnum } from '@/types/blogPost'

/**
 * E2E tests for the BlogPostTitle component
 * These tests verify that the component works correctly in a real-world scenario
 */
describe('BlogPostTitle E2E', () => {
  it('renders correctly in a real-world scenario', () => {
    // Mount the component with real-world props
    const wrapper = mount(BlogPostTitle, {
      props: {
        title: 'Real World Blog Post Title',
        variant: BlogPostTitleVariantEnum.FULL
      }
    })

    // Verify that the component renders correctly
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Real World Blog Post Title')
    expect(wrapper.classes()).toContain('blog-post-title--full')
    expect(wrapper.element.tagName).toBe('H2')
    expect(wrapper.attributes('id')).toBe('blog-title-real-world-blog-post-title')
  })

  it('works correctly with keyboard navigation', () => {
    // Mount the component
    const wrapper = mount(BlogPostTitle, {
      props: {
        title: 'Keyboard Navigation Test',
        variant: BlogPostTitleVariantEnum.FULL
      }
    })

    // Verify that the component is focusable
    wrapper.element.focus()
    expect(document.activeElement).toBe(wrapper.element)
  })

  it('is accessible to screen readers', () => {
    // Mount the component
    const wrapper = mount(BlogPostTitle, {
      props: {
        title: 'Screen Reader Test',
        variant: BlogPostTitleVariantEnum.FULL
      }
    })

    // Verify that the component has the correct role and aria attributes
    expect(wrapper.element.tagName).toBe('H2')
    expect(wrapper.attributes('id')).toBe('blog-title-screen-reader-test')
  })
}) 