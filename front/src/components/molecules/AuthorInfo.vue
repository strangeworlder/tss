<!--
AuthorInfo Component

A molecule component that displays author information with an avatar.
Used in blog posts, comments, and other content to show authorship.

Features:
- Displays author avatar and name
- Optional date display
- Configurable avatar size
- Supports left and right-aligned variants
- Semantic styling
- Accessible markup

Usage:
<AuthorInfo 
  :author="post.author" 
  :date="post.publishedAt" 
  size="md" 
  variant="left" 
/>

Props:
- author: Author object containing name and optional avatar
- date: Optional ISO date string to display
- size: Avatar size ('sm' | 'md' | 'lg')
- variant: Layout variant ('left' | 'right')
-->

<template>
  <div class="author-info" :class="[`author-info--${variant}`, `author-info--${size}`]">
    <UserAvatar 
      v-if="variant === 'left'" 
      :src="author?.avatar?.filename" 
      :alt="author?.name || 'Anonymous'" 
      :size="size" 
    />
    <div class="author-info__details">
      <span class="author-info__name">{{ author?.name || 'Anonymous' }}</span>
      <time v-if="date" class="author-info__date" :datetime="date">
        {{ formatDate(date) }}
      </time>
    </div>
    <UserAvatar 
      v-if="variant === 'right'" 
      :src="author?.avatar?.filename" 
      :alt="author?.name || 'Anonymous'" 
      :size="size" 
    />
  </div>
</template>

<script setup lang="ts">
import UserAvatar from '@/components/atoms/UserAvatar.vue';
import type { Author } from '@/types/blog';

interface Props {
  /** The author object containing name and optional avatar */
  author?: Author;
  /** ISO date string for the content */
  date?: string;
  /** Size of the avatar image */
  size: 'sm' | 'md' | 'lg';
  /** Layout variant - left (default) or right */
  variant: 'left' | 'right';
}

const { author, date, size, variant } = withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'left',
});

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
</script>

<style scoped>
.author-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.author-info--sm {
  gap: var(--spacing-xs);
}

.author-info__details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.author-info--right .author-info__details {
  align-items: flex-end;
}

.author-info__name {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.author-info__date {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

/* Size-specific styles */
.author-info--sm .author-info__name {
  font-size: var(--font-size-sm);
  line-height: 1.2;
}

.author-info--sm .author-info__date {
  font-size: var(--font-size-xs);
  line-height: 1.2;
}

.author-info--lg .author-info__name {
  font-size: var(--font-size-lg);
  line-height: 1.3;
}

.author-info--lg .author-info__date {
  font-size: var(--font-size-sm);
  line-height: 1.3;
}
</style>
