import type { IBlogPost } from '@/types/blog'
import { UserRole } from '@/types/user'

/**
 * Creates a mock blog post with default values that can be overridden
 * @param overrides - Properties to override in the default blog post
 * @returns A mock blog post object
 */
export const createMockBlogPost = (overrides: Partial<IBlogPost> = {}): IBlogPost => {
  return {
    id: '1',
    title: 'Test Blog Post',
    slug: 'test-blog-post',
    content: 'This is test content',
    excerpt: 'This is test excerpt',
    author: {
      id: 'user1',
      firstName: 'Test',
      lastName: 'Author',
      email: 'test@example.com',
      role: UserRole.USER,
      avatar: {
        filename: 'avatar1.jpg',
        altText: 'Test Author Avatar'
      }
    },
    heroImage: {
      filename: 'hero1.jpg',
      altText: 'Hero Image'
    },
    tags: ['Vue', 'TypeScript'],
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
    publishedAt: '2023-01-01T00:00:00Z',
    isPublished: true,
    ...overrides
  }
}

/**
 * Mock data for BlogPostList tests
 */
export const mockBlogPosts = {
  /**
   * Default set of blog posts for testing
   */
  default: [
    createMockBlogPost(),
    createMockBlogPost({
      id: '2',
      title: 'Draft Blog Post',
      slug: 'draft-blog-post',
      isPublished: false,
      publishedAt: undefined
    }),
    createMockBlogPost({
      id: '3',
      title: 'Post Without Image',
      slug: 'post-without-image',
      heroImage: undefined
    })
  ],
  
  /**
   * Empty array for testing empty state
   */
  empty: [],
  
  /**
   * Posts with long titles for testing responsive behavior
   */
  withLongTitles: [
    createMockBlogPost({
      id: '4',
      title: 'This is a very long blog post title that should wrap to multiple lines in the UI to test responsive behavior',
      slug: 'long-title-post'
    }),
    createMockBlogPost({
      id: '5',
      title: 'Another extremely long blog post title that contains many words and should also wrap to multiple lines in the UI',
      slug: 'another-long-title-post'
    })
  ]
} 