/**
 * Blog Store
 * Central state management for blog posts
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { BlogPost, BlogPostPreview } from '@/types/blog';
import * as blogService from '@/api/blogService';

export const useBlogStore = defineStore('blog', () => {
  // State
  const posts = ref<BlogPostPreview[]>([]);
  const currentPost = ref<BlogPost | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  // Getters
  const postsByTag = computed(() => {
    return (tag: string) => posts.value.filter(post => post.tags.includes(tag));
  });
  
  // Actions
  async function fetchPosts(limit?: number) {
    loading.value = true;
    error.value = null;
    
    try {
      posts.value = await blogService.fetchBlogPosts(limit);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      error.value = err instanceof Error ? err.message : 'Failed to load blog posts';
    } finally {
      loading.value = false;
    }
  }
  
  async function fetchPostBySlug(slug: string) {
    loading.value = true;
    error.value = null;
    
    try {
      currentPost.value = await blogService.fetchBlogPostBySlug(slug);
    } catch (err) {
      console.error(`Error fetching blog post with slug ${slug}:`, err);
      error.value = err instanceof Error ? err.message : 'Failed to load blog post';
    } finally {
      loading.value = false;
    }
  }
  
  async function fetchPostsByTag(tag: string, limit?: number) {
    loading.value = true;
    error.value = null;
    
    try {
      posts.value = await blogService.fetchBlogPostsByTag(tag, limit);
    } catch (err) {
      console.error(`Error fetching blog posts with tag ${tag}:`, err);
      error.value = err instanceof Error ? err.message : 'Failed to load blog posts';
    } finally {
      loading.value = false;
    }
  }
  
  return {
    // State
    posts,
    currentPost,
    loading,
    error,
    // Getters
    postsByTag,
    // Actions
    fetchPosts,
    fetchPostBySlug,
    fetchPostsByTag
  };
}); 