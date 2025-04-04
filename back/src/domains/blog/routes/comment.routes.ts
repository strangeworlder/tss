import express from 'express';
import { createComment, getComments, updateCommentStatus, deleteComment, createCommentValidation } from '../controllers/comment.controller';
import { authenticateToken } from '../../../middleware/auth';

const router = express.Router();

// Logging middleware for comment routes
router.use((req, res, next) => {
  console.log('Comment route hit:', {
    method: req.method,
    path: req.path,
    params: req.params,
    query: req.query,
    body: req.body,
    headers: {
      authorization: req.headers.authorization ? 'Present' : 'Missing',
      'content-type': req.headers['content-type']
    }
  });
  next();
});

// Create a new comment (requires authentication)
router.post('/posts/comments', authenticateToken, createCommentValidation, createComment);

// Get comments for a post (public)
router.get('/posts/:postId/comments', getComments);

// Update comment status (admin only)
router.patch('/comments/:commentId/status', authenticateToken, updateCommentStatus);

// Delete a comment (admin or comment author)
router.delete('/comments/:commentId', authenticateToken, deleteComment);

export default router; 