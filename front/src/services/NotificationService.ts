import type { IScheduledContent } from '@/types/scheduledContent';

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

export class NotificationService {
  private static instance: NotificationService;
  private notifications: INotification[] = [];
  private preferences: INotificationPreferences = {
    email: true,
    push: true,
    inApp: true,
    types: Object.values(NotificationTypeEnum).reduce(
      (acc, type) => {
        acc[type] = true;
        return acc;
      },
      {} as { [key in NotificationTypeEnum]: boolean }
    ),
  };

  private constructor() {
    this.loadFromLocalStorage();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private loadFromLocalStorage(): void {
    try {
      const storedNotifications = localStorage.getItem('notifications');
      if (storedNotifications) {
        this.notifications = JSON.parse(storedNotifications).map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          expiresAt: item.expiresAt ? new Date(item.expiresAt) : undefined,
        }));
      }

      const storedPreferences = localStorage.getItem('notificationPreferences');
      if (storedPreferences) {
        this.preferences = JSON.parse(storedPreferences);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      this.notifications = [];
    }
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('notifications', JSON.stringify(this.notifications));
      localStorage.setItem('notificationPreferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  public async notifyContentScheduled(content: IScheduledContent): Promise<void> {
    if (!this.preferences.types[NotificationTypeEnum.CONTENT_SCHEDULED]) return;

    const notification: INotification = {
      id: crypto.randomUUID(),
      type: NotificationTypeEnum.CONTENT_SCHEDULED,
      title: 'Content Scheduled',
      message: `Your ${content.type} has been scheduled for publication.`,
      contentId: content.id,
      contentType: content.type === 'post' ? 'post' : 'comment',
      read: false,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      metadata: {
        publishAt: content.publishAt,
      },
    };

    this.notifications.push(notification);
    this.saveToLocalStorage();

    if (this.preferences.push) {
      this.sendPushNotification(notification);
    }
  }

  public async notifyContentPublishingSoon(content: IScheduledContent): Promise<void> {
    if (!this.preferences.types[NotificationTypeEnum.CONTENT_PUBLISHING_SOON]) return;

    const notification: INotification = {
      id: crypto.randomUUID(),
      type: NotificationTypeEnum.CONTENT_PUBLISHING_SOON,
      title: 'Content Publishing Soon',
      message: `Your ${content.type} will be published in 5 minutes.`,
      contentId: content.id,
      contentType: content.type === 'post' ? 'post' : 'comment',
      read: false,
      createdAt: new Date(),
      expiresAt: new Date(content.publishAt.getTime() + 24 * 60 * 60 * 1000), // 24 hours after publication
    };

    this.notifications.push(notification);
    this.saveToLocalStorage();

    if (this.preferences.push) {
      this.sendPushNotification(notification);
    }
  }

  public async notifyContentPublished(content: IScheduledContent): Promise<void> {
    if (!this.preferences.types[NotificationTypeEnum.CONTENT_PUBLISHED]) return;

    const notification: INotification = {
      id: crypto.randomUUID(),
      type: NotificationTypeEnum.CONTENT_PUBLISHED,
      title: 'Content Published',
      message: `Your ${content.type} has been published.`,
      contentId: content.id,
      contentType: content.type === 'post' ? 'post' : 'comment',
      read: false,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };

    this.notifications.push(notification);
    this.saveToLocalStorage();

    if (this.preferences.push) {
      this.sendPushNotification(notification);
    }
  }

  public async notifyContentFailed(content: IScheduledContent, error: string): Promise<void> {
    if (!this.preferences.types[NotificationTypeEnum.CONTENT_PUBLICATION_FAILED]) return;

    const notification: INotification = {
      id: crypto.randomUUID(),
      type: NotificationTypeEnum.CONTENT_PUBLICATION_FAILED,
      title: 'Publication Failed',
      message: `Failed to publish your ${content.type}: ${error}`,
      contentId: content.id,
      contentType: content.type === 'post' ? 'post' : 'comment',
      read: false,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      metadata: {
        error,
      },
    };

    this.notifications.push(notification);
    this.saveToLocalStorage();

    if (this.preferences.push) {
      this.sendPushNotification(notification);
    }
  }

  public async notifyOfflineSync(content: IScheduledContent): Promise<void> {
    if (!this.preferences.types[NotificationTypeEnum.OFFLINE_SYNC]) return;

    const notification: INotification = {
      id: crypto.randomUUID(),
      type: NotificationTypeEnum.OFFLINE_SYNC,
      title: 'Offline Content Synced',
      message: `Your offline ${content.type} has been synced and published.`,
      contentId: content.id,
      contentType: content.type === 'post' ? 'post' : 'comment',
      read: false,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };

    this.notifications.push(notification);
    this.saveToLocalStorage();

    if (this.preferences.push) {
      this.sendPushNotification(notification);
    }
  }

  public async notifySystemError(error: string): Promise<void> {
    if (!this.preferences.types[NotificationTypeEnum.SYSTEM_ERROR]) return;

    const notification: INotification = {
      id: crypto.randomUUID(),
      type: NotificationTypeEnum.SYSTEM_ERROR,
      title: 'System Error',
      message: `A system error occurred: ${error}`,
      read: false,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      metadata: {
        error,
      },
    };

    this.notifications.push(notification);
    this.saveToLocalStorage();

    if (this.preferences.push) {
      this.sendPushNotification(notification);
    }
  }

  public async notifySystemSuccess(message: string): Promise<void> {
    if (!this.preferences.types[NotificationTypeEnum.SYSTEM_SUCCESS]) return;

    const notification: INotification = {
      id: crypto.randomUUID(),
      type: NotificationTypeEnum.SYSTEM_SUCCESS,
      title: 'Success',
      message,
      read: false,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };

    this.notifications.push(notification);
    this.saveToLocalStorage();

    if (this.preferences.push) {
      this.sendPushNotification(notification);
    }
  }

  public async notifySystemWarning(message: string): Promise<void> {
    if (!this.preferences.types[NotificationTypeEnum.SYSTEM_WARNING]) return;

    const notification: INotification = {
      id: crypto.randomUUID(),
      type: NotificationTypeEnum.SYSTEM_WARNING,
      title: 'Warning',
      message,
      read: false,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    };

    this.notifications.push(notification);
    this.saveToLocalStorage();

    if (this.preferences.push) {
      this.sendPushNotification(notification);
    }
  }

  public async notifySystemInfo(message: string): Promise<void> {
    if (!this.preferences.types[NotificationTypeEnum.SYSTEM_INFO]) return;

    const notification: INotification = {
      id: crypto.randomUUID(),
      type: NotificationTypeEnum.SYSTEM_INFO,
      title: 'Information',
      message,
      read: false,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };

    this.notifications.push(notification);
    this.saveToLocalStorage();

    if (this.preferences.push) {
      this.sendPushNotification(notification);
    }
  }

  private async sendPushNotification(notification: INotification): Promise<void> {
    if (!('Notification' in window)) return;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico',
    });
  }

  public getNotifications(): INotification[] {
    return this.notifications;
  }

  public getUnreadNotifications(): INotification[] {
    return this.notifications.filter((notification) => !notification.read);
  }

  public async markAsRead(id: string): Promise<void> {
    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveToLocalStorage();
    }
  }

  public async markAllAsRead(): Promise<void> {
    for (const notification of this.notifications) {
      notification.read = true;
    }
    this.saveToLocalStorage();
  }

  public async deleteNotification(id: string): Promise<void> {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.saveToLocalStorage();
  }

  public async clearNotifications(): Promise<void> {
    this.notifications = [];
    this.saveToLocalStorage();
  }

  public getPreferences(): INotificationPreferences {
    return this.preferences;
  }

  public async updatePreferences(preferences: Partial<INotificationPreferences>): Promise<void> {
    this.preferences = {
      ...this.preferences,
      ...preferences,
      types: {
        ...this.preferences.types,
        ...(preferences.types || {}),
      },
    };
    this.saveToLocalStorage();
  }
}

export const useNotificationService = () => NotificationService.getInstance();
