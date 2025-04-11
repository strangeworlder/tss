import { EventEmitter } from 'node:events';
import ErrorHandler, { ErrorCategory, ErrorSeverity } from './ErrorHandler';
import MonitoringService from './MonitoringService';
import { BlogPostModel, CommentModel } from '../models';
import { NotificationModel } from '../models/NotificationModel';
import {
  NotificationPreferencesModel,
  type INotificationPreferences,
  type IBaseNotificationPreferences,
} from '../models/NotificationPreferencesModel';
import { type Document, Types } from 'mongoose';
import { EmailService } from './EmailService';
import { NotificationType, NotificationEvent, type INotification } from '../types/notification';

// Singleton class
export class NotificationService extends EventEmitter {
  private static instance: NotificationService;
  private errorHandler: typeof ErrorHandler;
  private monitoringService: typeof MonitoringService;
  private emailService: EmailService;
  private defaultPreferences: Pick<
    IBaseNotificationPreferences,
    keyof IBaseNotificationPreferences
  > = {
    userId: '',
    emailNotifications: true,
    inAppNotifications: true,
    emailFrequency: 'immediate',
    emailTypes: Object.values(NotificationType),
    notificationTypes: Object.values(NotificationType).reduce(
      (acc, type) => {
        acc[type] = true;
        return acc;
      },
      {} as Record<NotificationType, boolean>
    ),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  private constructor() {
    super();
    this.errorHandler = ErrorHandler;
    this.monitoringService = MonitoringService;
    this.emailService = EmailService.getInstance();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Notification creation methods
  public async notifyContentScheduled(
    userId: string,
    contentId: string,
    contentType: 'post' | 'comment',
    publishAt: Date
  ): Promise<INotification> {
    try {
      const title = contentType === 'post' ? 'Post Scheduled' : 'Comment Scheduled';
      const message = `Your ${contentType} has been scheduled for publication on ${publishAt.toLocaleString()}.`;
      const now = new Date();

      const notification = await this.createNotification({
        userId,
        type: NotificationType.CONTENT_SCHEDULED,
        title,
        message,
        contentId,
        contentType,
        read: false,
        createdAt: now,
        updatedAt: now,
        expiresAt: new Date(publishAt.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days after publication
      });

      // Send email notification if enabled
      if (await this.shouldSendEmailNotification(userId, NotificationType.CONTENT_SCHEDULED)) {
        await this.sendEmailNotification(userId, notification);
      }

      return notification;
    } catch (error) {
      this.handleNotificationError('Failed to create content scheduled notification', error);
      throw new Error('Failed to create content scheduled notification');
    }
  }

  public async notifyContentPublishingSoon(
    userId: string,
    contentId: string,
    contentType: 'post' | 'comment',
    publishAt: Date
  ): Promise<INotification> {
    try {
      const title = contentType === 'post' ? 'Post Publishing Soon' : 'Comment Publishing Soon';
      const message = `Your ${contentType} will be published in 5 minutes.`;
      const now = new Date();

      const notification = await this.createNotification({
        userId,
        type: NotificationType.CONTENT_PUBLISHING_SOON,
        title,
        message,
        contentId,
        contentType,
        read: false,
        createdAt: now,
        updatedAt: now,
        expiresAt: new Date(publishAt.getTime() + 24 * 60 * 60 * 1000), // 24 hours after publication
      });

      // Send email notification if enabled
      if (
        await this.shouldSendEmailNotification(userId, NotificationType.CONTENT_PUBLISHING_SOON)
      ) {
        await this.sendEmailNotification(userId, notification);
      }

      return notification;
    } catch (error) {
      this.handleNotificationError('Failed to create content publishing soon notification', error);
      throw new Error('Failed to create content publishing soon notification');
    }
  }

  public async notifyContentPublished(
    userId: string,
    contentId: string,
    contentType: 'post' | 'comment'
  ): Promise<INotification> {
    try {
      const title = contentType === 'post' ? 'Post Published' : 'Comment Published';
      const message = `Your ${contentType} has been published.`;
      const now = new Date();

      const notification = await this.createNotification({
        userId,
        type: NotificationType.CONTENT_PUBLISHED,
        title,
        message,
        contentId,
        contentType,
        read: false,
        createdAt: now,
        updatedAt: now,
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      // Send email notification if enabled
      if (await this.shouldSendEmailNotification(userId, NotificationType.CONTENT_PUBLISHED)) {
        await this.sendEmailNotification(userId, notification);
      }

      return notification;
    } catch (error) {
      this.handleNotificationError('Failed to create content published notification', error);
      throw new Error('Failed to create content published notification');
    }
  }

  public async notifyContentPublicationFailed(
    userId: string,
    contentId: string,
    contentType: 'post' | 'comment',
    error: string
  ): Promise<INotification> {
    try {
      const title =
        contentType === 'post' ? 'Post Publication Failed' : 'Comment Publication Failed';
      const message = `Failed to publish your ${contentType}: ${error}`;
      const now = new Date();

      const notification = await this.createNotification({
        userId,
        type: NotificationType.CONTENT_PUBLICATION_FAILED,
        title,
        message,
        contentId,
        contentType,
        read: false,
        createdAt: now,
        updatedAt: now,
        expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });

      // Send email notification if enabled
      if (
        await this.shouldSendEmailNotification(userId, NotificationType.CONTENT_PUBLICATION_FAILED)
      ) {
        await this.sendEmailNotification(userId, notification);
      }

      return notification;
    } catch (error) {
      this.handleNotificationError(
        'Failed to create content publication failed notification',
        error
      );
      throw new Error('Failed to create content publication failed notification');
    }
  }

  public async notifyContentUpdateScheduled(
    userId: string,
    contentId: string,
    contentType: 'post' | 'comment',
    publishAt: Date
  ): Promise<INotification> {
    try {
      const title = contentType === 'post' ? 'Post Update Scheduled' : 'Comment Update Scheduled';
      const message = `Your ${contentType} update has been scheduled for publication on ${publishAt.toLocaleString()}.`;
      const now = new Date();

      const notification = await this.createNotification({
        userId,
        type: NotificationType.CONTENT_UPDATE_SCHEDULED,
        title,
        message,
        contentId,
        contentType,
        read: false,
        createdAt: now,
        updatedAt: now,
        expiresAt: new Date(publishAt.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days after publication
      });

      // Send email notification if enabled
      if (
        await this.shouldSendEmailNotification(userId, NotificationType.CONTENT_UPDATE_SCHEDULED)
      ) {
        await this.sendEmailNotification(userId, notification);
      }

      return notification;
    } catch (error) {
      this.handleNotificationError('Failed to create content update scheduled notification', error);
      throw new Error('Failed to create content update scheduled notification');
    }
  }

  public async notifyContentUpdatePublishingSoon(
    userId: string,
    contentId: string,
    contentType: 'post' | 'comment',
    publishAt: Date
  ): Promise<INotification> {
    try {
      const title =
        contentType === 'post' ? 'Post Update Publishing Soon' : 'Comment Update Publishing Soon';
      const message = `Your ${contentType} update will be published in 5 minutes.`;
      const now = new Date();

      const notification = await this.createNotification({
        userId,
        type: NotificationType.CONTENT_UPDATE_PUBLISHING_SOON,
        title,
        message,
        contentId,
        contentType,
        read: false,
        createdAt: now,
        updatedAt: now,
        expiresAt: new Date(publishAt.getTime() + 24 * 60 * 60 * 1000), // 24 hours after publication
      });

      // Send email notification if enabled
      if (
        await this.shouldSendEmailNotification(
          userId,
          NotificationType.CONTENT_UPDATE_PUBLISHING_SOON
        )
      ) {
        await this.sendEmailNotification(userId, notification);
      }

      return notification;
    } catch (error) {
      this.handleNotificationError(
        'Failed to create content update publishing soon notification',
        error
      );
      throw new Error('Failed to create content update publishing soon notification');
    }
  }

  public async notifyContentUpdatePublished(
    userId: string,
    contentId: string,
    contentType: 'post' | 'comment'
  ): Promise<INotification> {
    try {
      const title = contentType === 'post' ? 'Post Update Published' : 'Comment Update Published';
      const message = `Your ${contentType} update has been published.`;
      const now = new Date();

      const notification = await this.createNotification({
        userId,
        type: NotificationType.CONTENT_UPDATE_PUBLISHED,
        title,
        message,
        contentId,
        contentType,
        read: false,
        createdAt: now,
        updatedAt: now,
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      // Send email notification if enabled
      if (
        await this.shouldSendEmailNotification(userId, NotificationType.CONTENT_UPDATE_PUBLISHED)
      ) {
        await this.sendEmailNotification(userId, notification);
      }

      return notification;
    } catch (error) {
      this.handleNotificationError('Failed to create content update published notification', error);
      throw new Error('Failed to create content update published notification');
    }
  }

  public async notifyContentUpdatePublicationFailed(
    userId: string,
    contentId: string,
    contentType: 'post' | 'comment',
    error: string
  ): Promise<INotification> {
    try {
      const title =
        contentType === 'post'
          ? 'Post Update Publication Failed'
          : 'Comment Update Publication Failed';
      const message = `Failed to publish your ${contentType} update: ${error}`;
      const now = new Date();

      const notification = await this.createNotification({
        userId,
        type: NotificationType.CONTENT_UPDATE_PUBLICATION_FAILED,
        title,
        message,
        contentId,
        contentType,
        read: false,
        createdAt: now,
        updatedAt: now,
        expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });

      // Send email notification if enabled
      if (
        await this.shouldSendEmailNotification(
          userId,
          NotificationType.CONTENT_UPDATE_PUBLICATION_FAILED
        )
      ) {
        await this.sendEmailNotification(userId, notification);
      }

      return notification;
    } catch (error) {
      this.handleNotificationError(
        'Failed to create content update publication failed notification',
        error
      );
      throw new Error('Failed to create content update publication failed notification');
    }
  }

  public async notifyContentCancelled(
    userId: string,
    contentId: string,
    contentType: 'post' | 'comment'
  ): Promise<INotification> {
    try {
      const title = contentType === 'post' ? 'Post Cancelled' : 'Comment Cancelled';
      const message = `Your ${contentType} has been cancelled.`;
      const now = new Date();

      const notification = await this.createNotification({
        userId,
        type: NotificationType.CONTENT_CANCELLED,
        title,
        message,
        contentId,
        contentType,
        read: false,
        createdAt: now,
        updatedAt: now,
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      // Send email notification if enabled
      if (await this.shouldSendEmailNotification(userId, NotificationType.CONTENT_CANCELLED)) {
        await this.sendEmailNotification(userId, notification);
      }

      return notification;
    } catch (error) {
      this.handleNotificationError('Failed to create content cancelled notification', error);
      throw new Error('Failed to create content cancelled notification');
    }
  }

  public async notifyContentRescheduled(
    userId: string,
    contentId: string,
    contentType: 'post' | 'comment',
    publishAt: Date
  ): Promise<INotification> {
    try {
      const title = contentType === 'post' ? 'Post Rescheduled' : 'Comment Rescheduled';
      const message = `Your ${contentType} has been rescheduled for publication on ${publishAt.toLocaleString()}.`;
      const now = new Date();

      const notification = await this.createNotification({
        userId,
        type: NotificationType.CONTENT_RESCHEDULED,
        title,
        message,
        contentId,
        contentType,
        read: false,
        createdAt: now,
        updatedAt: now,
        expiresAt: new Date(publishAt.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days after publication
      });

      // Send email notification if enabled
      if (await this.shouldSendEmailNotification(userId, NotificationType.CONTENT_RESCHEDULED)) {
        await this.sendEmailNotification(userId, notification);
      }

      return notification;
    } catch (error) {
      this.handleNotificationError('Failed to create content rescheduled notification', error);
      throw new Error('Failed to create content rescheduled notification');
    }
  }

  public async notifySystemError(userId: string, error: string): Promise<INotification> {
    try {
      const title = 'System Error';
      const message = `A system error occurred: ${error}`;
      const now = new Date();

      const notification = await this.createNotification({
        userId,
        type: NotificationType.SYSTEM_ERROR,
        title,
        message,
        read: false,
        createdAt: now,
        updatedAt: now,
        expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });

      // Send email notification if enabled
      if (await this.shouldSendEmailNotification(userId, NotificationType.SYSTEM_ERROR)) {
        await this.sendEmailNotification(userId, notification);
      }

      return notification;
    } catch (error) {
      this.handleNotificationError('Failed to create system error notification', error);
      throw new Error('Failed to create system error notification');
    }
  }

  // Notification management methods
  private async createNotification(
    notification: Omit<INotification, 'id'>
  ): Promise<INotification> {
    try {
      // Create a new notification document
      const newNotification = await NotificationModel.create({
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        contentId: notification.contentId,
        contentType: notification.contentType,
        read: notification.read,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
        expiresAt: notification.expiresAt,
        metadata: notification.metadata,
      });

      const notificationObj = convertToNotification(newNotification);
      this.emit(NotificationEvent.NOTIFICATION_CREATED, notificationObj);
      return notificationObj;
    } catch (error) {
      this.handleNotificationError('Failed to create notification', error);
      throw new Error('Failed to create notification');
    }
  }

  public async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const result = await NotificationModel.findByIdAndUpdate(
        notificationId,
        { read: true },
        { new: true }
      );

      if (!result) {
        return false;
      }

      const notificationObj = convertToNotification(result);
      this.emit(NotificationEvent.NOTIFICATION_READ, notificationObj);
      return true;
    } catch (error) {
      this.handleNotificationError('Failed to mark notification as read', error);
      return false;
    }
  }

  public async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const notification = await NotificationModel.findByIdAndDelete(notificationId);
      if (!notification) {
        return false;
      }

      const notificationObj = convertToNotification(notification);
      this.emit(NotificationEvent.NOTIFICATION_DELETED, notificationObj);
      return true;
    } catch (error) {
      this.handleNotificationError('Failed to delete notification', error);
      return false;
    }
  }

  public async getNotificationsByUser(userId: string): Promise<INotification[]> {
    try {
      const notifications = await NotificationModel.find({ userId }).sort({ createdAt: -1 });
      return notifications.map(convertToNotification);
    } catch (error) {
      this.handleNotificationError('Failed to get notifications by user', error);
      return [];
    }
  }

  public async getUnreadNotificationsByUser(userId: string): Promise<INotification[]> {
    try {
      const notifications = await NotificationModel.find({
        userId,
        read: false,
      }).sort({ createdAt: -1 });
      return notifications.map(convertToNotification);
    } catch (error) {
      this.handleNotificationError('Failed to get unread notifications by user', error);
      return [];
    }
  }

  // Preferences management methods
  public async getNotificationPreferences(userId: string): Promise<IBaseNotificationPreferences> {
    try {
      let preferences = await NotificationPreferencesModel.findOne({ userId });

      if (!preferences) {
        const defaultPrefs = {
          ...this.defaultPreferences,
          userId: new Types.ObjectId(userId).toString(),
        };
        preferences = await NotificationPreferencesModel.create(defaultPrefs);
      }

      return preferences.toObject();
    } catch (error) {
      this.handleNotificationError('Failed to get notification preferences', error);
      return {
        ...this.defaultPreferences,
        userId,
      };
    }
  }

  public async updateNotificationPreferences(
    userId: string,
    preferences: Partial<IBaseNotificationPreferences>
  ): Promise<IBaseNotificationPreferences> {
    try {
      const updatedPreferences = await NotificationPreferencesModel.findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        { $set: preferences },
        { new: true, upsert: true }
      );

      if (!updatedPreferences) {
        throw new Error('Failed to update notification preferences');
      }

      const convertedPreferences = updatedPreferences.toObject();
      this.emit(NotificationEvent.PREFERENCES_UPDATED, convertedPreferences);
      return convertedPreferences;
    } catch (error) {
      this.handleNotificationError('Failed to update notification preferences', error);
      throw new Error('Failed to update notification preferences');
    }
  }

  // Email notification methods
  private async sendEmailNotification(
    userId: string,
    notification: INotification
  ): Promise<boolean> {
    try {
      const shouldSend = await this.shouldSendEmailNotification(userId, notification.type);
      if (!shouldSend) return false;

      const userEmail = await this.emailService.getUserEmail(userId);
      if (!userEmail) {
        console.error(`No email found for user ${userId}`);
        return false;
      }

      const emailTemplate = this.generateEmailTemplate(notification);
      return await this.emailService.sendEmail({
        to: userEmail,
        subject: notification.title,
        html: emailTemplate,
      });
    } catch (error) {
      console.error('Error sending email notification:', error);
      return false;
    }
  }

  private generateEmailTemplate(notification: INotification): string {
    return `
      <h1>${notification.title}</h1>
      <p>${notification.message}</p>
      ${notification.metadata?.publishAt ? `<p>Scheduled for: ${new Date(notification.metadata.publishAt).toLocaleString()}</p>` : ''}
    `;
  }

  private async shouldSendEmailNotification(
    userId: string,
    type: NotificationType
  ): Promise<boolean> {
    try {
      const preferences = await this.getNotificationPreferences(userId);
      return preferences.emailNotifications && preferences.notificationTypes[type] === true;
    } catch (error) {
      this.handleNotificationError('Failed to check email notification preferences', error);
      return false;
    }
  }

  private handleNotificationError(message: string, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.errorHandler.handleError(new Error(errorMessage), {
      message,
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.MONITORING,
      timestamp: new Date(),
      context: { error: errorMessage },
    });

    this.emit(NotificationEvent.NOTIFICATION_ERROR, {
      message,
      error: errorMessage,
      timestamp: new Date(),
    });
  }
}

// Helper function to convert MongoDB document to INotification
function convertToNotification(doc: Document): INotification {
  const obj = doc.toObject();
  return {
    ...obj,
    id: obj._id.toString(),
    userId: obj.userId.toString(),
    contentId: obj.contentId?.toString(),
  } as INotification;
}
