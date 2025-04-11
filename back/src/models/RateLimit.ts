import mongoose, { Schema, type Document } from 'mongoose';

export interface IRateLimit extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  count: number;
  lastReset: Date;
  blockedUntil: Date | null;
}

const RateLimitSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      default: 0,
    },
    lastReset: {
      type: Date,
      default: Date.now,
    },
    blockedUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
RateLimitSchema.index({ userId: 1, action: 1 }, { unique: true });
RateLimitSchema.index({ blockedUntil: 1 });

// Create the model if it doesn't exist already
export const RateLimitModel =
  mongoose.models.RateLimit || mongoose.model<IRateLimit>('RateLimit', RateLimitSchema);

export default RateLimitModel;
