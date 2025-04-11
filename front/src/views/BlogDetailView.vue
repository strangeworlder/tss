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
import FormError from '@/components/atoms/FormError.vue';
import { ImageSizeEnum } from '@/types/image';
import { checkApiHealth } from '@/api/apiClient';
import { marked } from 'marked';
import { CommentParentTypeEnum } from '@/types/comment';
import { useDocumentTitle } from '@/composables/useDocumentTitle';
import type { IBlogPost } from '@/types/blog';
import type { IScheduledContent } from '@/types/scheduledContent';
import ScheduledPostPreview from '@/components/molecules/ScheduledPostPreview.vue';
import ScheduledPostStatus from '@/components/molecules/ScheduledPostStatus.vue';
import { useScheduledContentStore } from '@/stores/scheduledContentStore';
import { useUpdateStore } from '@/stores/update';

const route = useRoute();
const router = useRouter();
const blogStore = useBlogStore();
const scheduledContentStore = useScheduledContentStore();
const updateStore = useUpdateStore();

const isLoading = ref(false);
const error = ref<Error | null>(null);
const post = ref<IBlogPost | null>(null);
const scheduledContent = ref<IScheduledContent | null>(null);

const isScheduled = computed(() => !!scheduledContent.value);
const hasActiveUpdate = computed(() =>
  post.value ? updateStore.hasActiveUpdate(post.value.id) : false
);

// Document title management
const { setTitle } = useDocumentTitle('Blog Post');

// Get the current post from the store
const currentPost = computed(() => {
  const currentPost = blogStore.currentPost;
  console.log('Current post from store:', currentPost);
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

async function fetchBlogPost() {
  isLoading.value = true;
  error.value = null;

  try {
    const slug = route.params.slug as string;
    console.log('BlogDetailView: Starting fetch with slug:', slug);
    console.log('BlogDetailView: Current store state before fetch:', {
      currentPost: blogStore.currentPost,
      loading: blogStore.loading,
      error: blogStore.error,
    });

    await blogStore.fetchPostBySlug(slug);

    console.log('BlogDetailView: Store state after fetch:', {
      currentPost: blogStore.currentPost,
      loading: blogStore.loading,
      error: blogStore.error,
    });

    post.value = blogStore.currentPost;
    console.log('BlogDetailView: Local post ref after assignment:', post.value);

    if (post.value) {
      console.log('BlogDetailView: Post found, fetching scheduled content for ID:', post.value.id);
      // Use the getContentById getter from the store
      const content = scheduledContentStore.getContentById(post.value.id);
      if (content) {
        scheduledContent.value = content;
      } else {
        // If not found in the store, fetch it
        await scheduledContentStore.fetchScheduledContent();
        scheduledContent.value = scheduledContentStore.getContentById(post.value.id) || null;
      }
    }
  } catch (err) {
    error.value = err as Error;
  } finally {
    isLoading.value = false;
  }
}

async function handleEdit() {
  if (!post.value) return;
  await router.push(`/blog/${post.value.id}/edit`);
}

async function handleCancel() {
  if (!scheduledContent.value) return;

  try {
    await scheduledContentStore.cancelScheduledContent(scheduledContent.value.id);
    scheduledContent.value = null;
  } catch (err) {
    error.value = err as Error;
  }
}

async function handleRetry() {
  if (!scheduledContent.value) return;

  try {
    await scheduledContentStore.retryPublication(scheduledContent.value.id);
  } catch (err) {
    error.value = err as Error;
  }
}

onMounted(() => {
  fetchBlogPost();
});
</script>

<template>
  <div class="blog-detail-view">
    <div class="blog-detail-view__header">
      <BackButton />
    </div>

    <LoadingSpinner v-if="isLoading" />

    <FormError v-else-if="error" :message="error.message" className="blog-detail-view__error" />

    <template v-else-if="post">
      <BlogHero
        :hero-image="post.heroImage?.filename"
        :alt-text="post.heroImage?.altText || post.title"
        class="blog-detail-view__hero"
      >
        <h2 class="blog-detail-view__hero-title">{{ post.title }}</h2>
      </BlogHero>
      <article 
        class="blog-detail-view__article"
        :class="{ 'blog-detail-view__article--scheduled': isScheduled }"
      >
        <BlogPostHeader 
          :post="post" 
          class="blog-detail-view__header" 
         />
        <div v-if="scheduledContent" class="blog-detail-view__scheduled">
          <ScheduledPostPreview
            :content-id="post.id"
            :publish-at="scheduledContent.publishAt.toISOString()"
            :content="scheduledContent.content"
            :version="scheduledContent.version"
            :has-active-update="hasActiveUpdate"
            @edit="handleEdit"
            @cancel="handleCancel"
          />
          <ScheduledPostStatus
            :status="scheduledContent.status"
            :error="scheduledContent.error"
            :has-active-update="hasActiveUpdate"
            @retry="handleRetry"
          />
        </div>
        <div v-else class="blog-detail-view__content">
          <div class="blog-content markdown-body" v-html="parsedContent"></div>
        </div>

        <div class="blog-detail-view__comments">
          <h2 class="blog-detail-view__comments-heading">Comments</h2>
          <CommentList 
            :parent-id="post.id" 
            :parent-type="CommentParentTypeEnum.POST" 
          />
        </div>
      </article>
    </template>
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
  margin-top: 6rem;
  padding-top: var(--spacing-sm);
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
  padding: 0 var(--spacing-xl) var(--spacing-xl);
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

.blog-content {
  font-family: var(--font-family-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-text);
}

:deep(.markdown-body) {
  font-family: var(--font-family-base);
  line-height: var(--line-height-relaxed);
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

.blog-detail-view__article--scheduled {
  opacity: 0.8;
  pointer-events: none;
}

.blog-detail-view__scheduled {
  position: relative;
  padding: var(--spacing-md);
  background-color: var(--color-background-muted);
  border-bottom: 0.0625rem solid var(--color-border);
}
</style>
