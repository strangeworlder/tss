import { Router } from 'express';
import { ScheduledContentController } from '../controllers/ScheduledContentController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const controller = ScheduledContentController.getInstance();

// Get all scheduled content for the authenticated user
router.get('/', authenticateToken, controller.getScheduledContent.bind(controller));

// Get scheduled content by ID
router.get('/:contentId', authenticateToken, controller.getScheduledContentById.bind(controller));

// Cancel scheduled content
router.post(
  '/:contentId/cancel',
  authenticateToken,
  controller.cancelScheduledContent.bind(controller)
);

// Retry failed publication
router.post('/:contentId/retry', authenticateToken, controller.retryPublication.bind(controller));

export default router;
