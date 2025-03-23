<script setup lang="ts">
import { computed } from 'vue';
import AppImage from '@/components/atoms/AppImage.vue';
import TagPill from '@/components/atoms/TagPill.vue';
import { ImageSize } from '@/types/image';

interface Props {
  title: string;
  date: string;
  author: {
    name: string;
    avatar?: {
      filename: string;
      altText: string;
    };
  };
  content: string;
  heroImageFilename?: string;
  heroImageAlt?: string;
  heroImageUrl?: string;
  slug: string;
  variant?: 'compact' | 'full'; // compact for homepage, full for blog listing
  tags?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'full',
  tags: () => []
});

const imageSize = ImageSize.MEDIUM;
</script>

<template>
  <article class="blog-post-card" :class="`blog-post-card--${variant}`">
    <!-- Use AppImage for hero image if available -->
    <div v-if="heroImageFilename" class="blog-post-card__image">
      <AppImage 
        :filename="heroImageFilename" 
        :size="imageSize" 
        :alt="heroImageAlt || title" 
        class="blog-post-card__img"
      />
    </div>
    <!-- Fallback to direct image URL if provided -->
    <div v-else-if="heroImageUrl" class="blog-post-card__image">
      <img :src="heroImageUrl" :alt="title" class="blog-post-card__img">
    </div>
    
    <div class="blog-post-card__content">
      <h2 class="blog-post-card__title">{{ title }}</h2>
      
      <div class="blog-post-card__meta">
        <span class="blog-post-card__date">{{ date }}</span>
        <div class="blog-post-card__author">
          <div v-if="author.avatar" class="blog-post-card__author-avatar">
            <AppImage 
              :filename="author.avatar.filename" 
              :alt="author.avatar.altText" 
              :size="ImageSize.THUMBNAIL" 
              class="blog-post-card__author-img"
            />
          </div>
          <span class="blog-post-card__author-name">by {{ author.name }}</span>
        </div>
      </div>
      
      <!-- Tags visible only in full variant, now using TagPill component -->
      <div v-if="variant === 'full' && tags && tags.length" class="blog-post-card__tags">
        <TagPill
          v-for="tag in tags"
          :key="tag"
          :text="tag"
          size="small"
          class="blog-post-card__tag"
        />
      </div>
      
      <div class="blog-post-card__excerpt">
        <!-- Shorter excerpt for compact variant -->
        <template v-if="variant === 'compact'">
          {{ content.substring(0, 100) }}...
        </template>
        <template v-else>
          {{ content.substring(0, 200) }}...
        </template>
      </div>
      
      <RouterLink :to="`/blog/${slug}`" class="blog-post-card__read-more btn btn--primary">
        Read More
      </RouterLink>
    </div>
  </article>
</template>

<style scoped>
.blog-post-card {
  margin-bottom: var(--spacing-4);
  border-radius: var(--border-radius);
  overflow: hidden;
  background-color: var(--color-background);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.blog-post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.blog-post-card__image {
  margin-bottom: var(--spacing-3);
}

.blog-post-card__img {
  width: 100%;
  height: 16rem;
  object-fit: cover;
}

.blog-post-card__content {
  padding: var(--spacing-4);
}

.blog-post-card__title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: var(--spacing-2);
  color: var(--color-heading);
}

.blog-post-card__meta {
  color: var(--color-text);
  opacity: 0.8;
  margin-bottom: var(--spacing-3);
  font-size: 0.9rem;
}

.blog-post-card__author {
  margin-left: var(--spacing-2);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.blog-post-card__author-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  overflow: hidden;
}

.blog-post-card__author-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.blog-post-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-3);
}

.blog-post-card__excerpt {
  margin-bottom: var(--spacing-4);
  color: var(--color-text);
}

.blog-post-card__read-more {
  display: inline-block;
}

/* Compact variant specific styles */
.blog-post-card--compact {
  display: flex;
  flex-direction: column;
}

.blog-post-card--compact .blog-post-card__img {
  height: 12rem;
}

.blog-post-card--compact .blog-post-card__title {
  font-size: 1.25rem;
}

/* Full variant specific styles */
.blog-post-card--full {
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .blog-post-card--full {
    flex-direction: row;
  }
  
  .blog-post-card--full .blog-post-card__image {
    flex: 0 0 40%;
    margin-bottom: 0;
  }
  
  .blog-post-card--full .blog-post-card__img {
    height: 100%;
  }
}
</style> 