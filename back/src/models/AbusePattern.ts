import mongoose, { Schema, type Document } from 'mongoose';

export enum AbuseAction {
  WARN = 'warn',
  BLOCK = 'block',
  BAN = 'ban',
}

export interface IAbusePattern extends Document {
  userId: mongoose.Types.ObjectId;
  pattern: string;
  severity: number;
  detectedAt: Date;
  resolvedAt: Date | null;
  action: AbuseAction;
}

const AbusePatternSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pattern: {
      type: String,
      required: true,
    },
    severity: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    detectedAt: {
      type: Date,
      default: Date.now,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    action: {
      type: String,
      enum: Object.values(AbuseAction),
      default: AbuseAction.WARN,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
AbusePatternSchema.index({ userId: 1 });
AbusePatternSchema.index({ detectedAt: -1 });
AbusePatternSchema.index({ resolvedAt: 1 });

// Create the model if it doesn't exist already
export const AbusePatternModel =
  mongoose.models.AbusePattern || mongoose.model<IAbusePattern>('AbusePattern', AbusePatternSchema);

export default AbusePatternModel;
