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
 * Blog post status enum
 */
export enum BlogPostStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  FAILED = 'failed',
}

/**
 * Blog post moderation status enum
 */
export enum BlogPostModerationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
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
  author: Author;
  heroImage?: HeroImage;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  isPublished: boolean;
  publishAt?: string;
  status: BlogPostStatus;
  timezone: string;
  version: number;
  pendingUpdateId?: string;
  hasActiveUpdate: boolean;
  originalPostId?: string;
  moderationStatus: BlogPostModerationStatus;
  abuseScore: number;
  lastModeratedAt?: string;
}

/**
 * Interface for blog post preview data
 */
export interface IBlogPostPreview {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: Author;
  heroImage?: HeroImage;
  tags: string[];
  publishedAt?: string;
  isPublished: boolean;
  status: BlogPostStatus;
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

/**
 * Blog post field type for partial updates
 */
export type BlogPostField =
  | 'id'
  | 'title'
  | 'slug'
  | 'excerpt'
  | 'author'
  | 'heroImage'
  | 'tags'
  | 'publishedAt'
  | 'status'
  | 'moderationStatus';

/**
 * Blog store interface for state management
 */
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
