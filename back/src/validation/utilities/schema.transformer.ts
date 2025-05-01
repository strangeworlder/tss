import { Types } from 'mongoose';
import { z } from 'zod';
import type { IBlogPost, IBlogPostDocument } from '@shared/types/blog';

/**
 * Type converter registry for converting between MongoDB types and API types
 */
export namespace TypeConverter {
  /**
   * Convert MongoDB ObjectId to string
   */
  export function objectIdToString(value: Types.ObjectId | null): string | null {
    return value ? value.toString() : null;
  }

  /**
   * Convert string to MongoDB ObjectId
   */
  export function stringToObjectId(value: string | null): Types.ObjectId | null {
    return value ? new Types.ObjectId(value) : null;
  }

  /**
   * Convert date to ISO string
   */
  export function dateToISOString(value: Date | null): string | null {
    return value ? value.toISOString() : null;
  }

  /**
   * Convert ISO string to date
   */
  export function stringToDate(value: string | null): Date | null {
    return value ? new Date(value) : null;
  }
}

/**
 * Schema transformation utilities for blog posts
 */
export namespace BlogPostTransformer {
  /**
   * Transform MongoDB document to API response format
   */
  export function toApiResponse(doc: IBlogPostDocument): IBlogPost {
    return {
      id: doc._id.toString(),
      title: doc.title,
      content: doc.content,
      author: {
        type: doc.author.type,
        id: doc.author.id?.toString() || '',
        name: doc.author.name,
        email: doc.author.email,
        avatar: doc.author.avatar,
      },
      status: doc.status,
      moderationStatus: doc.moderationStatus,
      featuredImage: doc.featuredImage,
      tags: doc.tags,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      publishedAt: doc.publishedAt,
    };
  }

  /**
   * Transform API request to MongoDB document format
   */
  export function toMongoDocument(post: IBlogPost): Partial<IBlogPostDocument> {
    return {
      title: post.title,
      content: post.content,
      author: {
        type: post.author.type,
        id: post.author.id ? new Types.ObjectId(post.author.id) : undefined,
        name: post.author.name,
        email: post.author.email,
        avatar: post.author.avatar,
      },
      status: post.status,
      moderationStatus: post.moderationStatus,
      featuredImage: post.featuredImage,
      tags: post.tags,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      publishedAt: post.publishedAt,
    };
  }
}

/**
 * Zod schema for ObjectId validation
 */
export const objectIdSchema = z.string().refine(
  (value) => {
    try {
      new Types.ObjectId(value);
      return true;
    } catch {
      return false;
    }
  },
  {
    message: 'Invalid ObjectId format',
  }
);
