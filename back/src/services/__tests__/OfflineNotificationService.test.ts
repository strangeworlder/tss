import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  OfflineNotificationService,
  type IQueuedNotification,
} from '../OfflineNotificationService';
import type { IScheduledContent } from '../../types/scheduling';
import SchedulingService from '../SchedulingService';

// Mock dependencies
jest.mock('../SchedulingService', () => ({
  default: {
    emit: jest.fn(),
  },
}));

jest.mock('../MonitoringService', () => ({
  default: {
    updateHealthCheck: jest.fn(),
  },
}));

describe('OfflineNotificationService', () => {
  let service: OfflineNotificationService;
  const mockContent: IScheduledContent = {
    id: 'post1',
    type: 'post' as const,
    content: 'Test post content',
    publishAt: new Date(),
    status: 'scheduled',
    timezone: 'UTC',
    version: 1,
    authorId: 'user1',
  };

  beforeEach(() => {
    service = OfflineNotificationService.getInstance();
    jest.clearAllMocks();
  });

  describe('queueNotification', () => {
    it('should queue a notification successfully', async () => {
      const type = 'contentScheduled';
      await service.queueNotification(type, mockContent);

      const queuedNotifications = service.getQueuedNotifications();
      expect(queuedNotifications).toHaveLength(1);
      expect(queuedNotifications[0]).toMatchObject({
        type,
        content: mockContent,
        attempts: 0,
      });
    });

    it('should queue a notification with error', async () => {
      const type = 'contentPublicationFailed';
      const error = 'Publication failed';
      await service.queueNotification(type, mockContent, error);

      const queuedNotifications = service.getQueuedNotifications();
      expect(queuedNotifications[0].error).toBe(error);
    });
  });

  describe('processQueue', () => {
    it('should process queued notifications successfully', async () => {
      const type = 'contentScheduled';
      await service.queueNotification(type, mockContent);
      await service.processQueue();

      expect(SchedulingService.emit).toHaveBeenCalledWith(type, mockContent, undefined);
      expect(service.getQueuedNotifications()).toHaveLength(0);
    });

    it('should handle failed notifications and retry', async () => {
      const type = 'contentScheduled';
      jest
        .mocked(SchedulingService.emit)
        .mockRejectedValueOnce(new Error('Failed to emit') as never);

      await service.queueNotification(type, mockContent);
      await service.processQueue();

      const queuedNotifications = service.getQueuedNotifications();
      expect(queuedNotifications).toHaveLength(1);
      expect(queuedNotifications[0].attempts).toBe(1);
    });

    it('should remove notification after max retries', async () => {
      const type = 'contentScheduled';
      jest.mocked(SchedulingService.emit).mockRejectedValue(new Error('Failed to emit') as never);

      await service.queueNotification(type, mockContent);

      // Process queue multiple times to exceed max retries
      for (let i = 0; i < 4; i++) {
        await service.processQueue();
      }

      expect(service.getQueuedNotifications()).toHaveLength(0);
    });
  });

  describe('getQueuedNotification', () => {
    it('should return a specific queued notification', async () => {
      const type = 'contentScheduled';
      await service.queueNotification(type, mockContent);

      const notifications = service.getQueuedNotifications();
      const notification = service.getQueuedNotification(notifications[0].id);

      expect(notification).toBeDefined();
      expect(notification?.type).toBe(type);
    });

    it('should return undefined for non-existent notification', () => {
      const notification = service.getQueuedNotification('non-existent-id');
      expect(notification).toBeUndefined();
    });
  });

  describe('clearQueue', () => {
    it('should clear all queued notifications', async () => {
      await service.queueNotification('contentScheduled', mockContent);
      await service.queueNotification('contentPublished', mockContent);

      service.clearQueue();
      expect(service.getQueuedNotifications()).toHaveLength(0);
    });
  });

  describe('getQueueSize', () => {
    it('should return the correct queue size', async () => {
      expect(service.getQueueSize()).toBe(0);

      await service.queueNotification('contentScheduled', mockContent);
      expect(service.getQueueSize()).toBe(1);

      await service.queueNotification('contentPublished', mockContent);
      expect(service.getQueueSize()).toBe(2);
    });
  });
});
