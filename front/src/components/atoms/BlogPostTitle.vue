<script setup lang="ts">
import { computed } from 'vue'
import { BlogPostTitleVariantEnum } from '@/types/blogPost'

/**
 * BlogPostTitle Component
 *
 * A reusable component for displaying blog post titles with different variants.
 * Follows semantic HTML principles and accessibility guidelines.
 *
 * This component uses semantic HTML (h2) for proper document structure and
 * includes accessibility features like unique IDs for screen readers.
 *
 * @example
 * <BlogPostTitle
 *   title="My Blog Post Title"
 *   variant="full"
 * />
 *
 * @example
 * <!-- With compact variant -->
 * <BlogPostTitle
 *   title="Short Title"
 *   variant="compact"
 * />
 */

/**
 * BlogPostTitle component props interface
 */
interface IBlogPostTitleProps {
  /**
   * The title text to display
   * @required
   */
  title: string
  /**
   * The visual variant of the title (compact or full)
   * @default 'full'
   */
  variant?: BlogPostTitleVariantEnum
}

const props = withDefaults(defineProps<IBlogPostTitleProps>(), {
  variant: BlogPostTitleVariantEnum.FULL,
})

// Validate title is not empty
if (!props.title.trim()) {
  console.warn('BlogPostTitle: Title should not be empty')
}

// Generate a unique ID for accessibility
const titleId = computed(() => {
  return `blog-title-${props.title.toLowerCase().replace(/\s+/g, '-')}`
})
</script>

<template>
  <h2 class="blog-post-title" :class="`blog-post-title--${variant}`" :id="titleId">
    {{ title }}
  </h2>
</template>

<style scoped>
.blog-post-title {
  font-family: var(--font-family-base);
  color: var(--color-text);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-2);
  line-height: 1.2;
}

.blog-post-title--compact {
  font-size: var(--font-size-lg);
}

.blog-post-title--full {
  font-size: var(--font-size-xl);
}
</style>
