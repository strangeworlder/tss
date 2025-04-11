import { Schema, model, type Document, type Types } from 'mongoose';

export enum UpdateStatus {
  PENDING = 'pending',
  APPLIED = 'applied',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum ContentType {
  BLOG_POST = 'blog_post',
  COMMENT = 'comment',
}

export interface IUpdate extends Document {
  _id: Types.ObjectId;
  contentType: ContentType;
  contentId: Types.ObjectId;
  authorId: Types.ObjectId;
  status: UpdateStatus;
  content: string;
  version: number;
  reason?: string;
  appliedAt?: Date;
  rejectedAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const updateSchema = new Schema<IUpdate>(
  {
    contentType: {
      type: String,
      enum: Object.values(ContentType),
      required: true,
    },
    contentId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'contentType',
    },
    authorId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    status: {
      type: String,
      enum: Object.values(UpdateStatus),
      default: UpdateStatus.PENDING,
    },
    content: {
      type: String,
      required: true,
    },
    version: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
    },
    appliedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
updateSchema.index({ contentId: 1, status: 1 });
updateSchema.index({ authorId: 1 });
updateSchema.index({ status: 1 });

const UpdateModel = model<IUpdate>('Update', updateSchema);

export default UpdateModel;
