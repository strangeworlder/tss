import { mount } from '@vue/test-utils'
import BlogPostHeader from '../BlogPostHeader.vue'
import type { BlogPost } from '@/types/blog'
import { createBlogPostHeaderProps } from './__fixtures__/BlogPostHeader.fixture'

/**
 * Interface for BlogPostHeader component props
 */
interface IBlogPostHeaderProps {
  post: BlogPost
  showBackButton?: boolean
}

/**
 * Mounts the BlogPostHeader component with the given props
 * @param props - The props to pass to the component
 * @returns The mounted component
 */
export function mountBlogPostHeader(props: IBlogPostHeaderProps = createBlogPostHeaderProps()) {
  return mount(BlogPostHeader, {
    props
  })
}

/**
 * Creates a default set of props for the BlogPostHeader component
 * @param overrides - Props to override the defaults
 * @returns The props for the BlogPostHeader component
 */
export function createDefaultBlogPostHeaderProps(overrides: Partial<IBlogPostHeaderProps> = {}) {
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
          altText: 'Test Author Avatar'
        }
      },
      tags: ['Vue', 'TypeScript', 'Testing'],
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z',
      publishedAt: '2023-01-01T00:00:00Z',
      isPublished: true
    },
    showBackButton: true,
    ...overrides
  }
} 