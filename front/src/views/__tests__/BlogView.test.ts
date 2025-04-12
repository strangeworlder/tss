import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { mountBlogView, createDefaultStoreState } from './BlogView.test-utils';
import { mockBlogViewData } from './__fixtures__/BlogView.fixture';

// Mock the blog store
jest.mock('../../stores/blogStore');

// Mock the API client
jest.mock('../../api/apiClient', () => ({
  checkApiHealth: jest.fn<() => Promise<boolean>>().mockResolvedValue(true),
}));

describe('BlogView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the title correctly', () => {
      const wrapper = mountBlogView();

      const title = wrapper.find('.blog-view__title');
      expect(title.exists()).toBe(true);
      expect(title.text()).toContain('Blog Posts');
    });

    it('renders the blog posts grid when posts are available', () => {
      const wrapper = mountBlogView();

      const grid = wrapper.find('.blog-view__grid');
      expect(grid.exists()).toBe(true);
      expect(grid.element.tagName).toBe('SECTION');

      const blogPostCards = wrapper.findAllComponents({ name: 'BlogPostCard' });
      expect(blogPostCards.length).toBe(mockBlogViewData.blogPosts.length);
    });
  });

  describe('Loading state', () => {
    it('shows loading spinner and message when loading is true', () => {
      const wrapper = mountBlogView(createDefaultStoreState({ loading: true }));

      const loadingElement = wrapper.find('.blog-view__loading');
      expect(loadingElement.exists()).toBe(true);

      const spinner = loadingElement.find('.blog-view__spinner');
      expect(spinner.exists()).toBe(true);
      expect(spinner.attributes('aria-hidden')).toBe('true');

      const loadingText = loadingElement.find('p');
      expect(loadingText.exists()).toBe(true);
      expect(loadingText.text()).toContain('Loading blog posts');

      const grid = wrapper.find('.blog-view__grid');
      expect(grid.exists()).toBe(false);
    });
  });

  describe('Error state', () => {
    it('shows error message when error is not null', () => {
      const errorMessage = 'API server is not available';
      const wrapper = mountBlogView(createDefaultStoreState({ error: errorMessage }));

      const errorElement = wrapper.find('.blog-view__error');
      expect(errorElement.exists()).toBe(true);
      expect(errorElement.element.tagName).toBe('SECTION');

      const errorText = errorElement.find('.blog-view__error-message');
      expect(errorText.exists()).toBe(true);
      expect(errorText.text()).toBe(errorMessage);

      const errorActions = errorElement.find('.blog-view__error-actions');
      expect(errorActions.exists()).toBe(true);

      const startServerButton = errorActions.findComponent({ name: 'AppButton' });
      expect(startServerButton.exists()).toBe(true);
      expect(startServerButton.text()).toContain('Start Backend Server');

      const tryAgainButton = errorActions.findAllComponents({ name: 'AppButton' })[1];
      expect(tryAgainButton.exists()).toBe(true);
      expect(tryAgainButton.text()).toContain('Try Again');

      const grid = wrapper.find('.blog-view__grid');
      expect(grid.exists()).toBe(false);
    });

    it('does not show start server button when error does not include API server message', () => {
      const errorMessage = 'Some other error';
      const wrapper = mountBlogView(createDefaultStoreState({ error: errorMessage }));

      const errorElement = wrapper.find('.blog-view__error');
      expect(errorElement.exists()).toBe(true);

      const errorActions = errorElement.find('.blog-view__error-actions');
      expect(errorActions.exists()).toBe(true);

      const buttons = errorActions.findAllComponents({ name: 'AppButton' });
      expect(buttons.length).toBe(1);
      expect(buttons[0].text()).toContain('Try Again');
    });
  });

  describe('Empty state', () => {
    it('shows empty state message when there are no posts', () => {
      const wrapper = mountBlogView(createDefaultStoreState({ posts: [] }));

      const emptyElement = wrapper.find('.blog-view__empty');
      expect(emptyElement.exists()).toBe(true);
      expect(emptyElement.element.tagName).toBe('P');
      expect(emptyElement.text()).toContain('No blog posts found');

      const grid = wrapper.find('.blog-view__grid');
      expect(grid.exists()).toBe(false);
    });
  });

  describe('Server starting state', () => {
    it('disables buttons when server is starting', () => {
      const errorMessage = 'API server is not available';
      const wrapper = mountBlogView(createDefaultStoreState({ error: errorMessage }), true);

      const errorElement = wrapper.find('.blog-view__error');
      expect(errorElement.exists()).toBe(true);

      const errorActions = errorElement.find('.blog-view__error-actions');
      expect(errorActions.exists()).toBe(true);

      const startServerButton = errorActions.findComponent({ name: 'AppButton' });
      expect(startServerButton.exists()).toBe(true);
      expect(startServerButton.props('disabled')).toBe(true);

      const tryAgainButton = errorActions.findAllComponents({ name: 'AppButton' })[1];
      expect(tryAgainButton.exists()).toBe(true);
      expect(tryAgainButton.props('disabled')).toBe(true);
    });
  });

  describe('Semantic HTML', () => {
    it('uses semantic HTML elements', () => {
      const wrapper = mountBlogView();

      // Check for semantic elements
      expect(wrapper.find('main').exists()).toBe(true);
      expect(wrapper.find('h1').exists()).toBe(true);
      expect(wrapper.findAll('section').length).toBe(1); // Blog posts grid
    });

    it('uses semantic HTML elements in error state', () => {
      const wrapper = mountBlogView(createDefaultStoreState({ error: 'Test error' }));
      expect(wrapper.find('section.blog-view__error').exists()).toBe(true);
    });

    it('maintains proper heading hierarchy', () => {
      const wrapper = mountBlogView();

      const h1Elements = wrapper.findAll('h1');
      expect(h1Elements.length).toBe(1);
    });
  });
});
