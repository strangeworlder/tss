<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useBlogStore } from '@/stores/blogStore'
import BlogPostCard from '@/components/organisms/BlogPostCard.vue'
import Button from '@/components/atoms/Button.vue'
import { checkApiHealth } from '@/api/apiClient'
import { BlogPostTitleVariantEnum } from '@/types/blogPost'
import { ButtonVariantEnum } from '@/types/button'

// Get the blog store
const blogStore = useBlogStore()
// Use computed properties to ensure reactivity with store changes
const posts = computed(() => blogStore.posts)
const loading = computed(() => blogStore.loading)
const error = computed(() => blogStore.error)
const serverStarting = ref(false)

// Start the backend server
const startBackendServer = async () => {
  if (serverStarting.value) return

  serverStarting.value = true

  try {
    // Using a simple fetch to a service worker that starts the server
    // In a real app, this would be a more sophisticated approach
    // This is just a mock implementation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Check if server is now running
    const isHealthy = await checkApiHealth()

    if (isHealthy) {
      fetchBlogPosts()
    } else {
      // Set error directly in the store
      blogStore.error = 'Failed to start the backend server. Please start it manually.'
    }
  } catch (err) {
    blogStore.error = 'Failed to start the backend server. Please start it manually.'
    console.error('Error starting backend server:', err)
  } finally {
    serverStarting.value = false
  }
}

// Fetch blog posts using the store
const fetchBlogPosts = async () => {
  try {
    // First check if the API is available
    const isHealthy = await checkApiHealth()

    if (!isHealthy) {
      blogStore.error = 'API server is not available'
      return
    }

    // Use the store action to fetch posts
    await blogStore.fetchPosts()
  } catch (err) {
    console.error('Error in fetchBlogPosts:', err)
  }
}

// Format date (2023-10-15T14:30:00Z -> October 15, 2023)
const formatDate = (dateString: string | null) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

onMounted(() => {
  fetchBlogPosts()
})
</script>

<template>
  <div class="blog-view">
    <h1 class="blog-view__title">Blog Posts</h1>

    <!-- Loading state -->
    <div v-if="loading" class="blog-view__loading">
      <div class="blog-view__spinner"></div>
      <p>Loading blog posts...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="blog-view__error">
      <p>{{ error }}</p>
      <Button
        v-if="!serverStarting && error.includes('API server is not available')"
        @click="startBackendServer"
        :variant="ButtonVariantEnum.PRIMARY"
        :disabled="serverStarting"
      >
        Start Backend Server
      </Button>
      <Button
        @click="fetchBlogPosts"
        :variant="ButtonVariantEnum.DANGER"
        :disabled="serverStarting"
      >
        Try Again
      </Button>
    </div>

    <!-- Empty state - only shown if we're not loading and have no error -->
    <div v-else-if="!loading && !error && posts.length === 0" class="blog-view__empty">
      <p>No blog posts found.</p>
    </div>

    <!-- Blog posts -->
    <div v-else class="blog-view__grid">
      <BlogPostCard
        v-for="post in posts"
        :key="post.id"
        :title="post.title"
        :date="formatDate(post.publishedAt)"
        :author="post.author"
        :content="post.excerpt"
        :heroImageFilename="post.heroImage?.filename"
        :heroImageAlt="post.heroImage?.altText"
        :heroImageUrl="post.heroImageUrl"
        :slug="post.slug"
        :tags="post.tags"
        :variant="BlogPostTitleVariantEnum.FULL"
        class="blog-view__post"
      />
    </div>
  </div>
</template>

<style scoped>
.blog-view__title {
  font-size: 1.875rem;
  font-weight: bold;
  margin-bottom: var(--spacing-8);
  color: var(--color-heading);
}

.blog-view__loading {
  text-align: center;
  padding: var(--spacing-8) 0;
}

.blog-view__spinner {
  display: inline-block;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  border: 0.25rem solid var(--color-border);
  border-top-color: var(--vt-c-indigo);
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-4);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.blog-view__error {
  background-color: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.5);
  color: rgb(185, 28, 28);
  padding: var(--spacing-4);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-8);
}

.blog-view__empty {
  text-align: center;
  padding: var(--spacing-8) 0;
  color: var(--color-text);
  opacity: 0.8;
}

.blog-view__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-6);
}

@media (min-width: 768px) {
  .blog-view__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.blog-view__post {
  height: 100%;
  background-color: var(--color-background);
  padding: var(--spacing-6);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
