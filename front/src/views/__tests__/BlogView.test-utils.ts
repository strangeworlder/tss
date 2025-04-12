import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { jest } from '@jest/globals';
import type { IBlogPost } from '../../types/blog';
import BlogView from '../BlogView.vue';
import { mockBlogViewData } from './__fixtures__/BlogView.fixture';

/**
 * Interface for BlogView store state
 */
interface IBlogViewStoreState {
  posts: IBlogPost[];
  loading: boolean;
  error: string | null;
  fetchPosts: () => Promise<void>;
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
    fetchPosts: jest.fn<() => Promise<void>>().mockResolvedValue(),
  };

  // Mock the BlogView component
  jest.mock('../BlogView.vue', () => {
    const actual = jest.requireActual<typeof BlogView>('../BlogView.vue');
    return {
      __esModule: true,
      default: {
        ...actual.default,
        serverStarting: { value: serverStarting },
      },
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
    fetchPosts: jest.fn<() => Promise<void>>().mockResolvedValue(),
    ...overrides,
  };
}
