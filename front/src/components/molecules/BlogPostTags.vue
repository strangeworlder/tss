<!--
# BlogPostTags
A molecular component that displays a collection of tags for a blog post.

## Features
- Renders a collection of tags using TagPill components
- Responsive layout with wrapping
- Consistent spacing between tags

## Props
| Name | Type     | Required | Default | Description        |
|------|----------|----------|---------|-------------------|
| tags | string[] | Yes      | -       | Array of tag names |

## Accessibility
- Tags are rendered as a semantic group
-->
<script setup lang="ts">
import TagPill from '@/components/atoms/TagPill.vue'
import type { Props } from './BlogPostTags.types'

const props = defineProps<Props>()

// Validate that tags is an array
if (!Array.isArray(props.tags)) {
  console.error('BlogPostTags: tags prop must be an array')
}
</script>

<template>
  <div class="blog-post-tags" role="list" aria-label="Blog post tags">
    <TagPill 
      v-for="tag in tags" 
      :key="tag" 
      :tag="tag" 
      class="blog-post-tags__tag"
      role="listitem"
    />
  </div>
</template>

<style scoped>
.blog-post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}
</style>
