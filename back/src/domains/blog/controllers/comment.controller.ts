import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import CommentModel, { CommentStatus } from '../models/CommentModel';
import BlogPostModel from '../models/BlogPostModel';
import User from '../../users/models/user.model';

// Validation rules
export const createCommentValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),
];

// Create a new comment
export const createComment = async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content } = req.body;
    const postId = req.params.postId;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Check if post exists
    const post = await BlogPostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create new comment
    const comment = new CommentModel({
      content,
      postId,
      userId,
      status: user.role === 'admin' ? CommentStatus.APPROVED : CommentStatus.PENDING
    });

    await comment.save();

    return res.status(201).json({
      message: 'Comment created successfully',
      comment: {
        id: comment._id,
        content: comment.content,
        status: comment.status,
        createdAt: comment.createdAt,
        user: {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    console.error('Create comment error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get comments for a post
export const getComments = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;
    const userId = req.user?.id;

    // Check if post exists
    const post = await BlogPostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Get comments with user details
    const comments = await CommentModel.find({ postId })
      .populate('userId', 'firstName lastName avatar')
      .sort({ createdAt: -1 });

    // Filter comments based on user role
    const filteredComments = comments.filter(comment => {
      if (userId && comment.userId._id.toString() === userId) {
        return true; // User can see their own comments
      }
      return comment.status === CommentStatus.APPROVED; // Only show approved comments to others
    });

    return res.json({
      comments: filteredComments.map(comment => ({
        id: comment._id,
        content: comment.content,
        status: comment.status,
        createdAt: comment.createdAt,
        user: {
          id: comment.userId._id,
          name: `${comment.userId.firstName} ${comment.userId.lastName}`,
          avatar: comment.userId.avatar
        }
      }))
    });
  } catch (error) {
    console.error('Get comments error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update comment status (admin only)
export const updateCommentStatus = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Check if user is admin
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if comment exists
    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Update comment status
    comment.status = status;
    await comment.save();

    return res.json({
      message: 'Comment status updated successfully',
      comment: {
        id: comment._id,
        status: comment.status
      }
    });
  } catch (error) {
    console.error('Update comment status error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Delete comment
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Check if comment exists
    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is admin or comment owner
    const user = await User.findById(userId);
    if (!user || (user.role !== 'admin' && comment.userId.toString() !== userId)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await comment.deleteOne();

    return res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}; 