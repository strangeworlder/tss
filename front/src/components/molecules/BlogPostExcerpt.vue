<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  content: string;
  variant?: 'compact' | 'full';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'full'
});

const excerptLength = computed(() => {
  return props.variant === 'compact' ? 100 : 150;
});

const excerpt = computed(() => {
  const truncated = props.content.substring(0, excerptLength.value);
  return props.content.length > excerptLength.value ? `${truncated}...` : truncated;
});
</script>

<template>
  <div class="blog-post-excerpt">
    {{ excerpt }}
  </div>
</template>

<style scoped>
.blog-post-excerpt {
  margin-bottom: var(--spacing-4);
  color: var(--color-text);
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  line-height: 1.5;
}
</style> 