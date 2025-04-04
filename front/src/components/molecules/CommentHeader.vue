<template>
  <div class="comment-header">
    <div class="comment-header__author">
      <Avatar
        :src="author.avatar"
        :alt="author.name"
        :name="author.name"
        size="sm"
      />
      <span class="comment-header__author-name">{{ author.name }}</span>
      <span class="comment-header__date">{{ formatDate(date) }}</span>
    </div>
    <div v-if="showActions" class="comment-header__actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import Avatar from '@/components/atoms/Avatar.vue';
import type { User } from '@/types/user';

defineProps<{
  author: User;
  date: string;
  showActions?: boolean;
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
.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2);
}

.comment-header__author {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.comment-header__author-name {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.comment-header__date {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.comment-header__actions {
  display: flex;
  gap: var(--spacing-2);
}
</style> 