<!--
  BlogPostHeader
  A component that displays the header section of a blog post, including title, author info, and tags.
  
  Features:
  - Displays blog post title
  - Shows author information with publication date in the top right corner
  - Displays tags associated with the post
  - Optional back button to return to blog listing
  
  Props:
  - post: IBlogPost - The blog post data to display
  - showBackButton: boolean - Whether to show the back button (default: true)
  
  Accessibility:
  - Uses semantic HTML elements (header, h1)
  - Proper heading hierarchy maintained
  - No redundant ARIA attributes
-->
<script setup lang="ts">
import AuthorInfo from '@/components/molecules/AuthorInfo.vue';
import TagPill from '@/components/atoms/TagPill.vue';
import BackButton from '@/components/atoms/BackButton.vue';
import type { IBlogPost, Author } from '@/types/blog';

interface Props {
  post: IBlogPost;
  showBackButton?: boolean;
}

withDefaults(defineProps<Props>(), {
  showBackButton: true,
});
</script>

<template>
  <header class="blog-post-header">
    <div class="blog-post-header__container">
      <div class="blog-post-header__left">
        <BackButton
          v-if="showBackButton"
          text="Back to Blog Listing"
          to="/blog"
          class="blog-post-header__back"
        />
      </div>
      
      <div class="blog-post-header__right">
        <AuthorInfo 
          :author="post.author" 
          :date="post.publishedAt || undefined" 
          size="md" 
          variant="right" 
        />
      </div>
    </div>

    <div v-if="post.tags && post.tags.length > 0" class="blog-post-header__tags">
      <TagPill v-for="tag in post.tags" :key="tag" :tag="tag" class="blog-post-header__tag" />
    </div>
  </header>
</template>

<style scoped>
.blog-post-header {
  margin-bottom: var(--spacing-xl);
}

.blog-post-header__container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
}

.blog-post-header__left {
  flex: 1;
}

.blog-post-header__right {
  margin-left: var(--spacing-lg);
  margin-right: var(--spacing-md);
}

.blog-post-header__back {
  margin-bottom: var(--spacing-md);
}

.blog-post-header__title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
  line-height: 1.2;
}

.blog-post-header__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.blog-post-header__tag {
  margin-right: var(--spacing-sm);
}

@media (min-width: 768px) {
  .blog-post-header__title {
    font-size: var(--font-size-3xl);
  }
}
</style>
