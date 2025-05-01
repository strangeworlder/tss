import type { Types } from 'mongoose';
import type { Document } from 'mongoose';

/**
 * Enum for blog post status
 */
export enum BlogPostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

/**
 * Enum for blog post moderation status
 */
export enum BlogPostModerationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

/**
 * Blog post title variant
 */
export enum BlogPostTitleVariantEnum {
  COMPACT = 'compact',
  FULL = 'full',
}

/**
 * Interface for author information
 */
export interface IAuthor {
  type: 'user' | 'text';
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
}

/**
 * Hero image for a blog post
 */
export interface IHeroImage {
  filename: string;
  altText: string;
}

/**
 * Blog post tag interface
 */
export interface IBlogPostTag {
  /**
   * The name of the tag
   */
  name: string;
  /**
   * The slug of the tag (URL-friendly version of the name)
   */
  slug: string;
  /**
   * The number of posts using this tag
   */
  postCount?: number;
  /**
   * The date the tag was created
   */
  createdAt?: Date;
  /**
   * The date the tag was last updated
   */
  updatedAt?: Date;
}

/**
 * Interface for blog post
 */
export interface IBlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: BlogPostStatus;
  moderationStatus: BlogPostModerationStatus;
  author: IAuthor;
  tags: string[];
  categories: string[];
  featuredImage?: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  isPublished: boolean;
}

/**
 * Blog post preview interface for list views
 */
export interface IBlogPostPreview {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: IAuthor;
  heroImage?: IHeroImage;
  tags: string[];
  publishedAt?: string;
  isPublished: boolean;
  status: BlogPostStatus;
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
 * Interface for MongoDB blog post document without Document inheritance
 * Contains MongoDB-specific field types but doesn't extend Mongoose's Document
 */
export interface IBlogPostDocument extends Omit<IBlogPost, 'id'> {
  _id: Types.ObjectId;
}

/**
 * Type that combines MongoDB document with Mongoose Document interface
 * Use this type for MongoDB model instances
 */
export type MongooseBlogPostDocument = IBlogPostDocument & Document;
