import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { vi } from 'vitest';
import BlogView from '../BlogView.vue';
import { mockBlogViewData } from './__fixtures__/BlogView.fixture';
import type { IBlogPost } from '@/types/blog';

/**
 * Interface for BlogView store state
 */
interface IBlogViewStoreState {
  posts: IBlogPost[];
  loading: boolean;
  error: string | null;
}

/**
 * Mounts the BlogView component with the given store state
 * @param storeState - The store state to use
 * @param serverStarting - Whether the server is starting
 * @returns The mounted component
 */
export function mountBlogView(
  storeState: Partial<IBlogViewStoreState> = {},
  serverStarting = false
) {
  // Create a new Pinia instance
  const pinia = createPinia();
  setActivePinia(pinia);

  // Mock the blog store
  const blogStore = {
    posts: storeState.posts || mockBlogViewData.blogPosts,
    loading: storeState.loading || false,
    error: storeState.error || null,
    fetchPosts: vi.fn().mockResolvedValue(undefined),
  };

  // Mock the ref for serverStarting
  vi.mock('../BlogView.vue', async () => {
    const actual = await vi.importActual('../BlogView.vue');
    return {
      ...actual,
      serverStarting: { value: serverStarting },
    };
  });

  // Mount the component with the mocked store
  return mount(BlogView, {
    global: {
      plugins: [pinia],
      stubs: {
        AppButton: true,
        BlogPostCard: true,
      },
    },
  });
}

/**
 * Creates a default store state for the BlogView component
 * @param overrides - State to override the defaults
 * @returns The store state for the BlogView component
 */
export function createDefaultStoreState(
  overrides: Partial<IBlogViewStoreState> = {}
): IBlogViewStoreState {
  return {
    posts: mockBlogViewData.blogPosts,
    loading: false,
    error: null,
    ...overrides,
  };
}
