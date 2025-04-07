import type { IBlogPost } from '@/types/blog';

/**
 * Creates a default set of props for the BlogDetailView
 * @param overrides - Props to override the defaults
 * @returns The props for the BlogDetailView
 */
export function createBlogDetailViewProps(overrides: Record<string, any> = {}) {
  return {
    ...overrides,
  };
}

/**
 * Mock blog post data for testing
 */
export const mockBlogPost: IBlogPost = {
  id: '1',
  title: 'Test Blog Post',
  slug: 'test-blog-post',
  content: '# Test Blog Post\n\nThis is a test blog post content.',
  excerpt: 'This is a test blog post excerpt.',
  publishedAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
  author: {
    type: 'user' as const,
    id: '1',
    name: 'Test Author',
    avatar: {
      filename: 'test-avatar.jpg',
      altText: 'Test avatar',
    },
  },
  heroImage: {
    filename: 'test-hero.jpg',
    altText: 'Test hero image',
  },
  tags: ['test', 'blog'],
  createdAt: '2023-01-01T00:00:00.000Z',
  isPublished: true,
};

/**
 * Mock data for testing the BlogDetailView
 */
export const mockBlogDetailView = {
  default: {
    post: mockBlogPost,
    loading: false,
    error: null,
  },
  loading: {
    post: null,
    loading: true,
    error: null,
  },
  error: {
    post: null,
    loading: false,
    error: 'Failed to load blog post',
  },
  notFound: {
    post: null,
    loading: false,
    error: null,
  },
};
