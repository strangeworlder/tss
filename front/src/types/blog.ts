/**
 * Blog-related type definitions
 * These match the backend data structures to ensure consistency
 */

import type { IUser } from './user';
import type { IImage } from './image';

export interface Author {
  type: 'user' | 'text';
  id?: string;
  name: string;
  avatar?: {
    filename: string;
    altText: string;
  };
}

export interface HeroImage {
  filename: string;
  altText: string;
  url?: string; // Optional URL for direct image access
}

/**
 * Interface representing a blog post in the system
 */
export interface IBlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: IUser;
  heroImage?: IImage;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  isPublished: boolean;
}

/**
 * Interface for blog post preview data
 */
export interface IBlogPostPreview {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: IUser;
  heroImage?: IImage;
  tags: string[];
  publishedAt?: string;
  isPublished: boolean;
}

/**
 * Interface for API responses
 */
export interface IApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export type BlogPostField =
  | 'id'
  | 'title'
  | 'slug'
  | 'excerpt'
  | 'author'
  | 'heroImage'
  | 'tags'
  | 'publishedAt';

export interface IBlogStore {
  posts: IBlogPost[];
  loading: boolean;
  error: string | null;
  fetchAdminPosts: () => Promise<void>;
  fetchPost: (id: string) => Promise<IBlogPost | null>;
  createPost: (post: Omit<IBlogPost, 'id' | 'createdAt' | 'updatedAt'>) => Promise<IBlogPost>;
  updatePost: (id: string, post: Partial<IBlogPost>) => Promise<IBlogPost>;
  deletePost: (id: string) => Promise<void>;
}
