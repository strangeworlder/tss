import mongoose, { Schema, type Document } from 'mongoose';

export interface ISecurityAudit extends Document {
  action: string;
  userId: mongoose.Types.ObjectId | null;
  ip: string;
  userAgent: string;
  details: any;
  timestamp: Date;
  verified: boolean;
}

const SecurityAuditSchema = new Schema(
  {
    action: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    ip: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
SecurityAuditSchema.index({ action: 1 });
SecurityAuditSchema.index({ userId: 1 });
SecurityAuditSchema.index({ timestamp: -1 });
SecurityAuditSchema.index({ verified: 1 });

// Create the model if it doesn't exist already
export const SecurityAuditModel =
  mongoose.models.SecurityAudit ||
  mongoose.model<ISecurityAudit>('SecurityAudit', SecurityAuditSchema);

export default SecurityAuditModel;
