import type { IBlogPost } from '@/types/blog';
import type { IUser } from '@/types/user';
import { UserRole } from '@/types/user';

const mockUser: IUser = {
  id: 'user-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  role: UserRole.ADMIN,
  avatar: {
    filename: 'avatar.jpg',
    altText: 'John Doe',
  },
};

/**
 * Mock blog posts for testing
 */
export const mockBlogPosts: IBlogPost[] = [
  {
    id: 'post-1',
    title: 'Test Blog Post 1',
    slug: 'test-blog-post-1',
    content: 'This is the content of test blog post 1',
    excerpt: 'This is the excerpt of test blog post 1',
    heroImage: {
      filename: 'hero1.jpg',
      altText: 'Hero image 1',
    },
    author: mockUser,
    publishedAt: '2024-04-07T10:00:00Z',
    isPublished: true,
    tags: ['test', 'blog'],
    createdAt: '2024-04-07T10:00:00Z',
    updatedAt: '2024-04-07T10:00:00Z',
  },
  {
    id: 'post-2',
    title: 'Test Blog Post 2',
    slug: 'test-blog-post-2',
    content: 'This is the content of test blog post 2',
    excerpt: 'This is the excerpt of test blog post 2',
    heroImage: {
      filename: 'hero2.jpg',
      altText: 'Hero image 2',
    },
    author: mockUser,
    publishedAt: '2024-04-07T11:00:00Z',
    isPublished: false,
    tags: ['test', 'blog'],
    createdAt: '2024-04-07T11:00:00Z',
    updatedAt: '2024-04-07T11:00:00Z',
  },
];
