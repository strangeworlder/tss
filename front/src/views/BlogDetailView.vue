<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBlogStore } from '@/stores/blogStore';
import AppImage from '@/components/common/AppImage.vue';
import { ImageSize } from '@/types/image';
import { checkApiHealth } from '@/api/apiClient';

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

// Simple markdown parser for basic formatting
const parseMarkdown = (markdown: string) => {
  if (!markdown) return '';
  
  // Process code blocks
  let html = markdown.replace(/```([a-z]*)\n([\s\S]*?)\n```/g, '<pre><code>$2</code></pre>');
  
  // Process headers
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  
  // Process lists
  html = html.replace(/^\- (.*?)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n)+/g, '<ul>$&</ul>');
  
  // Process bold and italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Process links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
  
  // Process paragraphs - split by double newlines and wrap in <p> tags
  const paragraphs = html.split('\n\n');
  html = paragraphs
    .map(p => {
      if (
        !p.startsWith('<h1>') && 
        !p.startsWith('<h2>') && 
        !p.startsWith('<h3>') && 
        !p.startsWith('<ul>') && 
        !p.startsWith('<pre>') &&
        p.trim().length > 0
      ) {
        return `<p>${p}</p>`;
      }
      return p;
    })
    .join('\n\n');
  
  return html;
};

// Fetch blog post from the API using the store
const fetchPost = async () => {
  if (!slug.value) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    // First check if the API is available
    const isHealthy = await checkApiHealth();
    
    if (!isHealthy) {
      error.value = 'API server is not available';
      return;
    }
    
    // Use the store action to fetch the post by slug
    await blogStore.fetchPostBySlug(slug.value);
    
    // If post wasn't found in the store after fetching, show an error
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

// Go back to blog list
const goBack = () => {
  router.push('/blog');
};

// Parse content to HTML
const parsedContent = computed(() => {
  if (!post.value?.content) return '';
  return parseMarkdown(post.value.content);
});

onMounted(() => {
  fetchPost();
});
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
          @click="fetchPost"
          class="blog-detail-view__button blog-detail-view__button--retry"
        >
          Try Again
        </button>
        <button 
          @click="goBack"
          class="blog-detail-view__button blog-detail-view__button--back"
        >
          Back to Blog
        </button>
      </div>
    </div>
    
    <!-- Blog post -->
    <article v-else-if="post" class="blog-detail-view__article">
      <!-- Hero image -->
      <div 
        v-if="post.heroImage" 
        class="blog-detail-view__hero"
      >
        <AppImage
          :filename="post.heroImage.filename"
          :alt="post.heroImage.altText || post.title"
          :size="ImageSize.FULL"
          class="blog-detail-view__hero-img"
        />
      </div>
      
      <div class="blog-detail-view__header">
        <button 
          @click="goBack"
          class="blog-detail-view__back-button"
        >
          &larr; Back to Blog
        </button>
        
        <h1 class="blog-detail-view__title">{{ post.title }}</h1>
        
        <div class="blog-detail-view__meta">
          <span class="blog-detail-view__date">{{ formatDate(post.publishedAt) }}</span>
          <div class="blog-detail-view__author">
            <div v-if="post.author.avatar" class="blog-detail-view__author-avatar">
              <AppImage
                :filename="post.author.avatar.filename"
                :alt="post.author.avatar.altText"
                :size="ImageSize.THUMBNAIL"
                class="blog-detail-view__author-img"
              />
            </div>
            <span class="blog-detail-view__author-name">by {{ post.author.name }}</span>
          </div>
        </div>
        
        <div v-if="post.tags && post.tags.length" class="blog-detail-view__tags">
          <span 
            v-for="tag in post.tags" 
            :key="tag" 
            class="blog-detail-view__tag"
          >
            {{ tag }}
          </span>
        </div>
      </div>
      
      <div 
        class="blog-detail-view__content" 
        v-html="parsedContent"
      ></div>
    </article>
    
    <!-- Not found state -->
    <div v-else class="blog-detail-view__not-found">
      <p>Blog post not found.</p>
      <button 
        @click="goBack"
        class="blog-detail-view__button blog-detail-view__button--back"
      >
        Back to Blog
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Loading state styles */
.blog-detail-view__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12) 0;
  text-align: center;
}

.blog-detail-view__spinner {
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
  to { transform: rotate(360deg); }
}

/* Existing styles */
.blog-detail-view__back-button {
  display: inline-block;
  margin-bottom: var(--spacing-4);
  color: var(--color-text);
  background: none;
  border: none;
  padding: var(--spacing-2) 0;
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: none;
}

.blog-detail-view__back-button:hover {
  color: var(--vt-c-indigo);
  text-decoration: underline;
}

.blog-detail-view__actions {
  display: flex;
  gap: var(--spacing-4);
  margin-top: var(--spacing-4);
}

.blog-detail-view__button {
  cursor: pointer;
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--border-radius);
  font-weight: 500;
  border: none;
}

.blog-detail-view__button--retry {
  background-color: var(--vt-c-red);
  color: var(--vt-c-white);
}

.blog-detail-view__button--back {
  background-color: var(--color-background-soft);
  color: var(--color-text);
}

.blog-detail-view__author {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.blog-detail-view__author-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  overflow: hidden;
}

.blog-detail-view__author-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.blog-detail-view__author-name {
  font-size: 0.875rem;
  color: var(--color-text);
}
</style>

<style>
/* Markdown styles - not scoped to allow styling of v-html content */
.blog-detail-view__content h1 {
  font-size: 2rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-weight: bold;
  color: var(--color-heading);
}

.blog-detail-view__content h2 {
  font-size: 1.5rem;
  margin-top: 1.75rem;
  margin-bottom: 0.75rem;
  font-weight: bold;
  color: var(--color-heading);
}

.blog-detail-view__content h3 {
  font-size: 1.25rem;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: var(--color-heading);
}

.blog-detail-view__content p {
  margin-bottom: 1rem;
  line-height: 1.7;
}

.blog-detail-view__content ul {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.blog-detail-view__content li {
  margin-bottom: 0.5rem;
  line-height: 1.7;
}

.blog-detail-view__content pre {
  background-color: var(--color-background-soft);
  padding: 1rem;
  border-radius: var(--border-radius);
  overflow-x: auto;
  margin-bottom: 1rem;
}

.blog-detail-view__content code {
  font-family: 'Source Code Pro', monospace;
  font-size: 0.9rem;
}

.blog-detail-view__content a {
  color: var(--vt-c-indigo);
  text-decoration: none;
}

.blog-detail-view__content a:hover {
  text-decoration: underline;
}
</style> 