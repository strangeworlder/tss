import { describe, it, expect, beforeEach } from 'vitest'
import { mountBlogPostImage, getVariantClass, hasCorrectAriaLabel, hasCorrectRole } from '../BlogPostImage.test-utils'
import { mockBlogPostImages } from '../__fixtures__/BlogPostImage.fixture'

describe('BlogPostImage', () => {
  beforeEach(() => {
    // Clear any mocks or state between tests
  })

  describe('rendering', () => {
    it('should render with default props', () => {
      const wrapper = mountBlogPostImage()
      
      expect(wrapper.classes()).toContain('blog-post-image')
      expect(getVariantClass(wrapper)).toBe('blog-post-image--full')
      expect(wrapper.find('.blog-post-image__img').exists()).toBe(true)
    })

    it('should render with compact variant', () => {
      const wrapper = mountBlogPostImage(mockBlogPostImages.compact)
      
      expect(getVariantClass(wrapper)).toBe('blog-post-image--compact')
    })

    it('should render with full variant', () => {
      const wrapper = mountBlogPostImage(mockBlogPostImages.default)
      
      expect(getVariantClass(wrapper)).toBe('blog-post-image--full')
    })
  })

  describe('image source', () => {
    it('should use filename when provided', () => {
      const wrapper = mountBlogPostImage(mockBlogPostImages.default)
      
      const appImage = wrapper.findComponent({ name: 'AppImage' })
      expect(appImage.props('filename')).toBe('default-image.webp')
    })

    it('should use url when provided', () => {
      const wrapper = mountBlogPostImage(mockBlogPostImages.withUrl)
      
      const appImage = wrapper.findComponent({ name: 'AppImage' })
      expect(appImage.props('src')).toBe('https://example.com/image.jpg')
    })

    it('should use placeholder when no filename is provided', () => {
      const wrapper = mountBlogPostImage(mockBlogPostImages.noFilename)
      
      const appImage = wrapper.findComponent({ name: 'AppImage' })
      expect(appImage.props('filename')).toBe('placeholder1.webp')
    })
  })

  describe('accessibility', () => {
    it('should have proper aria-label', () => {
      const wrapper = mountBlogPostImage(mockBlogPostImages.default)
      
      expect(hasCorrectAriaLabel(wrapper, 'Default blog image')).toBe(true)
    })

    it('should have proper role attribute', () => {
      const wrapper = mountBlogPostImage()
      
      expect(hasCorrectRole(wrapper)).toBe(true)
    })
  })
}) 