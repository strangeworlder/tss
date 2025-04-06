import { describe, it, expect } from 'vitest'
import { mountComponent } from './BlogPostTags.test-utils'
import { mockTags } from './__fixtures__/BlogPostTags.fixture'

describe('BlogPostTags', () => {
  // Rendering tests
  describe('rendering', () => {
    it('renders all tags from the provided array', () => {
      const wrapper = mountComponent({ tags: mockTags.default })
      const tagPills = wrapper.findAllComponents({ name: 'TagPill' })
      
      expect(tagPills).toHaveLength(mockTags.default.length)
      mockTags.default.forEach((tag: string, index: number) => {
        expect(tagPills[index].props('tag')).toBe(tag)
      })
    })

    it('renders no tags when empty array is provided', () => {
      const wrapper = mountComponent({ tags: mockTags.empty })
      const tagPills = wrapper.findAllComponents({ name: 'TagPill' })
      
      expect(tagPills).toHaveLength(0)
    })

    it('applies correct BEM classes', () => {
      const wrapper = mountComponent({ tags: mockTags.default })
      expect(wrapper.classes()).toContain('blog-post-tags')
      
      const tagPills = wrapper.findAllComponents({ name: 'TagPill' })
      tagPills.forEach((pill: any) => {
        expect(pill.classes()).toContain('blog-post-tags__tag')
      })
    })
  })

  // Props tests
  describe('props', () => {
    it('accepts tags prop as an array of strings', () => {
      const wrapper = mountComponent({ tags: mockTags.default })
      expect(wrapper.props('tags')).toEqual(mockTags.default)
    })
  })

  // Accessibility tests
  describe('accessibility', () => {
    it('has correct ARIA attributes', () => {
      const wrapper = mountComponent({ tags: mockTags.default })
      
      expect(wrapper.attributes('role')).toBe('list')
      expect(wrapper.attributes('aria-label')).toBe('Blog post tags')
      
      const tagPills = wrapper.findAllComponents({ name: 'TagPill' })
      tagPills.forEach((pill: any) => {
        expect(pill.attributes('role')).toBe('listitem')
      })
    })
  })

  // Responsive behavior tests
  describe('responsive behavior', () => {
    it('maintains flex-wrap layout', () => {
      const wrapper = mountComponent({ tags: mockTags.long })
      expect(wrapper.element.style.flexWrap).toBe('wrap')
    })
  })

  // Style tests
  describe('styling', () => {
    it('uses correct semantic spacing variables', () => {
      const wrapper = mountComponent({ tags: mockTags.default })
      const styles = window.getComputedStyle(wrapper.element)
      
      expect(styles.gap).toBe('var(--spacing-sm)')
      expect(styles.marginBottom).toBe('var(--spacing-md)')
    })
  })
}) 