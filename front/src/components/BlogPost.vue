<script setup lang="ts">
import AppImage from '@/components/common/AppImage.vue';
import { ImageSize } from '@/utils/imageUtils';

interface Props {
  title: string;
  date: string;
  author: string;
  content: string;
  imageUrl?: string;
  heroImageFilename?: string;
  heroImageAlt?: string;
  slug: string;
}

defineProps<Props>();
</script>

<template>
  <article class="blog-post">
    <!-- Hero image takes precedence if available -->
    <div v-if="heroImageFilename" class="blog-post__hero">
      <AppImage 
        :filename="heroImageFilename" 
        :size="ImageSize.FULL" 
        :alt="heroImageAlt || title" 
        class="blog-post__hero-img"
      />
    </div>
    <div v-else-if="imageUrl" class="blog-post__image">
      <img :src="imageUrl" :alt="title" class="blog-post__img">
    </div>
    <div class="blog-post__content">
      <h2 class="blog-post__title">{{ title }}</h2>
      <div class="blog-post__meta">
        <span class="blog-post__date">{{ date }}</span>
        <span class="blog-post__author">by {{ author }}</span>
      </div>
      <div class="blog-post__excerpt">
        {{ content.substring(0, 150) }}...
      </div>
      <RouterLink :to="`/blog/${slug}`" class="blog-post__read-more btn btn--primary">
        Read More
      </RouterLink>
    </div>
  </article>
</template>

<style scoped>
.blog-post {
  margin-bottom: var(--spacing-4);
}

.blog-post__hero {
  margin-bottom: var(--spacing-4);
  width: 100%;
}

.blog-post__hero-img {
  width: 100%;
  height: 24rem;
  object-fit: cover;
  border-radius: 0.5rem;
}

.blog-post__image {
  margin-bottom: var(--spacing-4);
}

.blog-post__img {
  width: 100%;
  height: 16rem;
  object-fit: cover;
  border-radius: 0.5rem;
}

.blog-post__title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: var(--spacing-2);
}

.blog-post__meta {
  color: var(--color-gray-600);
  margin-bottom: var(--spacing-4);
}

.blog-post__author {
  margin-left: var(--spacing-2);
}

.blog-post__excerpt {
  margin-bottom: var(--spacing-4);
}

.blog-post__read-more {
  display: inline-block;
}
</style> 