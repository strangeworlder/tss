import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountBlogDetailView } from './BlogDetailView.test-utils';
import { mockBlogDetailView } from './__fixtures__/BlogDetailView.fixture';
import { useBlogStore } from '@/stores/blogStore';
import { useRoute, useRouter } from 'vue-router';

// Mock the blog store
vi.mock('@/stores/blogStore', () => ({
  useBlogStore: vi.fn(),
}));

// Mock the route and router
vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

describe('BlogDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the route
    (useRoute as any).mockReturnValue({
      params: {
        slug: 'test-blog-post',
      },
      path: '/blog/test-blog-post',
    });

    // Mock the blog store
    (useBlogStore as any).mockReturnValue({
      currentPost: mockBlogDetailView.default.post,
      fetchPostBySlug: vi.fn().mockResolvedValue(mockBlogDetailView.default.post),
    });
  });

  describe('Rendering', () => {
    it('should render the blog post content when data is loaded', async () => {
      const wrapper = mountBlogDetailView();

      // Wait for the component to update
      await wrapper.vm.$nextTick();

      // Check that the blog post content is rendered
      expect(wrapper.find('.blog-detail-view__article').exists()).toBe(true);
      expect(wrapper.find('.blog-detail-view__content').exists()).toBe(true);
    });

    it('should render the loading spinner when loading', async () => {
      // Mock the blog store to return loading state
      (useBlogStore as any).mockReturnValue({
        currentPost: null,
        fetchPostBySlug: vi.fn().mockResolvedValue(null),
      });

      const wrapper = mountBlogDetailView();

      // Check that the loading spinner is rendered
      expect(wrapper.find('LoadingSpinner-stub').exists()).toBe(true);
    });

    it('should render the error message when there is an error', async () => {
      // Mock the blog store to return error state
      (useBlogStore as any).mockReturnValue({
        currentPost: null,
        fetchPostBySlug: vi.fn().mockRejectedValue(new Error('Failed to load blog post')),
      });

      const wrapper = mountBlogDetailView();

      // Wait for the component to update
      await wrapper.vm.$nextTick();

      // Check that the error message is rendered
      expect(wrapper.find('.blog-detail-view__error').exists()).toBe(true);
      expect(wrapper.find('.blog-detail-view__error-text').text()).toContain(
        'Failed to load blog post'
      );
    });

    it('should render the not found message when the post is not found', async () => {
      // Mock the blog store to return not found state
      (useBlogStore as any).mockReturnValue({
        currentPost: null,
        fetchPostBySlug: vi.fn().mockResolvedValue(null),
      });

      const wrapper = mountBlogDetailView();

      // Wait for the component to update
      await wrapper.vm.$nextTick();

      // Check that the not found message is rendered
      expect(wrapper.find('.blog-detail-view__not-found').exists()).toBe(true);
      expect(wrapper.find('.blog-detail-view__not-found-heading').text()).toContain(
        'Blog Post Not Found'
      );
    });
  });

  describe('User Interactions', () => {
    it('should navigate back to the blog listing when the back button is clicked', async () => {
      const mockRouter = {
        push: vi.fn(),
      };
      (useRouter as any).mockReturnValue(mockRouter);

      const wrapper = mountBlogDetailView();

      // Wait for the component to update
      await wrapper.vm.$nextTick();

      // Find the back button and click it
      const backButton = wrapper.find('.blog-detail-view__button--back');
      await backButton.trigger('click');

      // Check that the router.push method was called with the correct path
      expect(mockRouter.push).toHaveBeenCalledWith('/blog');
    });

    it('should retry loading the blog post when the retry button is clicked', async () => {
      // Mock the blog store to return error state
      const mockFetchPostBySlug = vi.fn().mockRejectedValue(new Error('Failed to load blog post'));
      (useBlogStore as any).mockReturnValue({
        currentPost: null,
        fetchPostBySlug: mockFetchPostBySlug,
      });

      const wrapper = mountBlogDetailView();

      // Wait for the component to update
      await wrapper.vm.$nextTick();

      // Find the retry button and click it
      const retryButton = wrapper.find('.blog-detail-view__button--retry');
      await retryButton.trigger('click');

      // Check that the fetchPostBySlug method was called again
      expect(mockFetchPostBySlug).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility', () => {
    it('should use semantic HTML elements', async () => {
      const wrapper = mountBlogDetailView();

      // Wait for the component to update
      await wrapper.vm.$nextTick();

      // Check that semantic HTML elements are used
      expect(wrapper.find('article').exists()).toBe(true);
      expect(wrapper.find('section').exists()).toBe(true);
      expect(wrapper.find('h2').exists()).toBe(true);
    });

    it('should provide meaningful alt text for images', async () => {
      const wrapper = mountBlogDetailView();

      // Wait for the component to update
      await wrapper.vm.$nextTick();

      // Check that the AppImage component has the correct alt text
      const appImage = wrapper.find('AppImage-stub');
      if (mockBlogDetailView.default.post.heroImage) {
        expect(appImage.attributes('alt')).toBe(mockBlogDetailView.default.post.heroImage.altText);
      }
    });
  });
});
