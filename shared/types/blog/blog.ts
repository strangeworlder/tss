/**
 * Core blog post types and interfaces
 *
 * @module shared/types/blog/blog
 */

import type { Types } from 'mongoose';

export enum BlogPostStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  PUBLISHING = 'PUBLISHING',
  PUBLISHED = 'PUBLISHED',
  FAILED = 'FAILED',
  ARCHIVED = 'ARCHIVED',
  CANCELLED = 'CANCELLED',
}

export enum BlogPostModerationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  FLAGGED = 'FLAGGED',
}

export interface IAuthor {
  type: 'user' | 'text';
  id?: string;
  name: string;
  email: string;
  avatar?: {
    filename: string;
    altText: string;
  };
}

export interface IHeroImage {
  filename: string;
  altText: string;
  url?: string;
}

export interface IBlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: IAuthor;
  heroImage?: IHeroImage;
  tags: string[];
  status: BlogPostStatus;
  publishAt?: Date;
  timezone: string;
  version: number;
  hasActiveUpdate: boolean;
  pendingUpdateId?: string;
  moderationStatus: BlogPostModerationStatus;
  abuseScore: number;
  lastModeratedAt?: Date;
  originalPostId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * MongoDB-specific blog post document schema
 * Contains MongoDB-specific field types but doesn't extend Mongoose's Document
 */
export interface IBlogPostDocument
  extends Omit<
    IBlogPost,
    | 'id'
    | 'author'
    | 'content'
    | 'publishAt'
    | 'lastModeratedAt'
    | 'createdAt'
    | 'updatedAt'
    | 'originalPostId'
    | 'pendingUpdateId'
  > {
  _id: Types.ObjectId;
  author: {
    type: 'user' | 'text';
    id?: Types.ObjectId;
    name: string;
    email: string;
    avatar?: {
      filename: string;
      altText: string;
    };
  };
  content: string;
  heroImage?: IHeroImage;
  timezone: string;
  version: number;
  hasActiveUpdate: boolean;
  abuseScore: number;
  publishAt?: Date;
  lastModeratedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  originalPostId?: Types.ObjectId;
  pendingUpdateId?: Types.ObjectId;
}
