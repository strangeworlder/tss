import { EventEmitter } from 'node:events';
import type { Types } from 'mongoose';
import {
  BlogPostModel,
  type IBlogPost,
  BlogPostStatus,
} from '../domains/blog/models/BlogPostModel';
import { HealthStatus } from './MonitoringService';
import type { IScheduledContent, IPendingUpdate } from '../types/scheduling';
import ErrorHandler, { ErrorCategory, ErrorSeverity } from './ErrorHandler';
import MonitoringService from './MonitoringService';
import ConfigurationService from './ConfigurationService';
import ScheduledContentModel from '../domains/scheduledContent/models/ScheduledContentModel';
import { NotificationService } from './NotificationService';

export class SchedulingService extends EventEmitter {
  private static instance: SchedulingService;
  private isInitialized = false;
  private defaultDelayHours = 24;
  private timezone = 'UTC';
  private scheduledContent: Map<string, IScheduledContent>;
  private pendingUpdates: Map<string, IPendingUpdate>;
  private healthStatus: HealthStatus;
  private errorHandler: typeof ErrorHandler;
  private notificationService: NotificationService;

  private constructor() {
    super();
    this.scheduledContent = new Map();
    this.pendingUpdates = new Map();
    this.healthStatus = HealthStatus.HEALTHY;
    this.errorHandler = ErrorHandler;
    this.notificationService = NotificationService.getInstance();
  }

  public static getInstance(): SchedulingService {
    if (!SchedulingService.instance) {
      SchedulingService.instance = new SchedulingService();
    }
    return SchedulingService.instance;
  }

  /**
   * Initialize the scheduling service
   * @returns Promise<void>
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Get global delay settings
      const globalDelay = await ConfigurationService.getGlobalDelay();
      this.defaultDelayHours = globalDelay.delayHours;

      // Set timezone
      this.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Set up event listeners for notification events
      this.setupNotificationEventListeners();

      this.isInitialized = true;
      this.emit('initialized', { timestamp: new Date() });

      // Update health check
      MonitoringService.updateHealthCheck('scheduling', {
        name: 'scheduling',
        status: HealthStatus.HEALTHY,
        message: 'Scheduling service initialized',
        timestamp: new Date(),
      });
    } catch (error) {
      ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.DATABASE,
        context: { operation: 'initialize' },
      });

      // Update health check
      MonitoringService.updateHealthCheck('scheduling', {
        name: 'scheduling',
        status: HealthStatus.DEGRADED,
        message: 'Scheduling service initialization failed',
        timestamp: new Date(),
      });

      throw error;
    }
  }

  /**
   * Set up event listeners for notification events
   * @private
   */
  private setupNotificationEventListeners(): void {
    // Listen for content scheduled events
    this.on('contentScheduled', async (content: IScheduledContent) => {
      try {
        await this.notificationService.notifyContentScheduled(
          content.authorId,
          content.id,
          content.type,
          content.publishAt
        );
      } catch (error) {
        this.errorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
          severity: ErrorSeverity.MEDIUM,
          category: ErrorCategory.NOTIFICATION,
          context: { operation: 'contentScheduled', contentId: content.id },
        });
      }
    });

    // Listen for content publishing soon events
    this.on('contentPublishingSoon', async (content: IScheduledContent) => {
      try {
        await this.notificationService.notifyContentPublishingSoon(
          content.authorId,
          content.id,
          content.type,
          content.publishAt
        );
      } catch (error) {
        this.errorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
          severity: ErrorSeverity.MEDIUM,
          category: ErrorCategory.NOTIFICATION,
          context: { operation: 'contentPublishingSoon', contentId: content.id },
        });
      }
    });

    // Listen for content published events
    this.on('contentPublished', async (content: IScheduledContent) => {
      try {
        await this.notificationService.notifyContentPublished(
          content.authorId,
          content.id,
          content.type
        );
      } catch (error) {
        this.errorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
          severity: ErrorSeverity.MEDIUM,
          category: ErrorCategory.NOTIFICATION,
          context: { operation: 'contentPublished', contentId: content.id },
        });
      }
    });

    // Listen for publication failure events
    this.on('contentPublicationFailed', async (content: IScheduledContent, error: string) => {
      try {
        await this.notificationService.notifyContentPublicationFailed(
          content.authorId,
          content.id,
          content.type,
          error
        );
      } catch (error) {
        this.errorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
          severity: ErrorSeverity.HIGH,
          category: ErrorCategory.NOTIFICATION,
          context: { operation: 'contentPublicationFailed', contentId: content.id },
        });
      }
    });

    // Listen for content update scheduled events
    this.on('contentUpdateScheduled', async (content: IScheduledContent) => {
      try {
        await this.notificationService.notifyContentUpdateScheduled(
          content.authorId,
          content.id,
          content.type,
          content.publishAt
        );
      } catch (error) {
        this.errorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
          severity: ErrorSeverity.MEDIUM,
          category: ErrorCategory.NOTIFICATION,
          context: { operation: 'contentUpdateScheduled', contentId: content.id },
        });
      }
    });

    // Listen for content update publishing soon events
    this.on('contentUpdatePublishingSoon', async (content: IScheduledContent) => {
      try {
        await this.notificationService.notifyContentUpdatePublishingSoon(
          content.authorId,
          content.id,
          content.type,
          content.publishAt
        );
      } catch (error) {
        this.errorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
          severity: ErrorSeverity.MEDIUM,
          category: ErrorCategory.NOTIFICATION,
          context: { operation: 'contentUpdatePublishingSoon', contentId: content.id },
        });
      }
    });

    // Listen for content update published events
    this.on('contentUpdatePublished', async (content: IScheduledContent) => {
      try {
        await this.notificationService.notifyContentUpdatePublished(
          content.authorId,
          content.id,
          content.type
        );
      } catch (error) {
        this.errorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
          severity: ErrorSeverity.MEDIUM,
          category: ErrorCategory.NOTIFICATION,
          context: { operation: 'contentUpdatePublished', contentId: content.id },
        });
      }
    });

    // Listen for content update publication failure events
    this.on('contentUpdatePublicationFailed', async (content: IScheduledContent, error: string) => {
      try {
        await this.notificationService.notifyContentUpdatePublicationFailed(
          content.authorId,
          content.id,
          content.type,
          error
        );
      } catch (error) {
        this.errorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
          severity: ErrorSeverity.HIGH,
          category: ErrorCategory.NOTIFICATION,
          context: { operation: 'contentUpdatePublicationFailed', contentId: content.id },
        });
      }
    });

    // Listen for content cancelled events
    this.on('contentCancelled', async (content: IScheduledContent) => {
      try {
        await this.notificationService.notifyContentCancelled(
          content.authorId,
          content.id,
          content.type
        );
      } catch (error) {
        this.errorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
          severity: ErrorSeverity.MEDIUM,
          category: ErrorCategory.NOTIFICATION,
          context: { operation: 'contentCancelled', contentId: content.id },
        });
      }
    });

    // Listen for content rescheduled events
    this.on('contentRescheduled', async (content: IScheduledContent) => {
      try {
        await this.notificationService.notifyContentRescheduled(
          content.authorId,
          content.id,
          content.type,
          content.publishAt
        );
      } catch (error) {
        this.errorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
          severity: ErrorSeverity.MEDIUM,
          category: ErrorCategory.NOTIFICATION,
          context: { operation: 'contentRescheduled', contentId: content.id },
        });
      }
    });
  }

  public getHealthStatus(): HealthStatus {
    return this.healthStatus;
  }

  /**
   * Schedule a post for publication
   * @param post The post to schedule
   * @returns Promise<IScheduledContent>
   */
  public async schedulePost(post: IBlogPost, publishAt: Date): Promise<IScheduledContent> {
    try {
      const scheduledContent = await ScheduledContentModel.create({
        type: 'post',
        content: post._id?.toString() || '',
        authorId: post.author.id?.toString() || '',
        publishAt,
        status: BlogPostStatus.SCHEDULED,
        timezone: post.timezone || 'UTC',
        version: 1,
      });

      // Convert to IScheduledContent
      const result: IScheduledContent = {
        id: (scheduledContent._id as Types.ObjectId).toString(),
        type: scheduledContent.type,
        content: scheduledContent.content,
        authorId: scheduledContent.authorId,
        publishAt: scheduledContent.publishAt,
        status: scheduledContent.status,
        timezone: scheduledContent.timezone,
        version: scheduledContent.version,
      };

      // Emit event for notification
      this.emit('contentScheduled', result);

      // Schedule notification for 5 minutes before publication
      const notificationTime = new Date(publishAt.getTime() - 5 * 60 * 1000);
      const now = new Date();
      if (notificationTime > now) {
        setTimeout(() => {
          this.emit('contentPublishingSoon', result);
        }, notificationTime.getTime() - now.getTime());
      }

      return result;
    } catch (error) {
      throw ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
        category: ErrorCategory.DATABASE,
        context: {
          operation: 'SchedulingService.schedulePost',
          postId: post._id?.toString() ?? 'unknown',
          publishAt: publishAt.toISOString(),
          type: 'post',
        },
      });
    }
  }

  /**
   * Schedule a comment for publication
   * @param comment The comment to schedule
   * @returns Promise<IScheduledContent>
   */
  public async scheduleComment(comment: IBlogPost, publishAt: Date): Promise<IScheduledContent> {
    try {
      const scheduledContent = await ScheduledContentModel.create({
        type: 'comment',
        content: comment._id?.toString() || '',
        authorId: comment.author.id?.toString() || '',
        publishAt,
        status: BlogPostStatus.SCHEDULED,
        timezone: comment.timezone || 'UTC',
        version: 1,
      });

      // Convert to IScheduledContent
      const result: IScheduledContent = {
        id: (scheduledContent._id as Types.ObjectId).toString(),
        type: scheduledContent.type,
        content: scheduledContent.content,
        authorId: scheduledContent.authorId,
        publishAt: scheduledContent.publishAt,
        status: scheduledContent.status,
        timezone: scheduledContent.timezone,
        version: scheduledContent.version,
      };

      // Emit event for notification
      this.emit('contentScheduled', result);

      // Schedule notification for 5 minutes before publication
      const notificationTime = new Date(publishAt.getTime() - 5 * 60 * 1000);
      const now = new Date();
      if (notificationTime > now) {
        setTimeout(() => {
          this.emit('contentPublishingSoon', result);
        }, notificationTime.getTime() - now.getTime());
      }

      return result;
    } catch (error) {
      throw ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
        category: ErrorCategory.DATABASE,
        context: {
          operation: 'SchedulingService.scheduleComment',
          commentId: comment._id?.toString() ?? 'unknown',
          publishAt: publishAt.toISOString(),
          type: 'comment',
        },
      });
    }
  }

  /**
   * Update scheduled content
   * @param contentId The content ID
   * @param updates The updates to apply
   * @returns Promise<IScheduledContent>
   */
  public async updateScheduledContent(
    id: string,
    updates: Partial<IScheduledContent>
  ): Promise<IScheduledContent> {
    try {
      const scheduledContent = await ScheduledContentModel.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true }
      );

      if (!scheduledContent) {
        throw new Error(`Scheduled content with id ${id} not found`);
      }

      // Convert to IScheduledContent
      const result: IScheduledContent = {
        id: (scheduledContent._id as Types.ObjectId).toString(),
        type: scheduledContent.type,
        content: scheduledContent.content,
        authorId: scheduledContent.authorId,
        publishAt: scheduledContent.publishAt,
        status: scheduledContent.status,
        timezone: scheduledContent.timezone,
        version: scheduledContent.version,
      };

      // Emit event for notification
      this.emit('contentUpdateScheduled', result);

      // If publish date was updated, schedule new notification
      if (updates.publishAt) {
        const notificationTime = new Date(updates.publishAt.getTime() - 5 * 60 * 1000);
        const now = new Date();
        if (notificationTime > now) {
          setTimeout(() => {
            this.emit('contentUpdatePublishingSoon', result);
          }, notificationTime.getTime() - now.getTime());
        }
      }

      return result;
    } catch (error) {
      throw ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
        category: ErrorCategory.DATABASE,
        context: {
          operation: 'SchedulingService.updateScheduledContent',
          contentId: id,
          updates: JSON.stringify(updates),
        },
      });
    }
  }

  /**
   * Cancel scheduled content
   * @param contentId The content ID
   * @returns Promise<IScheduledContent>
   */
  public async cancelScheduledContent(id: string): Promise<IScheduledContent> {
    try {
      const scheduledContent = await ScheduledContentModel.findByIdAndUpdate(
        id,
        { $set: { status: BlogPostStatus.CANCELLED } },
        { new: true }
      );

      if (!scheduledContent) {
        throw new Error(`Scheduled content with id ${id} not found`);
      }

      // Convert to IScheduledContent
      const result: IScheduledContent = {
        id: (scheduledContent._id as Types.ObjectId).toString(),
        type: scheduledContent.type,
        content: scheduledContent.content,
        authorId: scheduledContent.authorId,
        publishAt: scheduledContent.publishAt,
        status: scheduledContent.status,
        timezone: scheduledContent.timezone,
        version: scheduledContent.version,
      };

      // Emit event for notification
      this.emit('contentCancelled', result);

      return result;
    } catch (error) {
      throw ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
        category: ErrorCategory.DATABASE,
        context: {
          operation: 'SchedulingService.cancelScheduledContent',
          contentId: id,
        },
      });
    }
  }

  /**
   * Reschedule content
   * @param contentId The content ID
   * @param newPublishAt The new publish date
   * @returns Promise<IScheduledContent>
   */
  public async rescheduleContent(id: string, newPublishAt: Date): Promise<IScheduledContent> {
    try {
      const scheduledContent = await ScheduledContentModel.findByIdAndUpdate(
        id,
        { $set: { publishAt: newPublishAt, status: BlogPostStatus.SCHEDULED } },
        { new: true }
      );

      if (!scheduledContent) {
        throw new Error(`Scheduled content with id ${id} not found`);
      }

      // Convert to IScheduledContent
      const result: IScheduledContent = {
        id: (scheduledContent._id as Types.ObjectId).toString(),
        type: scheduledContent.type,
        content: scheduledContent.content,
        authorId: scheduledContent.authorId,
        publishAt: scheduledContent.publishAt,
        status: scheduledContent.status,
        timezone: scheduledContent.timezone,
        version: scheduledContent.version,
      };

      // Emit event for notification
      this.emit('contentRescheduled', result);

      // Schedule notification for 5 minutes before publication
      const notificationTime = new Date(newPublishAt.getTime() - 5 * 60 * 1000);
      const now = new Date();
      if (notificationTime > now) {
        setTimeout(() => {
          this.emit('contentPublishingSoon', result);
        }, notificationTime.getTime() - now.getTime());
      }

      return result;
    } catch (error) {
      throw ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
        category: ErrorCategory.DATABASE,
        context: {
          operation: 'SchedulingService.rescheduleContent',
          contentId: id,
          newPublishAt: newPublishAt.toISOString(),
        },
      });
    }
  }

  /**
   * Get scheduled content by ID
   * @param contentId The content ID
   * @param contentType The content type
   * @returns Promise<IScheduledContent | null>
   */
  public async getScheduledContentById(id: string): Promise<IScheduledContent | null> {
    try {
      const scheduledContent = await ScheduledContentModel.findById(id);

      if (!scheduledContent) {
        return null;
      }

      // Convert to IScheduledContent
      const result: IScheduledContent = {
        id: (scheduledContent._id as Types.ObjectId).toString(),
        type: scheduledContent.type,
        content: scheduledContent.content,
        authorId: scheduledContent.authorId,
        publishAt: scheduledContent.publishAt,
        status: scheduledContent.status,
        timezone: scheduledContent.timezone,
        version: scheduledContent.version,
      };

      return result;
    } catch (error) {
      throw ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
        category: ErrorCategory.DATABASE,
        context: {
          operation: 'SchedulingService.getScheduledContentById',
          contentId: id,
        },
      });
    }
  }

  /**
   * Get scheduled content by author
   * @param authorId The author ID
   * @returns Promise<IScheduledContent[]>
   */
  public async getScheduledContentByAuthor(authorId: string): Promise<IScheduledContent[]> {
    try {
      const scheduledContent = await ScheduledContentModel.find({ authorId });

      // Convert to IScheduledContent[]
      return scheduledContent.map((content) => ({
        id: (content._id as Types.ObjectId).toString(),
        type: content.type,
        content: content.content,
        authorId: content.authorId,
        publishAt: content.publishAt,
        status: content.status,
        timezone: content.timezone,
        version: content.version,
      }));
    } catch (error) {
      throw ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
        category: ErrorCategory.DATABASE,
        context: {
          operation: 'SchedulingService.getScheduledContentByAuthor',
          authorId,
        },
      });
    }
  }

  /**
   * Get all scheduled content
   * @returns Promise<IScheduledContent[]>
   */
  public async getScheduledContent(): Promise<IScheduledContent[]> {
    try {
      const scheduledContent = await ScheduledContentModel.find({
        status: BlogPostStatus.SCHEDULED,
        publishAt: { $lte: new Date() },
      });

      // Convert to IScheduledContent[]
      return scheduledContent.map((content) => ({
        id: (content._id as Types.ObjectId).toString(),
        type: content.type,
        content: content.content,
        authorId: content.authorId,
        publishAt: content.publishAt,
        status: content.status,
        timezone: content.timezone,
        version: content.version,
      }));
    } catch (error) {
      throw ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
        category: ErrorCategory.DATABASE,
        context: {
          operation: 'SchedulingService.getScheduledContent',
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * Calculate publish date
   * @param delayHours Optional delay hours
   * @returns Date
   */
  private calculatePublishDate(delayHours?: number): Date {
    return new Date(Date.now() + (delayHours || this.defaultDelayHours) * 60 * 60 * 1000);
  }

  /**
   * Get default delay hours
   * @returns number
   */
  public getDefaultDelayHours(): number {
    return this.defaultDelayHours;
  }

  /**
   * Set default delay hours
   * @param hours The delay hours
   */
  public setDefaultDelayHours(hours: number): void {
    this.defaultDelayHours = hours;
  }

  /**
   * Add pending update
   * @param update The pending update
   */
  public async addPendingUpdate(update: IPendingUpdate): Promise<void> {
    this.pendingUpdates.set(update.id, update);
  }

  /**
   * Get pending update
   * @param id The update ID
   * @returns Promise<IPendingUpdate | null>
   */
  public async getPendingUpdate(id: string): Promise<IPendingUpdate | null> {
    return this.pendingUpdates.get(id) || null;
  }

  /**
   * Remove pending update
   * @param id The update ID
   */
  public async removePendingUpdate(id: string): Promise<void> {
    this.pendingUpdates.delete(id);
  }

  /**
   * Update health status
   * @param status The health status
   */
  public async updateHealthStatus(status: HealthStatus): Promise<void> {
    this.healthStatus = status;
  }
}

export default SchedulingService.getInstance();
