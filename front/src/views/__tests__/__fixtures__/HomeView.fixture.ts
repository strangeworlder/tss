import type { IBlogPost } from '@/types/blog';
import { UserRole } from '@/types/user';

/**
 * Creates mock blog posts for testing
 * @param count - Number of blog posts to create
 * @returns Array of mock blog posts
 */
export function createMockBlogPosts(count = 3): IBlogPost[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `post-${index + 1}`,
    title: `Test Blog Post ${index + 1}`,
    slug: `test-blog-post-${index + 1}`,
    content: `This is the content of test blog post ${index + 1}.`,
    excerpt: `This is the excerpt of test blog post ${index + 1}.`,
    publishedAt: new Date(2023, 0, index + 1).toISOString(),
    author: {
      type: 'user',
      id: `author-${index + 1}`,
      name: `Test Author ${index + 1}`,
      avatar: {
        filename: `avatar-${index + 1}.jpg`,
        altText: `Avatar of Test Author ${index + 1}`,
      },
    },
    heroImage: {
      filename: `hero-${index + 1}.jpg`,
      altText: `Hero image for Test Blog Post ${index + 1}`,
      url: `https://example.com/hero-${index + 1}.jpg`,
    },
    tags: [`tag-${index + 1}`, 'common-tag'],
    createdAt: new Date(2023, 0, index + 1).toISOString(),
    updatedAt: new Date(2023, 0, index + 1).toISOString(),
    isPublished: true,
  }));
}

/**
 * Mock data for testing the HomeView component
 */
export const mockHomeViewData = {
  blogPosts: createMockBlogPosts(3),
  emptyBlogPosts: [],
  loadingState: true,
  errorState: 'Failed to load recent posts. Please try again later.',
  newsletterSuccess: true,
  newsletterError: 'Please enter a valid email address',
};
