<script setup lang="ts">
import AuthorInfo from '@/components/molecules/AuthorInfo.vue';
import TagPill from '@/components/atoms/TagPill.vue';
import BackButton from '@/components/atoms/BackButton.vue';
import { BlogPost } from '@/types/blog';

interface Props {
  post: BlogPost;
  showBackButton?: boolean;
}

withDefaults(defineProps<Props>(), {
  showBackButton: true
});
</script>

<template>
  <header class="blog-post-header">
    <BackButton 
      v-if="showBackButton"
      text="Back to Blog Listing"
      to="/blog"
      class="blog-post-header__back"
    />

    <h1 class="blog-post-header__title">{{ post.title }}</h1>
    
    <div class="blog-post-header__meta">
      <AuthorInfo
        :author="post.author"
        :date="post.publishedAt"
        size="md"
      />
    </div>
    
    <div v-if="post.tags && post.tags.length > 0" class="blog-post-header__tags">
      <TagPill 
        v-for="tag in post.tags" 
        :key="tag" 
        :tag="tag"
        class="blog-post-header__tag"
      />
    </div>
  </header>
</template>

<style scoped>
.blog-post-header {
  margin-bottom: var(--spacing-8);
}

.blog-post-header__back {
  margin-bottom: var(--spacing-4);
}

.blog-post-header__title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin-bottom: var(--spacing-4);
  line-height: 1.2;
}

.blog-post-header__meta {
  margin-bottom: var(--spacing-4);
}

.blog-post-header__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.blog-post-header__tag {
  margin-right: var(--spacing-2);
}

@media (min-width: 768px) {
  .blog-post-header__title {
    font-size: var(--font-size-3xl);
  }
}
</style> 