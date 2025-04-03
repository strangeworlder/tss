<script setup lang="ts">
import AppImage from '@/components/atoms/AppImage.vue';
import { ImageSize } from '@/types/image';

interface Props {
  filename?: string;
  url?: string;
  alt: string;
  size?: ImageSize;
  variant?: 'compact' | 'full';
}

withDefaults(defineProps<Props>(), {
  size: ImageSize.MEDIUM,
  variant: 'full'
});
</script>

<template>
  <div class="blog-post-image" :class="`blog-post-image--${variant}`">
    <AppImage 
      v-if="filename"
      :filename="filename" 
      :size="size" 
      :alt="alt" 
      class="blog-post-image__img"
    />
    <img 
      v-else-if="url" 
      :src="url" 
      :alt="alt" 
      class="blog-post-image__img"
    />
  </div>
</template>

<style scoped>
.blog-post-image {
  margin-bottom: var(--spacing-3);
}

.blog-post-image__img {
  width: 100%;
  height: 16rem;
  object-fit: cover;
}

.blog-post-image--compact .blog-post-image__img {
  height: 12rem;
}

@media (min-width: 768px) {
  .blog-post-image--full {
    flex: 0 0 40%;
    margin-bottom: 0;
  }
  
  .blog-post-image--full .blog-post-image__img {
    height: 100%;
  }
}
</style> 