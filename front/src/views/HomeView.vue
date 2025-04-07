<!--
@component HomeView
@description Home page component that displays recent blog posts and a newsletter signup form

@features
- Displays hero section with call-to-action
- Shows 3 most recent blog posts
- Provides newsletter signup functionality
- Handles loading, error, and empty states
- Responsive layout with grid system
- Dark mode support through semantic variables

@props
None - This is a page component that doesn't accept props

@events
None - This component doesn't emit events

@slots
None - This component doesn't provide slots

@accessibility
- Uses semantic HTML structure with proper heading hierarchy (h1, h2)
- Form inputs have associated labels
- Loading states are announced to screen readers
- Error messages are properly associated with form controls
- Keyboard navigation is supported for all interactive elements
- Color contrast meets WCAG 2.1 AA standards through semantic variables
- Responsive design ensures usability across device sizes

@example
<template>
  <HomeView />
</template>
-->

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useBlogStore } from '@/stores/blogStore';
import type { IBlogPost, Author } from '@/types/blog';
import type { IUser } from '@/types/user';
import BlogPostCard from '@/components/organisms/BlogPostCard.vue';
import { checkApiHealth } from '@/api/apiClient';
import AppButton from '@/components/atoms/AppButton.vue';
import { BlogPostTitleVariantEnum } from '@/types/blogPost';
import { ButtonVariantEnum } from '@/types/button';
import LoadingSpinner from '@/components/atoms/LoadingSpinner.vue';
import FormGroup from '@/components/molecules/FormGroup.vue';
import HomeViewError from '@/components/molecules/HomeViewError.vue';

// Store
const blogStore = useBlogStore();

// State
const loading = ref<boolean>(false);
const error = ref<string | null>(null);
const newsletterEmail = ref<string>('');
const newsletterError = ref<string | null>(null);
const newsletterSuccess = ref<boolean>(false);

// Computed
const recentPosts = computed(() => {
  return blogStore.posts.slice(0, 3) as IBlogPost[];
});

const errorMessage = computed<string>(() => {
  return error.value || '';
});

// Methods
const fetchRecentPosts = async (): Promise<void> => {
  loading.value = true;
  error.value = null;

  try {
    const API_BASE_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    const isHealthy = await checkApiHealth();

    if (!isHealthy) {
      error.value = `API server ${API_BASE_URL}/health is not available. Please make sure the backend server is running.`;
      return;
    }

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

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const getFormattedDate = (dateString: string | null | undefined): string | undefined => {
  const formatted = formatDate(dateString);
  return formatted || undefined;
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const handleNewsletterSubmit = async (event: Event): Promise<void> => {
  event.preventDefault();
  newsletterError.value = null;
  newsletterSuccess.value = false;

  if (!newsletterEmail.value.trim()) {
    newsletterError.value = 'Email address is required';
    return;
  }

  if (!validateEmail(newsletterEmail.value)) {
    newsletterError.value = 'Please enter a valid email address';
    return;
  }

  try {
    // TODO: Implement newsletter subscription API call
    newsletterSuccess.value = true;
    newsletterEmail.value = '';
  } catch (err) {
    newsletterError.value =
      err instanceof Error ? err.message : 'Failed to subscribe to newsletter. Please try again.';
  }
};

onMounted(() => {
  fetchRecentPosts();
});
</script>

<template>
  <main class="home-view">
    <section class="home-view__hero">
      <div class="container home-view__hero-container">
        <h1 class="home-view__hero-title">Welcome to Vue Blog</h1>
        <p class="home-view__hero-text">A modern blog built with Vue 3 and TypeScript.</p>
        <AppButton 
          to="/blog" 
          :variant="ButtonVariantEnum.PRIMARY" 
          class="home-view__cta"
        >
          Read All Blog Posts
        </AppButton>
      </div>
    </section>

    <section class="home-view__recent-posts">
      <div class="container">
        <h2 class="home-view__section-title">Recent Posts</h2>

        <!-- Loading state -->
        <LoadingSpinner 
          v-if="loading" 
          text="Loading recent posts..."
          size="lg"
        />

        <!-- Error state -->
        <HomeViewError
          v-else-if="error"
          :error="error"
          @retry="fetchRecentPosts"
        />

        <!-- Empty state -->
        <div 
          v-else-if="recentPosts.length === 0" 
          class="home-view__empty"
        >
          <p class="home-view__empty-message">No recent posts found.</p>
          <AppButton 
            to="/blog" 
            :variant="ButtonVariantEnum.SECONDARY"
          >
            Check our blog &rarr;
          </AppButton>
        </div>

        <!-- Recent posts -->
        <div v-else class="home-view__posts">
          <div class="home-view__posts-grid">
            <BlogPostCard
              v-for="post in recentPosts"
              :key="post.id"
              :title="post.title"
              :date="getFormattedDate(post.publishedAt)"
              :author="post.author"
              :content="post.excerpt"
              :hero-image-filename="post.heroImage?.filename"
              :hero-image-alt="post.heroImage?.altText"
              :hero-image-url="post.heroImage?.url"
              :slug="post.slug"
              :tags="post.tags"
              :variant="BlogPostTitleVariantEnum.COMPACT"
              class="home-view__post"
            />
          </div>
          <div class="home-view__more">
            <AppButton 
              to="/blog" 
              :variant="ButtonVariantEnum.SECONDARY"
            >
              View All Blog Posts
            </AppButton>
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
        <form 
          class="home-view__newsletter-form"
          @submit="handleNewsletterSubmit"
          aria-label="Newsletter signup form"
          novalidate
        >
          <FormGroup
            id="newsletter-email"
            label="Email address"
            type="email"
            v-model="newsletterEmail"
            :error="newsletterError"
            required
            placeholder="Your email address"
            className="home-view__newsletter-field"
          />
          <p 
            v-if="newsletterSuccess" 
            class="home-view__newsletter-success" 
            role="status"
          >
            Thank you for subscribing to our newsletter!
          </p>
          <AppButton 
            type="submit" 
            :variant="ButtonVariantEnum.PRIMARY"
          >
            Subscribe
          </AppButton>
        </form>
      </div>
    </section>
  </main>
</template>

<style scoped>
.home-view__hero {
  background-color: var(--color-primary-600);
  color: var(--color-text-inverse);
  padding: var(--spacing-xl) var(--spacing-md);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-xl);
}

.home-view__hero-container {
  text-align: center;
}

.home-view__hero-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-md);
}

.home-view__hero-text {
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-lg);
  max-width: 42rem;
  margin-left: auto;
  margin-right: auto;
}

.home-view__cta {
  display: inline-block;
  background-color: var(--color-background);
  color: var(--color-primary-600);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius);
  font-weight: var(--font-weight-medium);
  transition: background-color var(--transition-fast);
}

.home-view__cta:hover {
  background-color: var(--color-background-alt);
}

.home-view__recent-posts {
  margin-bottom: var(--spacing-xl);
}

.home-view__section-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-lg);
  color: var(--color-text);
}

.home-view__posts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
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
  background-color: var(--color-background-card);
  padding: 0;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
}

.home-view__more {
  text-align: center;
  margin-top: var(--spacing-lg);
}

.home-view__newsletter {
  background-color: var(--color-background-alt);
  padding: var(--spacing-xl) var(--spacing-md);
  border-radius: var(--border-radius);
}

.home-view__newsletter-container {
  max-width: 42rem;
  text-align: center;
}

.home-view__newsletter-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-md);
  color: var(--color-text);
}

.home-view__newsletter-text {
  margin-bottom: var(--spacing-md);
  color: var(--color-text-secondary);
}

.home-view__newsletter-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.home-view__newsletter-field {
  flex: 1;
}

.home-view__newsletter-success {
  color: var(--color-success);
  font-size: var(--font-size-sm);
}

.home-view__error,
.home-view__empty {
  text-align: center;
  padding: var(--spacing-lg) 0;
}

.home-view__error-message {
  color: var(--color-danger);
  margin-bottom: var(--spacing-md);
}

.home-view__empty-message {
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-md);
}

@media (min-width: 768px) {
  .home-view__hero-title {
    font-size: var(--font-size-3xl);
  }

  .home-view__newsletter-form {
    flex-direction: row;
    align-items: flex-start;
  }
}
</style>
