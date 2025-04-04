<script setup lang="ts">
import { ref, computed, onMounted, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBlogStore } from '@/stores/blogStore';
import AppImage from '@/components/atoms/AppImage.vue';
import TagPill from '@/components/atoms/TagPill.vue';
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

// Format date (2023-10-15T14:30:00Z -> October 15, 2023)
const formatDate = (dateString: string | null) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

// Configure marked options
marked.setOptions({
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // Convert line breaks to <br>
  headerIds: true, // Add IDs to headers
  mangle: false, // Don't mangle header IDs
  sanitize: true, // We'll use DOMPurify instead
});

// Parse content to HTML using marked
const parsedContent = computed(() => {
  if (!post.value?.content) return '';
  
  // Debug the content
  console.log('Original content:', post.value.content);
  
  // Parse markdown
  const html = marked(post.value.content);
  
  // Debug the parsed HTML
  console.log('Parsed HTML:', html);
  
  return html;
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
    // First check if the API is available
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

const updatePost = async (id: string, data: any) => {
  const token = localStorage.getItem('token'); // or however you store the token
  console.log('Token being sent:', token); // Debug log

  const formData = new FormData();
  Object.keys(data).forEach(key => {
    formData.append(key, data[key]);
  });

  const response = await fetch(`http://localhost:4000/api/v1/blog/id/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Don't set Content-Type header for FormData
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Update error:', error); // Debug log
    throw new Error(error.message || 'Failed to update post');
  }

  return response.json();
};
</script>

<template>
  <div class="blog-detail-view">
    <!-- Loading state -->
    <div v-if="loading" class="blog-detail-view__loading">
      <div class="blog-detail-view__spinner"></div>
      <p>Loading blog post...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="blog-detail-view__error">
      <p>{{ error }}</p>
      <div class="blog-detail-view__actions">
        <button 
          @click="fetchBlogPost"
          class="blog-detail-view__button blog-detail-view__button--retry"
        >
          Try Again
        </button>
        <button
          @click="() => router.push('/blog')"
          class="blog-detail-view__button blog-detail-view__button--back"
        >
          Back to Blog Listing
        </button>
      </div>
    </div>
    
    <!-- Blog post content -->
    <article v-else-if="post" class="blog-detail-view__article">
      <header class="blog-detail-view__header">
        <button 
          @click="() => router.push('/blog')"
          class="blog-detail-view__back-button"
        >
          &larr; Back to Blog Listing
        </button>

        <h1 class="blog-detail-view__title">{{ post.title }}</h1>
        
        <div class="blog-detail-view__meta">
          <span v-if="post.publishedAt" class="blog-detail-view__date">
            {{ formatDate(post.publishedAt) }}
          </span>
          
          <div v-if="post.author" class="blog-detail-view__author">
            <div v-if="post.author.avatar" class="blog-detail-view__author-avatar">
              <AppImage
                :filename="post.author.avatar.filename"
                :alt="post.author.avatar.altText"
                :size="ImageSize.THUMBNAIL"
                class="blog-detail-view__author-img"
              />
            </div>
            <span class="blog-detail-view__author-name">
              by {{ post.author.name }}
            </span>
          </div>
        </div>
        
        <!-- Tags -->
        <div v-if="post.tags && post.tags.length > 0" class="blog-detail-view__tags">
          <TagPill 
            v-for="tag in post.tags" 
            :key="tag" 
            :tag="tag"
            class="blog-detail-view__tag"
          />
        </div>
      </header>
      
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
      <button
        @click="() => router.push('/blog')"
        class="blog-detail-view__button blog-detail-view__button--back"
      >
        Back to Blog Listing
      </button>
    </div>
  </div>
</template>

<style scoped>
.blog-detail-view {
  min-height: 100vh;
  background-color: var(--color-background);
  color: var(--color-text);
}

/* Loading state styles */
.blog-detail-view__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
}

.blog-detail-view__spinner {
  display: inline-block;
  width: var(--spacing-12);
  height: var(--spacing-12);
  border-radius: 50%;
  border: var(--spacing-1) solid var(--color-border);
  border-top-color: var(--color-heading);
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-4);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error state styles */
.blog-detail-view__error {
  text-align: center;
  padding: var(--spacing-8) 0;
  min-height: 50vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.blog-detail-view__actions {
  display: flex;
  gap: var(--spacing-4);
  justify-content: center;
  margin-top: var(--spacing-4);
}

/* Article styles */
.blog-detail-view__article {
  max-width: var(--container-width);
  margin: 0 auto;
  padding: var(--spacing-8) var(--spacing-4);
}

.blog-detail-view__header {
  margin-bottom: var(--spacing-8);
}

.blog-detail-view__back-button {
  display: inline-block;
  margin-bottom: var(--spacing-4);
  color: var(--color-text);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: color var(--transition-fast);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.blog-detail-view__back-button:hover {
  color: var(--color-heading);
}

.blog-detail-view__title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-4);
  color: var(--color-heading);
  line-height: 1.2;
}

.blog-detail-view__meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);
  color: var(--color-text);
  font-size: var(--font-size-sm);
}

.blog-detail-view__author {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.blog-detail-view__author-avatar {
  width: var(--spacing-8);
  height: var(--spacing-8);
  border-radius: 50%;
  overflow: hidden;
}

.blog-detail-view__author-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.blog-detail-view__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-4);
}

.blog-detail-view__hero {
  margin-bottom: var(--spacing-8);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.blog-detail-view__hero-img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  max-height: 60vh;
}

/* Markdown content styles */
.blog-detail-view__content {
  font-size: var(--font-size-base);
  line-height: 1.6;
  color: var(--color-text);
}

.blog-detail-view__content :deep(h1) {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin: var(--spacing-8) 0 var(--spacing-4);
  color: var(--color-heading);
}

.blog-detail-view__content :deep(h2) {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: var(--spacing-6) 0 var(--spacing-4);
  color: var(--color-heading);
}

.blog-detail-view__content :deep(h3) {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: var(--spacing-4) 0 var(--spacing-2);
  color: var(--color-heading);
}

.blog-detail-view__content :deep(p) {
  margin-bottom: var(--spacing-4);
}

.blog-detail-view__content :deep(ul),
.blog-detail-view__content :deep(ol) {
  margin: var(--spacing-4) 0;
  padding-left: var(--spacing-4);
}

.blog-detail-view__content :deep(li) {
  margin-bottom: var(--spacing-2);
}

.blog-detail-view__content :deep(pre) {
  background-color: var(--color-background-soft);
  padding: var(--spacing-4);
  border-radius: var(--border-radius);
  overflow-x: auto;
  margin: var(--spacing-4) 0;
}

.blog-detail-view__content :deep(code) {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  background-color: var(--color-background-soft);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--border-radius-sm);
}

.blog-detail-view__content :deep(a) {
  color: var(--color-heading);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.blog-detail-view__content :deep(a:hover) {
  color: var(--color-text);
  text-decoration: underline;
}

.blog-detail-view__content :deep(strong) {
  font-weight: var(--font-weight-bold);
}

.blog-detail-view__content :deep(em) {
  font-style: italic;
}

.blog-detail-view__content :deep(blockquote) {
  border-left: 4px solid var(--color-heading);
  margin: var(--spacing-4) 0;
  padding: var(--spacing-2) var(--spacing-4);
  background-color: var(--color-background-soft);
  color: var(--color-text);
}

.blog-detail-view__content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: var(--border-radius);
  margin: var(--spacing-4) 0;
}

.blog-detail-view__content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: var(--spacing-4) 0;
}

.blog-detail-view__content :deep(th),
.blog-detail-view__content :deep(td) {
  border: 1px solid var(--color-border);
  padding: var(--spacing-2) var(--spacing-4);
  text-align: left;
}

.blog-detail-view__content :deep(th) {
  background-color: var(--color-background-soft);
  font-weight: var(--font-weight-bold);
}

/* Not found state */
.blog-detail-view__not-found {
  text-align: center;
  padding: var(--spacing-8) 0;
  min-height: 50vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* Button styles */
.blog-detail-view__button {
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
  cursor: pointer;
  border: none;
  transition: background-color var(--transition-fast);
}

.blog-detail-view__button--retry {
  background-color: var(--color-heading);
  color: var(--color-background);
}

.blog-detail-view__button--retry:hover {
  background-color: var(--color-text);
}

.blog-detail-view__button--back {
  background-color: var(--color-background-soft);
  color: var(--color-text);
}

.blog-detail-view__button--back:hover {
  background-color: var(--color-border);
}

/* Responsive styles */
@media (max-width: 768px) {
  .blog-detail-view__article {
    padding: var(--spacing-4) var(--spacing-2);
  }

  .blog-detail-view__title {
    font-size: var(--font-size-2xl);
  }

  .blog-detail-view__meta {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-2);
  }
}

.blog-detail-view__comments {
  margin-top: var(--spacing-8);
  padding-top: var(--spacing-8);
  border-top: 1px solid var(--color-border);
}
</style> 