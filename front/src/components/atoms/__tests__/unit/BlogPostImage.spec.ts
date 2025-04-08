import { describe, it, expect, beforeEach } from 'vitest';
import {
  mountBlogPostImage,
  getVariantClass,
  hasCorrectAriaLabel,
  hasCorrectRole,
} from '../BlogPostImage.test-utils';
import { mockBlogPostImages } from '../__fixtures__/BlogPostImage.fixture';
import { mount } from '@vue/test-utils';
import BlogPostImage from '../../BlogPostImage.vue';

describe('BlogPostImage', () => {
  beforeEach(() => {
    // Clear any mocks or state between tests
  });

  describe('rendering', () => {
    it('should render with default props', () => {
      const wrapper = mountBlogPostImage();

      expect(wrapper.classes()).toContain('blog-post-image');
      expect(getVariantClass(wrapper)).toBe('blog-post-image--full');
      expect(wrapper.find('.blog-post-image__img').exists()).toBe(true);
    });

    it('should render with compact variant', () => {
      const wrapper = mountBlogPostImage(mockBlogPostImages.compact);

      expect(getVariantClass(wrapper)).toBe('blog-post-image--compact');
    });

    it('should render with full variant', () => {
      const wrapper = mountBlogPostImage(mockBlogPostImages.default);

      expect(getVariantClass(wrapper)).toBe('blog-post-image--full');
    });
  });

  describe('image source', () => {
    it('should use the provided filename correctly', () => {
      const wrapper = mount(BlogPostImage, {
        props: mockBlogPostImages.default,
      });

      const img = wrapper.find('img');
      expect(img.exists()).toBe(true);
      expect(img.attributes('src')).toContain(mockBlogPostImages.default.filename);
    });

    it('should use the provided URL correctly', () => {
      const wrapper = mount(BlogPostImage, {
        props: mockBlogPostImages.withUrl,
      });

      const img = wrapper.find('img');
      expect(img.exists()).toBe(true);
      expect(img.attributes('src')).toBe(mockBlogPostImages.withUrl.url);
    });

    it('should use a placeholder image when no filename is provided', () => {
      const wrapper = mount(BlogPostImage, {
        props: mockBlogPostImages.noFilename,
      });

      const img = wrapper.find('img');
      expect(img.exists()).toBe(true);
      expect(img.attributes('src')).toContain('placeholder');
    });
  });

  describe('alt text', () => {
    it('should use the provided alt text', () => {
      const wrapper = mount(BlogPostImage, {
        props: mockBlogPostImages.default,
      });

      const img = wrapper.find('img');
      expect(img.exists()).toBe(true);
      expect(img.attributes('alt')).toBe(mockBlogPostImages.default.alt);
    });

    it('should use the alt text from props when no filename is provided', () => {
      const wrapper = mount(BlogPostImage, {
        props: mockBlogPostImages.noFilename,
      });

      const img = wrapper.find('img');
      expect(img.exists()).toBe(true);
      expect(img.attributes('alt')).toBe(mockBlogPostImages.noFilename.alt);
    });
  });

  describe('accessibility', () => {
    it('should have proper aria-label', () => {
      const wrapper = mountBlogPostImage(mockBlogPostImages.default);

      expect(hasCorrectAriaLabel(wrapper, 'Default blog image')).toBe(true);
    });

    it('should have proper role attribute', () => {
      const wrapper = mountBlogPostImage();

      expect(hasCorrectRole(wrapper)).toBe(true);
    });
  });
});
