import { EventEmitter } from 'node:events';
import ErrorHandler, { ErrorCategory, ErrorSeverity } from './ErrorHandler';
import MonitoringService, { HealthStatus } from './MonitoringService';
import type { IScheduledContent } from '../types/scheduling';
import { SchedulingService } from './SchedulingService';
import { Types } from 'mongoose';
import { BlogPostModel, type BlogPostStatus } from '../domains/blog/models/BlogPostModel';
import type { ModerationStatus } from '../domains/blog/types/BlogPostTypes';

/**
 * Interface for offline content that will be synced when back online
 */
export interface IOfflineContent {
  id: string;
  content: IScheduledContent;
  operation: 'create' | 'update' | 'delete';
  createdAt: Date;
  attempts: number;
  lastAttempt?: Date;
  error?: string;
}

/**
 * Events emitted by the OfflineContentService
 */
export enum OfflineContentEvent {
  CONTENT_QUEUED = 'contentQueued',
  CONTENT_SYNCED = 'contentSynced',
  CONTENT_SYNC_FAILED = 'contentSyncFailed',
  QUEUE_PROCESSED = 'queueProcessed',
  QUEUE_ERROR = 'queueError',
  QUEUE_CLEARED = 'queueCleared',
}

/**
 * Service for handling offline content storage and synchronization
 */
export class OfflineContentService extends EventEmitter {
  private static instance: OfflineContentService;
  private contentQueue: Map<string, IOfflineContent>;
  private isProcessing: boolean;
  private maxRetries: number;
  private retryDelay: number; // in milliseconds
  private errorHandler: typeof ErrorHandler;
  private monitoringService: typeof MonitoringService;
  private schedulingService: SchedulingService;

  private constructor() {
    super();
    this.contentQueue = new Map();
    this.isProcessing = false;
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 seconds
    this.errorHandler = ErrorHandler;
    this.monitoringService = MonitoringService;
    this.schedulingService = SchedulingService.getInstance();
    this.loadQueueFromStorage();
  }

  public static getInstance(): OfflineContentService {
    if (!OfflineContentService.instance) {
      OfflineContentService.instance = new OfflineContentService();
    }
    return OfflineContentService.instance;
  }

  /**
   * Queue content for later synchronization
   * @param content The scheduled content
   * @param operation The operation type
   */
  public async queueContent(
    content: IScheduledContent,
    operation: IOfflineContent['operation']
  ): Promise<void> {
    try {
      const offlineContent: IOfflineContent = {
        id: content.id,
        content,
        operation,
        createdAt: new Date(),
        attempts: 0,
      };

      this.contentQueue.set(content.id, offlineContent);
      this.saveQueueToStorage();

      this.emit(OfflineContentEvent.CONTENT_QUEUED, offlineContent);

      // Update monitoring
      MonitoringService.updateHealthCheck('offlineContent', {
        name: 'offlineContent',
        status: HealthStatus.HEALTHY,
        message: `Content queued: ${operation}`,
        timestamp: new Date(),
        details: {
          queueSize: this.contentQueue.size,
          lastContent: offlineContent,
        },
      });
    } catch (error) {
      throw ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.NETWORK,
        context: {
          operation: 'queueContent',
          contentId: content.id,
          type: operation,
        },
      });
    }
  }

  /**
   * Process queued content
   * @returns Promise<void>
   */
  public async processQueue(): Promise<void> {
    if (this.isProcessing || this.contentQueue.size === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const contentItems = Array.from(this.contentQueue.values());
      const currentTime = new Date();

      for (const content of contentItems) {
        // Skip if max retries reached
        if (content.attempts >= this.maxRetries) {
          this.contentQueue.delete(content.id);
          continue;
        }

        // Skip if not enough time has passed since last attempt
        if (
          content.lastAttempt &&
          currentTime.getTime() - content.lastAttempt.getTime() < this.retryDelay
        ) {
          continue;
        }

        try {
          await this.syncContent(content);
          this.contentQueue.delete(content.id);
          this.emit(OfflineContentEvent.CONTENT_SYNCED, content);
        } catch (error) {
          // Update attempt count and last attempt time
          content.attempts += 1;
          content.lastAttempt = new Date();
          content.error = error instanceof Error ? error.message : String(error);

          if (content.attempts >= this.maxRetries) {
            this.contentQueue.delete(content.id);
            this.emit(OfflineContentEvent.CONTENT_SYNC_FAILED, content);

            ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
              severity: ErrorSeverity.HIGH,
              category: ErrorCategory.NETWORK,
              context: {
                operation: 'processQueue',
                contentId: content.id,
                attempts: content.attempts,
                error: 'Max retries reached',
              },
            });
          }
        }
      }

      this.saveQueueToStorage();
      this.emit(OfflineContentEvent.QUEUE_PROCESSED, this.contentQueue.size);

      // Update monitoring
      MonitoringService.updateHealthCheck('offlineContent', {
        name: 'offlineContent',
        status: HealthStatus.HEALTHY,
        message: 'Queue processed successfully',
        timestamp: new Date(),
        details: {
          queueSize: this.contentQueue.size,
          processedAt: currentTime,
        },
      });
    } catch (error) {
      this.emit(OfflineContentEvent.QUEUE_ERROR, error);

      ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.NETWORK,
        context: {
          operation: 'processQueue',
          queueSize: this.contentQueue.size,
        },
      });
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Sync a single content item
   * @param content The offline content to sync
   */
  private async syncContent(content: IOfflineContent): Promise<void> {
    try {
      switch (content.operation) {
        case 'create':
          if (content.content.type === 'post') {
            const post = await BlogPostModel.create({
              title: content.content.content,
              content: content.content.content,
              author: new Types.ObjectId(content.content.authorId),
              status: content.content.status as BlogPostStatus,
              publishAt: content.content.publishAt,
              timezone: content.content.timezone,
              version: content.content.version,
              tags: [],
              slug: '',
              moderationStatus: 'pending' as ModerationStatus,
            });
            await this.schedulingService.schedulePost(post, content.content.publishAt);
          } else if (content.content.type === 'comment') {
            const comment = await BlogPostModel.create({
              title: '',
              content: content.content.content,
              author: new Types.ObjectId(content.content.authorId),
              status: content.content.status as BlogPostStatus,
              publishAt: content.content.publishAt,
              timezone: content.content.timezone,
              version: content.content.version,
              tags: [],
              slug: '',
              moderationStatus: 'pending' as ModerationStatus,
            });
            await this.schedulingService.scheduleComment(comment, content.content.publishAt);
          }
          break;
        case 'update':
          await this.schedulingService.updateScheduledContent(content.content.id, {
            content: content.content.content,
            publishAt: content.content.publishAt,
            status: content.content.status,
            timezone: content.content.timezone,
            version: content.content.version,
          });
          break;
        case 'delete':
          await this.schedulingService.cancelScheduledContent(content.content.id);
          break;
      }

      // Emit queue cleared event if this was the last item
      if (this.contentQueue.size === 1) {
        this.emit(OfflineContentEvent.QUEUE_CLEARED);
      }

      // Update monitoring
      this.monitoringService.updateHealthCheck('offlineContent', {
        name: 'offlineContent',
        status: HealthStatus.HEALTHY,
        message: `Content synced: ${content.operation}`,
        timestamp: new Date(),
        details: {
          contentId: content.id,
          operation: content.operation,
          type: content.content.type,
        },
      });
    } catch (error) {
      this.errorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.NETWORK,
        context: {
          operation: 'syncContent',
          contentId: content.id,
          type: content.operation,
        },
      });
      throw error;
    }
  }

  /**
   * Get all queued content
   */
  public getQueue(): IOfflineContent[] {
    return Array.from(this.contentQueue.values());
  }

  /**
   * Remove content from queue
   * @param id Content ID to remove
   */
  public removeFromQueue(id: string): void {
    this.contentQueue.delete(id);
    this.saveQueueToStorage();
  }

  /**
   * Get a specific queued content item
   * @param id The content ID
   * @returns IOfflineContent | undefined
   */
  public getQueuedContentById(id: string): IOfflineContent | undefined {
    return this.contentQueue.get(id);
  }

  /**
   * Clear all queued content
   */
  public clearQueue(): void {
    this.contentQueue.clear();
    this.saveQueueToStorage();
    this.emit(OfflineContentEvent.QUEUE_CLEARED);

    // Update monitoring
    MonitoringService.updateHealthCheck('offlineContent', {
      name: 'offlineContent',
      status: HealthStatus.HEALTHY,
      message: 'Queue cleared',
      timestamp: new Date(),
    });
  }

  /**
   * Get the current queue size
   * @returns number
   */
  public getQueueSize(): number {
    return this.contentQueue.size;
  }

  /**
   * Set the maximum number of retry attempts
   * @param maxRetries The maximum number of retries
   */
  public setMaxRetries(maxRetries: number): void {
    this.maxRetries = maxRetries;
  }

  /**
   * Load the queue from local storage
   */
  private loadQueueFromStorage(): void {
    try {
      const storedQueue = localStorage.getItem('offlineContentQueue');
      if (storedQueue) {
        const queueData = JSON.parse(storedQueue);
        for (const item of queueData) {
          this.contentQueue.set(item.id, {
            id: item.id,
            content: item.content,
            operation: item.operation,
            createdAt: new Date(item.createdAt),
            attempts: item.attempts || 0,
            lastAttempt: item.lastAttempt ? new Date(item.lastAttempt) : undefined,
            error: item.error,
          });
        }
      }
    } catch (error) {
      ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
        severity: ErrorSeverity.LOW,
        category: ErrorCategory.NETWORK,
        context: {
          operation: 'loadQueueFromStorage',
        },
      });
    }
  }

  /**
   * Save the queue to local storage
   */
  private saveQueueToStorage(): void {
    try {
      localStorage.setItem(
        'offlineContentQueue',
        JSON.stringify(Array.from(this.contentQueue.values()))
      );
    } catch (error) {
      ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
        severity: ErrorSeverity.LOW,
        category: ErrorCategory.NETWORK,
        context: {
          operation: 'saveQueueToStorage',
        },
      });
    }
  }
}
