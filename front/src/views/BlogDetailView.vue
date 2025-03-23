<script setup lang="ts">
import { ref, computed, onMounted, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBlogStore } from '@/stores/blogStore';
import AppImage from '@/components/atoms/AppImage.vue';
import TagPill from '@/components/atoms/TagPill.vue';
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
    console.log('BlogDetailView: Fetching post with slug:', slug.value);
    await blogStore.fetchPostBySlug(slug.value);
    
    // Check if post was found
    if (!blogStore.currentPost) {
      console.log('BlogDetailView: Post not found in store after fetch');
      error.value = 'Blog post not found';
    } else {
      console.log('BlogDetailView: Post found:', blogStore.currentPost.title);
    }
  } catch (err) {
    console.error('BlogDetailView: Error fetching blog post:', err);
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
    <div v-if="loading" class="blog-detail-view__loading">
      <div class="blog-detail-view__spinner"></div>
      <p>Loading blog post...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="blog-detail-view__error">
      <p>{{ error }}</p>
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
    
    <!-- Blog post content -->
    <article v-else-if="post" class="blog-detail-view__article">
      <header class="blog-detail-view__header">
        <h1 class="blog-detail-view__title">{{ post.title }}</h1>
        
        <div class="blog-detail-view__meta">
          <span v-if="post.publishedAt" class="blog-detail-view__date">
            {{ formatDate(post.publishedAt) }}
          </span>
          
          <div v-if="post.author" class="blog-detail-view__author">
            <img 
              v-if="post.author.avatar?.filename" 
              :src="`/api/images/${post.author.avatar.filename}?size=small`" 
              :alt="post.author.avatar.altText" 
              class="blog-detail-view__author-avatar"
            />
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
      <div v-if="post.heroImage || post.heroImageUrl" class="blog-detail-view__hero">
        <AppImage 
          v-if="post.heroImage?.filename"
          :filename="post.heroImage.filename" 
          :size="ImageSize.LARGE" 
          :alt="post.heroImage.altText || post.title" 
          class="blog-detail-view__hero-img"
        />
        <img 
          v-else-if="post.heroImageUrl" 
          :src="post.heroImageUrl" 
          :alt="post.title" 
          class="blog-detail-view__hero-img"
        />
      </div>
      
      <!-- Content -->
      <div class="blog-detail-view__content">
        {{ post.content }}
      </div>
      
      <!-- Back to blog listing -->
      <div class="blog-detail-view__footer">
        <router-link to="/blog" class="blog-detail-view__back-link">
          ← Back to Blog Listing
        </router-link>
      </div>
    </article>
  </div>
</template> 