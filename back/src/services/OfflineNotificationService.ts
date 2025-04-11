import { Types } from 'mongoose';
import ErrorHandler, { ErrorCategory, ErrorSeverity } from './ErrorHandler';
import MonitoringService, { HealthStatus } from './MonitoringService';
import type { IScheduledContent } from '../types/scheduling';
import SchedulingService from './SchedulingService.js';

/**
 * Interface for queued notifications that will be sent when back online
 */
export interface IQueuedNotification {
  id: string;
  type:
    | 'contentScheduled'
    | 'contentPublishingSoon'
    | 'contentPublished'
    | 'contentPublicationFailed'
    | 'contentUpdateScheduled'
    | 'contentUpdatePublishingSoon'
    | 'contentUpdatePublished'
    | 'contentUpdatePublicationFailed'
    | 'contentCancelled'
    | 'contentRescheduled';
  content: IScheduledContent;
  error?: string;
  createdAt: Date;
  attempts: number;
  lastAttempt?: Date;
}

/**
 * Service for handling offline notifications
 */
export class OfflineNotificationService {
  private static instance: OfflineNotificationService;
  private notificationQueue: Map<string, IQueuedNotification>;
  private isProcessing: boolean;
  private maxRetries: number;
  private retryDelay: number; // in milliseconds

  private constructor() {
    this.notificationQueue = new Map();
    this.isProcessing = false;
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 seconds
  }

  public static getInstance(): OfflineNotificationService {
    if (!OfflineNotificationService.instance) {
      OfflineNotificationService.instance = new OfflineNotificationService();
    }
    return OfflineNotificationService.instance;
  }

  /**
   * Queue a notification for later delivery
   * @param type The notification type
   * @param content The scheduled content
   * @param error Optional error message
   */
  public async queueNotification(
    type: IQueuedNotification['type'],
    content: IScheduledContent,
    error?: string
  ): Promise<void> {
    try {
      const notification: IQueuedNotification = {
        id: new Types.ObjectId().toString(),
        type,
        content,
        error,
        createdAt: new Date(),
        attempts: 0,
      };

      this.notificationQueue.set(notification.id, notification);

      // Update monitoring
      MonitoringService.updateHealthCheck('offlineNotifications', {
        name: 'offlineNotifications',
        status: HealthStatus.HEALTHY,
        message: `Notification queued: ${type}`,
        timestamp: new Date(),
        details: {
          queueSize: this.notificationQueue.size,
          lastNotification: notification,
        },
      });
    } catch (error) {
      throw ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.VALIDATION,
        context: {
          operation: 'queueNotification',
          type,
          contentId: content.id,
        },
      });
    }
  }

  /**
   * Process queued notifications
   * @returns Promise<void>
   */
  public async processQueue(): Promise<void> {
    if (this.isProcessing || this.notificationQueue.size === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const notifications = Array.from(this.notificationQueue.values());
      const currentTime = new Date();

      for (const notification of notifications) {
        // Skip if max retries reached
        if (notification.attempts >= this.maxRetries) {
          this.notificationQueue.delete(notification.id);
          continue;
        }

        // Skip if not enough time has passed since last attempt
        if (
          notification.lastAttempt &&
          currentTime.getTime() - notification.lastAttempt.getTime() < this.retryDelay
        ) {
          continue;
        }

        try {
          await this.processNotification(notification);
          this.notificationQueue.delete(notification.id);
        } catch (error) {
          // Update attempt count and last attempt time
          notification.attempts += 1;
          notification.lastAttempt = new Date();

          if (notification.attempts >= this.maxRetries) {
            this.notificationQueue.delete(notification.id);
            ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
              severity: ErrorSeverity.HIGH,
              category: ErrorCategory.VALIDATION,
              context: {
                operation: 'processQueue',
                notificationId: notification.id,
                attempts: notification.attempts,
                error: 'Max retries reached',
              },
            });
          }
        }
      }

      // Update monitoring
      MonitoringService.updateHealthCheck('offlineNotifications', {
        name: 'offlineNotifications',
        status: HealthStatus.HEALTHY,
        message: 'Queue processed successfully',
        timestamp: new Date(),
        details: {
          queueSize: this.notificationQueue.size,
          processedAt: currentTime,
        },
      });
    } catch (error) {
      ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.VALIDATION,
        context: {
          operation: 'processQueue',
          queueSize: this.notificationQueue.size,
        },
      });
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single notification
   * @param notification The notification to process
   * @returns Promise<void>
   */
  private async processNotification(notification: IQueuedNotification): Promise<void> {
    const { type, content, error } = notification;

    try {
      // Emit the event on the SchedulingService instance
      SchedulingService.emit(type, content, error);

      // Update monitoring
      MonitoringService.updateHealthCheck('offlineNotifications', {
        name: 'offlineNotifications',
        status: HealthStatus.HEALTHY,
        message: `Notification processed: ${type}`,
        timestamp: new Date(),
        details: {
          notificationId: notification.id,
          type,
          contentId: content.id,
        },
      });
    } catch (error) {
      throw ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.VALIDATION,
        context: {
          operation: 'processNotification',
          notificationId: notification.id,
          type,
          contentId: content.id,
        },
      });
    }
  }

  /**
   * Get all queued notifications
   * @returns IQueuedNotification[]
   */
  public getQueuedNotifications(): IQueuedNotification[] {
    return Array.from(this.notificationQueue.values());
  }

  /**
   * Get a specific queued notification
   * @param id The notification ID
   * @returns IQueuedNotification | undefined
   */
  public getQueuedNotification(id: string): IQueuedNotification | undefined {
    return this.notificationQueue.get(id);
  }

  /**
   * Clear all queued notifications
   */
  public clearQueue(): void {
    this.notificationQueue.clear();
  }

  /**
   * Get the current queue size
   * @returns number
   */
  public getQueueSize(): number {
    return this.notificationQueue.size;
  }

  /**
   * Set the maximum number of retry attempts
   * @param maxRetries The maximum number of retries
   */
  public setMaxRetries(maxRetries: number): void {
    this.maxRetries = maxRetries;
  }

  /**
   * Set the retry delay
   * @param delayMs The delay in milliseconds
   */
  public setRetryDelay(delayMs: number): void {
    this.retryDelay = delayMs;
  }
}
