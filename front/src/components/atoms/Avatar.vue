<template>
  <div class="avatar" :class="[`avatar--${size}`]">
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      class="avatar__image"
    />
    <div v-else class="avatar__placeholder">
      {{ initials }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  name?: string;
}>();

const initials = computed(() => {
  if (!props.name) return '';
  return props.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
});
</script>

<style scoped>
.avatar {
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--color-background-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.avatar--sm {
  width: var(--avatar-size-sm);
  height: var(--avatar-size-sm);
  font-size: var(--font-size-xs);
}

.avatar--md {
  width: var(--avatar-size-md);
  height: var(--avatar-size-md);
  font-size: var(--font-size-sm);
}

.avatar--lg {
  width: var(--avatar-size-lg);
  height: var(--avatar-size-lg);
  font-size: var(--font-size-base);
}

.avatar__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 