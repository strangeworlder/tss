import { apiGet, apiPost, apiDelete } from './apiClient';

export interface Comment {
  _id: string;
  id?: string;
  title: string;
  content: string;
  status: string;
  createdAt: string;
  author: {
    type: 'user' | 'text';
    id?: string;
    name: string;
    avatar?: {
      filename: string;
      altText: string;
    };
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export const getComments = async (postId: string, parentType: string = 'post'): Promise<Comment[]> => {
  const response = await apiGet<{ comments: Comment[] }>(`/v1/blog/posts/${postId}/comments?parentType=${parentType}`);
  
  if (response && response.success && Array.isArray(response.data?.comments)) {
    return response.data.comments;
  }
  
  return [];
};

export const createComment = async (
  title: string,
  content: string,
  parentId: string,
  parentType: 'post' | 'comment' = 'post'
): Promise<Comment> => {
  const response = await apiPost<{ comment: Comment }>('/v1/blog/posts/comments', {
    title,
    content,
    parentId,
    parentType
  });

  if (!response || !response.success || !response.data?.comment) {
    throw new Error(response?.message || 'Failed to create comment');
  }

  return response.data.comment;
};

export const deleteComment = async (commentId: string): Promise<void> => {
  const response = await apiDelete<{ message: string }>(`/v1/blog/comments/${commentId}`);
  
  if (!response || !response.success) {
    throw new Error(response?.message || 'Failed to delete comment');
  }
}; 