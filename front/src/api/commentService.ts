import { apiGet, apiPost, apiDelete, apiRequest } from './apiClient';
import type { IComment, CreateCommentInput } from '@/types/comment';
import type { IApiResponse } from '@/types/blog';
import { CommentParentTypeEnum } from '@/types/comment';

interface CommentsResponse {
  comments: IComment[];
}

interface CommentResponse {
  comment: IComment;
}

export interface ICreateCommentParams {
  title?: string;
  content: string;
  parentId: string;
  parentType: CommentParentTypeEnum;
}

/**
 * Get comments for a post or replies for a comment
 * @param parentId The ID of the parent (post or comment)
 * @param parentType The type of the parent (CommentParentTypeEnum)
 * @returns Array of comments, with nested replies for post comments
 */
export const getComments = async (
  parentId: string,
  parentType: CommentParentTypeEnum
): Promise<IComment[]> => {
  try {
    const endpoint =
      parentType === CommentParentTypeEnum.POST
        ? `/v1/blog/posts/${parentId}/comments`
        : `/v1/blog/comments/${parentId}/replies`;

    const response = await apiGet<CommentsResponse>(endpoint);

    if (response?.success && response.data?.comments) {
      // Ensure each comment and its replies have an ID
      const processComment = (comment: IComment): IComment => ({
        ...comment,
        id: comment.id || String(comment._id),
        replies: comment.replies?.map(reply => processComment(reply))
      });

      return response.data.comments.map(comment => processComment(comment));
    }

    return [];
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

/**
 * Create a new comment or reply
 * @param comment The comment data to create
 * @returns The created comment
 */
export const createComment = async (comment: CreateCommentInput): Promise<IComment> => {
  try {
    const endpoint =
      comment.parentType === CommentParentTypeEnum.POST
        ? '/v1/blog/posts/comments'
        : '/v1/blog/comments';

    const response = await apiPost<CommentResponse>(endpoint, comment);

    if (response?.success && response.data?.comment) {
      return response.data.comment;
    }

    throw new Error('Failed to create comment');
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

/**
 * Delete a comment
 * @param commentId The ID of the comment to delete
 */
export const deleteComment = async (commentId: string): Promise<void> => {
  try {
    const response = await apiDelete<void>(`/v1/blog/comments/${commentId}`);

    if (!response?.success) {
      throw new Error('Failed to delete comment');
    }
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

export const updateCommentStatus = async (commentId: string, status: string): Promise<IComment> => {
  try {
    const response = await apiRequest<IApiResponse<CommentResponse>>(
      `/v1/blog/comments/${commentId}/status`,
      {
        method: 'PATCH',
        body: { status },
      }
    );

    if (response?.success && response.data?.comment) {
      return response.data.comment;
    }

    throw new Error('Failed to update comment status');
  } catch (error) {
    console.error('Error updating comment status:', error);
    throw error;
  }
};

/**
 * Updates a comment with the provided data
 * @param commentId - The ID of the comment to update
 * @param data - The data to update the comment with
 * @returns Updated comment
 */
export const updateComment = async (
  commentId: string,
  data: Partial<IComment>
): Promise<IComment> => {
  try {
    const response = await apiRequest<IApiResponse<CommentResponse>>(
      `/v1/blog/comments/${commentId}`,
      {
        method: 'PUT',
        body: data,
      }
    );

    if (response?.success && response.data?.comment) {
      return response.data.comment;
    }

    throw new Error('Failed to update comment');
  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
};
