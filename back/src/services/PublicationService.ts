import type { Types } from 'mongoose';
import { BlogPostModel } from '../models';
import { CommentModel, CommentStatus } from '../domains/blog/models/CommentModel';
import { BlogPostModerationStatus, type IBlogPost } from '@shared/types/blog';
import type { IComment } from '../domains/blog/models/CommentModel';
import { EventEmitter } from 'node:events';
import ErrorHandler, { ErrorSeverity, ErrorCategory } from './ErrorHandler';
import MonitoringService, { HealthStatus } from './MonitoringService';
import { toBlogPost } from '../domains/blog/models/BlogPostModel';

/**
 * Event emitted when content is published
 */
export interface IPublicationEvent {
  contentId: string;
  type: 'post' | 'comment';
  status: string | CommentStatus;
  timestamp: Date;
  content: IBlogPost | IComment;
}

/**
 * Represents a failed publication attempt
 */
export interface IFailedPublication {
  contentId: string;
  type: 'post' | 'comment';
  error: string;
  timestamp: Date;
  retryCount: number;
}

/**
 * Custom error class for publication failures
 */
export class PublicationError extends Error {
  constructor(
    message: string,
    public readonly contentId: string,
    public readonly type: 'post' | 'comment',
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'PublicationError';
  }
}

/**
 * Service responsible for managing content publication
 * Handles both posts and comments, with retry mechanisms and monitoring
 */
class PublicationService extends EventEmitter {
  private static instance: PublicationService;
  private failedPublications: IFailedPublication[] = [];
  private maxRetries = 3;

  private constructor() {
    super();
  }

  /**
   * Get the singleton instance of the PublicationService
   */
  public static getInstance(): PublicationService {
    if (!PublicationService.instance) {
      PublicationService.instance = new PublicationService();
    }
    return PublicationService.instance;
  }

  /**
   * Publish content (blog post or comment)
   * @param contentId The ID of the content to publish
   * @param type The type of content ('post' | 'comment')
   */
  public async publishContent(contentId: string, type: 'post' | 'comment'): Promise<void> {
    try {
      if (type === 'post') {
        const post = await BlogPostModel.findById(contentId);
        if (!post) {
          throw new PublicationError('Post not found', contentId, type);
        }

        // Update post status
        post.status = 'PUBLISHED';
        post.publishedAt = new Date().toISOString();
        post.isPublished = true;
        await post.save();

        // Update monitoring
        MonitoringService.updateHealthCheck('publication', {
          name: 'publication',
          status: HealthStatus.HEALTHY,
          message: `Successfully published post ${contentId}`,
          timestamp: new Date(),
        });

        // Emit publication event
        const blogPost = toBlogPost(post);
        const publicationEvent: IPublicationEvent = {
          contentId: post._id.toString(),
          type: 'post',
          status: 'PUBLISHED',
          timestamp: new Date(),
          content: blogPost as unknown as IBlogPost | IComment,
        };
        this.emit('contentPublished', publicationEvent);
      } else {
        const comment = await CommentModel.findById(contentId);
        if (!comment) {
          throw new PublicationError('Comment not found', contentId, type);
        }

        // Update comment status
        comment.status = CommentStatus.PUBLISHED;
        await comment.save();

        // Update monitoring
        MonitoringService.updateHealthCheck('publication', {
          name: 'publication',
          status: HealthStatus.HEALTHY,
          message: `Successfully published comment ${contentId}`,
          timestamp: new Date(),
        });

        this.emit('commentPublished', comment);
      }
    } catch (error) {
      // Update monitoring
      MonitoringService.updateHealthCheck('publication', {
        name: 'publication',
        status: HealthStatus.DEGRADED,
        message: `Failed to publish ${type} ${contentId}`,
        timestamp: new Date(),
      });

      // Log error
      ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.UPDATE,
        context: {
          contentId,
          type,
          status: type === 'post' ? 'PUBLISHED' : CommentStatus.PUBLISHED,
          moderationStatus:
            type === 'post' ? BlogPostModerationStatus.APPROVED : CommentStatus.APPROVED,
        },
      });

      // Record failed publication
      this.recordFailedPublication(contentId, type, error);

      throw new PublicationError(
        `Failed to publish ${type}`,
        contentId,
        type,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Record a failed publication attempt
   * @param contentId The ID of the content that failed to publish
   * @param type The type of content ('post' | 'comment')
   * @param error The error that occurred
   */
  private recordFailedPublication(
    contentId: string,
    type: 'post' | 'comment',
    error: unknown
  ): void {
    const now = new Date();
    const existingFailure = this.failedPublications.find((pub) => pub.contentId === contentId);

    if (existingFailure) {
      existingFailure.retryCount++;
      existingFailure.timestamp = now;
      existingFailure.error = error instanceof Error ? error.message : 'Unknown error';
    } else {
      this.failedPublications.push({
        contentId,
        type,
        timestamp: now,
        retryCount: 1,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    console.error(`Failed publication recorded for ${type} ${contentId}`);
  }

  /**
   * Retry failed publications
   */
  public async retryFailedPublications(): Promise<void> {
    const now = new Date();
    const retryablePublications = this.failedPublications.filter(
      (pub) => pub.retryCount < this.maxRetries
    );

    console.log(`Retrying ${retryablePublications.length} failed publications`);

    for (const publication of retryablePublications) {
      try {
        await this.publishContent(publication.contentId, publication.type);
        this.failedPublications = this.failedPublications.filter(
          (pub) => pub.contentId !== publication.contentId
        );
        console.log(
          `Successfully retried publication for ${publication.type} ${publication.contentId}`
        );
      } catch (error) {
        publication.retryCount++;
        publication.timestamp = now;
        console.error(
          `Failed to retry publication for ${publication.type} ${publication.contentId}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  }

  /**
   * Get content that is ready to be published
   * @returns Array of content IDs and types ready for publication
   */
  public async getContentReadyForPublication(): Promise<
    Array<{ id: string; type: 'post' | 'comment' }>
  > {
    const readyContent: Array<{ id: string; type: 'post' | 'comment' }> = [];

    try {
      // Get scheduled posts
      const scheduledPosts = await BlogPostModel.find({
        status: 'SCHEDULED',
        publishAt: { $lte: new Date() },
      });

      readyContent.push(
        ...scheduledPosts.map((post) => ({ id: post._id.toString(), type: 'post' as const }))
      );

      // Get scheduled comments
      const scheduledComments = await CommentModel.find({
        status: CommentStatus.SCHEDULED,
        publishAt: { $lte: new Date() },
      });

      readyContent.push(
        ...scheduledComments.map((comment) => ({
          id: comment._id.toString(),
          type: 'comment' as const,
        }))
      );

      console.log(`Found ${readyContent.length} items ready for publication`);
      return readyContent;
    } catch (error) {
      throw ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
        category: ErrorCategory.DATABASE,
        context: {
          operation: 'PublicationService.getContentReadyForPublication',
        },
      });
    }
  }

  /**
   * Check if content is ready to be published
   * @param contentId The ID of the content to check
   * @param type The type of content ('post' | 'comment')
   * @returns Whether the content is ready to be published
   */
  public async isContentReadyForPublication(
    contentId: string,
    type: 'post' | 'comment'
  ): Promise<boolean> {
    try {
      if (type === 'post') {
        const post = await BlogPostModel.findById(contentId);
        return post?.status === 'SCHEDULED' && post.publishAt && post.publishAt <= new Date();
      }
      const comment = await CommentModel.findById(contentId);
      return (
        comment?.status === CommentStatus.SCHEDULED &&
        comment.publishAt &&
        comment.publishAt <= new Date()
      );
    } catch (error) {
      throw ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
        category: ErrorCategory.DATABASE,
        context: {
          operation: 'PublicationService.isContentReadyForPublication',
          contentId,
          type,
        },
      });
    }
  }
}

export default PublicationService;
