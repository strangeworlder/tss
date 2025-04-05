<script setup lang="ts">
import { computed } from 'vue'
import BlogPostTitle from '@/components/atoms/BlogPostTitle.vue'
import BlogPostImage from '@/components/atoms/BlogPostImage.vue'
import BlogPostMeta from '@/components/molecules/BlogPostMeta.vue'
import BlogPostTags from '@/components/molecules/BlogPostTags.vue'
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
  margin-bottom: var(--spacing-4);
  color: var(--color-text);
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  line-height: 1.5;
}
</style>
