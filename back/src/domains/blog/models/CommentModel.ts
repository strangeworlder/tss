import mongoose, { Document, Schema, Types } from 'mongoose';
import { IUser } from '../../users/models/user.model';
import { IBlogPost } from './BlogPostModel';

export enum CommentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// Comment interface
export interface IComment extends Document {
  content: string;
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  status: CommentStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Comment Schema for MongoDB
const commentSchema = new Schema<IComment>({
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 1000
  },
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'BlogPost',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: Object.values(CommentStatus),
    default: CommentStatus.PENDING
  }
}, {
  timestamps: true
});

// Create the model if it doesn't exist already
export const CommentModel = mongoose.models.Comment || mongoose.model<IComment>('Comment', commentSchema);

export default CommentModel; 