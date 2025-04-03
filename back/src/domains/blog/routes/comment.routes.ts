import { Router } from 'express';
import { authenticate, authorizeAdmin } from '../../../middlewares/auth.middleware';
import {
  createComment,
  getComments,
  updateCommentStatus,
  deleteComment,
  createCommentValidation
} from '../controllers/comment.controller';

const router = Router();

// Comment routes
router.post('/posts/:postId/comments', authenticate, createCommentValidation, createComment);
router.get('/posts/:postId/comments', getComments);
router.put('/comments/:commentId/status', authenticate, authorizeAdmin, updateCommentStatus);
router.delete('/comments/:commentId', authenticate, deleteComment);

export default router; 