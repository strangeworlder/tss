/**
 * Blog-related type definitions
 * These match the backend data structures to ensure consistency
 *
 * @module types/blog
 */

import type { IUser } from '@/types/user';
import type { IImage } from '@/types/image';

/**
 * Re-export shared blog post types from the shared package
 * These are the canonical definitions used throughout the application
 */
import {
  BlogPostStatus,
  BlogPostModerationStatus,
  BlogPostTitleVariantEnum,
  // Import all available enums from the shared package
  // for consistency and type safety
} from '@shared/types/blog';

import type {
  IBlogPost,
  IBlogPostPreview,
  BlogPostField,
  IAuthor,
  IHeroImage,
  IBlogPostTag, // Add import for blog post tag interface
} from '@shared/types/blog';

/**
 * Re-export enum values for blog post status
 * @enum {string}
 */
export { BlogPostStatus, BlogPostModerationStatus, BlogPostTitleVariantEnum };

/**
 * Re-export interfaces and types from shared package
 */
export type {
  IBlogPost,
  IBlogPostPreview,
  BlogPostField,
  IAuthor,
  IHeroImage,
  IBlogPostTag, // Export blog post tag interface
};

/**
 * Interface for API responses
 *
 * @template T - The type of data contained in the response
 */
export interface IApiResponse<T> {
  /** Whether the API request was successful */
  success: boolean;
  /** The response data */
  data: T;
  /** Error message if the request failed */
  error?: string;
}

/**
 * Interface for the blog store
 * Defines the state and actions available in the blog store
 */
export interface IBlogStore {
  /** Array of blog posts in the store */
  posts: IBlogPost[];
  /** Loading state indicator */
  loading: boolean;
  /** Current error state */
  error: string | null;
  /** Fetches admin posts */
  fetchAdminPosts: () => Promise<void>;
  /** Fetches a single post by ID */
  fetchPost: (id: string) => Promise<IBlogPost | null>;
  /** Creates a new blog post */
  createPost: (post: Omit<IBlogPost, 'id' | 'createdAt' | 'updatedAt'>) => Promise<IBlogPost>;
  /** Updates an existing blog post */
  updatePost: (id: string, post: Partial<IBlogPost>) => Promise<IBlogPost>;
  /** Deletes a blog post */
  deletePost: (id: string) => Promise<void>;
}

/**
 * Converts a date string to a Date object
 *
 * @param dateString - The date string to convert
 * @returns A Date object or undefined if the date string is falsy
 */
export function convertStringToDate(dateString?: string): Date | undefined {
  return dateString ? new Date(dateString) : undefined;
}

/**
 * Converts a Date object to an ISO string
 *
 * @param date - The Date object to convert
 * @returns An ISO string or undefined if the date is falsy
 */
export function convertDateToString(date?: Date): string | undefined {
  return date?.toISOString();
}

/**
 * Checks if a blog post has the specified status
 *
 * @param post - The blog post to check
 * @param status - The status to check against
 * @returns True if the post has the specified status
 */
export function hasStatus(post: IBlogPost, status: BlogPostStatus): boolean {
  return post.status === status;
}

/**
 * Checks if a blog post is published
 *
 * @param post - The blog post to check
 * @returns True if the post is published
 */
export function isPublished(post: IBlogPost): boolean {
  return post.status === BlogPostStatus.PUBLISHED;
}

/**
 * Checks if a blog post is a draft
 *
 * @param post - The blog post to check
 * @returns True if the post is a draft
 */
export function isDraft(post: IBlogPost): boolean {
  return post.status === BlogPostStatus.DRAFT;
}

/**
 * Checks if a blog post is archived
 *
 * @param post - The blog post to check
 * @returns True if the post is archived
 */
export function isArchived(post: IBlogPost): boolean {
  return post.status === BlogPostStatus.ARCHIVED;
}

/**
 * Converts a partial blog post to a full blog post with default values
 *
 * @param partial - The partial blog post to convert
 * @returns A full blog post with default values
 */
export function createBlogPost(partial: Partial<IBlogPost>): IBlogPost {
  const now = new Date();
  return {
    id: partial.id || '',
    title: partial.title || '',
    slug: partial.slug || '',
    content: partial.content || '',
    excerpt: partial.excerpt || '',
    status: partial.status || BlogPostStatus.DRAFT,
    moderationStatus: partial.moderationStatus || BlogPostModerationStatus.PENDING,
    author: partial.author || {
      id: '',
      name: '',
      email: '',
    },
    tags: partial.tags || [],
    categories: partial.categories || [],
    featuredImage: partial.featuredImage,
    createdAt: partial.createdAt || now,
    updatedAt: partial.updatedAt || now,
    publishedAt: partial.publishedAt,
    isPublished: partial.isPublished || false,
  };
}

/**
 * Converts an API blog post to a frontend blog post
 * Handles any necessary type conversions between API and frontend
 *
 * @param apiPost - The API blog post to convert
 * @returns A frontend blog post
 */
export function convertApiPostToFrontend(apiPost: Record<string, any>): IBlogPost {
  return {
    id: apiPost.id || apiPost._id || '',
    title: apiPost.title || '',
    slug: apiPost.slug || '',
    content: apiPost.content || '',
    excerpt: apiPost.excerpt || '',
    status: apiPost.status || BlogPostStatus.DRAFT,
    moderationStatus: apiPost.moderationStatus || BlogPostModerationStatus.PENDING,
    author: apiPost.author || {
      id: '',
      name: '',
      email: '',
    },
    tags: apiPost.tags || [],
    categories: apiPost.categories || [],
    featuredImage: apiPost.featuredImage,
    createdAt: apiPost.createdAt ? new Date(apiPost.createdAt) : new Date(),
    updatedAt: apiPost.updatedAt ? new Date(apiPost.updatedAt) : new Date(),
    publishedAt: apiPost.publishedAt ? new Date(apiPost.publishedAt) : undefined,
    isPublished: apiPost.isPublished || apiPost.status === BlogPostStatus.PUBLISHED,
  };
}
