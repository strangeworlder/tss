import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mountHomeView, createDefaultStoreState } from './HomeView.test-utils';
import { mockHomeViewData } from './__fixtures__/HomeView.fixture';
import { useBlogStore } from '@/stores/blogStore';

// Mock the blog store
vi.mock('@/stores/blogStore', () => ({
  useBlogStore: vi.fn(),
}));

// Mock the API client
vi.mock('@/api/apiClient', () => ({
  checkApiHealth: vi.fn().mockResolvedValue(true),
}));

describe('HomeView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the hero section with correct content', () => {
      const wrapper = mountHomeView();

      // Check hero section
      const heroSection = wrapper.find('.home-view__hero');
      expect(heroSection.exists()).toBe(true);

      const heroTitle = heroSection.find('.home-view__hero-title');
      expect(heroTitle.exists()).toBe(true);
      expect(heroTitle.text()).toContain('Welcome to Vue Blog');

      const heroText = heroSection.find('.home-view__hero-text');
      expect(heroText.exists()).toBe(true);
      expect(heroText.text()).toContain('A modern blog built with Vue 3 and TypeScript');
    });

    it('renders the recent posts section with correct content', () => {
      const wrapper = mountHomeView();

      // Check recent posts section
      const recentPostsSection = wrapper.find('.home-view__recent-posts');
      expect(recentPostsSection.exists()).toBe(true);

      const sectionTitle = recentPostsSection.find('.home-view__section-title');
      expect(sectionTitle.exists()).toBe(true);
      expect(sectionTitle.text()).toContain('Recent Posts');
    });

    it('renders the newsletter section with correct content', () => {
      const wrapper = mountHomeView();

      // Check newsletter section
      const newsletterSection = wrapper.find('.home-view__newsletter');
      expect(newsletterSection.exists()).toBe(true);

      const newsletterTitle = newsletterSection.find('.home-view__newsletter-title');
      expect(newsletterTitle.exists()).toBe(true);
      expect(newsletterTitle.text()).toContain('Subscribe to Our Newsletter');

      const newsletterText = newsletterSection.find('.home-view__newsletter-text');
      expect(newsletterText.exists()).toBe(true);
      expect(newsletterText.text()).toContain(
        'Get the latest blog posts and updates delivered to your inbox'
      );
    });
  });

  describe('Loading state', () => {
    it('shows loading spinner when loading is true', () => {
      const wrapper = mountHomeView(createDefaultStoreState({ loading: true }));

      const loadingSpinner = wrapper.findComponent({ name: 'LoadingSpinner' });
      expect(loadingSpinner.exists()).toBe(true);

      const postsGrid = wrapper.find('.home-view__posts-grid');
      expect(postsGrid.exists()).toBe(false);
    });
  });

  describe('Error state', () => {
    it('shows error message when error is not null', () => {
      const errorMessage = 'Failed to load recent posts';
      const wrapper = mountHomeView(createDefaultStoreState({ error: errorMessage }));

      const errorComponent = wrapper.findComponent({ name: 'HomeViewError' });
      expect(errorComponent.exists()).toBe(true);
      expect(errorComponent.props('error')).toBe(errorMessage);

      const postsGrid = wrapper.find('.home-view__posts-grid');
      expect(postsGrid.exists()).toBe(false);
    });
  });

  describe('Empty state', () => {
    it('shows empty state message when there are no posts', () => {
      const wrapper = mountHomeView(createDefaultStoreState({ posts: [] }));

      const emptyMessage = wrapper.find('.home-view__empty-message');
      expect(emptyMessage.exists()).toBe(true);
      expect(emptyMessage.text()).toContain('No recent posts found');

      const postsGrid = wrapper.find('.home-view__posts-grid');
      expect(postsGrid.exists()).toBe(false);
    });
  });

  describe('Posts rendering', () => {
    it('renders the correct number of blog post cards', () => {
      const wrapper = mountHomeView();

      const blogPostCards = wrapper.findAllComponents({ name: 'BlogPostCard' });
      expect(blogPostCards.length).toBe(3); // We expect 3 recent posts
    });
  });

  describe('Newsletter form', () => {
    it('renders the newsletter form with correct fields', () => {
      const wrapper = mountHomeView();

      const newsletterForm = wrapper.find('.home-view__newsletter-form');
      expect(newsletterForm.exists()).toBe(true);

      const formGroup = wrapper.findComponent({ name: 'FormGroup' });
      expect(formGroup.exists()).toBe(true);
      expect(formGroup.props('id')).toBe('newsletter-email');
      expect(formGroup.props('label')).toBe('Email address');
      expect(formGroup.props('type')).toBe('email');
    });
  });

  describe('Accessibility', () => {
    it('uses semantic HTML elements', () => {
      const wrapper = mountHomeView();

      // Check for semantic elements
      expect(wrapper.find('main').exists()).toBe(true);
      expect(wrapper.findAll('section').length).toBeGreaterThan(0);
      expect(wrapper.find('h1').exists()).toBe(true);
      expect(wrapper.find('h2').exists()).toBe(true);
    });

    it('maintains proper heading hierarchy', () => {
      const wrapper = mountHomeView();

      // Check heading hierarchy
      const h1Elements = wrapper.findAll('h1');
      expect(h1Elements.length).toBe(1);

      const h2Elements = wrapper.findAll('h2');
      expect(h2Elements.length).toBeGreaterThan(0);
    });
  });
});
