import type { Request, Response } from 'express';
import { SchedulingService } from '../services/SchedulingService';
import publicationService from '../services/PublicationService';
import { UpdateService } from '../services/UpdateService';
import ErrorHandler, { ErrorCategory, ErrorSeverity } from '../services/ErrorHandler';
import MonitoringService from '../services/MonitoringService';
import type { IUser } from '../types/user';
import type { IComment } from '../models/CommentModel';
import { CommentStatus } from '../models/CommentModel';
import { Types } from 'mongoose';
import { ContentType, UpdateStatus } from '../models/UpdateModel';
import { BlogPostStatus } from '../domains/blog/models/BlogPostModel';
import { BlogPostModel } from '../models';

// Define AuthUser interface since the import is missing
interface AuthUser {
  id: string;
  username?: string;
  isAdmin?: boolean;
  email?: string;
}

export class CommentController {
  private schedulingService: typeof SchedulingService;
  private publicationService: typeof publicationService;
  private updateService: typeof UpdateService;
  private errorHandler: typeof ErrorHandler;
  private monitoringService: typeof MonitoringService;

  constructor() {
    this.schedulingService = SchedulingService;
    this.publicationService = publicationService;
    this.updateService = UpdateService;
    this.errorHandler = ErrorHandler;
    this.monitoringService = MonitoringService;
  }

  // Schedule a comment for publication
  public async scheduleComment(req: Request, res: Response): Promise<void> {
    try {
      const { content, postId, publishAt } = req.body;

      if (!content || !postId) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Get the user from the request
      const authUser = req.user as AuthUser;
      if (!authUser) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Convert AuthUser to IUser
      const user: IUser = {
        id: authUser.id,
        email: authUser.email || '',
        username: authUser.username || '',
        isAdmin: authUser.isAdmin || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Create a new comment
      const comment: Partial<IComment> = {
        content,
        postId: new Types.ObjectId(postId),
        authorId: new Types.ObjectId(user.id),
        status: CommentStatus.DRAFT,
        timezone: 'UTC',
        version: 1,
        hasActiveUpdate: false,
      };

      // Create a temporary blog post object for scheduling
      // We'll use the BlogPostModel to create a proper document
      const tempBlogPost = new BlogPostModel({
        title: 'Comment',
        content: content,
        slug: `comment-${Date.now()}`,
        excerpt: content.substring(0, 100),
        author: {
          type: 'user',
          id: new Types.ObjectId(user.id),
          name: user.username,
        },
        status: BlogPostStatus.DRAFT,
        publishAt: publishAt ? new Date(publishAt) : new Date(),
        version: 1,
        hasActiveUpdate: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        timezone: 'UTC',
        isPublished: false,
        publishedAt: null,
      });

      // Schedule the comment for publication
      const scheduledComment = await this.schedulingService
        .getInstance()
        .scheduleComment(tempBlogPost, publishAt ? new Date(publishAt) : new Date());

      res.status(201).json({ comment: scheduledComment });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.errorHandler.handleError(new Error(errorMessage), {
        message: errorMessage,
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.SCHEDULING,
        timestamp: new Date(),
        context: { action: 'scheduleComment' },
      });
      res.status(500).json({ error: errorMessage });
    }
  }

  // Update a comment
  public async updateComment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { content, publishAt } = req.body;

      if (!content) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Get the user from the request
      const authUser = req.user as AuthUser;
      if (!authUser) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Convert AuthUser to IUser
      const user: IUser = {
        id: authUser.id,
        email: authUser.email || '',
        username: authUser.username || '',
        isAdmin: authUser.isAdmin || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Create an update for the comment
      const updatedComment = await this.updateService.getInstance().createUpdate({
        contentType: ContentType.COMMENT,
        contentId: id,
        status: UpdateStatus.PENDING,
        details: {
          content,
          authorId: user.id,
          reason: 'User update',
        },
      });

      if (!updatedComment.success) {
        res.status(400).json({ error: updatedComment.error });
        return;
      }

      // If publishAt is provided, reschedule the comment
      if (publishAt) {
        await this.schedulingService.getInstance().rescheduleContent(id, new Date(publishAt));
      }

      res.status(200).json({ comment: updatedComment.update });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.errorHandler.handleError(new Error(errorMessage), {
        message: errorMessage,
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.UPDATE,
        timestamp: new Date(),
        context: { action: 'updateComment' },
      });
      res.status(500).json({ error: errorMessage });
    }
  }

  // Cancel a scheduled comment
  public async cancelComment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Get the user from the request
      const authUser = req.user as AuthUser;
      if (!authUser) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Cancel the scheduled comment
      await this.schedulingService.getInstance().cancelScheduledContent(id);

      res.status(200).json({ message: 'Comment cancelled successfully' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.errorHandler.handleError(new Error(errorMessage), {
        message: errorMessage,
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.SCHEDULING,
        timestamp: new Date(),
        context: { action: 'cancelComment' },
      });
      res.status(500).json({ error: errorMessage });
    }
  }

  // Reschedule a comment
  public async rescheduleComment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { publishAt } = req.body;

      if (!publishAt) {
        res.status(400).json({ error: 'Missing publishAt field' });
        return;
      }

      // Get the user from the request
      const authUser = req.user as AuthUser;
      if (!authUser) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Reschedule the comment
      const rescheduledComment = await this.schedulingService
        .getInstance()
        .rescheduleContent(id, new Date(publishAt));

      res.status(200).json({ comment: rescheduledComment });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.errorHandler.handleError(new Error(errorMessage), {
        message: errorMessage,
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.SCHEDULING,
        timestamp: new Date(),
        context: { action: 'rescheduleComment' },
      });
      res.status(500).json({ error: errorMessage });
    }
  }

  // Get scheduled comments for a user
  public async getScheduledComments(req: Request, res: Response): Promise<void> {
    try {
      // Get the user from the request
      const authUser = req.user as AuthUser;
      if (!authUser) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Get scheduled comments for the user
      const scheduledComments = await this.schedulingService
        .getInstance()
        .getScheduledContentByAuthor(authUser.id);

      res.status(200).json({ comments: scheduledComments });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.errorHandler.handleError(new Error(errorMessage), {
        message: errorMessage,
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.SCHEDULING,
        timestamp: new Date(),
        context: { action: 'getScheduledComments' },
      });
      res.status(500).json({ error: errorMessage });
    }
  }

  // Get the status of a scheduled comment
  public async getCommentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Get the status of the scheduled comment
      const status = await this.schedulingService.getInstance().getScheduledContentById(id);

      if (!status) {
        res.status(404).json({ error: 'Comment not found' });
        return;
      }

      res.status(200).json({ status });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.errorHandler.handleError(new Error(errorMessage), {
        message: errorMessage,
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.SCHEDULING,
        timestamp: new Date(),
        context: { action: 'getCommentStatus' },
      });
      res.status(500).json({ error: errorMessage });
    }
  }

  // Publish a comment immediately
  public async publishComment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Get the user from the request
      const authUser = req.user as AuthUser;
      if (!authUser) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Publish the comment immediately - using the instance directly
      await this.publicationService.publishContent(id, 'comment');

      res.status(200).json({ message: 'Comment published successfully' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.errorHandler.handleError(new Error(errorMessage), {
        message: errorMessage,
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.UNKNOWN,
        timestamp: new Date(),
        context: { action: 'publishComment' },
      });
      res.status(500).json({ error: errorMessage });
    }
  }
}
