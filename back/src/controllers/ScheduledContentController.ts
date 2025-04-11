import type { Request, Response } from 'express';
import { SchedulingService } from '../services/SchedulingService';
import ErrorHandler from '../services/ErrorHandler';
import { ErrorSeverity, ErrorCategory } from '../services/ErrorHandler';
import type { IUser } from '../domains/users/models/user.model';

export class ScheduledContentController {
  private static instance: ScheduledContentController;
  private schedulingService: SchedulingService;

  private constructor() {
    this.schedulingService = SchedulingService.getInstance();
  }

  public static getInstance(): ScheduledContentController {
    if (!ScheduledContentController.instance) {
      ScheduledContentController.instance = new ScheduledContentController();
    }
    return ScheduledContentController.instance;
  }

  /**
   * Get all scheduled content for the authenticated user
   */
  public async getScheduledContent(req: Request, res: Response): Promise<void> {
    try {
      const content = await this.schedulingService.getScheduledContent();
      res.json({ success: true, data: content });
    } catch (error) {
      ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.DATABASE,
      });
      res.status(500).json({ success: false, error: 'Failed to fetch scheduled content' });
    }
  }

  /**
   * Get scheduled content by ID
   */
  public async getScheduledContentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ success: false, error: 'Missing required parameters' });
        return;
      }

      const content = await this.schedulingService.getScheduledContentById(id);

      if (!content) {
        res.status(404).json({ success: false, error: 'Scheduled content not found' });
        return;
      }

      res.json({ success: true, data: content });
    } catch (error) {
      ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.DATABASE,
      });
      res.status(500).json({ success: false, error: 'Failed to fetch scheduled content' });
    }
  }

  /**
   * Cancel scheduled content
   */
  public async cancelScheduledContent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user as IUser;

      if (!id || !user?._id) {
        res.status(400).json({ success: false, error: 'Missing required parameters' });
        return;
      }

      const content = await this.schedulingService.cancelScheduledContent(id);

      if (!content) {
        res.status(404).json({ success: false, error: 'Scheduled content not found' });
        return;
      }

      res.json({ success: true, data: content });
    } catch (error) {
      ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.DATABASE,
      });
      res.status(500).json({ success: false, error: 'Failed to cancel scheduled content' });
    }
  }

  /**
   * Retry failed publication
   */
  public async retryPublication(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user as IUser;

      if (!id || !user?._id) {
        res.status(400).json({ success: false, error: 'Missing required parameters' });
        return;
      }

      // Calculate new publish date (24 hours from now)
      const newPublishAt = new Date();
      newPublishAt.setHours(newPublishAt.getHours() + 24);

      const content = await this.schedulingService.rescheduleContent(id, newPublishAt);

      res.json({ success: true, data: content });
    } catch (error) {
      ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), {
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.DATABASE,
      });
      res.status(500).json({ success: false, error: 'Failed to retry publication' });
    }
  }
}
