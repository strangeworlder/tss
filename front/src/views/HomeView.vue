<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useBlogStore } from '@/stores/blogStore';
import BlogPostCard from '@/components/organisms/BlogPostCard.vue';
import { checkApiHealth } from '@/api/apiClient';
import Button from '@/components/atoms/Button.vue';
import { BlogPostTitleVariantEnum } from '@/types/blogPost';
import { ButtonVariantEnum } from '@/types/button';

// Get the blog store
const blogStore = useBlogStore();
const storeLoading = computed(() => blogStore.loading);
const storeError = computed(() => blogStore.error);
const loading = ref(false);
const error = ref<string | null>(null);

// Get only 3 most recent posts for the homepage
const recentPosts = computed(() => {
  return blogStore.posts.slice(0, 3);
});

// Fetch recent blog posts from the API
const fetchRecentPosts = async () => {
  loading.value = true;
  error.value = null;

  try {
    // First check if the API is available
    const isHealthy = await checkApiHealth();
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

    if (!isHealthy) {
      error.value =
        `API server ${API_BASE_URL}/health is not available. Please make sure the backend server is running.`;
      return;
    }

    // Use the store action to fetch posts (limit to 3 for homepage)
    await blogStore.fetchPosts(3);
  } catch (err) {
    console.error('Error fetching recent posts:', err);
    error.value =
      err instanceof Error
        ? err.message
        : 'Failed to load recent posts. Please make sure the backend server is running.';
  } finally {
    loading.value = false;
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
  fetchRecentPosts();
});
</script>

<template>
  <div class="home-view">
    <section class="home-view__hero">
      <div class="container home-view__hero-container">
        <h1 class="home-view__hero-title">Welcome to Vue Blog</h1>
        <p class="home-view__hero-text">A modern blog built with Vue 3 and TypeScript.</p>
        <Button to="/blog" :variant="ButtonVariantEnum.PRIMARY" class="home-view__cta"> Read All Blog Posts </Button>
      </div>
    </section>

    <section class="home-view__recent-posts">
      <div class="container">
        <h2 class="home-view__section-title">Recent Posts</h2>

        <!-- Loading state -->
        <div v-if="loading" class="home-view__loading">
          <div class="home-view__spinner"></div>
          <p>Loading recent posts...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="text-center py-8">
          <p class="text-red-600 mb-4">{{ error }}</p>
          <Button @click="fetchRecentPosts" :variant="ButtonVariantEnum.DANGER"> Try Again </Button>
        </div>

        <!-- Empty state -->
        <div v-else-if="recentPosts.length === 0" class="text-center py-8">
          <p class="text-gray-600 mb-4">No recent posts found.</p>
          <Button to="/blog" :variant="ButtonVariantEnum.SECONDARY"> Check our blog &rarr; </Button>
        </div>

        <!-- Recent posts -->
        <div v-else class="home-view__recent-posts">
          <h2 class="home-view__section-title">Recent Blog Posts</h2>
          <div class="home-view__posts-grid">
            <BlogPostCard
              v-for="post in recentPosts"
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
              :variant="BlogPostTitleVariantEnum.COMPACT"
              class="home-view__post"
            />
          </div>
          <div class="home-view__more-link">
            <Button to="/blog" :variant="ButtonVariantEnum.SECONDARY"> View All Blog Posts </Button>
          </div>
        </div>
      </div>
    </section>

    <section class="home-view__newsletter">
      <div class="container home-view__newsletter-container">
        <h2 class="home-view__newsletter-title">Subscribe to Our Newsletter</h2>
        <p class="home-view__newsletter-text">
          Get the latest blog posts and updates delivered to your inbox.
        </p>
        <form class="home-view__newsletter-form">
          <input
            type="email"
            placeholder="Your email address"
            class="home-view__newsletter-input"
            required
          />
          <Button type="submit" :variant="ButtonVariantEnum.PRIMARY"> Subscribe </Button>
        </form>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-view__hero {
  background-color: var(--vt-c-indigo);
  color: var(--vt-c-white);
  padding-top: var(--spacing-16);
  padding-bottom: var(--spacing-16);
  padding-left: var(--spacing-4);
  padding-right: var(--spacing-4);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-12);
}

.home-view__hero-container {
  text-align: center;
}

.home-view__hero-title {
  font-size: 2.25rem;
  font-weight: bold;
  margin-bottom: var(--spacing-4);
}

.home-view__hero-text {
  font-size: 1.25rem;
  margin-bottom: var(--spacing-8);
  max-width: 42rem;
  margin-left: auto;
  margin-right: auto;
}

.home-view__cta {
  display: inline-block;
  background-color: var(--vt-c-white);
  color: var(--vt-c-indigo);
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--border-radius);
  font-weight: 500;
  transition: background-color 0.2s;
}

.home-view__cta:hover {
  background-color: rgba(255, 255, 255, 0.9);
}

.home-view__recent-posts {
  margin-bottom: var(--spacing-12);
}

.home-view__section-title {
  font-size: 1.875rem;
  font-weight: bold;
  margin-bottom: var(--spacing-8);
  color: var(--color-heading);
}

.home-view__posts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-6);
}

@media (min-width: 768px) {
  .home-view__posts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .home-view__posts-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.home-view__post {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--color-background);
  padding: var(--spacing-6);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.home-view__more-link {
  color: var(--vt-c-indigo);
  font-weight: 500;
}

.home-view__more-link:hover {
  color: var(--color-text);
}

.home-view__newsletter {
  background-color: var(--color-background-soft);
  padding: var(--spacing-12) var(--spacing-4);
  border-radius: var(--border-radius);
}

.home-view__newsletter-container {
  max-width: 42rem;
  text-align: center;
}

.home-view__newsletter-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: var(--spacing-4);
  color: var(--color-heading);
}

.home-view__newsletter-text {
  margin-bottom: var(--spacing-6);
  color: var(--color-text);
}

.home-view__newsletter-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.home-view__newsletter-input {
  flex-grow: 1;
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border);
  background-color: var(--color-background);
  color: var(--color-text);
}

.home-view__newsletter-input:focus {
  outline: none;
  border-color: var(--vt-c-indigo);
}

.home-view__newsletter-button {
  padding: var(--spacing-3) var(--spacing-6);
}

@media (min-width: 768px) {
  .home-view__hero-title {
    font-size: 3rem;
  }
}

.home-view__retry-button {
  display: inline-block;
  background-color: var(--vt-c-red);
  color: var(--vt-c-white);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--border-radius);
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.home-view__retry-button:hover {
  background-color: var(--vt-c-red-dark, #b91c1c);
}

.home-view__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-8) 0;
  text-align: center;
}

.home-view__spinner {
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
</style>
