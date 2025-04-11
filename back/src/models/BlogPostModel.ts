import { Schema, model, type Document, type Types } from 'mongoose';
import mongoose from 'mongoose';
import { EncryptionService } from '../services/EncryptionService';

export enum BlogPostStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
}

export interface IBlogPost extends Document {
  _id: Types.ObjectId;
  content: string;
  authorId: Types.ObjectId;
  status: BlogPostStatus;
  publishAt?: Date;
  timezone: string;
  version: number;
  hasActiveUpdate: boolean;
  pendingUpdateId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const blogPostSchema = new Schema<IBlogPost>(
  {
    content: {
      type: String,
      required: true,
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
    authorId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
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
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

// Indexes
blogPostSchema.index({ authorId: 1, status: 1 });
blogPostSchema.index({ status: 1, publishAt: 1 });
blogPostSchema.index({ pendingUpdateId: 1 });

// Create the model if it doesn't exist already
export const BlogPost = mongoose.models.BlogPost || model<IBlogPost>('BlogPost', blogPostSchema);
