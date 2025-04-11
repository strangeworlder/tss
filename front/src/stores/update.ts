/**
 * Update store for managing content update status
 * Tracks which content items have active updates
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { IBlogPost } from '@/types/blog';

export const useUpdateStore = defineStore('update', () => {
  // Store state
  const activeUpdates = ref<Record<string, boolean>>({});
  const loading = ref(false);
  const error = ref<Error | null>(null);

  /**
   * Check if a content item has an active update
   * @param id - The ID of the content item to check
   * @returns Boolean indicating if there's an active update
   */
  function hasActiveUpdate(id: string): boolean {
    return !!activeUpdates.value[id];
  }

  /**
   * Set the active update status for a content item
   * @param id - The ID of the content item
   * @param status - Whether the item has an active update
   */
  function setActiveUpdate(id: string, status: boolean): void {
    activeUpdates.value[id] = status;
  }

  /**
   * Clear all active updates
   */
  function clearActiveUpdates(): void {
    activeUpdates.value = {};
  }

  /**
   * Update active updates from blog posts
   * @param posts - Array of blog posts to check
   */
  function updateFromPosts(posts: IBlogPost[]): void {
    for (const post of posts) {
      if (post.hasActiveUpdate) {
        activeUpdates.value[post.id] = true;
      }
    }
  }

  return {
    activeUpdates,
    loading,
    error,
    hasActiveUpdate,
    setActiveUpdate,
    clearActiveUpdates,
    updateFromPosts,
  };
});
