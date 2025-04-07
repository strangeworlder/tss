<script setup lang="ts">
import BlogPostTitle from '@/components/atoms/BlogPostTitle.vue';
import BlogPostImage from '@/components/atoms/BlogPostImage.vue';
import BlogPostMeta from '@/components/molecules/BlogPostMeta.vue';
import BlogPostTags from '@/components/molecules/BlogPostTags.vue';
import BlogPostExcerpt from '@/components/molecules/BlogPostExcerpt.vue';
import ReadMoreButton from '@/components/atoms/ReadMoreButton.vue';
import { BlogPostTitleVariantEnum } from '@/types/blogPost';
import type { Author } from '@/types/blog';

interface Props {
  title: string;
  date: string;
  author: Author;
  content: string;
  heroImageFilename?: string;
  heroImageAlt?: string;
  heroImageUrl?: string;
  slug: string;
  variant?: BlogPostTitleVariantEnum; // compact for homepage, full for blog listing
  tags?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  variant: BlogPostTitleVariantEnum.FULL,
  tags: () => [],
  date: '',
  author: () =>
    ({
      name: 'Anonymous',
      type: 'text',
      id: undefined,
    }) as Author,
  slug: '',
  content: '',
});

// Temporary debugging
console.log('BlogPostCard props:', props);
console.log('Tags:', props.tags);
</script>

<template>
  <article class="blog-post-card" :class="`blog-post-card--${variant}`">
    <BlogPostImage
      :filename="heroImageFilename"
      :url="heroImageUrl"
      :alt="heroImageAlt || title"
      :variant="variant"
    />

    <div class="blog-post-card__content">
      <BlogPostTitle :title="title" :variant="variant" />

      <BlogPostMeta :date="date" :author="author" />

      <BlogPostTags v-if="variant === BlogPostTitleVariantEnum.FULL && tags && tags.length > 0" :tags="tags" />

      <BlogPostExcerpt :content="content" :variant="variant" />

      <ReadMoreButton :to="`/blog/${slug}`" />
    </div>
  </article>
</template>

<style scoped>
.blog-post-card {
  margin-bottom: var(--spacing-4);
  border-radius: var(--border-radius);
  overflow: hidden;
  background-color: var(--color-background);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast);
}

.blog-post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.blog-post-card__content {
  padding: var(--spacing-4);
}

/* Compact variant specific styles */
.blog-post-card--compact {
  display: flex;
  flex-direction: column;
}

/* Full variant specific styles */
.blog-post-card--full {
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .blog-post-card--full {
    flex-direction: row;
  }
}
</style>
