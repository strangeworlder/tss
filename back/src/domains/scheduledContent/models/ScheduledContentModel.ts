import mongoose from 'mongoose';
import type { IScheduledContent } from '../../../types/scheduling';

// Define the document interface that extends both Document and IScheduledContent
export interface IScheduledContentDocument extends mongoose.Document {
  type: 'post' | 'comment';
  content: string;
  authorId: string;
  publishAt: Date;
  status: 'scheduled' | 'published' | 'failed' | 'cancelled';
  timezone: string;
  version: number;
  _id: mongoose.Types.ObjectId;
}

// Create the schema
const scheduledContentSchema = new mongoose.Schema<IScheduledContentDocument>(
  {
    type: {
      type: String,
      required: true,
      enum: ['post', 'comment'],
    },
    content: {
      type: String,
      required: true,
    },
    authorId: {
      type: String,
      required: true,
    },
    publishAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['scheduled', 'published', 'failed', 'cancelled'],
      default: 'scheduled',
    },
    timezone: {
      type: String,
      required: true,
      default: 'UTC',
    },
    version: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes - only define them once
scheduledContentSchema.index({ type: 1, status: 1 });
scheduledContentSchema.index({ authorId: 1 });
scheduledContentSchema.index({ publishAt: 1 });
scheduledContentSchema.index({ content: 1 }, { unique: true });

// Create and export the model
const ScheduledContentModel = mongoose.model<IScheduledContentDocument>(
  'ScheduledContent',
  scheduledContentSchema
);

export default ScheduledContentModel;
