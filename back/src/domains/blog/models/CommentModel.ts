import mongoose, { Document, Schema, Types } from 'mongoose';
import { IBlogPost } from './BlogPostModel';
import { IUser } from '../../users/models/user.model';

export enum CommentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
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
  createdAt: Date;
  updatedAt: Date;
}

// Define the Comment Schema for MongoDB
const commentSchema = new Schema<IComment>({
  title: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 200
  },
  content: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 1000
  },
  author: {
    type: { type: String, enum: ['user', 'text'], required: true },
    id: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    avatar: {
      filename: { type: String },
      altText: { type: String }
    }
  },
  parentId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'parentType'
  },
  parentType: {
    type: String,
    enum: ['post', 'comment'],
    required: true
  },
  status: {
    type: String,
    enum: Object.values(CommentStatus),
    default: CommentStatus.PENDING
  }
}, { timestamps: true });

// Create indexes for better query performance
commentSchema.index({ parentId: 1, parentType: 1 });
commentSchema.index({ createdAt: -1 });
commentSchema.index({ status: 1 });

// Create the model if it doesn't exist already
export const CommentModel = mongoose.models.Comment || mongoose.model<IComment>('Comment', commentSchema);

export default CommentModel; 