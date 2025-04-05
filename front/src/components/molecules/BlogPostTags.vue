<script setup lang="ts">
import TagPill from '@/components/atoms/TagPill.vue'

interface Props {
  tags: string[]
}

defineProps<Props>()
</script>

<template>
  <div class="blog-post-tags">
    <TagPill v-for="tag in tags" :key="tag" :tag="tag" class="blog-post-tags__tag" />
  </div>
</template>

<style scoped>
.blog-post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-3);
}
</style>
