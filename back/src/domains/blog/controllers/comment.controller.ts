import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { CommentModel, CommentStatus } from '../models/CommentModel';
import { BlogPostModel } from '../models/BlogPostModel';
import { User, IUser } from '../../users/models/user.model';
import mongoose from 'mongoose';
import { validateObjectId } from '../../../utils/validation';

// Validation rules
export const createCommentValidation = (req: Request, res: Response, next: Function) => {
  const { title, content, parentId, parentType } = req.body;

  if (!title || !content || !parentId || !parentType) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields',
      errors: {
        title: !title ? 'Title is required' : undefined,
        content: !content ? 'Content is required' : undefined,
        parentId: !parentId ? 'Parent ID is required' : undefined,
        parentType: !parentType ? 'Parent type is required' : undefined
      }
    });
  }

  if (!validateObjectId(parentId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid parent ID format'
    });
  }

  if (!['post', 'comment'].includes(parentType)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid parent type. Must be either "post" or "comment"'
    });
  }

  next();
};

// Create a new comment
export const createComment = async (req: Request, res: Response) => {
  try {
    const { title, content, parentId, parentType } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Validate parentId format
    if (!validateObjectId(parentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid parent ID format'
      });
    }

    // Check if parent exists
    const parent = parentType === 'post' 
      ? await BlogPostModel.findById(parentId)
      : await CommentModel.findById(parentId);

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: `${parentType === 'post' ? 'Post' : 'Comment'} not found`
      });
    }

    // Get user information
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create the comment
    const comment = await CommentModel.create({
      title,
      content,
      parentId,
      parentType,
      author: {
        type: 'user',
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        avatar: {
          filename: user.avatar?.filename || '',
          altText: `${user.firstName} ${user.lastName}'s avatar`
        }
      },
      status: CommentStatus.PENDING
    });

    // Populate author information
    const populatedComment = await CommentModel.findById(comment._id);

    return res.status(201).json({
      success: true,
      data: {
        comment: populatedComment
      }
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create comment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get comments for a post
export const getComments = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { parentType } = req.query;

    if (!validateObjectId(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID format'
      });
    }

    const query: any = { parentId: postId };
    if (parentType) {
      query.parentType = parentType;
    }

    const comments = await CommentModel.find(query)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        comments
      }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch comments',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update comment status
export const updateCommentStatus = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!validateObjectId(commentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid comment ID format'
      });
    }

    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Only allow admins to update status
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update comment status'
      });
    }

    comment.status = status;
    await comment.save();

    return res.status(200).json({
      success: true,
      data: {
        comment
      }
    });
  } catch (error) {
    console.error('Error updating comment status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update comment status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete a comment
export const deleteComment = async (req: Request, res: Response) => {
  try {
    console.log('Delete comment request received:', {
      commentId: req.params.commentId,
      user: req.user ? {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      } : 'No user in request'
    });

    if (!req.user) {
      console.log('Authentication failed: No user in request');
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { commentId } = req.params;
    if (!commentId || !validateObjectId(commentId)) {
      console.log('Invalid comment ID:', commentId);
      return res.status(400).json({
        success: false,
        message: 'Invalid comment ID'
      });
    }

    const comment = await CommentModel.findById(commentId);
    console.log('Comment lookup result:', {
      commentId,
      found: !!comment,
      commentAuthor: comment?.author?.id,
      requestUser: req.user.id
    });

    if (!comment) {
      console.log('Comment not found:', commentId);
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is admin or comment author
    const isAdmin = req.user.role === 'admin';
    const isAuthor = comment.author.id === req.user.id;
    console.log('Authorization check:', {
      isAdmin,
      isAuthor,
      commentAuthorId: comment.author.id,
      requestUserId: req.user.id
    });

    if (!isAdmin && !isAuthor) {
      console.log('Authorization failed:', {
        userRole: req.user.role,
        commentAuthorId: comment.author.id,
        requestUserId: req.user.id
      });
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    await CommentModel.findByIdAndDelete(commentId);
    console.log('Comment deleted successfully:', commentId);

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete comment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 