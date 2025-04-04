<script setup lang="ts">
interface Props {
  text?: string;
  to?: string;
}

withDefaults(defineProps<Props>(), {
  text: 'Back',
  to: '/'
});
</script>

<template>
  <button 
    @click="$router.push(to)"
    class="back-button"
  >
    &larr; {{ text }}
  </button>
</template>

<style scoped>
.back-button {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.back-button:hover {
  color: var(--color-primary);
}
</style> 