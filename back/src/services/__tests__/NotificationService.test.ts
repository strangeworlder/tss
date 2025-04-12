import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { NotificationService } from '../NotificationService';
import { NotificationType, NotificationEvent, type INotification } from '../../types/notification';
import type { EmailService } from '../EmailService';
import type { OfflineNotificationService } from '../OfflineNotificationService';
import { Types } from 'mongoose';

// Mock dependencies
jest.mock('../EmailService');
jest.mock('../OfflineNotificationService');
jest.mock('../ErrorHandler');
jest.mock('../MonitoringService');

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let mockEmailService: jest.Mocked<EmailService>;
  let mockOfflineNotificationService: jest.Mocked<OfflineNotificationService>;

  const mockUser = {
    id: new Types.ObjectId().toString(),
    email: 'test@example.com',
    role: 'USER',
  };

  const mockScheduledContent = {
    id: new Types.ObjectId().toString(),
    type: 'post',
    content: {
      title: 'Test Post',
      content: 'Test Content',
    },
    publishAt: new Date('2024-12-31T12:00:00Z'),
    status: 'scheduled',
    authorId: mockUser.id,
    timezone: 'UTC',
    version: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Initialize mocks
    mockEmailService = {
      sendEmail: jest.fn(),
    } as any;

    mockOfflineNotificationService = {
      queueNotification: jest.fn(),
    } as any;

    // Get singleton instance
    notificationService = NotificationService.getInstance();
  });

  describe('Content Scheduling Notifications', () => {
    it('should notify when content is scheduled', async () => {
      const notification = await notificationService.notifyContentScheduled(
        mockUser.id,
        mockScheduledContent.id,
        'post',
        mockScheduledContent.publishAt
      );

      expect(notification).toBeDefined();
      expect(notification.type).toBe(NotificationType.CONTENT_SCHEDULED);
      expect(notification.userId).toBe(mockUser.id);
      expect(notification.metadata).toBeDefined();
      expect(notification.read).toBe(false);
    });

    it('should notify when content is publishing soon', async () => {
      const notification = await notificationService.notifyContentPublishingSoon(
        mockUser.id,
        mockScheduledContent.id,
        'post',
        mockScheduledContent.publishAt
      );

      expect(notification).toBeDefined();
      expect(notification.type).toBe(NotificationType.CONTENT_PUBLISHING_SOON);
      expect(notification.userId).toBe(mockUser.id);
      expect(notification.metadata).toBeDefined();
      expect(notification.read).toBe(false);
    });

    it('should notify when content is published', async () => {
      const notification = await notificationService.notifyContentPublished(
        mockUser.id,
        mockScheduledContent.id,
        'post'
      );

      expect(notification).toBeDefined();
      expect(notification.type).toBe(NotificationType.CONTENT_PUBLISHED);
      expect(notification.userId).toBe(mockUser.id);
      expect(notification.read).toBe(false);
    });

    it('should notify when content publication fails', async () => {
      const error = 'Publication failed due to network error';
      const notification = await notificationService.notifyContentPublicationFailed(
        mockUser.id,
        mockScheduledContent.id,
        'post',
        error
      );

      expect(notification).toBeDefined();
      expect(notification.type).toBe(NotificationType.CONTENT_PUBLICATION_FAILED);
      expect(notification.userId).toBe(mockUser.id);
      expect(notification.message).toContain(error);
      expect(notification.read).toBe(false);
    });
  });

  describe('Email Notifications', () => {
    it('should send email notification when enabled', async () => {
      // Mock email preferences
      jest.spyOn(notificationService as any, 'shouldSendEmailNotification').mockResolvedValue(true);

      const notification = await notificationService.notifyContentScheduled(
        mockUser.id,
        mockScheduledContent.id,
        'post',
        mockScheduledContent.publishAt
      );

      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
        mockUser.email,
        expect.any(String),
        expect.any(String)
      );
    });

    it('should not send email notification when disabled', async () => {
      // Mock email preferences
      jest
        .spyOn(notificationService as any, 'shouldSendEmailNotification')
        .mockResolvedValue(false);

      await notificationService.notifyContentScheduled(
        mockUser.id,
        mockScheduledContent.id,
        'post',
        mockScheduledContent.publishAt
      );

      expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
    });
  });

  describe('Notification Management', () => {
    it('should mark notification as read', async () => {
      const notification = await notificationService.notifyContentScheduled(
        mockUser.id,
        mockScheduledContent.id,
        'post',
        mockScheduledContent.publishAt
      );

      const result = await notificationService.markNotificationAsRead(notification.id);
      expect(result).toBe(true);

      const updatedNotification = await notificationService.getNotificationsByUser(mockUser.id);
      expect(updatedNotification[0].read).toBe(true);
    });

    it('should delete notification', async () => {
      const notification = await notificationService.notifyContentScheduled(
        mockUser.id,
        mockScheduledContent.id,
        'post',
        mockScheduledContent.publishAt
      );

      const result = await notificationService.deleteNotification(notification.id);
      expect(result).toBe(true);

      const notifications = await notificationService.getNotificationsByUser(mockUser.id);
      expect(notifications).toHaveLength(0);
    });

    it('should get unread notifications', async () => {
      await notificationService.notifyContentScheduled(
        mockUser.id,
        mockScheduledContent.id,
        'post',
        mockScheduledContent.publishAt
      );

      const unreadNotifications = await notificationService.getUnreadNotificationsByUser(
        mockUser.id
      );
      expect(unreadNotifications).toHaveLength(1);
      expect(unreadNotifications[0].read).toBe(false);
    });
  });
});
