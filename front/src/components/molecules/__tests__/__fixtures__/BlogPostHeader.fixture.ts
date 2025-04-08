import type { IBlogPost, Author } from '@/types/blog';
import { UserRole } from '@/types/user';

interface BlogPostHeaderProps {
  post: IBlogPost;
  showBackButton?: boolean;
}

/**
 * Creates a default set of props for the BlogPostHeader component
 * @param overrides - Props to override the defaults
 * @returns The props for the BlogPostHeader component
 */
export function createBlogPostHeaderProps(overrides: Partial<BlogPostHeaderProps> = {}) {
  return {
    post: {
      id: '1',
      title: 'Test Blog Post Title',
      slug: 'test-blog-post',
      content: 'This is the full content of the test blog post.',
      excerpt: 'This is the excerpt of the test blog post.',
      author: {
        type: 'user' as const,
        id: 'user1',
        name: 'Test Author',
        avatar: {
          filename: 'avatar.jpg',
          altText: 'Test Author Avatar',
        },
      },
      tags: ['Vue', 'TypeScript', 'Testing'],
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z',
      publishedAt: '2023-01-01T00:00:00Z',
      isPublished: true,
    },
    showBackButton: true,
    ...overrides,
  };
}

/**
 * Mock data for testing the BlogPostHeader component
 */
export const mockBlogPostHeaders = {
  default: createBlogPostHeaderProps(),
  noBackButton: createBlogPostHeaderProps({
    showBackButton: false,
  }),
  noTags: createBlogPostHeaderProps({
    post: {
      ...createBlogPostHeaderProps().post,
      tags: [],
    },
  }),
  noPublishedDate: createBlogPostHeaderProps({
    post: {
      ...createBlogPostHeaderProps().post,
      publishedAt: undefined,
    },
  }),
  longTitle: createBlogPostHeaderProps({
    post: {
      ...createBlogPostHeaderProps().post,
      title:
        'This is a very long blog post title that should wrap to multiple lines on smaller screens',
    },
  }),
};
