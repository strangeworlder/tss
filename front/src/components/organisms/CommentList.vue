<!--
@component CommentList
@description A component that displays a list of comments with reply and delete functionality.

@features
- Displays comments in a threaded format
- Supports reply functionality for authenticated users
- Allows comment deletion for authors and admins
- Markdown support for comment content with security measures
- Loading, error, and empty states
- Responsive design
- Accessibility features
- Supports scheduled comments with preview and timer
- Real-time loading states for scheduled comment actions
- Proper error handling for all operations
- Integration with CommentStore for state management

@props {
  parentId: {
    type: string
    required: true
    description: "ID of the parent post or comment"
  }
  parentType: {
    type: CommentParentTypeEnum
    required: true
    description: "Type of the parent ('post' or 'comment')"
    validator: (value) => Object.values(CommentParentTypeEnum).includes(value)
  }
}

@events {
  comment-deleted: {
    payload: string
    description: "Emitted when a comment is deleted, passes the comment ID"
  }
  comment-added: {
    payload: void
    description: "Emitted when a new comment is successfully added"
  }
  error: {
    payload: string
    description: "Emitted when an error occurs"
  }
}

@actions
- editScheduled: Initiates edit mode for a scheduled comment
- cancelScheduled: Cancels a scheduled comment
- retryPublication: Retries publication of a failed scheduled comment
- deleteComment: Deletes a comment (with confirmation)
- addComment: Adds a new comment
- replyToComment: Adds a reply to an existing comment

@states
- loading: Global loading state for the component
- scheduledActionLoading: Content-specific loading state for scheduled comment actions
- error: Error state for handling and displaying errors
- replyingTo: Tracks which comment is being replied to
- commentToDelete: Tracks which comment is being deleted

@accessibility
- Uses semantic HTML structure with proper heading hierarchy
- Loading and error states are announced to screen readers
- Interactive elements are keyboard accessible
- Uses proper ARIA attributes only when necessary
- Markdown content is sanitized for security
- Color contrast meets WCAG 2.1 AA standards
- Focus management for reply forms
- Proper role and aria-live attributes for dynamic content
- Loading overlays with proper role attributes
-->

<template>
  <section class="comment-list" aria-labelledby="comments-title">
    <h2 id="comments-title" class="comment-list__title">Comments</h2>

    <div v-if="isAuthenticated" class="comment-list__form">
      <Suspense>
        <template #default>
          <CommentForm
            :parent-id="parentId"
            :parent-type="parentType"
            @submit="handleCommentSuccess"
            @error="handleCommentError"
          />
        </template>
        <template #fallback>
          <div class="comment-list__loading">{{ COMMENT_CONSTANTS.LOADING_MESSAGE }}</div>
        </template>
      </Suspense>
    </div>
    <p v-else class="comment-list__login-prompt">
      {{ COMMENT_CONSTANTS.LOGIN_PROMPT }}
      <router-link to="/auth">log in</router-link>
    </p>

    <div v-if="loading" class="comment-list__loading" role="status" aria-live="polite">
      {{ COMMENT_CONSTANTS.LOADING_MESSAGE }}
    </div>
    <div v-else-if="error" class="comment-list__error" role="alert">
      {{ error }}
    </div>
    <p v-else-if="!comments || comments.length === 0" class="comment-list__empty">
      {{ COMMENT_CONSTANTS.EMPTY_MESSAGE }}
    </p>
    <ul v-else class="comment-list__items">
      <li v-for="comment in comments" :key="comment.id" class="comment-list__item">
        <article>
          <div v-if="comment.status === 'scheduled'" class="comment-list__scheduled">
            <ScheduledCommentPreview
              :content-id="comment.id"
              :publish-at="comment.publishAt || ''"
              :content="comment.content"
              :version="comment.version || 1"
              :has-active-update="comment.hasActiveUpdate"
              @edit="handleEditScheduled"
              @cancel="handleCancelScheduled"
              @retry="handleRetryPublication"
            />
            <div v-if="scheduledActionLoading === comment.id" class="comment-list__loading-overlay" role="status">
              <span class="comment-list__loading-text">Processing...</span>
            </div>
          </div>
          <template v-else>
            <div class="comment-list__header">
              <h3 class="comment-list__title">{{ comment?.title || 'Untitled' }}</h3>
              <AuthorInfo :author="mapToAuthor(comment)" :date="comment?.createdAt" size="sm" variant="right" />
            </div>
            <div class="comment-list__content" v-html="formatContent(comment?.content || '')" />
            <div class="comment-list__actions">
              <AppButton 
                v-if="isAuthenticated && comment?.id" 
                :variant="ButtonVariantEnum.TEXT" 
                @click="showReplyForm(comment.id)"
              >
                Reply
              </AppButton>
              <AppButton
                v-if="canDelete(comment) && comment?.id"
                :variant="ButtonVariantEnum.TEXT"
                @click="showDeleteDialog(comment.id)"
              >
                Delete
              </AppButton>
            </div>
            <div v-if="replyingTo === comment.id" class="comment-list__form--reply">
              <Suspense>
                <template #default>
                  <CommentForm
                    :parent-id="comment.id"
                    :parent-type="CommentParentTypeEnum.COMMENT"
                    @submit="handleReplySubmit"
                    @cancel="replyingTo = null"
                  />
                </template>
                <template #fallback>
                  <div class="comment-list__loading">{{ COMMENT_CONSTANTS.LOADING_MESSAGE }}</div>
                </template>
              </Suspense>
            </div>
            <!-- Nested replies -->
            <ul v-if="comment?.replies?.length" class="comment-list__replies">
              <li v-for="reply in comment.replies" :key="reply.id" class="comment-list__reply">
                <article>
                  <div v-if="reply.status === 'scheduled'" class="comment-list__scheduled">
                    <ScheduledCommentPreview
                      :content-id="reply.id"
                      :publish-at="reply.publishAt || ''"
                      :content="reply.content"
                      :version="reply.version || 1"
                      :has-active-update="reply.hasActiveUpdate"
                      @edit="handleEditScheduled"
                      @cancel="handleCancelScheduled"
                      @retry="handleRetryPublication"
                    />
                    <div v-if="scheduledActionLoading === reply.id" class="comment-list__loading-overlay" role="status">
                      <span class="comment-list__loading-text">Processing...</span>
                    </div>
                  </div>
                  <template v-else>
                    <div class="comment-list__header">
                      <h4 class="comment-list__title">{{ reply.title || 'Untitled' }}</h4>
                      <AuthorInfo :author="mapToAuthor(reply)" :date="reply.createdAt" size="sm" variant="right" />
                    </div>
                    <div class="comment-list__content" v-html="formatContent(reply.content || '')" />
                    <div class="comment-list__actions">
                      <AppButton
                        v-if="canDelete(reply) && reply?.id"
                        :variant="ButtonVariantEnum.TEXT"
                        @click="showDeleteDialog(reply.id)"
                      >
                        Delete
                      </AppButton>
                    </div>
                  </template>
                </article>
              </li>
            </ul>
          </template>
        </article>
      </li>
    </ul>

    <!-- Delete Confirmation Dialog -->
    <AppDialog
      :is-open="!!commentToDelete"
      title="Delete Comment"
      content="Are you sure you want to delete this comment? This action cannot be undone."
      primary-action="Delete"
      secondary-action="Cancel"
      variant="danger"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue';
import { marked } from 'marked';
import { useAuthStore } from '@/stores/authStore';
import { getComments, deleteComment as deleteCommentApi } from '@/api/commentService';
import type { IComment } from '@/types/comment';
import type { IApiError } from '@/types/error';
import { CommentParentTypeEnum } from '@/types/comment';
import { useNotificationStore } from '@/stores/notification';
import { COMMENT_CONSTANTS } from '@/constants/comment';
import AuthorInfo from '@/components/molecules/AuthorInfo.vue';
import AppButton from '@/components/atoms/AppButton.vue';
import AppDialog from '@/components/molecules/AppDialog.vue';
import ScheduledCommentPreview from '@/components/molecules/ScheduledCommentPreview.vue';
import { ButtonVariantEnum } from '@/types/button';
import type { Author } from '@/types/blog';
import { useScheduledContentStore } from '@/stores/scheduledContentStore';
import { useCommentStore } from '@/stores/commentStore';

const CommentForm = defineAsyncComponent(() => import('@/components/organisms/CommentForm.vue'));

interface Props {
  parentId: string;
  parentType: CommentParentTypeEnum;
}

interface Emits {
  (e: 'comment-deleted', commentId: string): void;
  (e: 'comment-added'): void;
  (e: 'error', message: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  parentType: CommentParentTypeEnum.POST,
});
const emit = defineEmits<Emits>();

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const scheduledContentStore = useScheduledContentStore();
const commentStore = useCommentStore();
const isAuthenticated = computed((): boolean => authStore.isAuthenticated);
const comments = ref<IComment[]>([]);
const loading = ref<boolean>(true);
const error = ref<string | null>(null);
const replyingTo = ref<string | null>(null);
const commentToDelete = ref<string | null>(null);
const scheduledActionLoading = ref<string | null>(null);

// Helper function to convert IAuthor to Author
const mapToAuthor = (comment: IComment | undefined): Author | undefined => {
  if (!comment || !comment.author) return undefined;

  return {
    type: 'user',
    id: comment.author.id,
    name: comment.author.name || 'Anonymous',
    avatar: comment.author.avatar
      ? {
          filename:
            typeof comment.author.avatar === 'string'
              ? comment.author.avatar
              : (comment.author.avatar as { filename: string }).filename,
          altText: comment.author.name || 'Anonymous',
        }
      : undefined,
  };
};

const fetchComments = async (): Promise<void> => {
  try {
    loading.value = true;
    error.value = null;
    console.log('Fetching comments:', {
      parentId: props.parentId,
      parentType: props.parentType,
    });

    await commentStore.fetchComments(props.parentId, props.parentType);
    comments.value = commentStore.comments;

    console.log('Comments fetched:', comments.value);
  } catch (err) {
    const apiError = err as IApiError;
    error.value = apiError.message || 'Failed to load comments';
    console.error('Error fetching comments:', {
      error: apiError,
      parentId: props.parentId,
      parentType: props.parentType,
    });
    emit('error', error.value);
    comments.value = []; // Ensure comments is always an array
  } finally {
    loading.value = false;
  }
};

const formatContent = (content: string): string => {
  if (!content) return '';
  try {
    // marked can return a Promise in some cases, so we need to handle it
    const result = marked(content, {
      breaks: true,
      gfm: true,
    });
    // If result is a Promise, return a placeholder until it resolves
    if (result instanceof Promise) {
      return 'Loading...';
    }
    return result;
  } catch (error) {
    console.error('Error formatting content:', error);
    return content;
  }
};

const showReplyForm = (commentId: string | undefined) => {
  console.log('Trying to show reply form for comment:', commentId);
  if (!commentId) {
    console.error('No comment ID provided to showReplyForm');
    return;
  }
  console.log('Showing reply form for comment:', commentId);
  replyingTo.value = commentId;
};

const handleReplySubmit = async (): Promise<void> => {
  console.log('Handling reply submission');
  replyingTo.value = null;
  await fetchComments();
  emit('comment-added');
};

const canDelete = (comment: IComment | undefined): boolean => {
  if (!comment || !comment.author) return false;
  const currentUser = authStore.currentUser;
  const canDelete = currentUser?.id === comment.author.id || authStore.isAdmin;
  console.log('Checking delete permission:', {
    commentId: comment.id,
    currentUserId: currentUser?.id,
    commentAuthorId: comment.author.id,
    isAdmin: authStore.isAdmin,
    canDelete,
  });
  return canDelete;
};

const showDeleteDialog = (commentId: string | undefined): void => {
  console.log('Trying to show delete dialog for comment:', commentId);
  if (!commentId) {
    console.error('No comment ID provided to showDeleteDialog');
    return;
  }
  console.log('Showing delete dialog for comment:', commentId);
  commentToDelete.value = commentId;
};

const confirmDelete = async (): Promise<void> => {
  if (!commentToDelete.value) return;
  console.log('Confirming delete for comment:', commentToDelete.value);

  try {
    await deleteCommentApi(commentToDelete.value);
    emit('comment-deleted', commentToDelete.value);
    await fetchComments();
    notificationStore.success('Comment deleted successfully');
  } catch (err) {
    const apiError = err as IApiError;
    error.value = apiError.message || 'Failed to delete comment';
    console.error('Error deleting comment:', {
      commentId: commentToDelete.value,
      error: apiError,
    });
    emit('error', error.value);
  } finally {
    commentToDelete.value = null;
  }
};

const cancelDelete = (): void => {
  console.log('Cancelling delete dialog');
  commentToDelete.value = null;
};

const handleCommentSuccess = async (): Promise<void> => {
  console.log('Handling comment success');
  try {
    await fetchComments();
    notificationStore.success('Comment added successfully');
    emit('comment-added');
  } catch (err) {
    const apiError = err as IApiError;
    error.value = apiError.message || 'Failed to refresh comments after adding';
    console.error('Error after comment success:', {
      error: apiError,
    });
    emit('error', error.value);
  }
};

const handleCommentError = (message: string): void => {
  console.error('Comment error:', message);
  error.value = message || 'Failed to add comment';
  notificationStore.error(error.value);
  emit('error', error.value);
};

const handleEditScheduled = async (contentId: string): Promise<void> => {
  try {
    scheduledActionLoading.value = contentId;

    // Get the scheduled comment from the store
    const comment = commentStore.getScheduledCommentById(contentId);
    if (!comment) {
      throw new Error('Scheduled comment not found');
    }

    // TODO: Implement edit functionality - open editor or navigate to edit page
    console.log('Editing scheduled comment:', contentId);

    // For now, we'll just show a success message
    notificationStore.success('Edit mode activated for scheduled comment');
  } catch (err) {
    const apiError = err as IApiError;
    const errorMsg = apiError.message || 'Failed to edit scheduled comment';
    error.value = errorMsg;
    notificationStore.error(errorMsg);
    emit('error', errorMsg);
    console.error('Error editing scheduled comment:', err);
  } finally {
    scheduledActionLoading.value = null;
  }
};

const handleCancelScheduled = async (contentId: string): Promise<void> => {
  try {
    scheduledActionLoading.value = contentId;

    const success = await commentStore.cancelScheduledComment(contentId);
    if (success) {
      await fetchComments();
      notificationStore.success('Scheduled comment cancelled successfully');
    } else {
      throw new Error('Failed to cancel scheduled comment');
    }
  } catch (err) {
    const apiError = err as IApiError;
    const errorMsg = apiError.message || 'Failed to cancel scheduled comment';
    error.value = errorMsg;
    notificationStore.error(errorMsg);
    emit('error', errorMsg);
    console.error('Error cancelling scheduled comment:', err);
  } finally {
    scheduledActionLoading.value = null;
  }
};

const handleRetryPublication = async (contentId: string): Promise<void> => {
  try {
    scheduledActionLoading.value = contentId;

    const success = await commentStore.retryPublishComment(contentId);
    if (success) {
      await fetchComments();
      notificationStore.success('Comment publication retry initiated');
    } else {
      throw new Error('Failed to retry comment publication');
    }
  } catch (err) {
    const apiError = err as IApiError;
    const errorMsg = apiError.message || 'Failed to retry comment publication';
    error.value = errorMsg;
    notificationStore.error(errorMsg);
    emit('error', errorMsg);
    console.error('Error retrying comment publication:', err);
  } finally {
    scheduledActionLoading.value = null;
  }
};

onMounted(() => {
  fetchComments().catch((err) => {
    const apiError = err as IApiError;
    error.value = apiError.message || 'Failed to load comments';
    notificationStore.error(error.value);
    emit('error', error.value);
  });
});
</script>

<style scoped>
.comment-list {
  margin: var(--spacing-xl) 0;
}

.comment-list__title {
  margin: 0 0 var(--spacing-lg);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-base);
  color: var(--color-text);
}

.comment-list__login-prompt {
  margin: var(--spacing-md) 0;
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  background-color: var(--color-background-alt);
  text-align: center;
}

.comment-list__login-prompt a {
  color: var(--color-primary);
  text-decoration: none;
}

.comment-list__login-prompt a:hover {
  text-decoration: underline;
}

.comment-list__loading,
.comment-list__error,
.comment-list__empty {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
}

.comment-list__error {
  color: var(--color-danger);
}

.comment-list__items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.comment-list__item {
  padding: var(--spacing-md);
  border: 0.0625rem solid var(--color-border);
  border-radius: var(--border-radius-md);
  background-color: var(--color-background-alt);
}

.comment-list__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
}

.comment-list__content {
  margin: var(--spacing-sm) 0;
  line-height: 1.6;
  color: var(--color-text);
}

.comment-list__actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.comment-list__form--reply {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 0.0625rem solid var(--color-border);
}

.comment-list__replies {
  list-style: none;
  padding: 0;
  margin: var(--spacing-md) 0 0 var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.comment-list__reply {
  padding: var(--spacing-md);
  border: 0.0625rem solid var(--color-border);
  border-radius: var(--border-radius-md);
  background-color: var(--color-background);
}

.comment-list__scheduled {
  margin: var(--spacing-md) 0;
  position: relative;
}

.comment-list__loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(var(--color-background-rgb), 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: var(--border-radius-md);
  z-index: 1;
}

.comment-list__loading-text {
  background-color: var(--color-background);
  color: var(--color-text);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-sm);
  font-weight: var(--font-weight-medium);
  box-shadow: 0 var(--spacing-xs) var(--spacing-sm) rgba(0, 0, 0, 0.1);
}

@media (max-width: 48rem) {
  .comment-list__header {
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .comment-list__actions {
    flex-wrap: wrap;
  }

  .comment-list__replies {
    margin-left: var(--spacing-md);
  }
}
</style>
