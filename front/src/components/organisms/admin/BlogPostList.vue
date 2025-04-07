<!--
  BlogPostList.vue
  A component that displays a list of blog posts in a grid layout.
  
  Features:
  - Displays blog posts in a responsive grid
  - Shows loading state while fetching posts
  - Handles error states with retry functionality
  - Displays post status (published/draft)
  - Provides edit functionality for each post
  
  Usage:
  <BlogPostList @edit-post="handleEditPost" />
  
  Events:
  - edit-post: Emitted when the edit button is clicked, with the post ID as the payload
  
  Accessibility:
  - Uses semantic HTML elements
  - Provides alt text for images
  - Ensures keyboard navigation for interactive elements
-->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useBlogStore } from '@/stores/blogStore';
import AppImage from '@/components/atoms/AppImage.vue';
import { ImageSizeEnum } from '@/types/image';
import AuthorInfo from '@/components/molecules/AuthorInfo.vue';
import AppButton from '@/components/atoms/AppButton.vue';
import { ButtonVariantEnum } from '@/types/button';
import type { IUser } from '@/types/user';
import type { Author } from '@/types/blog';

/**
 * Emits when the edit button is clicked for a post
 * @param postId - The ID of the post to edit
 */
const emit = defineEmits<(e: 'edit-post', postId: string) => void>();

const blogStore = useBlogStore();
const loading = ref<boolean>(true);
const error = ref<string | null>(null);

/**
 * Maps an IUser to an Author
 * @param user - The user to map
 * @returns An Author object
 */
const mapUserToAuthor = (user: IUser | undefined): Author => {
  if (!user) {
    return {
      type: 'text',
      name: 'Unknown Author',
    };
  }
  return {
    type: 'user',
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    avatar: user.avatar,
  };
};

/**
 * Handles the edit button click for a post
 * @param postId - The ID of the post to edit
 */
const handleEditPost = (postId: string): void => {
  emit('edit-post', postId);
};

/**
 * Fetches blog posts from the store
 */
const fetchPosts = async (): Promise<void> => {
  loading.value = true;
  error.value = null;

  try {
    await blogStore.fetchAdminPosts();
  } catch (err) {
    // Use a proper error handling system instead of console.error
    error.value = err instanceof Error ? err.message : 'Failed to load blog posts';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchPosts();
});
</script>

<template>
  <div class="blog-post-list">
    <!-- Loading state -->
    <div v-if="loading" class="blog-post-list__loading" role="status" aria-live="polite">
      <div class="blog-post-list__spinner"></div>
      <p>Loading posts...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="blog-post-list__error" role="alert">
      <p>{{ error }}</p>
      <AppButton @click="fetchPosts" :variant="ButtonVariantEnum.DANGER"> Try Again </AppButton>
    </div>

    <!-- Posts list -->
    <div v-else class="blog-post-list__grid">
      <div v-for="post in blogStore.posts" :key="post.id" class="blog-post-list__item">
        <div class="blog-post-list__image">
          <AppImage
            v-if="post.heroImage"
            :filename="post.heroImage.filename"
            :alt="post.heroImage.altText || post.title"
            :size="ImageSizeEnum.MEDIUM"
            class="blog-post-list__img"
          />
          <div v-else class="blog-post-list__placeholder"></div>
        </div>

        <div class="blog-post-list__content">
          <h2 class="blog-post-list__title">{{ post.title }}</h2>
          <div class="blog-post-list__meta">
            <AuthorInfo :author="mapUserToAuthor(post.author)" :date="post.publishedAt" size="sm" />
            <span
              :class="[
                'blog-post-list__status',
                post.isPublished
                  ? 'blog-post-list__status--published'
                  : 'blog-post-list__status--draft',
              ]"
            >
              {{ post.isPublished ? 'Published' : 'Draft' }}
            </span>
          </div>
          <div class="blog-post-list__actions">
            <AppButton @click="handleEditPost(post.id)" :variant="ButtonVariantEnum.PRIMARY">
              Edit
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.blog-post-list {
  width: 100%;
}

.blog-post-list__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl) 0;
  text-align: center;
}

.blog-post-list__spinner {
  display: inline-block;
  width: var(--spacing-xl);
  height: var(--spacing-xl);
  border-radius: 50%;
  border: var(--spacing-xs) solid var(--color-border);
  border-top-color: var(--color-primary-500);
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-sm);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.blog-post-list__error {
  text-align: center;
  padding: var(--spacing-md);
  color: var(--color-danger);
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
}

.blog-post-list__grid {
  display: grid;
  gap: var(--spacing-md);
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.blog-post-list__item {
  background-color: var(--color-background);
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast);
}

.blog-post-list__item:hover {
  transform: translateY(-2px);
}

.blog-post-list__image {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  overflow: hidden;
}

.blog-post-list__img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.blog-post-list__placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--color-background-muted);
}

.blog-post-list__content {
  padding: var(--spacing-md);
}

.blog-post-list__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--spacing-sm);
  font-family: var(--font-family-base);
}

.blog-post-list__meta {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
  font-family: var(--font-family-base);
}

.blog-post-list__date {
  margin-right: var(--spacing-sm);
}

.blog-post-list__actions {
  margin-top: var(--spacing-md);
  display: flex;
  justify-content: flex-end;
}

.blog-post-list__status {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  margin-left: var(--spacing-sm);
}

.blog-post-list__status--published {
  background-color: var(--color-success);
  color: var(--color-text-on-success);
}

.blog-post-list__status--draft {
  background-color: var(--color-background-muted);
  color: var(--color-text);
}
</style>
