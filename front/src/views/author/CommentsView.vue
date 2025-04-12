<!--
CommentsView.vue
Component name: CommentsView
Description: View for managing author comments
Features:
- List of comments on author's posts
- Comment moderation tools
- Reply functionality
- Accessibility compliant
Usage:
<template>
  <CommentsView />
</template>
Props:
- None
Events:
- None
Accessibility:
- Proper semantic structure
- ARIA labels
- Screen reader support
-->

<template>
  <AuthorDashboardLayout title="Comments">
    <div class="author-comments">
      <div v-if="loading" class="author-comments__loading">
        Loading comments...
      </div>
      <div v-else-if="error" class="author-comments__error" role="alert">
        {{ error }}
      </div>
      <div v-else>
        <div class="author-comments__filters">
          <select v-model="selectedPostId" class="author-comments__filter">
            <option value="">All Posts</option>
            <option v-for="(post, index) in authorPosts" :key="post.id" :value="post.id">
              {{ post.title }}
            </option>
          </select>
        </div>

        <CommentList 
          v-if="selectedPostId"
          :parent-id="selectedPostId" 
          :parent-type="CommentParentTypeEnum.POST"
          @comment-deleted="handleCommentDeleted"
          @comment-added="handleCommentAdded"
          @error="handleError"
        />
        <div v-else class="author-comments__all-comments">
          <div v-for="(post, index) in authorPosts" :key="post.id" class="author-comments__post-section">
            <h3 class="author-comments__post-title">{{ post.title }}</h3>
            <CommentList 
              :parent-id="post.id" 
              :parent-type="CommentParentTypeEnum.POST"
              @comment-deleted="handleCommentDeleted"
              @comment-added="handleCommentAdded"
              @error="handleError"
            />
          </div>
        </div>
      </div>
    </div>
  </AuthorDashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthorStore } from '@/stores/author';
import { useBlogStore } from '@/stores/blogStore';
import { useAuthStore } from '@/stores/auth';
import AuthorDashboardLayout from '@/components/templates/AuthorDashboardLayout.vue';
import CommentList from '@/components/organisms/CommentList.vue';
import { CommentParentTypeEnum } from '@/types/comment';
import type { IBlogPost } from '@/types/blog';

const router = useRouter();
const authorStore = useAuthorStore();
const blogStore = useBlogStore();
const authStore = useAuthStore();
const loading = ref(true);
const error = ref<string | null>(null);
const authorPosts = ref<IBlogPost[]>([]);
const selectedPostId = ref('');

const handleCommentDeleted = (commentId: string) => {
  console.log('Comment deleted:', commentId);
};

const handleCommentAdded = () => {
  console.log('Comment added');
  fetchAuthorPosts(); // Refresh the posts to get updated comment counts
};

const handleError = (message: string) => {
  console.error('Comment error:', message);
  error.value = message;
};

const fetchAuthorPosts = async () => {
  try {
    loading.value = true;
    error.value = null;

    // First ensure we have author data
    if (!authorStore.isAuthenticated) {
      await authorStore.checkAuth();
    }

    // If still not authenticated after checking, try regular user auth
    if (!authorStore.isAuthenticated) {
      if (!authStore.isAuthenticated) {
        await authStore.fetchUserData();
      }

      // If neither author nor user auth works, redirect to login
      if (!authStore.isAuthenticated) {
        console.log('No authenticated user found, redirecting to login');
        router.push('/auth');
        return;
      }
    }

    // Fetch all posts
    await blogStore.fetchPosts();

    // Filter posts by current author or user
    const currentAuthor = authorStore.author;
    const currentUser = authStore.user;

    authorPosts.value = blogStore.posts.filter((post: IBlogPost) => {
      if (currentAuthor?.id) {
        return post.author && post.author.type === 'user' && post.author.id === currentAuthor.id;
      }

      if (currentUser?.id) {
        return post.author && post.author.type === 'user' && post.author.id === currentUser.id;
      }
      return false;
    });

    if (authorPosts.value.length === 0) {
      error.value = 'No posts found. Create your first post to start receiving comments.';
    }
  } catch (err) {
    console.error('Error fetching author posts:', err);
    error.value = err instanceof Error ? err.message : 'Failed to fetch posts';
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchAuthorPosts();
});
</script>

<style scoped>
.author-comments {
  padding: var(--spacing-md);
}

.author-comments__loading,
.author-comments__error {
  text-align: center;
  padding: var(--spacing-lg);
  color: var(--color-text);
}

.author-comments__error {
  color: var(--color-danger);
}

.author-comments__filters {
  margin-bottom: var(--spacing-md);
}

.author-comments__filter {
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-background);
  color: var(--color-text);
  width: 100%;
  max-width: 300px;
}

.author-comments__post-section {
  margin-bottom: var(--spacing-xl);
}

.author-comments__post-title {
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
}
</style> 