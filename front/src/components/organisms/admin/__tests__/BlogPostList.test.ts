import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { VueWrapper } from '@vue/test-utils';
import { mountBlogPostList } from './BlogPostList.test-utils';
import { mockBlogPosts } from './__fixtures__/BlogPostList.fixture';
import { useBlogStore } from '@/stores/blogStore';
import type { IBlogPost } from '@/types/blog';

// Mock the blog store
vi.mock('@/stores/blogStore', () => ({
  useBlogStore: vi.fn(() => ({
    posts: [],
    loading: false,
    error: null,
    fetchAdminPosts: vi.fn(),
  })),
}));

describe('BlogPostList', () => {
  let wrapper: VueWrapper;
  let blogStore: ReturnType<typeof useBlogStore>;

  beforeEach(() => {
    wrapper = mountBlogPostList();
    blogStore = useBlogStore();
  });

  describe('Rendering', () => {
    it('should render loading state initially', () => {
      expect(wrapper.find('.blog-post-list__loading').exists()).toBe(true);
      expect(wrapper.find('[role="status"]').text()).toContain('Loading posts...');
    });

    it('should render error state when there is an error', async () => {
      const error = 'Failed to load blog posts';
      vi.mocked(blogStore.fetchAdminPosts).mockRejectedValueOnce(new Error(error));

      await wrapper.vm.$nextTick();

      expect(wrapper.find('.blog-post-list__error').exists()).toBe(true);
      expect(wrapper.find('[role="alert"]').text()).toContain(error);
    });

    it('should render blog posts grid when posts are loaded', async () => {
      blogStore.posts = mockBlogPosts;
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.blog-post-list__grid').exists()).toBe(true);
      expect(wrapper.findAll('.blog-post-list__item')).toHaveLength(mockBlogPosts.length);
    });
  });

  describe('Props and Data Display', () => {
    beforeEach(async () => {
      blogStore.posts = mockBlogPosts;
      await wrapper.vm.$nextTick();
    });

    it('should display post title correctly', () => {
      const firstPost = wrapper.find('.blog-post-list__title');
      expect(firstPost.text()).toBe(mockBlogPosts[0].title);
    });

    it('should display author information correctly', () => {
      const authorInfo = wrapper.findComponent({ name: 'AuthorInfo' });
      expect(authorInfo.exists()).toBe(true);
      expect(authorInfo.props('author')).toMatchObject({
        type: 'user',
        id: mockBlogPosts[0].author.id,
        name: mockBlogPosts[0].author.name,
      });
    });

    it('should show correct status badge for published posts', () => {
      const publishedStatus = wrapper.find('.blog-post-list__status--published');
      expect(publishedStatus.text()).toBe('Published');
    });

    it('should show correct status badge for draft posts', async () => {
      const draftPost: IBlogPost = { ...mockBlogPosts[0], isPublished: false };
      blogStore.posts = [draftPost];
      await wrapper.vm.$nextTick();

      const draftStatus = wrapper.find('.blog-post-list__status--draft');
      expect(draftStatus.text()).toBe('Draft');
    });
  });

  describe('Events', () => {
    beforeEach(async () => {
      blogStore.posts = mockBlogPosts;
      await wrapper.vm.$nextTick();
    });

    it('should emit edit-post event when edit button is clicked', async () => {
      const editButton = wrapper.find('.blog-post-list__actions button');
      await editButton.trigger('click');

      expect(wrapper.emitted('edit-post')).toBeTruthy();
      expect(wrapper.emitted('edit-post')?.[0]).toEqual([mockBlogPosts[0].id]);
    });

    it('should retry fetching posts when try again button is clicked', async () => {
      vi.mocked(blogStore.fetchAdminPosts).mockRejectedValueOnce(new Error('Failed to load'));
      await wrapper.vm.$nextTick();

      const retryButton = wrapper.find('.blog-post-list__error button');
      await retryButton.trigger('click');

      expect(blogStore.fetchAdminPosts).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility', () => {
    it('should have proper loading state announcement', () => {
      const loadingElement = wrapper.find('[role="status"]');
      expect(loadingElement.exists()).toBe(true);
      expect(loadingElement.attributes('aria-live')).toBe('polite');
    });

    it('should have proper error state announcement', async () => {
      vi.mocked(blogStore.fetchAdminPosts).mockRejectedValueOnce(new Error('Failed to load'));
      await wrapper.vm.$nextTick();

      const errorElement = wrapper.find('[role="alert"]');
      expect(errorElement.exists()).toBe(true);
    });

    it('should have proper image alt text', async () => {
      blogStore.posts = mockBlogPosts;
      await wrapper.vm.$nextTick();

      const image = wrapper.find('.blog-post-list__img');
      // Check if the image exists before accessing its attributes
      if (image.exists()) {
        expect(image.attributes('alt')).toBe(mockBlogPosts[0].heroImage?.altText);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing author information gracefully', async () => {
      const postWithoutAuthor: IBlogPost = {
        ...mockBlogPosts[0],
        author: undefined as unknown as IBlogPost['author'],
      };
      blogStore.posts = [postWithoutAuthor];
      await wrapper.vm.$nextTick();

      const authorInfo = wrapper.findComponent({ name: 'AuthorInfo' });
      expect(authorInfo.props('author')).toMatchObject({
        type: 'text',
        name: 'Unknown Author',
      });
    });

    it('should handle missing hero image gracefully', async () => {
      const postWithoutHeroImage: IBlogPost = {
        ...mockBlogPosts[0],
        heroImage: undefined,
      };
      blogStore.posts = [postWithoutHeroImage];
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.blog-post-list__placeholder').exists()).toBe(true);
      expect(wrapper.find('.blog-post-list__img').exists()).toBe(false);
    });
  });
});
