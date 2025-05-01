/**
 * Type conversion utilities for blog post data
 *
 * @module shared/types/blog/utils
 */

import { Types } from 'mongoose';
import type { IBlogPost, IBlogPostDocument } from './blog.js';
import { BlogPostStatus, BlogPostModerationStatus } from './blog.js';

/**
 * Type guard to check if a value is a MongoDB ObjectId
 * @param value - The value to check
 * @returns true if the value is a MongoDB ObjectId
 */
export function isObjectId(value: unknown): value is Types.ObjectId {
  return value instanceof Types.ObjectId;
}

/**
 * Converts a MongoDB ObjectId to a string
 * @param id - The ObjectId to convert
 * @returns The string representation of the ObjectId
 * @throws Error if the input is not a valid ObjectId
 */
export function objectIdToString(id: Types.ObjectId | string): string {
  if (typeof id === 'string') {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid ObjectId string');
    }
    return id;
  }
  if (!isObjectId(id)) {
    throw new Error('Invalid ObjectId');
  }
  return id.toString();
}

/**
 * Converts a string to a MongoDB ObjectId
 * @param id - The string to convert
 * @returns The ObjectId representation of the string
 * @throws Error if the input is not a valid ObjectId string
 */
export function stringToObjectId(id: string | Types.ObjectId): Types.ObjectId {
  if (isObjectId(id)) {
    return id;
  }
  if (!Types.ObjectId.isValid(id)) {
    throw new Error('Invalid ObjectId string');
  }
  return new Types.ObjectId(id);
}

/**
 * Type guard to check if a value is a valid blog post document
 * @param value - The value to check
 * @returns true if the value is a valid blog post document
 */
export function isBlogPostDocument(value: unknown): value is IBlogPostDocument {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const doc = value as IBlogPostDocument;
  return (
    isObjectId(doc._id) &&
    typeof doc.title === 'string' &&
    typeof doc.slug === 'string' &&
    typeof doc.content === 'string' &&
    typeof doc.excerpt === 'string' &&
    typeof doc.author === 'object' &&
    typeof doc.author.type === 'string' &&
    ['user', 'text'].includes(doc.author.type) &&
    typeof doc.author.name === 'string' &&
    Array.isArray(doc.tags) &&
    doc.tags.every((tag) => typeof tag === 'string') &&
    typeof doc.status === 'string' &&
    Object.values(BlogPostStatus).includes(doc.status) &&
    typeof doc.moderationStatus === 'string' &&
    Object.values(BlogPostModerationStatus).includes(doc.moderationStatus) &&
    typeof doc.abuseScore === 'number' &&
    doc.abuseScore >= 0
  );
}

/**
 * Converts a MongoDB document to a blog post interface
 * @param doc - The MongoDB document to convert
 * @returns The blog post interface
 * @throws Error if the document is not valid
 */
export function toBlogPost(doc: IBlogPostDocument): IBlogPost {
  if (!isBlogPostDocument(doc)) {
    throw new Error('Invalid blog post document');
  }

  return {
    id: objectIdToString(doc._id),
    title: doc.title,
    slug: doc.slug,
    content: doc.content,
    excerpt: doc.excerpt,
    author: {
      type: doc.author.type,
      id: doc.author.id ? objectIdToString(doc.author.id) : undefined,
      name: doc.author.name,
      avatar: doc.author.avatar,
    },
    heroImage: doc.heroImage,
    tags: doc.tags,
    status: doc.status,
    publishAt: doc.publishAt?.toISOString(),
    timezone: doc.timezone,
    version: doc.version,
    hasActiveUpdate: doc.hasActiveUpdate,
    pendingUpdateId: doc.pendingUpdateId ? objectIdToString(doc.pendingUpdateId) : undefined,
    moderationStatus: doc.moderationStatus,
    abuseScore: doc.abuseScore,
    lastModeratedAt: doc.lastModeratedAt?.toISOString(),
    originalPostId: doc.originalPostId ? objectIdToString(doc.originalPostId) : undefined,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

/**
 * Converts a blog post interface to a MongoDB document
 * @param post - The blog post interface to convert
 * @returns The MongoDB document
 * @throws Error if the blog post is not valid
 */
export function toBlogPostDocument(post: IBlogPost): Partial<IBlogPostDocument> {
  return {
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt,
    author: {
      type: post.author.type,
      id: post.author.id ? stringToObjectId(post.author.id) : undefined,
      name: post.author.name,
      avatar: post.author.avatar,
    },
    heroImage: post.heroImage,
    tags: post.tags,
    status: post.status,
    publishAt: post.publishAt ? new Date(post.publishAt) : undefined,
    timezone: post.timezone,
    version: post.version,
    hasActiveUpdate: post.hasActiveUpdate,
    pendingUpdateId: post.pendingUpdateId ? stringToObjectId(post.pendingUpdateId) : undefined,
    moderationStatus: post.moderationStatus,
    abuseScore: post.abuseScore,
    lastModeratedAt: post.lastModeratedAt ? new Date(post.lastModeratedAt) : undefined,
    originalPostId: post.originalPostId ? stringToObjectId(post.originalPostId) : undefined,
  };
}
