<!--
@component BlogPostHeader
@description A component that displays the header information for a blog post.

@features
- Displays post title and metadata
- Shows author information using AuthorInfo component
- Handles publication date
- Supports scheduled post status

@props {
  post: {
    type: IBlogPost
    required: true
    description: "The blog post data to display"
  }
}

@accessibility
- Uses semantic HTML elements (header, h1, time)
- Provides meaningful alt text for author avatar
- Maintains proper heading hierarchy
- Supports keyboard navigation
-->

<script setup lang="ts">
import { computed } from 'vue';
import type { IBlogPost } from '@/types/blog';
import AuthorInfo from '@/components/molecules/AuthorInfo.vue';

interface Props {
  post: IBlogPost;
}

const props = defineProps<Props>();

const formattedDate = computed((): string => {
  if (!props.post.publishedAt) return '';
  return new Date(props.post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});
</script>

<template>
  <header class="blog-post-header">
      <AuthorInfo 
        class="blog-post-header__meta"
        :author="post.author" 
        :date="post.publishedAt" 
        size="md" 
        variant="right" 
      />
  </header>
</template>

<style scoped>
.blog-post-header {
  margin-bottom: var(--spacing-lg);
}

.blog-post-header__title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
  line-height: 1.2;
}

.blog-post-header__meta {
  float: right;
  margin: var(--spacing-md);
}
</style>
