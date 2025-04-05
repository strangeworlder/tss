<template>
  <div class="author-info">
    <Avatar
      :src="author.avatar?.filename"
      :alt="author.name"
      :name="author.name"
      :size="size"
    />
    <div class="author-info__details">
      <span class="author-info__name">{{ author.name }}</span>
      <span v-if="date" class="author-info__date">{{ formatDate(date) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Avatar from '@/components/atoms/Avatar.vue';

interface Author {
  name: string;
  avatar?: {
    filename: string;
    altText?: string;
  };
}

const props = defineProps<{
  author: Author;
  date?: string;
  size?: 'sm' | 'md' | 'lg';
}>();

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<style scoped>
.author-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.author-info__details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
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