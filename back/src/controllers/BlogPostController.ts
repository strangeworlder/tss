import type { Request, Response } from 'express';
import SchedulingService from '../services/SchedulingService';
import PublicationService from '../services/PublicationService';
import ErrorHandler, { ErrorSeverity, ErrorCategory } from '../services/ErrorHandler';
import MonitoringService from '../services/MonitoringService';
import type { IUser } from '../types/user';
import type { IBlogPost } from '../domains/blog/models/BlogPostModel';
import type { AuthUser } from '../types/express';
import { Types } from 'mongoose';

export class BlogPostController {
  private static instance: BlogPostController;

  private constructor() {
    // Private constructor to prevent external instantiation
  }

  public static getInstance(): BlogPostController {
    if (!BlogPostController.instance) {
      BlogPostController.instance = new BlogPostController();
    }
    return BlogPostController.instance;
  }

  private convertAuthUserToIUser(authUser: AuthUser): IUser {
    return {
      id: authUser.id,
      email: authUser.email,
      username: authUser.email.split('@')[0], // Default username from email
      isAdmin: authUser.role === 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  public async createBlogPost(req: Request, res: Response): Promise<void> {
    try {
      const authUser = req.user as AuthUser;
      if (!authUser) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }
      const user = this.convertAuthUserToIUser(authUser);
      const post = {
        ...req.body,
        _id: new Types.ObjectId(),
      } as IBlogPost & { _id: Types.ObjectId };

      const publishAt = req.body.publishAt ? new Date(req.body.publishAt) : new Date();
      const scheduledContent = await SchedulingService.schedulePost(post, publishAt);
      MonitoringService.emit('event', { type: 'blog_post_created', postId: scheduledContent.id });

      res.status(201).json({
        success: true,
        data: scheduledContent,
      });
    } catch (error) {
      ErrorHandler.handleError(error as Error, {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.UPDATE,
        context: { operation: 'createBlogPost' },
      });

      res.status(500).json({
        success: false,
        message: 'Failed to create blog post',
      });
    }
  }

  public async updateBlogPost(req: Request, res: Response): Promise<void> {
    try {
      const authUser = req.user as AuthUser;
      if (!authUser) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }
      const user = this.convertAuthUserToIUser(authUser);
      const { id } = req.params;
      const update = req.body;

      const updatedContent = await SchedulingService.updateScheduledContent(id, update.content);
      MonitoringService.emit('event', { type: 'blog_post_updated', postId: id });

      res.status(200).json({
        success: true,
        data: updatedContent,
      });
    } catch (error) {
      ErrorHandler.handleError(error as Error, {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.UPDATE,
        context: { operation: 'updateBlogPost' },
      });

      res.status(500).json({
        success: false,
        message: 'Failed to update blog post',
      });
    }
  }

  public async cancelBlogPost(req: Request, res: Response): Promise<void> {
    try {
      const authUser = req.user as AuthUser;
      if (!authUser) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }
      const user = this.convertAuthUserToIUser(authUser);
      const { id } = req.params;

      await SchedulingService.cancelScheduledContent(id);
      MonitoringService.emit('event', { type: 'blog_post_cancelled', postId: id });

      res.status(200).json({
        success: true,
        message: 'Blog post cancelled successfully',
      });
    } catch (error) {
      ErrorHandler.handleError(error as Error, {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.UPDATE,
        context: { operation: 'cancelBlogPost' },
      });

      res.status(500).json({
        success: false,
        message: 'Failed to cancel blog post',
      });
    }
  }

  public async rescheduleBlogPost(req: Request, res: Response): Promise<void> {
    try {
      const authUser = req.user as AuthUser;
      if (!authUser) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }
      const user = this.convertAuthUserToIUser(authUser);
      const { id } = req.params;
      const { delayHours } = req.body;

      const rescheduledContent = await SchedulingService.rescheduleContent(id, delayHours);
      MonitoringService.emit('event', { type: 'blog_post_rescheduled', postId: id });

      res.status(200).json({
        success: true,
        data: rescheduledContent,
      });
    } catch (error) {
      ErrorHandler.handleError(error as Error, {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.UPDATE,
        context: { operation: 'rescheduleBlogPost' },
      });

      res.status(500).json({
        success: false,
        message: 'Failed to reschedule blog post',
      });
    }
  }

  public async getScheduledBlogPosts(req: Request, res: Response): Promise<void> {
    try {
      const authUser = req.user as AuthUser;
      if (!authUser) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }
      const user = this.convertAuthUserToIUser(authUser);
      const scheduledContent = await SchedulingService.getScheduledContentByAuthor(user.id);

      res.status(200).json({
        success: true,
        data: scheduledContent,
      });
    } catch (error) {
      ErrorHandler.handleError(error as Error, {
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.UPDATE,
        context: { operation: 'getScheduledBlogPosts' },
      });

      res.status(500).json({
        success: false,
        message: 'Failed to get scheduled blog posts',
      });
    }
  }

  public async getBlogPostStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const content = await SchedulingService.getScheduledContentById(id);

      if (!content) {
        res.status(404).json({
          success: false,
          message: 'Blog post not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: content,
      });
    } catch (error) {
      ErrorHandler.handleError(error as Error, {
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.UPDATE,
        context: { operation: 'getBlogPostStatus' },
      });

      res.status(500).json({
        success: false,
        message: 'Failed to get blog post status',
      });
    }
  }

  public async retryPublication(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await PublicationService.publishContent(id, 'post');
      MonitoringService.emit('event', { type: 'blog_post_retried', postId: id });

      res.status(200).json({
        success: true,
        message: 'Publication retried successfully',
      });
    } catch (error) {
      ErrorHandler.handleError(error as Error, {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.UPDATE,
        context: { operation: 'retryPublication' },
      });

      res.status(500).json({
        success: false,
        message: 'Failed to retry publication',
      });
    }
  }
}
