import type { Types, Document } from 'mongoose';
import { BlogPostModel, CommentModel } from '../models';
import { BlogPostStatus } from '../domains/blog/models/BlogPostModel';
import { CommentStatus } from '../domains/blog/models/CommentModel';
import { EventEmitter } from 'node:events';
import type { IBlogPost } from '../domains/blog/models/BlogPostModel';
import type { IComment } from '../models/CommentModel';
import ErrorHandler from './ErrorHandler';
import MonitoringService from './MonitoringService';
import { ErrorCategory, ErrorSeverity } from './ErrorHandler';
import { HealthStatus } from './MonitoringService';

// Define interfaces with proper _id typing
interface IBlogPostWithId extends IBlogPost {
  _id: Types.ObjectId;
}

interface ICommentWithId extends IComment {
  _id: Types.ObjectId;
}

export interface IPublicationEvent {
  contentId: string;
  type: 'post' | 'comment';
  status: BlogPostStatus | CommentStatus;
  timestamp: Date;
}

export interface IFailedPublication {
  contentId: string;
  type: 'post' | 'comment';
  error: string;
  timestamp: Date;
  retryCount: number;
}

class PublicationService extends EventEmitter {
  private static instance: PublicationService;
  private failedPublications: IFailedPublication[] = [];
  private maxRetries = 3;

  private constructor() {
    super();
  }

  public static getInstance(): PublicationService {
    if (!PublicationService.instance) {
      PublicationService.instance = new PublicationService();
    }
    return PublicationService.instance;
  }

  /**
   * Publish scheduled content
   * @param contentId The ID of the content to publish
   * @param type The type of content ('post' | 'comment')
   * @returns Promise<void>
   */
  public async publishContent(contentId: string, type: 'post' | 'comment'): Promise<void> {
    try {
      if (type === 'post') {
        const post = await BlogPostModel.findById(contentId);
        if (!post) {
          throw new Error(`Post with ID ${contentId} not found`);
        }

        // Update post status to published
        post.status = 'published';
        post.publishedAt = new Date();
        await post.save();

        // Emit event for successful publication
        this.emit('contentPublished', {
          contentId,
          type,
          timestamp: new Date(),
        });

        // Update monitoring metrics
        MonitoringService.updateHealthCheck('publication', {
          name: 'publication',
          status: HealthStatus.HEALTHY,
          message: `Successfully published post ${contentId}`,
          timestamp: new Date(),
        });
      } else {
        const comment = await CommentModel.findById(contentId);
        if (!comment) {
          throw new Error(`Comment with ID ${contentId} not found`);
        }

        // Update comment status to published
        comment.status = 'published';
        comment.publishedAt = new Date();
        await comment.save();

        // Emit event for successful publication
        this.emit('contentPublished', {
          contentId,
          type,
          timestamp: new Date(),
        });

        // Update monitoring metrics
        MonitoringService.updateHealthCheck('publication', {
          name: 'publication',
          status: HealthStatus.HEALTHY,
          message: `Successfully published comment ${contentId}`,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      await this.handleFailedPublication(contentId, type, error as Error);
      throw error;
    }
  }

  /**
   * Publish an update to existing content
   * @param contentId The ID of the content to update
   * @param type The type of content ('post' | 'comment')
   * @param updateData The data to update
   * @returns Promise<void>
   */
  public async publishUpdate(
    contentId: string,
    type: 'post' | 'comment',
    updateData: Record<string, unknown>
  ): Promise<void> {
    try {
      if (type === 'post') {
        const post = await BlogPostModel.findById(contentId);
        if (!post) {
          throw new Error(`Post with ID ${contentId} not found`);
        }

        // Apply the update data
        Object.assign(post, updateData);
        post.status = 'published';
        post.publishedAt = new Date();
        await post.save();

        // Emit event for successful update
        this.emit('contentUpdated', {
          contentId,
          type,
          timestamp: new Date(),
        });

        // Update monitoring metrics
        MonitoringService.updateHealthCheck('publication', {
          name: 'publication',
          status: HealthStatus.HEALTHY,
          message: `Successfully updated post ${contentId}`,
          timestamp: new Date(),
        });
      } else {
        const comment = await CommentModel.findById(contentId);
        if (!comment) {
          throw new Error(`Comment with ID ${contentId} not found`);
        }

        // Apply the update data
        Object.assign(comment, updateData);
        comment.status = 'published';
        comment.publishedAt = new Date();
        await comment.save();

        // Emit event for successful update
        this.emit('contentUpdated', {
          contentId,
          type,
          timestamp: new Date(),
        });

        // Update monitoring metrics
        MonitoringService.updateHealthCheck('publication', {
          name: 'publication',
          status: HealthStatus.HEALTHY,
          message: `Successfully updated comment ${contentId}`,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      await this.handleFailedPublication(contentId, type, error as Error);
      throw error;
    }
  }

  /**
   * Handle failed publication attempts
   * @param contentId The ID of the content that failed to publish
   * @param type The type of content ('post' | 'comment')
   * @param error The error that occurred
   * @returns Promise<void>
   */
  public async handleFailedPublication(
    contentId: string,
    type: 'post' | 'comment',
    error: Error
  ): Promise<void> {
    // Log the error
    ErrorHandler.handleError(error, {
      contentId,
      contentType: type,
      category: ErrorCategory.UPDATE,
      severity: ErrorSeverity.HIGH,
    });

    // Track the failure
    const failedPublication: IFailedPublication = {
      contentId,
      type,
      error: error.message,
      timestamp: new Date(),
      retryCount: 0,
    };

    this.failedPublications.push(failedPublication);

    // Alert monitoring service
    MonitoringService.updateHealthCheck('publication', {
      name: 'publication',
      status: HealthStatus.UNHEALTHY,
      message: `Publication failed for ${type} ${contentId}: ${error.message}`,
      timestamp: new Date(),
      details: {
        contentId,
        type,
        error: error.message,
      },
    });

    this.emit('publicationFailed', {
      contentId,
      type,
      error: error.message,
      timestamp: new Date(),
    });
  }

  /**
   * Retry failed publications
   * @returns Promise<void>
   */
  public async retryFailedPublications(): Promise<void> {
    const failedPublicationsCopy = [...this.failedPublications];
    this.failedPublications = [];

    for (const failedPublication of failedPublicationsCopy) {
      try {
        // Attempt to publish the content again
        await this.publishContent(failedPublication.contentId, failedPublication.type);

        // Log successful retry
        ErrorHandler.handleError(
          new Error(
            `Successfully retried publication for ${failedPublication.type} ${failedPublication.contentId}`
          ),
          {
            contentId: failedPublication.contentId,
            contentType: failedPublication.type,
            category: ErrorCategory.UPDATE,
            severity: ErrorSeverity.LOW,
          }
        );
      } catch (error) {
        // If retry fails, add back to failed publications with incremented retry count
        this.failedPublications.push({
          ...failedPublication,
          retryCount: failedPublication.retryCount + 1,
          error: (error as Error).message,
        });

        // Log the retry failure
        ErrorHandler.handleError(error as Error, {
          contentId: failedPublication.contentId,
          contentType: failedPublication.type,
          category: ErrorCategory.UPDATE,
          severity: ErrorSeverity.MEDIUM,
        });
      }
    }

    // If there are still failed publications after retrying, update monitoring
    if (this.failedPublications.length > 0) {
      MonitoringService.updateHealthCheck('publication', {
        name: 'publication',
        status: HealthStatus.UNHEALTHY,
        message: `${this.failedPublications.length} publications still failed after retry`,
        timestamp: new Date(),
        details: {
          failedCount: this.failedPublications.length,
          failedIds: this.failedPublications.map((fp) => fp.contentId),
        },
      });
    }
  }

  /**
   * Get content that is ready to be published
   * @returns Promise<Array<{ id: string; type: 'post' | 'comment' }>>
   */
  public async getContentReadyForPublication(): Promise<
    Array<{ id: string; type: 'post' | 'comment' }>
  > {
    const now = new Date();

    const readyPosts = (await BlogPostModel.find({
      status: BlogPostStatus.SCHEDULED,
      publishAt: { $lte: now },
    })) as IBlogPostWithId[];

    const readyComments = (await CommentModel.find({
      status: CommentStatus.SCHEDULED,
      publishAt: { $lte: now },
    })) as ICommentWithId[];

    const posts = readyPosts.map((post) => ({
      id: post._id.toString(),
      type: 'post' as const,
    }));

    const comments = readyComments.map((comment) => ({
      id: comment._id.toString(),
      type: 'comment' as const,
    }));

    return [...posts, ...comments];
  }

  /**
   * Check if content is ready to be published
   * @param contentId The ID of the content to check
   * @param type The type of content ('post' or 'comment')
   * @returns Promise<boolean>
   */
  public async isContentReadyForPublication(
    contentId: string,
    type: 'post' | 'comment'
  ): Promise<boolean> {
    const now = new Date();

    if (type === 'post') {
      const post = await BlogPostModel.findOne({
        _id: contentId,
        status: BlogPostStatus.SCHEDULED,
        publishAt: { $lte: now },
      });
      return !!post;
    }
    const comment = await CommentModel.findOne({
      _id: contentId,
      status: CommentStatus.SCHEDULED,
      publishAt: { $lte: now },
    });
    return !!comment;
  }
}

export default PublicationService.getInstance();
