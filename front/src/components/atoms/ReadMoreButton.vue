<script setup lang="ts">
interface Props {
  to: string;
}
</script>

<template>
  <router-link 
    :to="to" 
    class="read-more-button"
  >
    Read More
  </router-link>
</template>

<style scoped>
.read-more-button {
  display: inline-block;
  background-color: var(--color-highlight-1);
  color: var(--color-background);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--border-radius-sm);
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  transition: background-color var(--transition-normal);
}

.read-more-button:hover {
  background-color: var(--color-highlight-2);
}
</style> 