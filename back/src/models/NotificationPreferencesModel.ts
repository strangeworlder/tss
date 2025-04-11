import { Schema, model, type Document } from 'mongoose';
import { NotificationType } from '../types/notification';

// Base interface for notification preferences without Mongoose-specific fields
export interface IBaseNotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  emailFrequency: 'immediate' | 'daily' | 'weekly';
  emailTypes: NotificationType[];
  notificationTypes: Record<NotificationType, boolean>;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for notification preferences with Mongoose document methods
export interface INotificationPreferences extends IBaseNotificationPreferences {
  _id: unknown;
  save(): Promise<this>;
  toObject(): IBaseNotificationPreferences;
}

const notificationPreferencesSchema = new Schema<INotificationPreferences>(
  {
    userId: { type: String, required: true, unique: true },
    emailNotifications: { type: Boolean, default: true },
    inAppNotifications: { type: Boolean, default: true },
    emailFrequency: {
      type: String,
      enum: ['immediate', 'daily', 'weekly'],
      default: 'immediate',
    },
    emailTypes: [
      {
        type: String,
        enum: Object.values(NotificationType),
      },
    ],
    notificationTypes: {
      type: Map,
      of: Boolean,
      default: {},
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Create index on userId for faster lookups
notificationPreferencesSchema.index({ userId: 1 });

export const NotificationPreferencesModel = model<INotificationPreferences>(
  'NotificationPreferences',
  notificationPreferencesSchema
);
