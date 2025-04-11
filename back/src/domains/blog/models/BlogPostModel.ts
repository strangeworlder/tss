import mongoose, { type Document, Schema, type Types } from 'mongoose';
import { IUser } from '../../users/models/user.model';

export enum BlogPostStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

// Blog post interface
export interface IBlogPost extends Document {
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
  };
  heroImageUrl?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  isPublished: boolean;
  status: BlogPostStatus;
  publishAt?: Date;
  timezone: string;
  version: number;
  hasActiveUpdate: boolean;
  pendingUpdateId?: Types.ObjectId;
  originalPostId?: Types.ObjectId;
  originalCommentId?: Types.ObjectId;
}

// Define the BlogPost Schema for MongoDB
const blogPostSchema = new Schema<IBlogPost>(
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
    heroImageUrl: String,
    tags: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    publishedAt: { type: Date, default: null },
    isPublished: { type: Boolean, default: false },
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
    originalCommentId: { type: Schema.Types.ObjectId },
  },
  {
    timestamps: true,
  }
);

// Indexes - only define them once
blogPostSchema.index({ slug: 1 }, { unique: true });
blogPostSchema.index({ publishAt: 1 });
blogPostSchema.index({ status: 1 });
blogPostSchema.index({ author: 1 });

// Create the model if it doesn't exist already
export const BlogPostModel =
  mongoose.models.BlogPost || mongoose.model<IBlogPost>('BlogPost', blogPostSchema);

export default BlogPostModel;
