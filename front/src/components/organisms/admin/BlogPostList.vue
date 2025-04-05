<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBlogStore } from '@/stores/blogStore'
import AppImage from '@/components/atoms/AppImage.vue'
import { ImageSizeEnum } from '@/types/image'
import AuthorInfo from '@/components/molecules/AuthorInfo.vue'
import Button from '@/components/atoms/Button.vue'

const emit = defineEmits<{
  (e: 'edit-post', postId: string): void
}>()

const blogStore = useBlogStore()
const loading = ref(true)
const error = ref<string | null>(null)

const formatDate = (dateString: string | null) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const handleEditPost = (postId: string) => {
  emit('edit-post', postId)
}

const fetchPosts = async () => {
  loading.value = true
  error.value = null

  try {
    await blogStore.fetchAdminPosts()
  } catch (err) {
    console.error('Error fetching blog posts:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load blog posts'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPosts()
})
</script>

<template>
  <div class="blog-post-list">
    <!-- Loading state -->
    <div v-if="loading" class="blog-post-list__loading">
      <div class="blog-post-list__spinner"></div>
      <p>Loading posts...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="blog-post-list__error">
      <p>{{ error }}</p>
      <Button @click="fetchPosts" variant="danger"> Try Again </Button>
    </div>

    <!-- Posts list -->
    <div v-else class="blog-post-list__grid">
      <div v-for="post in blogStore.posts" :key="post.id" class="blog-post-list__item">
        <div class="blog-post-list__image">
          <AppImage
            v-if="post.heroImage"
            :filename="post.heroImage.filename"
            :alt="post.heroImage.altText || post.title"
            :size="ImageSizeEnum.MEDIUM"
            class="blog-post-list__img"
          />
          <div v-else class="blog-post-list__placeholder"></div>
        </div>

        <div class="blog-post-list__content">
          <h2 class="blog-post-list__title">{{ post.title }}</h2>
          <div class="blog-post-list__meta">
            <AuthorInfo :author="post.author" :date="post.publishedAt" size="sm" />
            <span
              :class="[
                'blog-post-list__status',
                post.isPublished
                  ? 'blog-post-list__status--published'
                  : 'blog-post-list__status--draft',
              ]"
            >
              {{ post.isPublished ? 'Published' : 'Draft' }}
            </span>
          </div>
          <div class="blog-post-list__actions">
            <Button @click="handleEditPost(post.id)" variant="primary"> Edit </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.blog-post-list {
  width: 100%;
}

.blog-post-list__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-8) 0;
  text-align: center;
}

.blog-post-list__spinner {
  display: inline-block;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 0.25rem solid var(--color-border);
  border-top-color: var(--color-highlight-1);
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-2);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.blog-post-list__error {
  text-align: center;
  padding: var(--spacing-4);
  color: var(--color-highlight-1);
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
}

.blog-post-list__grid {
  display: grid;
  gap: var(--spacing-4);
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.blog-post-list__item {
  background-color: var(--color-background);
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform var(--transition-fast);
}

.blog-post-list__item:hover {
  transform: translateY(-2px);
}

.blog-post-list__image {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  overflow: hidden;
}

.blog-post-list__img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.blog-post-list__placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--color-background-soft);
}

.blog-post-list__content {
  padding: var(--spacing-4);
}

.blog-post-list__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-heading);
  margin-bottom: var(--spacing-2);
  font-family: var(--font-family-base);
}

.blog-post-list__meta {
  font-size: var(--font-size-sm);
  color: var(--color-text);
  opacity: 0.8;
  margin-bottom: var(--spacing-4);
  font-family: var(--font-family-base);
}

.blog-post-list__date {
  margin-right: var(--spacing-2);
}

.blog-post-list__actions {
  margin-top: var(--spacing-4);
  display: flex;
  justify-content: flex-end;
}

.blog-post-list__status {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  margin-left: 0.5rem;
}

.blog-post-list__status--published {
  background-color: var(--color-highlight-1);
  color: var(--color-background);
}

.blog-post-list__status--draft {
  background-color: var(--color-background-soft);
  color: var(--color-text);
}
</style>
