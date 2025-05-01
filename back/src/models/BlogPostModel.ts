import mongoose, { Schema, model, type Document, Types } from 'mongoose';
import { EncryptionService } from '../services/EncryptionService';
import {
  BlogPostStatus,
  BlogPostModerationStatus,
  type IBlogPost,
  type IAuthor,
  type IHeroImage,
} from '@shared/types/blog';

// Re-export shared types
export type { IBlogPost } from '@shared/types/blog';
export { BlogPostStatus, BlogPostModerationStatus };

/**
 * MongoDB-specific blog post document interface
 * Extends the shared interface with MongoDB-specific fields and encryption
 */
export interface IBlogPostDocument
  extends Omit<
      IBlogPost,
      | 'id'
      | 'author'
      | 'content'
      | 'createdAt'
      | 'updatedAt'
      | 'publishAt'
      | 'lastModeratedAt'
      | 'pendingUpdateId'
      | 'originalPostId'
    >,
    Document {
  /** MongoDB document ID */
  _id: Types.ObjectId;

  /** Author information with MongoDB-specific types */
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

  /** Encrypted content */
  content: string;

  /** Creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;

  /** Scheduled publication timestamp */
  publishAt?: Date;

  /** Last moderation timestamp */
  lastModeratedAt?: Date;

  /** Reference to pending update document */
  pendingUpdateId?: Types.ObjectId;

  /** Reference to original post for updates */
  originalPostId?: Types.ObjectId;
}

/**
 * Converts a MongoDB document to a shared blog post interface
 * @param doc MongoDB document
 * @returns Shared blog post interface
 */
export function toBlogPost(doc: IBlogPostDocument): IBlogPost {
  const encryptionService = EncryptionService.getInstance();
  return {
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    content: encryptionService.decryptField(doc.content),
    excerpt: doc.excerpt,
    author: {
      type: doc.author.type,
      id: doc.author.id?.toString() || '',
      name: doc.author.name,
      email: doc.author.email,
      avatar: doc.author.avatar,
    },
    heroImage: doc.heroImage,
    tags: doc.tags,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    status: doc.status,
    publishAt: doc.publishAt,
    timezone: doc.timezone,
    version: doc.version,
    hasActiveUpdate: doc.hasActiveUpdate,
    pendingUpdateId: doc.pendingUpdateId?.toString(),
    originalPostId: doc.originalPostId?.toString(),
    moderationStatus: doc.moderationStatus,
    abuseScore: doc.abuseScore,
    lastModeratedAt: doc.lastModeratedAt,
  };
}

/**
 * Converts a shared blog post interface to a MongoDB document
 * @param post Shared blog post interface
 * @returns MongoDB document
 */
export function toBlogPostDocument(post: IBlogPost): Partial<IBlogPostDocument> {
  const encryptionService = EncryptionService.getInstance();
  return {
    title: post.title,
    slug: post.slug,
    content: encryptionService.encryptField(post.content),
    excerpt: post.excerpt,
    author: {
      type: post.author.type,
      id: post.author.id ? new Types.ObjectId(post.author.id) : undefined,
      name: post.author.name,
      email: post.author.email,
      avatar: post.author.avatar,
    },
    heroImage: post.heroImage,
    tags: post.tags,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    status: post.status,
    publishAt: post.publishAt,
    timezone: post.timezone,
    version: post.version,
    hasActiveUpdate: post.hasActiveUpdate,
    pendingUpdateId: post.pendingUpdateId ? new Types.ObjectId(post.pendingUpdateId) : undefined,
    originalPostId: post.originalPostId ? new Types.ObjectId(post.originalPostId) : undefined,
    moderationStatus: post.moderationStatus,
    abuseScore: post.abuseScore,
    lastModeratedAt: post.lastModeratedAt,
  };
}

// Define the schema with proper validation and indexes
const blogPostSchema = new Schema<IBlogPostDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      minlength: [10, 'Content must be at least 10 characters long'],
      get: (value: string) => {
        if (!value) return value;
        const encryptionService = EncryptionService.getInstance();
        return encryptionService.decryptField(value);
      },
      set: (value: string) => {
        if (!value) return value;
        const encryptionService = EncryptionService.getInstance();
        return encryptionService.encryptField(value);
      },
    },
    excerpt: {
      type: String,
      required: [true, 'Excerpt is required'],
      trim: true,
      maxlength: [500, 'Excerpt cannot exceed 500 characters'],
    },
    author: {
      type: {
        type: String,
        required: [true, 'Author type is required'],
        enum: ['user', 'text'],
      },
      id: {
        type: Types.ObjectId,
        required: function () {
          return this.author.type === 'user';
        },
        ref: 'User',
      },
      name: {
        type: String,
        required: [true, 'Author name is required'],
        trim: true,
      },
      email: {
        type: String,
        required: [true, 'Author email is required'],
      },
      avatar: {
        filename: String,
        altText: String,
      },
    },
    heroImage: {
      filename: {
        type: String,
        required: function () {
          return !!this.heroImage;
        },
      },
      altText: {
        type: String,
        required: function () {
          return !!this.heroImage?.filename;
        },
      },
    },
    tags: [
      {
        type: String,
        trim: true,
        minlength: [2, 'Tags must be at least 2 characters long'],
      },
    ],
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: Object.values(BlogPostStatus),
      default: BlogPostStatus.DRAFT,
    },
    publishAt: {
      type: Date,
      validate: {
        validator: (value: Date) => !value || value > new Date(),
        message: 'Publish date must be in the future',
      },
    },
    timezone: {
      type: String,
      required: [true, 'Timezone is required'],
      default: 'UTC',
    },
    version: {
      type: Number,
      required: [true, 'Version is required'],
      min: [1, 'Version must be at least 1'],
      default: 1,
    },
    hasActiveUpdate: {
      type: Boolean,
      required: [true, 'Has active update flag is required'],
      default: false,
    },
    pendingUpdateId: {
      type: Types.ObjectId,
      ref: 'BlogPost',
    },
    originalPostId: {
      type: Types.ObjectId,
      ref: 'BlogPost',
    },
    moderationStatus: {
      type: String,
      required: [true, 'Moderation status is required'],
      enum: Object.values(BlogPostModerationStatus),
      default: BlogPostModerationStatus.PENDING,
    },
    abuseScore: {
      type: Number,
      required: [true, 'Abuse score is required'],
      default: 0,
      min: [0, 'Abuse score cannot be negative'],
      max: [100, 'Abuse score cannot exceed 100'],
    },
    lastModeratedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for optimized querying
blogPostSchema.index({ slug: 1 }, { unique: true });
blogPostSchema.index({ status: 1 });
blogPostSchema.index({ tags: 1 });
blogPostSchema.index({ 'author.id': 1 });
blogPostSchema.index({ publishAt: 1 });
blogPostSchema.index({ createdAt: -1 });
blogPostSchema.index({ updatedAt: -1 });
blogPostSchema.index({ moderationStatus: 1 });
blogPostSchema.index({ abuseScore: 1 });

// Create the model if it doesn't exist already
export const BlogPostModel =
  mongoose.models.BlogPost || mongoose.model<IBlogPostDocument>('BlogPost', blogPostSchema);

export default BlogPostModel;
