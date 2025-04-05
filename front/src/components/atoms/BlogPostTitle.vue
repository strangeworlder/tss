<script setup lang="ts">
interface Props {
  title: string
  variant?: 'compact' | 'full'
}

defineProps<Props>()
</script>

<template>
  <h2 class="blog-post-title" :class="`blog-post-title--${variant}`">
    {{ title }}
  </h2>
</template>

<style scoped>
.blog-post-title {
  font-family: var(--font-family-base);
  color: var(--color-heading);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-2);
}

.blog-post-title--compact {
  font-size: var(--font-size-lg);
}

.blog-post-title--full {
  font-size: var(--font-size-xl);
}
</style>
