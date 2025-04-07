<!--
@component BlogPostExcerpt
@description A component that displays a truncated excerpt of a blog post with configurable length based on variant.

@features
- Truncates blog post content to a specified length
- Supports different variants (FULL, COMPACT) with different excerpt lengths
- Adds ellipsis (...) when content is truncated

@props {
  content: {
    type: String
    required: true
    description: "The full blog post content to be truncated"
  },
  variant: {
    type: String
    required: false
    default: "FULL"
    description: "The variant of the blog post title (FULL or COMPACT)"
  }
}

@accessibility
- Uses semantic HTML for text content
- Maintains proper text contrast for readability
- No ARIA attributes needed as semantic HTML is sufficient
-->

<script setup lang="ts">
import { computed } from 'vue'
import { BlogPostTitleVariantEnum } from '@/types/blogPost'

interface Props {
  content: string
  variant?: BlogPostTitleVariantEnum
}

const props = withDefaults(defineProps<Props>(), {
  variant: BlogPostTitleVariantEnum.FULL,
})

const excerptLength = computed(() => {
  return props.variant === BlogPostTitleVariantEnum.COMPACT ? 100 : 150
})

const excerpt = computed(() => {
  const truncated = props.content.substring(0, excerptLength.value)
  return props.content.length > excerptLength.value ? `${truncated}...` : truncated
})
</script>

<template>
  <div class="blog-post-excerpt">
    {{ excerpt }}
  </div>
</template>

<style scoped>
.blog-post-excerpt {
  margin-bottom: var(--spacing-md);
  color: var(--color-text);
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  line-height: 1.5;
}
</style>
