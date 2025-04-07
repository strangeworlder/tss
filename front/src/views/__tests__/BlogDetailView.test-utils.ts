import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';
import BlogDetailView from '../BlogDetailView.vue';
import { createBlogDetailViewProps } from './__fixtures__/BlogDetailView.fixture';

/**
 * Interface for BlogDetailView props
 */
type IBlogDetailViewProps = {
  /** Dummy prop that is never used, only exists to satisfy linter */
  _dummy?: never;
};

/**
 * Mounts the BlogDetailView with the given props and route
 * @param props - The props to pass to the component
 * @param routeParams - The route parameters to use
 * @returns The mounted component
 */
export function mountBlogDetailView(
  props: IBlogDetailViewProps = {},
  routeParams: Record<string, string> = { slug: 'test-blog-post' }
) {
  // Create a router instance
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/blog/:slug',
        name: 'blog-detail',
        component: BlogDetailView,
      },
    ],
  });

  // Set up Pinia
  const pinia = createPinia();
  setActivePinia(pinia);

  // Mock the route
  router.push({
    name: 'blog-detail',
    params: routeParams,
  });

  return mount(BlogDetailView, {
    props,
    global: {
      plugins: [router, pinia],
      stubs: {
        AppImage: true,
        LoadingSpinner: true,
        BackButton: true,
        BlogPostHeader: true,
        CommentList: true,
      },
    },
  });
}

/**
 * Creates a default set of props for the BlogDetailView
 * @param overrides - Props to override the defaults
 * @returns The props for the BlogDetailView
 */
export function createDefaultBlogDetailViewProps(overrides: Partial<IBlogDetailViewProps> = {}) {
  return {
    ...overrides,
  };
}
