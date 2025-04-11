import mongoose, { Schema, type Document } from 'mongoose';

export enum VerificationMethod {
  NONE = 'none',
  TWO_FACTOR = '2fa',
  ADMIN_APPROVAL = 'admin_approval',
}

export interface IConfiguration extends Document {
  key: string;
  value: any;
  description: string;
  updatedAt: Date;
  updatedBy: mongoose.Types.ObjectId | null;
  requiresVerification: boolean;
  lastVerifiedBy: mongoose.Types.ObjectId | null;
  lastVerifiedAt: Date | null;
  verificationMethod: VerificationMethod;
}

const ConfigurationSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    requiresVerification: {
      type: Boolean,
      default: false,
    },
    lastVerifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    lastVerifiedAt: {
      type: Date,
      default: null,
    },
    verificationMethod: {
      type: String,
      enum: Object.values(VerificationMethod),
      default: VerificationMethod.NONE,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
ConfigurationSchema.index({ key: 1 });

// Create the model if it doesn't exist already
export const ConfigurationModel =
  mongoose.models.Configuration ||
  mongoose.model<IConfiguration>('Configuration', ConfigurationSchema);

export default ConfigurationModel;
