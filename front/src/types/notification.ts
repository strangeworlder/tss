export enum NotificationTypeEnum {
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
  SYSTEM_SUCCESS = 'system_success',
  SYSTEM_WARNING = 'system_warning',
  SYSTEM_INFO = 'system_info',
  OFFLINE_SYNC = 'offline_sync',
}

export interface INotification {
  id: string;
  type: NotificationTypeEnum;
  title: string;
  message: string;
  contentId?: string;
  contentType?: 'post' | 'comment';
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface INotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  types: {
    [key in NotificationTypeEnum]: boolean;
  };
}
