<!--
 * BlogDetailView
 * 
 * A view component that displays a detailed blog post with its content, hero image, and comments.
 * 
 * Features:
 * - Displays blog post content with markdown rendering
 * - Shows hero image if available
 * - Handles loading, error, and not found states
 * - Displays comments section
 * - Provides navigation back to blog listing
 * 
 * Props: None (uses route parameters)
 * 
 * Events: None
 * 
 * Accessibility:
 * - Uses semantic HTML elements (article, div)
 * - Provides meaningful alt text for images
 * - Maintains proper heading hierarchy
 * - Supports keyboard navigation
 * - Provides clear error messages
 */
-->
<script setup lang="ts">
import { ref, computed, onMounted, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBlogStore } from '@/stores/blogStore';
import AppImage from '@/components/atoms/AppImage.vue';
import LoadingSpinner from '@/components/atoms/LoadingSpinner.vue';
import BackButton from '@/components/atoms/BackButton.vue';
import BlogPostHeader from '@/components/molecules/BlogPostHeader.vue';
import CommentList from '@/components/organisms/CommentList.vue';
import BlogHero from '@/components/molecules/BlogHero.vue';
import { ImageSizeEnum } from '@/types/image';
import { checkApiHealth } from '@/api/apiClient';
import { marked } from 'marked';
import { CommentParentTypeEnum } from '@/types/comment';
import { useDocumentTitle } from '@/composables/useDocumentTitle';

const route = useRoute();
const router = useRouter();
const slug = computed((): string => route.params.slug as string);

// Get the blog store
const blogStore = useBlogStore();
const loading = ref<boolean>(true);
const error = ref<string | null>(null);

// Document title management
const { setTitle } = useDocumentTitle('Blog Post');

// Get the current post from the store
const post = computed(() => {
  const currentPost = blogStore.currentPost;
  // Update the document title when post is loaded
  if (currentPost?.title) {
    setTitle(currentPost.title);
  }
  return currentPost;
});

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
});

// Parse content to HTML using marked
const parsedContent = computed((): string => {
  if (!post.value?.content) return '';
  return marked(post.value.content) as string;
});

// Fetch the blog post when the component mounts or when the slug changes
const fetchBlogPost = async (): Promise<void> => {
  if (!slug.value) {
    error.value = 'Blog post slug is missing';
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const isHealthy = await checkApiHealth();

    if (!isHealthy) {
      error.value = 'API server is not available';
      return;
    }

    await blogStore.fetchPostBySlug(slug.value);

    if (!blogStore.currentPost) {
      error.value = 'Blog post not found';
    }
  } catch (err) {
    console.error('Error fetching blog post:', err);
    error.value = err instanceof Error ? err.message : 'Failed to load blog post';
  } finally {
    loading.value = false;
  }
};

// Watch for changes in the route parameter
watchEffect(() => {
  if (route.params.slug) {
    fetchBlogPost();
  }
});

onMounted(() => {
  fetchBlogPost();
});
</script>

<template>
  <div class="blog-detail-view">
    <!-- Loading state -->
    <LoadingSpinner v-if="loading" size="lg" text="Loading blog post..." />

    <!-- Error state -->
    <div v-else-if="error" class="blog-detail-view__error">
      <h2 class="blog-detail-view__error-heading">Error</h2>
      <p class="blog-detail-view__error-text">{{ error }}</p>
      <div class="blog-detail-view__actions">
        <BackButton
          text="Try Again"
          :to="route.path"
          class="blog-detail-view__button blog-detail-view__button--retry"
        />
        <BackButton
          text="Back to Blog Listing"
          to="/blog"
          class="blog-detail-view__button blog-detail-view__button--back"
          @click="router.push('/blog')"
        />
      </div>
    </div>
    <!-- Blog post content -->
    <template v-else-if="post">
      
      <!-- Hero image -->
      <BlogHero
        v-if="post.title"
        :hero-image="post.heroImage?.filename"
        :alt-text="post.heroImage?.altText || post.title"
      >
        <h2 class="blog-detail-view__hero-title">{{ post.title }}</h2>
      </BlogHero>

      <article class="blog-detail-view__article">
        <BlogPostHeader :post="post" />

        <!-- Content -->
        <div class="blog-detail-view__content markdown-body" v-html="parsedContent"></div>

        <!-- Comments section -->
        <section class="blog-detail-view__comments">
          <h2 class="blog-detail-view__comments-heading">Comments</h2>
          <CommentList :parent-id="post.id" :parent-type="CommentParentTypeEnum.POST" />
        </section>
      </article>
    </template>
    <!-- Not found state -->
    <div v-else class="blog-detail-view__not-found">
      <h2 class="blog-detail-view__not-found-heading">Blog Post Not Found</h2>
      <p class="blog-detail-view__not-found-text">The requested blog post could not be found.</p>
      <BackButton
        text="Back to Blog Listing"
        to="/blog"
        class="blog-detail-view__button blog-detail-view__button--back"
        @click="router.push('/blog')"
      />
    </div>
  </div>
</template>

<style scoped>
.blog-detail-view {
  max-width: 48rem; /* 768px */
  margin: 0 auto;
  padding: var(--spacing-xl);
}

.blog-detail-view__error {
  text-align: center;
  padding: var(--spacing-xl);
}

.blog-detail-view__error-heading {
  color: var(--color-danger);
  margin-bottom: var(--spacing-md);
}

.blog-detail-view__error-text {
  margin-bottom: var(--spacing-lg);
}

.blog-detail-view__actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}

.blog-detail-view__button {
  min-width: 8rem;
}

.blog-detail-view__article {
  background-color: var(--color-background);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  position: relative;
}

.blog-detail-view__hero-title {
  color: var(--color-background);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  text-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.5);
  margin: 0;
}

.blog-detail-view__content {
  padding: var(--spacing-xl);
  padding-top: var(--spacing-md);
}

.blog-detail-view__comments {
  padding: var(--spacing-xl);
  border-top: 0.0625rem solid var(--color-border);
}

.blog-detail-view__comments-heading {
  margin-bottom: var(--spacing-lg);
  font-size: var(--font-size-xl);
  color: var(--color-text);
}

:deep(.markdown-body) {
  font-family: var(--font-family-body);
  line-height: 1.6;
  color: var(--color-text);
}

:deep(.markdown-body h1),
:deep(.markdown-body h2),
:deep(.markdown-body h3),
:deep(.markdown-body h4),
:deep(.markdown-body h5),
:deep(.markdown-body h6) {
  margin-top: var(--spacing-xl);
  margin-bottom: var(--spacing-md);
  font-weight: var(--font-weight-bold);
  line-height: 1.25;
  color: var(--color-text);
}

:deep(.markdown-body p) {
  margin-bottom: var(--spacing-md);
}

:deep(.markdown-body img) {
  max-width: 100%;
  height: auto;
  border-radius: var(--border-radius-md);
  margin: var(--spacing-lg) 0;
}

:deep(.markdown-body code) {
  background-color: var(--color-background-muted);
  padding: 0.125rem 0.25rem;
  border-radius: var(--border-radius-sm);
  font-family: var(--font-family-mono);
  font-size: 0.875em;
}

:deep(.markdown-body pre) {
  background-color: var(--color-background-muted);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  overflow-x: auto;
  margin: var(--spacing-lg) 0;
}

:deep(.markdown-body pre code) {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
}

:deep(.markdown-body blockquote) {
  border-left: 0.25rem solid var(--color-primary);
  margin: var(--spacing-lg) 0;
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--color-background-muted);
  border-radius: 0 var(--border-radius-md) var(--border-radius-md) 0;
}

:deep(.markdown-body ul),
:deep(.markdown-body ol) {
  margin: var(--spacing-md) 0;
  padding-left: var(--spacing-xl);
}

:deep(.markdown-body li) {
  margin-bottom: var(--spacing-xs);
}

:deep(.markdown-body a) {
  color: var(--color-text-link);
  text-decoration: none;
  transition: color var(--transition-fast);
}

:deep(.markdown-body a:hover) {
  color: var(--color-text-link-hover);
  text-decoration: underline;
}

:deep(.markdown-body table) {
  width: 100%;
  border-collapse: collapse;
  margin: var(--spacing-lg) 0;
}

:deep(.markdown-body th),
:deep(.markdown-body td) {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 0.0625rem solid var(--color-border);
  text-align: left;
}

:deep(.markdown-body th) {
  background-color: var(--color-background-muted);
  font-weight: var(--font-weight-bold);
}

:deep(.markdown-body tr:nth-child(even)) {
  background-color: var(--color-background-muted);
}
</style>
