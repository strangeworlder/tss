<script setup lang="ts">
import AuthorInfo from '@/components/molecules/AuthorInfo.vue'

interface Props {
  date: string
  author: {
    name: string
    avatar?: {
      filename: string
      altText: string
    }
  }
}

withDefaults(defineProps<Props>(), {
  date: '',
  author: () => ({ name: 'Anonymous' }),
})
</script>

<template>
  <div class="blog-post-meta">
    <span v-if="date" class="blog-post-meta__date">{{ date }}</span>
    <div v-if="author" class="blog-post-meta__author">
      <AuthorInfo :author="author" :date="date" size="sm" />
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
}
</style>
