import mongoose, { Schema, type Document, Types } from 'mongoose';
import {
  BlogPostStatus,
  BlogPostModerationStatus,
  type IBlogPost,
  type IBlogPostDocument as BaseDocument,
} from '@shared/types/blog/blog';

// Re-export shared types
export type { IBlogPost } from '@shared/types/blog/blog';
export { BlogPostStatus, BlogPostModerationStatus };

/**
 * MongoDB-specific blog post document interface
 * Extends the shared document interface with Mongoose Document features
 */
export interface IBlogPostDocument extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: {
    type: 'user' | 'text';
    id?: Types.ObjectId;
    name: string;
    avatar?: {
      filename: string;
      altText: string;
    };
  };
  heroImage?: {
    filename: string;
    altText: string;
    url?: string;
  };
  tags: string[];
  status: BlogPostStatus;
  publishAt?: Date;
  timezone: string;
  version: number;
  hasActiveUpdate: boolean;
  pendingUpdateId?: Types.ObjectId;
  originalPostId?: Types.ObjectId;
  moderationStatus: BlogPostModerationStatus;
  abuseScore: number;
  lastModeratedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
}

/**
 * Converts a MongoDB document to a shared blog post interface
 * @param doc MongoDB document
 * @returns Shared blog post interface
 */
export function toBlogPost(doc: IBlogPostDocument): IBlogPost {
  if (!doc) return null as any;

  // Use type assertion to ensure _id is treated as ObjectId
  const docWithId = doc as IBlogPostDocument & { _id: Types.ObjectId };

  return {
    id: docWithId._id.toString(),
    title: doc.title,
    slug: doc.slug,
    content: doc.content,
    excerpt: doc.excerpt,
    author: {
      type: doc.author.type,
      id: doc.author.id?.toString(),
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
    pendingUpdateId: doc.pendingUpdateId?.toString(),
    originalPostId: doc.originalPostId?.toString(),
    moderationStatus: doc.moderationStatus,
    abuseScore: doc.abuseScore,
    lastModeratedAt: doc.lastModeratedAt?.toISOString(),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

/**
 * Converts a shared blog post interface to MongoDB document data
 * @param post Shared blog post interface
 * @returns MongoDB document data
 */
export function toBlogPostDocument(post: IBlogPost): Partial<IBlogPostDocument> {
  if (!post) return null as any;

  return {
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt,
    author: {
      type: post.author.type,
      id: post.author.id ? new Types.ObjectId(post.author.id) : undefined,
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
    pendingUpdateId: post.pendingUpdateId ? new Types.ObjectId(post.pendingUpdateId) : undefined,
    originalPostId: post.originalPostId ? new Types.ObjectId(post.originalPostId) : undefined,
    moderationStatus: post.moderationStatus,
    abuseScore: post.abuseScore,
    lastModeratedAt: post.lastModeratedAt ? new Date(post.lastModeratedAt) : undefined,
    createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
    updatedAt: post.updatedAt ? new Date(post.updatedAt) : new Date(),
  };
}

const BlogPostSchema = new Schema<IBlogPostDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    excerpt: {
      type: String,
      required: [true, 'Excerpt is required'],
    },
    author: {
      type: {
        type: String,
        enum: ['user', 'text'],
        required: true,
      },
      id: { type: Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, required: true },
      avatar: {
        filename: String,
        altText: String,
      },
    },
    heroImage: {
      filename: String,
      altText: String,
      url: String,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: Object.values(BlogPostStatus),
      default: BlogPostStatus.DRAFT,
    },
    publishAt: {
      type: Date,
      default: null,
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    version: {
      type: Number,
      default: 1,
    },
    pendingUpdateId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    hasActiveUpdate: {
      type: Boolean,
      default: false,
    },
    originalPostId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    moderationStatus: {
      type: String,
      enum: Object.values(BlogPostModerationStatus),
      default: BlogPostModerationStatus.PENDING,
    },
    abuseScore: {
      type: Number,
      default: 0,
    },
    lastModeratedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Add virtual for isPublished
BlogPostSchema.virtual('isPublished').get(function (this: IBlogPostDocument) {
  return this.status === BlogPostStatus.PUBLISHED;
});

// Generate slug from title before saving
BlogPostSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Create the model if it doesn't exist already
export const BlogPostModel =
  mongoose.models.BlogPost || mongoose.model<IBlogPostDocument>('BlogPost', BlogPostSchema);

export default BlogPostModel;
