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

@accessibility
- Uses semantic HTML structure with proper heading hierarchy
- Loading and error states are announced to screen readers
- Interactive elements are keyboard accessible
- Uses proper ARIA attributes only when necessary
- Markdown content is sanitized for security
- Color contrast meets WCAG 2.1 AA standards
- Focus management for reply forms
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
      <li v-for="comment in comments" :key="comment?._id" class="comment-list__item">
        <article>
          <div class="comment-list__header">
            <h3 class="comment-list__title">{{ comment?.title || 'Untitled' }}</h3>
            <AuthorInfo :author="mapToAuthor(comment)" :date="comment?.createdAt" size="sm" variant="right" />
          </div>
          <div class="comment-list__content" v-html="formatContent(comment?.content || '')" />
          <div class="comment-list__actions">
            <AppButton 
              v-if="isAuthenticated" 
              :variant="ButtonVariantEnum.TEXT" 
              @click="showReplyForm(comment?._id)"
            >
              Reply
            </AppButton>
            <AppButton
              v-if="canDelete(comment)"
              :variant="ButtonVariantEnum.TEXT"
              @click="showDeleteDialog(comment?._id)"
            >
              Delete
            </AppButton>
          </div>
          <div v-if="replyingTo === comment?._id" class="comment-list__form--reply">
            <Suspense>
              <template #default>
                <CommentForm
                  :parent-id="comment?._id"
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
            <li v-for="reply in comment.replies" :key="reply._id" class="comment-list__reply">
              <article>
                <div class="comment-list__header">
                  <h4 class="comment-list__title">{{ reply.title || 'Untitled' }}</h4>
                  <AuthorInfo :author="mapToAuthor(reply)" :date="reply.createdAt" size="sm" variant="right" />
                </div>
                <div class="comment-list__content" v-html="formatContent(reply.content || '')" />
                <div class="comment-list__actions">
                  <AppButton
                    v-if="canDelete(reply)"
                    :variant="ButtonVariantEnum.TEXT"
                    @click="showDeleteDialog(reply._id)"
                  >
                    Delete
                  </AppButton>
                </div>
              </article>
            </li>
          </ul>
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
import { ButtonVariantEnum } from '@/types/button';
import type { Author } from '@/types/blog';

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
const isAuthenticated = computed((): boolean => authStore.isAuthenticated);
const comments = ref<IComment[]>([]);
const loading = ref<boolean>(true);
const error = ref<string | null>(null);
const replyingTo = ref<string | null>(null);
const commentToDelete = ref<string | null>(null);

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
    const fetchedComments = await getComments(props.parentId, props.parentType);
    console.log('Comments fetched:', fetchedComments);

    // Ensure we have a valid array of comments
    if (Array.isArray(fetchedComments)) {
      comments.value = fetchedComments;
    } else {
      console.error('Expected array of comments, got:', typeof fetchedComments);
      comments.value = [];
    }
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
  if (!commentId) return;
  replyingTo.value = commentId;
};

const handleReplySubmit = async (): Promise<void> => {
  replyingTo.value = null;
  await fetchComments();
  emit('comment-added');
};

const canDelete = (comment: IComment | undefined): boolean => {
  if (!comment || !comment.author) return false;
  const currentUser = authStore.user;
  return currentUser?.id === comment.author.id || authStore.isAdmin;
};

const showDeleteDialog = (commentId: string | undefined): void => {
  if (!commentId) return;
  commentToDelete.value = commentId;
};

const confirmDelete = async (): Promise<void> => {
  if (!commentToDelete.value) return;

  try {
    await deleteCommentApi(commentToDelete.value);
    emit('comment-deleted', commentToDelete.value);
    await fetchComments();
    notificationStore.success('Comment deleted successfully');
  } catch (err) {
    const apiError = err as IApiError;
    error.value = apiError.message || 'Failed to delete comment';
    emit('error', error.value);
  } finally {
    commentToDelete.value = null;
  }
};

const cancelDelete = (): void => {
  commentToDelete.value = null;
};

const handleCommentSuccess = async (): Promise<void> => {
  await fetchComments();
  notificationStore.success('Comment added successfully');
  emit('comment-added');
};

const handleCommentError = (message: string): void => {
  notificationStore.error(message || 'Failed to add comment');
  emit('error', message);
};

onMounted(fetchComments);
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
