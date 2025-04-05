<template>
  <div class="comment-list">
    <h2 class="comment-list__title">Comments</h2>
    
    <div v-if="isAuthenticated" class="comment-list__form">
      <CommentForm
        :parent-id="parentId"
        :parent-type="parentType"
        @success="handleCommentSuccess"
        @error="handleCommentError"
      />
    </div>
    <div v-else class="comment-list__login-prompt">
      Please <router-link to="/login">log in</router-link> to comment
    </div>

    <div v-if="loading" class="comment-list__loading">
      Loading comments...
    </div>
    <div v-else-if="error" class="comment-list__error">
      {{ error }}
    </div>
    <div v-else-if="comments.length === 0" class="comment-list__empty">
      No comments yet. Be the first to comment!
    </div>
    <div v-else class="comment-list__items">
      <div
        v-for="comment in comments"
        :key="comment._id"
        class="comment-list__item"
      >
        <div class="comment-list__header">
          <div class="comment-list__author">
            <AuthorInfo
              :author="comment.author"
              :date="comment.createdAt"
              size="sm"
            />
          </div>
          <h3 class="comment-list__title">{{ comment.title }}</h3>
        </div>
        <div class="comment-list__content" v-html="formatContent(comment.content)"></div>
        <div class="comment-list__actions">
          <Button 
            variant="text" 
            @click="showReplyForm(comment._id)"
          >
            Reply
          </Button>
          <Button 
            v-if="canDelete(comment)" 
            variant="text"
            @click="deleteComment(comment._id)"
          >
            Delete
          </Button>
        </div>
        <div v-if="replyingTo === comment._id" class="comment-list__reply-form">
          <CommentForm
            :parent-id="comment._id"
            parent-type="comment"
            @submit="handleReplySubmit"
            @cancel="replyingTo = null"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { marked } from 'marked';
import { useAuthStore } from '@/stores/auth';
import { getComments, deleteComment as deleteCommentApi, type Comment } from '@/api/commentService';
import CommentForm from './CommentForm.vue';
import { useNotificationStore } from '@/stores/notification';
import AuthorInfo from '@/components/molecules/AuthorInfo.vue';
import Button from '@/components/atoms/Button.vue';

const props = defineProps<{
  parentId: string;
  parentType: string;
}>();

const emit = defineEmits<{
  (e: 'comment-deleted', commentId: string): void;
}>();

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);
const comments = ref<Comment[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const replyingTo = ref<string | null>(null);

const fetchComments = async () => {
  try {
    loading.value = true;
    error.value = null;
    comments.value = await getComments(props.parentId, props.parentType);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load comments';
  } finally {
    loading.value = false;
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatContent = (content: string) => {
  return marked(content, {
    breaks: true,
    gfm: true,
    sanitize: true,
    smartLists: true,
    smartypants: true
  });
};

const showReplyForm = (commentId: string) => {
  replyingTo.value = commentId;
};

const handleReplySubmit = async () => {
  replyingTo.value = null;
  await fetchComments();
};

const canDelete = (comment: Comment) => {
  return authStore.isAdmin || (comment.author.id && comment.author.id === authStore.currentUser?.id);
};

const deleteComment = async (commentId: string) => {
  if (!confirm('Are you sure you want to delete this comment?')) {
    return;
  }

  try {
    await deleteCommentApi(commentId);
    emit('comment-deleted', commentId);
    await fetchComments();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete comment';
  }
};

const handleCommentSuccess = async () => {
  await fetchComments();
  notificationStore.success('Comment added successfully');
};

const handleCommentError = (message: string) => {
  notificationStore.error(message || 'Failed to add comment');
};

onMounted(fetchComments);
</script>

<style scoped>
.comment-list {
  margin: var(--spacing-8) 0;
}

.comment-list__title {
  margin: 0 0 var(--spacing-6);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.comment-list__login-prompt {
  margin: var(--spacing-4) 0;
  padding: var(--spacing-4);
  border-radius: var(--border-radius-md);
  background-color: var(--color-background-secondary);
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
  padding: var(--spacing-8);
  color: var(--color-text-secondary);
}

.comment-list__error {
  color: var(--color-error);
}

.comment-list__items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
}

.comment-list__item {
  padding: var(--spacing-4);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background-color: var(--color-background-secondary);
}

.comment-list__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-2);
}

.comment-list__author {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.comment-list__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-list__author-name {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.comment-list__date {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.comment-list__title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.comment-list__content {
  margin: var(--spacing-2) 0;
  line-height: 1.6;
  color: var(--color-text-primary);
}

.comment-list__actions {
  display: flex;
  gap: var(--spacing-2);
  margin-top: var(--spacing-2);
}

.comment-list__reply-form {
  margin-top: var(--spacing-4);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-border);
}
</style> 