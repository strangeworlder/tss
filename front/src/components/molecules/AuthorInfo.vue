<!--
AuthorInfo Component

A molecule component that displays author information with an avatar.
Used in blog posts, comments, and other content to show authorship.

Features:
- Displays author avatar and name
- Optional date display
- Configurable avatar size
- Semantic styling
- Accessible markup

Usage:
<AuthorInfo 
  :author="post.author" 
  :date="post.publishedAt" 
  size="md" 
/>

Props:
- author: Author object containing name and optional avatar
- date: Optional ISO date string to display
- size: Avatar size ('sm' | 'md' | 'lg')
-->

<template>
  <div class="author-info">
    <Avatar 
      :src="author?.avatar?.filename" 
      :alt="author?.name || 'Anonymous'" 
      :size="size" 
    />
    <div class="author-info__details">
      <span class="author-info__name">{{ author?.name || 'Anonymous' }}</span>
      <time 
        v-if="date" 
        class="author-info__date" 
        :datetime="date"
      >
        {{ formatDate(date) }}
      </time>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Avatar from '@/components/atoms/Avatar.vue'
import type { Author } from '@/types/blog'

interface Props {
  /** The author object containing name and optional avatar */
  author?: Author
  /** ISO date string for the content */
  date?: string
  /** Size of the avatar image */
  size: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.author-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.author-info__details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.author-info__name {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.author-info__date {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}
</style>
