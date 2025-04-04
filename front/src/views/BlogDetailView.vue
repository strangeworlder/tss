<script setup lang="ts">
import { ref, computed, onMounted, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBlogStore } from '@/stores/blogStore';
import AppImage from '@/components/atoms/AppImage.vue';
import LoadingSpinner from '@/components/atoms/LoadingSpinner.vue';
import BackButton from '@/components/atoms/BackButton.vue';
import BlogPostHeader from '@/components/molecules/BlogPostHeader.vue';
import CommentList from '@/components/blog/CommentList.vue';
import { ImageSize } from '@/types/image';
import { checkApiHealth } from '@/api/apiClient';
import { marked } from 'marked';

const route = useRoute();
const router = useRouter();
const slug = computed(() => route.params.slug as string);

// Get the blog store
const blogStore = useBlogStore();
const loading = ref(true);
const error = ref<string | null>(null);

// Get the current post from the store
const post = computed(() => blogStore.currentPost);

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
  headerIds: true,
  mangle: false,
  sanitize: true,
});

// Parse content to HTML using marked
const parsedContent = computed(() => {
  if (!post.value?.content) return '';
  return marked(post.value.content);
});

// Fetch the blog post when the component mounts or when the slug changes
const fetchBlogPost = async () => {
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
    <LoadingSpinner 
      v-if="loading"
      size="lg"
      text="Loading blog post..."
    />
    
    <!-- Error state -->
    <div v-else-if="error" class="blog-detail-view__error">
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
        />
      </div>
    </div>
    
    <!-- Blog post content -->
    <article v-else-if="post" class="blog-detail-view__article">
      <BlogPostHeader :post="post" />
      
      <!-- Hero image -->
      <div v-if="post.heroImage" class="blog-detail-view__hero">
        <AppImage 
          :filename="post.heroImage.filename" 
          :size="ImageSize.FULL" 
          :alt="post.heroImage.altText || post.title" 
          class="blog-detail-view__hero-img"
        />
      </div>
      
      <!-- Content -->
      <div 
        class="blog-detail-view__content markdown-body" 
        v-html="parsedContent"
      ></div>

      <!-- Comments section -->
      <div class="blog-detail-view__comments">
        <CommentList
          :parent-id="post.id"
          parent-type="post"
        />
      </div>
    </article>
    
    <!-- Not found state -->
    <div v-else class="blog-detail-view__not-found">
      <p>Blog post not found.</p>
      <BackButton 
        text="Back to Blog Listing"
        to="/blog"
        class="blog-detail-view__button blog-detail-view__button--back"
      />
    </div>
  </div>
</template>

<style scoped>
.blog-detail-view {
  min-height: 100vh;
  background-color: var(--color-background);
  color: var(--color-text);
  padding: var(--spacing-4);
}

.blog-detail-view__error {
  text-align: center;
  padding: var(--spacing-8);
}

.blog-detail-view__error-text {
  color: var(--color-error);
  margin-bottom: var(--spacing-4);
}

.blog-detail-view__actions {
  display: flex;
  gap: var(--spacing-4);
  justify-content: center;
}

.blog-detail-view__article {
  max-width: var(--content-width);
  margin: 0 auto;
}

.blog-detail-view__hero {
  margin-bottom: var(--spacing-8);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
}

.blog-detail-view__hero-img {
  width: 100%;
  height: auto;
  display: block;
}

.blog-detail-view__content {
  margin-bottom: var(--spacing-8);
  line-height: 1.6;
}

.blog-detail-view__comments {
  margin-top: var(--spacing-8);
  padding-top: var(--spacing-8);
  border-top: 1px solid var(--color-border);
}

.blog-detail-view__not-found {
  text-align: center;
  padding: var(--spacing-8);
}

@media (min-width: 768px) {
  .blog-detail-view {
    padding: var(--spacing-8);
  }
}
</style> 