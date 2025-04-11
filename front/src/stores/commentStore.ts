import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  getComments,
  createComment as apiCreateComment,
  updateComment as apiUpdateComment,
  deleteComment as apiDeleteComment,
} from '@/api/commentService';
import type { IComment, CommentParentTypeEnum, CreateCommentInput } from '@/types/comment';
import { CommentStatus } from '@/types/comment';
import type { IApiError } from '@/types/error';
import { useNotificationStore } from './notification';
import { apiGet, apiPost, apiDelete } from '@/api/apiClient';
import type { IApiResponse } from '@/types/blog';

export const useCommentStore = defineStore('comment', () => {
  const notificationStore = useNotificationStore();

  // State
  const comments = ref<IComment[]>([]);
  const scheduledComments = ref<IComment[]>([]);
  const currentComment = ref<IComment | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // Getters
  const getCommentsByParent = computed(() => {
    return (parentId: string, parentType: CommentParentTypeEnum) => {
      return comments.value.filter(
        (comment) => comment.parentId === parentId && comment.parentType === parentType
      );
    };
  });

  const getScheduledComments = computed(() => {
    return scheduledComments.value;
  });

  const getCommentById = computed(() => {
    return (id: string): IComment | null => {
      return comments.value.find((comment) => comment.id === id) || null;
    };
  });

  const getScheduledCommentById = computed(() => {
    return (id: string): IComment | null => {
      return scheduledComments.value.find((comment) => comment.id === id) || null;
    };
  });

  // Actions
  const fetchComments = async (
    parentId: string,
    parentType: CommentParentTypeEnum
  ): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const fetchedComments = await getComments(parentId, parentType);
      if (Array.isArray(fetchedComments)) {
        comments.value = fetchedComments;

        // Extract scheduled comments
        scheduledComments.value = fetchedComments.filter(
          (comment) =>
            comment.status === CommentStatus.PENDING ||
            comment.status === CommentStatus.PENDING_UPDATE
        );
      } else {
        console.error('Expected array of comments, got:', typeof fetchedComments);
        comments.value = [];
        scheduledComments.value = [];
      }
    } catch (err) {
      const apiError = err as IApiError;
      error.value = apiError.message || 'Failed to load comments';
      comments.value = [];
      scheduledComments.value = [];
    } finally {
      loading.value = false;
    }
  };

  const addComment = async (
    content: string,
    parentId: string,
    parentType: CommentParentTypeEnum,
    title?: string
  ): Promise<IComment | null> => {
    loading.value = true;
    error.value = null;

    try {
      const commentInput: CreateCommentInput = {
        content,
        parentId,
        parentType,
        title: title || '',
      };

      const newComment = await apiCreateComment(commentInput);

      if (
        newComment.status === CommentStatus.PENDING ||
        newComment.status === CommentStatus.PENDING_UPDATE
      ) {
        scheduledComments.value.push(newComment);
      }

      await fetchComments(parentId, parentType);
      notificationStore.success('Comment added successfully');
      return newComment;
    } catch (err) {
      const apiError = err as IApiError;
      error.value = apiError.message || 'Failed to add comment';
      notificationStore.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const editScheduledComment = async (
    commentId: string,
    content: string,
    title?: string
  ): Promise<IComment | null> => {
    loading.value = true;
    error.value = null;

    try {
      const commentToUpdate = getScheduledCommentById.value(commentId);
      if (!commentToUpdate) {
        throw new Error('Comment not found');
      }

      const updatedComment = await apiUpdateComment(commentId, {
        content,
        title: title || commentToUpdate.title || '',
      });

      // Update the scheduled comment in the list
      const index = scheduledComments.value.findIndex((c) => c.id === commentId);
      if (index !== -1) {
        scheduledComments.value[index] = updatedComment;
      }

      // Also update in main comments list
      const mainIndex = comments.value.findIndex((c) => c.id === commentId);
      if (mainIndex !== -1) {
        comments.value[mainIndex] = updatedComment;
      }

      notificationStore.success('Scheduled comment updated successfully');
      return updatedComment;
    } catch (err) {
      const apiError = err as IApiError;
      error.value = apiError.message || 'Failed to update scheduled comment';
      notificationStore.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const cancelScheduledComment = async (commentId: string): Promise<boolean> => {
    loading.value = true;
    error.value = null;

    try {
      const commentToCancel = getScheduledCommentById.value(commentId);
      if (!commentToCancel) {
        throw new Error('Scheduled comment not found');
      }

      await apiDeleteComment(commentId);

      // Remove the comment from scheduled list
      scheduledComments.value = scheduledComments.value.filter((c) => c.id !== commentId);

      // Remove from main comments list
      comments.value = comments.value.filter((c) => c.id !== commentId);

      notificationStore.success('Scheduled comment cancelled successfully');
      return true;
    } catch (err) {
      const apiError = err as IApiError;
      error.value = apiError.message || 'Failed to cancel scheduled comment';
      notificationStore.error(error.value);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const retryPublishComment = async (commentId: string): Promise<boolean> => {
    loading.value = true;
    error.value = null;

    try {
      const commentToRetry = getScheduledCommentById.value(commentId);
      if (!commentToRetry) {
        throw new Error('Failed comment not found');
      }

      // Call API to retry publication
      const result = await apiUpdateComment(commentId, {
        status: CommentStatus.PENDING,
      });

      // Update comment in lists
      const scheduledIndex = scheduledComments.value.findIndex((c) => c.id === commentId);
      if (scheduledIndex !== -1) {
        scheduledComments.value[scheduledIndex] = result;
      }

      const mainIndex = comments.value.findIndex((c) => c.id === commentId);
      if (mainIndex !== -1) {
        comments.value[mainIndex] = result;
      }

      notificationStore.success('Publication retry initiated');
      return true;
    } catch (err) {
      const apiError = err as IApiError;
      error.value = apiError.message || 'Failed to retry publication';
      notificationStore.error(error.value);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const clearErrors = (): void => {
    error.value = null;
  };

  async function fetchScheduledComments(postId: string): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const response = await apiGet<IComment[]>(`/posts/${postId}/scheduled-comments`);
      if (response.success && response.data) {
        scheduledComments.value = response.data;
      } else {
        scheduledComments.value = [];
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred';
      scheduledComments.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function storeCreateComment(postId: string, comment: Partial<IComment>): Promise<IComment> {
    loading.value = true;
    error.value = null;

    try {
      const response = await apiPost<IComment>(`/posts/${postId}/comments`, comment);
      if (response.success && response.data) {
        comments.value = [...comments.value, response.data];
        return response.data;
      }
      throw new Error('Failed to create comment');
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function storeUpdateComment(
    commentId: string,
    updates: Partial<IComment>
  ): Promise<IComment> {
    loading.value = true;
    error.value = null;

    try {
      const response = await apiPost<IComment>(`/comments/${commentId}`, updates);
      if (response.success && response.data) {
        const index = scheduledComments.value.findIndex((comment) => comment.id === commentId);
        if (index !== -1) {
          scheduledComments.value[index] = response.data;
        }
        return response.data;
      }
      throw new Error('Failed to update comment');
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function storeDeleteComment(commentId: string): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      await apiDelete(`/comments/${commentId}`);
      scheduledComments.value = scheduledComments.value.filter((c) => c.id !== commentId);
      comments.value = comments.value.filter((c) => c.id !== commentId);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function scheduleComment(postId: string, comment: Partial<IComment>): Promise<IComment> {
    loading.value = true;
    error.value = null;

    try {
      const response = await apiPost<IComment>(`/posts/${postId}/scheduled-comments`, comment);
      if (response.success && response.data) {
        scheduledComments.value = [...scheduledComments.value, response.data];
        return response.data;
      }
      throw new Error('Failed to schedule comment');
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    comments,
    scheduledComments,
    currentComment,
    loading,
    error,

    // Getters
    getCommentsByParent,
    getScheduledComments,
    getCommentById,
    getScheduledCommentById,

    // Actions
    fetchComments,
    addComment,
    editScheduledComment,
    cancelScheduledComment,
    retryPublishComment,
    clearErrors,
    fetchScheduledComments,
    createComment: storeCreateComment,
    updateComment: storeUpdateComment,
    deleteComment: storeDeleteComment,
    scheduleComment,
  };
});
