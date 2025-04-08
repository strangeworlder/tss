import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { vi } from 'vitest';
import HomeView from '../HomeView.vue';
import { mockHomeViewData } from './__fixtures__/HomeView.fixture';
import type { IBlogPost } from '@/types/blog';

/**
 * Interface for HomeView store state
 */
interface IHomeViewStoreState {
  posts: IBlogPost[];
  loading: boolean;
  error: string | null;
}

/**
 * Mounts the HomeView component with the given store state
 * @param storeState - The store state to use
 * @returns The mounted component
 */
export function mountHomeView(storeState: Partial<IHomeViewStoreState> = {}) {
  // Create a new Pinia instance
  const pinia = createPinia();
  setActivePinia(pinia);

  // Mock the blog store
  const blogStore = {
    posts: storeState.posts || mockHomeViewData.blogPosts,
    loading: storeState.loading || false,
    error: storeState.error || null,
    fetchPosts: vi.fn().mockResolvedValue(undefined),
  };

  // Mount the component with the mocked store
  return mount(HomeView, {
    global: {
      plugins: [pinia],
      stubs: {
        AppButton: true,
        BlogPostCard: true,
        LoadingSpinner: true,
        FormGroup: true,
        HomeViewError: true,
      },
    },
  });
}

/**
 * Creates a default store state for the HomeView component
 * @param overrides - State to override the defaults
 * @returns The store state for the HomeView component
 */
export function createDefaultStoreState(
  overrides: Partial<IHomeViewStoreState> = {}
): IHomeViewStoreState {
  return {
    posts: mockHomeViewData.blogPosts,
    loading: false,
    error: null,
    ...overrides,
  };
}
