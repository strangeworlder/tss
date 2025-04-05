<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  text: 'Loading...'
});
</script>

<template>
  <div class="loading-spinner" :class="`loading-spinner--${size}`">
    <div class="loading-spinner__spinner"></div>
    <p v-if="text" class="loading-spinner__text">{{ text }}</p>
  </div>
</template>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.loading-spinner__spinner {
  display: inline-block;
  border: 3px solid var(--color-border);
  border-radius: 50%;
  border-top-color: var(--color-primary);
  animation: spin 1s linear infinite;
}

.loading-spinner--sm .loading-spinner__spinner {
  width: var(--spacing-6);
  height: var(--spacing-6);
}

.loading-spinner--md .loading-spinner__spinner {
  width: var(--spacing-8);
  height: var(--spacing-8);
}

.loading-spinner--lg .loading-spinner__spinner {
  width: var(--spacing-12);
  height: var(--spacing-12);
}

.loading-spinner__text {
  margin-top: var(--spacing-4);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style> 