import { Schema, model, type Document, type Types } from 'mongoose';
import mongoose from 'mongoose';
import { EncryptionService } from '../services/EncryptionService';

export enum CommentStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
}

export interface IComment extends Document {
  _id: Types.ObjectId;
  content: string;
  authorId: Types.ObjectId;
  postId: Types.ObjectId;
  status: CommentStatus;
  publishAt?: Date;
  timezone: string;
  version: number;
  hasActiveUpdate: boolean;
  pendingUpdateId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
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
    postId: { type: Schema.Types.ObjectId, required: true, ref: 'BlogPost' },
    status: {
      type: String,
      enum: Object.values(CommentStatus),
      default: CommentStatus.DRAFT,
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
commentSchema.index({ authorId: 1, status: 1 });
commentSchema.index({ postId: 1, status: 1 });
commentSchema.index({ status: 1, publishAt: 1 });
commentSchema.index({ pendingUpdateId: 1 });

// Create the model if it doesn't exist already
export const Comment = mongoose.models.Comment || model<IComment>('Comment', commentSchema);
