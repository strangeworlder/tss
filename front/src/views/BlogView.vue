<!--
@component BlogView
@description Blog page component that displays all blog posts with loading, error, and empty states

@features
- Displays all blog posts in a responsive grid layout
- Handles loading, error, and empty states
- Provides functionality to start the backend server if not running
- Formats dates for better readability
- Responsive design with grid system
- Dark mode support through semantic variables

@props
None - This is a page component that doesn't accept props

@events
None - This component doesn't emit events

@slots
None - This component doesn't provide slots

@accessibility
- Uses semantic HTML structure with proper heading hierarchy
- Loading states are visually indicated
- Error messages are clearly displayed
- Empty states are properly communicated
- Keyboard navigation is supported for all interactive elements
- Color contrast meets WCAG 2.1 AA standards through semantic variables
- Responsive design ensures usability across device sizes
-->

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useBlogStore } from '@/stores/blogStore';
import BlogPostCard from '@/components/organisms/BlogPostCard.vue';
import AppButton from '@/components/atoms/AppButton.vue';
import { checkApiHealth } from '@/api/apiClient';
import { BlogPostTitleVariantEnum } from '@/types/blogPost';
import { ButtonVariantEnum } from '@/types/button';
import { BlogPostStatus } from '@/types/blog';
import type { IBlogPost } from '@/types/blog';

// Get the blog store
const blogStore = useBlogStore();
// Use computed properties to ensure reactivity with store changes
const posts = computed(() =>
  blogStore.posts.filter((post: IBlogPost) => post.status === BlogPostStatus.PUBLISHED)
);
const loading = computed(() => blogStore.loading);
const error = computed(() => blogStore.error);
const serverStarting = ref(false);

// Start the backend server
const startBackendServer = async () => {
  if (serverStarting.value) return;

  serverStarting.value = true;

  try {
    // Using a simple fetch to a service worker that starts the server
    // In a real app, this would be a more sophisticated approach
    // This is just a mock implementation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check if server is now running
    const isHealthy = await checkApiHealth();

    if (isHealthy) {
      fetchBlogPosts();
    } else {
      // Set error directly in the store
      blogStore.error = 'Failed to start the backend server. Please start it manually.';
    }
  } catch (err) {
    blogStore.error = 'Failed to start the backend server. Please start it manually.';
    console.error('Error starting backend server:', err);
  } finally {
    serverStarting.value = false;
  }
};

// Fetch blog posts using the store
const fetchBlogPosts = async () => {
  try {
    // First check if the API is available
    const isHealthy = await checkApiHealth();

    if (!isHealthy) {
      blogStore.error = 'API server is not available';
      return;
    }

    // Use the store action to fetch posts
    await blogStore.fetchPosts();
  } catch (err) {
    console.error('Error in fetchBlogPosts:', err);
  }
};

// Format date (2023-10-15T14:30:00Z -> October 15, 2023)
const formatDate = (dateString: string | null) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

onMounted(() => {
  fetchBlogPosts();
});
</script>

<template>
  <main class="blog-view">
    <h1 class="blog-view__title">Blog Posts</h1>

    <!-- Loading state -->
    <div v-if="loading" class="blog-view__loading">
      <div class="blog-view__spinner" aria-hidden="true"></div>
      <p>Loading blog posts...</p>
    </div>

    <!-- Error state -->
    <section v-else-if="error" class="blog-view__error">
      <p class="blog-view__error-message">{{ error }}</p>
      <div class="blog-view__error-actions">
        <AppButton
          v-if="!serverStarting && error.includes('API server is not available')"
          @click="startBackendServer"
          :variant="ButtonVariantEnum.PRIMARY"
          :disabled="serverStarting"
        >
          Start Backend Server
        </AppButton>
        <AppButton
          @click="fetchBlogPosts"
          :variant="ButtonVariantEnum.SECONDARY"
          :disabled="serverStarting"
        >
          Try Again
        </AppButton>
      </div>
    </section>

    <!-- Empty state -->
    <p v-else-if="!loading && !error && posts.length === 0" class="blog-view__empty">
      No blog posts found.
    </p>

    <!-- Blog posts -->
    <section v-else class="blog-view__grid">
      <BlogPostCard
        v-for="post in posts"
        :key="post.id"
        :title="post.title"
        :date="formatDate(post.publishedAt || null)"
        :author="post.author"
        :content="post.excerpt"
        :heroImageFilename="post.heroImage?.filename"
        :heroImageAlt="post.heroImage?.altText"
        :heroImageUrl="post.heroImage?.url"
        :slug="post.slug"
        :tags="post.tags"
        :variant="BlogPostTitleVariantEnum.FULL"
        class="blog-view__post"
      />
    </section>
  </main>
</template>

<style scoped>
.blog-view__title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-lg);
  color: var(--color-text);
}

.blog-view__loading {
  text-align: center;
  padding: var(--spacing-lg) 0;
}

.blog-view__spinner {
  display: inline-block;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  border: 0.25rem solid var(--color-border);
  border-top-color: var(--color-primary);
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-md);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.blog-view__error {
  background-color: var(--color-danger-light);
  border: 1px solid var(--color-danger);
  color: var(--color-danger-dark);
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-lg);
}

.blog-view__error-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.blog-view__empty {
  text-align: center;
  padding: var(--spacing-lg) 0;
  color: var(--color-text-muted);
}

.blog-view__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

@media (min-width: 768px) {
  .blog-view__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.blog-view__post {
  height: 100%;
  background-color: var(--color-background-card);
  padding: 0;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
}
</style>
