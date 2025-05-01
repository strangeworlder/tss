import mongoose, { type Document, Schema, Types } from 'mongoose';
import {
  BlogPostStatus,
  BlogPostModerationStatus,
  type IBlogPost,
  type IHeroImage,
  type IAuthor,
} from '@shared/types/blog/blog';

/**
 * MongoDB document interface for blog posts
 * Extends the shared IBlogPost interface with MongoDB-specific fields
 * @extends {Document}
 */
export interface IBlogPostDocument extends Document {
  /** MongoDB document ID */
  _id: Types.ObjectId;

  /** Title of the blog post */
  title: string;

  /** URL-friendly slug */
  slug: string;

  /** Main content of the post */
  content: string;

  /** Short excerpt/summary */
  excerpt: string;

  /** Author information with MongoDB-specific types */
  author: {
    type: 'user' | 'text';
    id?: Types.ObjectId;
    name: string;
    avatar?: {
      filename: string;
      altText: string;
    };
  };

  /** Hero image for the blog post */
  heroImage?: IHeroImage;

  /** Post tags */
  tags: string[];

  /** Creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;

  /** Publication timestamp */
  publishedAt: Date | null;

  /** Post status */
  status: BlogPostStatus;

  /** Scheduled publication timestamp */
  publishAt?: Date;

  /** Timezone for scheduling */
  timezone: string;

  /** Content version */
  version: number;

  /** Flag for pending content updates */
  hasActiveUpdate: boolean;

  /** Reference to pending update document */
  pendingUpdateId?: Types.ObjectId;

  /** Reference to original post for updates */
  originalPostId?: Types.ObjectId;

  /** Moderation status */
  moderationStatus: BlogPostModerationStatus;

  /** Automated abuse detection score */
  abuseScore: number;

  /** Last moderation timestamp */
  lastModeratedAt?: Date;

  /** Computed property indicating if the post is published */
  isPublished: boolean;
}

/**
 * Converts a MongoDB document to a shared blog post interface
 * @param doc MongoDB document
 * @returns Shared blog post interface
 */
export function toBlogPost(doc: IBlogPostDocument): IBlogPost {
  const author: IAuthor = {
    type: doc.author.type,
    id: doc.author.id?.toString(),
    name: doc.author.name,
    avatar: doc.author.avatar,
  };

  return {
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    content: doc.content,
    excerpt: doc.excerpt,
    author,
    heroImage: doc.heroImage,
    tags: doc.tags,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
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
  };
}

/**
 * Converts a shared blog post interface to a MongoDB document
 * @param post Shared blog post interface
 * @returns MongoDB document
 */
export function toBlogPostDocument(post: IBlogPost): Partial<IBlogPostDocument> {
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
    createdAt: new Date(post.createdAt),
    updatedAt: new Date(post.updatedAt),
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
    isPublished: post.status === BlogPostStatus.PUBLISHED,
  };
}

/**
 * Blog post schema definition for MongoDB
 * Maps the IBlogPost interface to MongoDB document structure
 */
const blogPostSchema = new Schema<IBlogPostDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true },
    content: { type: String, required: true },
    excerpt: { type: String, required: true },
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
    },
    tags: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    publishedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: Object.values(BlogPostStatus),
      default: BlogPostStatus.DRAFT,
    },
    publishAt: { type: Date },
    timezone: { type: String, default: 'UTC' },
    version: { type: Number, default: 1 },
    hasActiveUpdate: { type: Boolean, default: false },
    pendingUpdateId: { type: Schema.Types.ObjectId },
    originalPostId: { type: Schema.Types.ObjectId },
    moderationStatus: {
      type: String,
      enum: Object.values(BlogPostModerationStatus),
      default: BlogPostModerationStatus.PENDING,
    },
    abuseScore: { type: Number, default: 0 },
    lastModeratedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Add virtual for isPublished
blogPostSchema.virtual('isPublished').get(function (this: IBlogPostDocument) {
  return this.status === BlogPostStatus.PUBLISHED;
});

// Indexes for optimized queries
blogPostSchema.index({ slug: 1 }, { unique: true });
blogPostSchema.index({ publishAt: 1 });
blogPostSchema.index({ status: 1 });
blogPostSchema.index({ author: 1 });
blogPostSchema.index({ tags: 1 });
blogPostSchema.index({ createdAt: -1 });
blogPostSchema.index({ updatedAt: -1 });

// Create the model if it doesn't exist already
export const BlogPostModel =
  mongoose.models.BlogPost || mongoose.model<IBlogPostDocument>('BlogPost', blogPostSchema);

export default BlogPostModel;
