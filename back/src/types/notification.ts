// Notification types
export enum NotificationType {
  CONTENT_SCHEDULED = 'content_scheduled',
  CONTENT_PUBLISHED = 'content_published',
  CONTENT_PUBLICATION_FAILED = 'content_publication_failed',
  CONTENT_PUBLISHING_SOON = 'content_publishing_soon',
  CONTENT_UPDATE_SCHEDULED = 'content_update_scheduled',
  CONTENT_UPDATE_PUBLISHED = 'content_update_published',
  CONTENT_UPDATE_PUBLICATION_FAILED = 'content_update_publication_failed',
  CONTENT_UPDATE_PUBLISHING_SOON = 'content_update_publishing_soon',
  CONTENT_CANCELLED = 'content_cancelled',
  CONTENT_RESCHEDULED = 'content_rescheduled',
  SYSTEM_ERROR = 'system_error',
  OFFLINE_SYNC = 'offline_sync',
}

// Notification events
export enum NotificationEvent {
  NOTIFICATION_CREATED = 'notificationCreated',
  NOTIFICATION_READ = 'notificationRead',
  NOTIFICATION_DELETED = 'notificationDeleted',
  PREFERENCES_UPDATED = 'preferencesUpdated',
  NOTIFICATION_ERROR = 'notificationError',
}

// Notification interface
export interface INotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  contentId?: string;
  contentType?: 'post' | 'comment';
  read: boolean;
  metadata?: {
    publishAt?: Date;
    actionUrl?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}
