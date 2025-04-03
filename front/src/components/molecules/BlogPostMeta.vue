<script setup lang="ts">
import AppImage from '@/components/atoms/AppImage.vue';
import { ImageSize } from '@/types/image';

interface Props {
  date: string;
  author: {
    name: string;
    avatar?: {
      filename: string;
      altText: string;
    };
  };
}

withDefaults(defineProps<Props>(), {
  date: '',
  author: () => ({ name: 'Anonymous' })
});
</script>

<template>
  <div class="blog-post-meta">
    <span v-if="date" class="blog-post-meta__date">{{ date }}</span>
    <div v-if="author" class="blog-post-meta__author">
      <AppImage 
        v-if="author.avatar?.filename" 
        :filename="author.avatar.filename" 
        :alt="author.avatar.altText" 
        :size="ImageSize.THUMBNAIL"
        class="blog-post-meta__author-avatar"
      />
      <span class="blog-post-meta__author-name">
        by {{ author.name }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.blog-post-meta {
  color: var(--color-text);
  opacity: 0.8;
  margin-bottom: var(--spacing-3);
  font-size: var(--font-size-sm);
  font-family: var(--font-family-base);
}

.blog-post-meta__author {
  margin-left: var(--spacing-2);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.blog-post-meta__author-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  overflow: hidden;
}

.blog-post-meta__author-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style> 