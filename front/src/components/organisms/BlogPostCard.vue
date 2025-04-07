<!--
@component BlogPostCard
@description A card component for displaying blog post previews with image, title, meta information, tags, and excerpt.

@features
- Displays blog post preview with image, title, and meta information
- Supports two variants: compact (for homepage) and full (for blog listing)
- Responsive design with different layouts for mobile and desktop
- Displays tags when available in full variant
- Provides a read more button linking to the full blog post
- Full variant displays image on the left side (2/7th width) with content on the right
- Image in full variant extends to the card's edges

@props {
  title: {
    type: string
    required: true
    description: "The title of the blog post"
  }
  date: {
    type: string
    required: false
    description: "The publication date of the blog post"
  }
  author: {
    type: Author | IUser
    required: false
    description: "The author information for the blog post"
  }
  content: {
    type: string
    required: false
    description: "The content or excerpt of the blog post"
  }
  heroImageFilename: {
    type: string
    required: false
    description: "The filename of the hero image"
  }
  heroImageAlt: {
    type: string
    required: false
    description: "The alt text for the hero image"
  }
  heroImageUrl: {
    type: string
    required: false
    description: "The URL of the hero image"
  }
  slug: {
    type: string
    required: false
    description: "The URL slug for the blog post"
  }
  variant: {
    type: BlogPostTitleVariantEnum
    required: false
    description: "The display variant (compact for homepage, full for blog listing)"
  }
  tags: {
    type: string[]
    required: false
    description: "Array of tags associated with the blog post"
  }
}

@accessibility
- Uses semantic HTML with <article> element for blog post content
- Provides alt text for images
- Maintains proper heading hierarchy through BlogPostTitle component
- Supports keyboard navigation for interactive elements
- Ensures sufficient color contrast for text readability
-->

<script setup lang="ts">
import BlogPostTitle from '@/components/atoms/BlogPostTitle.vue';
import BlogPostImage from '@/components/atoms/BlogPostImage.vue';
import BlogPostMeta from '@/components/molecules/BlogPostMeta.vue';
import BlogPostTags from '@/components/molecules/BlogPostTags.vue';
import BlogPostExcerpt from '@/components/molecules/BlogPostExcerpt.vue';
import ReadMoreButton from '@/components/atoms/ReadMoreButton.vue';
import { BlogPostTitleVariantEnum } from '@/types/blogPost';
import type { Author } from '@/types/blog';
import type { IUser } from '@/types/user';
import { computed } from 'vue';

interface Props {
  title: string;
  date: string | null | undefined;
  author: Author | IUser;
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
  date: undefined,
  author: () =>
    ({
      name: 'Anonymous',
      type: 'text',
      id: undefined,
    }) as Author,
  slug: '',
  content: '',
});

// Convert IUser to Author format when needed
const formattedAuthor = computed<Author>(() => {
  if ('type' in props.author) {
    return props.author as Author;
  }

  const user = props.author as IUser;
  return {
    type: 'user',
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    avatar: user.avatar,
  };
});
</script>

<template>
  <article class="blog-post-card" :class="`blog-post-card--${variant}`">
    <div class="blog-post-card__image-container">
      <BlogPostImage
        :filename="heroImageFilename"
        :url="heroImageUrl"
        :alt="heroImageAlt || title"
        :variant="variant"
      />
    </div>

    <div class="blog-post-card__content">
      <BlogPostTitle :title="title" :variant="variant" />

      <BlogPostMeta :date="date" :author="formattedAuthor" />

      <BlogPostTags
        v-if="variant === BlogPostTitleVariantEnum.FULL && tags && tags.length > 0"
        :tags="tags"
      />

      <BlogPostExcerpt :content="content" :variant="variant" />

      <ReadMoreButton :to="`/blog/${slug}`" />
    </div>
  </article>
</template>

<style scoped>
.blog-post-card {
  margin-bottom: var(--spacing-lg);
  border-radius: var(--border-radius);
  overflow: hidden;
  background-color: var(--color-background);
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.05);
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast);
}

.blog-post-card:hover {
  transform: translateY(-0.125rem);
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
}

.blog-post-card--full .blog-post-card__content {
  padding: var(--spacing-md);
}

.blog-post-card__content {
  padding: 0 var(--spacing-lg);
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

@media (min-width: 48rem) {
  .blog-post-card--full {
    flex-direction: row;
    height: 100%;
  }
  
  .blog-post-card--full .blog-post-card__image-container {
    width: 28.57%; /* 2/7 of the card width */
    height: 100%;
    overflow: hidden;
  }
  
  .blog-post-card--full :deep(.blog-post-image) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .blog-post-card--full .blog-post-card__content {
    width: 71.43%; /* 5/7 of the card width */
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
}
</style>
