import mongoose, { Schema, type Document } from 'mongoose';

export interface IAuthor {
  name: string;
  avatar?: string;
}

export interface IHeroImage {
  url: string;
  alt: string;
}

export enum BlogPostStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  PENDING_UPDATE = 'pending_update',
}

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: IAuthor;
  heroImage?: IHeroImage;
  tags: string[];
  publishDate: Date;
  publishAt: Date | null;
  status: BlogPostStatus;
  timezone: string;
  version: number;
  pendingUpdateId: mongoose.Types.ObjectId | null;
  hasActiveUpdate: boolean;
  originalPostId: mongoose.Types.ObjectId | null;
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged';
  abuseScore: number;
  lastModeratedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
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
      name: {
        type: String,
        required: true,
      },
      avatar: String,
    },
    heroImage: {
      url: String,
      alt: String,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    publishDate: {
      type: Date,
      default: Date.now,
    },
    publishAt: {
      type: Date,
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(BlogPostStatus),
      default: BlogPostStatus.DRAFT,
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BlogPost',
      default: null,
    },
    hasActiveUpdate: {
      type: Boolean,
      default: false,
    },
    originalPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BlogPost',
      default: null,
    },
    moderationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'flagged'],
      default: 'pending',
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
  mongoose.models.BlogPost || mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);

export default BlogPostModel;
