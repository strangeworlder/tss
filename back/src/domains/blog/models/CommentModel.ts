import mongoose, { type Document, Schema, type Types } from 'mongoose';
import type { IBlogPost } from '@shared/types/blog/blog';
import { IUser } from '../../users/models/user.model';

export enum CommentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  PENDING_UPDATE = 'pending_update',
}

export interface IComment extends Document {
  title: string;
  content: string;
  author: {
    type: 'user' | 'text';
    id?: Types.ObjectId;
    name: string;
    avatar?: {
      filename: string;
      altText: string;
    };
  };
  parentId: Types.ObjectId | null; // ID of the parent post or comment
  parentType: 'post' | 'comment'; // Type of the parent (post or comment)
  status: CommentStatus;
  publishAt: Date | null;
  timezone: string;
  version: number;
  replyDepth: number;
  pendingUpdateId: Types.ObjectId | null;
  hasActiveUpdate: boolean;
  originalCommentId: Types.ObjectId | null;
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged';
  abuseScore: number;
  lastModeratedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Comment Schema for MongoDB
const commentSchema = new Schema<IComment>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 1000,
    },
    author: {
      type: { type: String, enum: ['user', 'text'], required: true },
      id: { type: Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, required: true },
      avatar: {
        filename: { type: String },
        altText: { type: String },
      },
    },
    parentId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'parentType',
    },
    parentType: {
      type: String,
      enum: ['post', 'comment'],
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(CommentStatus),
      default: CommentStatus.PENDING,
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
    replyDepth: {
      type: Number,
      default: 0,
    },
    pendingUpdateId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    hasActiveUpdate: {
      type: Boolean,
      default: false,
    },
    originalCommentId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
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
  { timestamps: true }
);

// Create indexes for better query performance
commentSchema.index({ parentId: 1, parentType: 1 });
commentSchema.index({ createdAt: -1 });
commentSchema.index({ status: 1 });
commentSchema.index({ publishAt: 1 });

// Create the model if it doesn't exist already
export const CommentModel =
  mongoose.models.Comment || mongoose.model<IComment>('Comment', commentSchema);

export default CommentModel;
