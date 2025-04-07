<!--
  BlogPostMeta
  A molecule component that displays metadata for a blog post, including the publication date and author information.
  
  Features:
  - Displays publication date
  - Shows author information using AuthorInfo component
  - Responsive layout with proper spacing
  
  Props:
  - date: string - The publication date of the blog post
  - author: Author - The author information object
  
  Accessibility:
  - Uses semantic HTML elements
  - Provides clear visual hierarchy
  - Maintains proper text contrast
-->
<script setup lang="ts">
import AuthorInfo from '@/components/molecules/AuthorInfo.vue';
import type { Author } from '@/types/blog';
import { computed } from 'vue';

interface Props {
  date: string | null | undefined;
  author: Author;
}

const props = withDefaults(defineProps<Props>(), {
  date: undefined,
  author: () =>
    ({
      name: 'Anonymous',
      type: 'text',
      id: undefined,
    }) as Author,
});

// Convert null to undefined for the AuthorInfo component
const formattedDate = computed(() => props.date || undefined);
</script>

<template>
  <div class="blog-post-meta">
    <span v-if="date" class="blog-post-meta__date">{{ date }}</span>
    <div v-if="author" class="blog-post-meta__author">
      <AuthorInfo :author="author" :date="formattedDate" size="sm" />
    </div>
  </div>
</template>

<style scoped>
.blog-post-meta {
  color: var(--color-text);
  opacity: 0.8;
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-sm);
  font-family: var(--font-family-base);
}

.blog-post-meta__author {
  margin-left: var(--spacing-sm);
}
</style>
