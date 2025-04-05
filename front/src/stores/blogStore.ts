/**
 * Blog Store
 * Central state management for blog posts
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BlogPost, BlogPostPreview } from '@/types/blog'
import * as blogService from '@/api/blogService'

export const useBlogStore = defineStore('blog', () => {
  // State
  const posts = ref<BlogPostPreview[]>([])
  const currentPost = ref<BlogPost | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const notification = ref<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)

  // Getters
  const postsByTag = computed(() => {
    return (tag: string) => posts.value.filter((post) => post.tags.includes(tag))
  })

  // Actions
  async function fetchPosts(limit?: number) {
    loading.value = true
    error.value = null

    try {
      posts.value = await blogService.fetchBlogPosts(limit)
    } catch (err) {
      console.error('Error fetching blog posts:', err)
      error.value = err instanceof Error ? err.message : 'Failed to load blog posts'
    } finally {
      loading.value = false
    }
  }

  async function fetchAdminPosts(limit?: number) {
    loading.value = true
    error.value = null

    try {
      posts.value = await blogService.fetchAdminPosts(limit)
    } catch (err) {
      console.error('Error fetching admin blog posts:', err)
      error.value = err instanceof Error ? err.message : 'Failed to load blog posts'
    } finally {
      loading.value = false
    }
  }

  async function fetchPostBySlug(slug: string) {
    loading.value = true
    error.value = null

    try {
      currentPost.value = await blogService.fetchBlogPostBySlug(slug)
    } catch (err) {
      console.error(`Error fetching blog post with slug ${slug}:`, err)
      error.value = err instanceof Error ? err.message : 'Failed to load blog post'
    } finally {
      loading.value = false
    }
  }

  async function fetchPostById(id: string) {
    loading.value = true
    error.value = null

    try {
      currentPost.value = await blogService.fetchBlogPostById(id)
    } catch (err) {
      console.error(`Error fetching blog post with ID ${id}:`, err)
      error.value = err instanceof Error ? err.message : 'Failed to load blog post'
    } finally {
      loading.value = false
    }
  }

  async function fetchPostsByTag(tag: string, limit?: number) {
    loading.value = true
    error.value = null

    try {
      posts.value = await blogService.fetchBlogPostsByTag(tag, limit)
    } catch (err) {
      console.error(`Error fetching blog posts with tag ${tag}:`, err)
      error.value = err instanceof Error ? err.message : 'Failed to load blog posts'
    } finally {
      loading.value = false
    }
  }

  async function createPost(formData: FormData) {
    loading.value = true
    error.value = null

    try {
      const newPost = await blogService.createBlogPost(formData)
      // Refresh the posts list to include the new post
      await fetchPosts()
      return newPost
    } catch (err) {
      console.error('Error creating blog post:', err)
      error.value = err instanceof Error ? err.message : 'Failed to create blog post'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updatePost(id: string, formData: FormData) {
    loading.value = true
    error.value = null

    try {
      console.log('Store: Updating post with ID:', id)
      const updatedPost = await blogService.updateBlogPost(id, formData)
      console.log('Store: Received updated post:', updatedPost)

      // Update the current post if it's the one being edited
      if (currentPost.value?.id === id) {
        console.log('Store: Updating current post')
        currentPost.value = updatedPost
      }

      // Refresh the posts list to include the updated post
      console.log('Store: Refreshing posts list')
      await fetchPosts()
      return updatedPost
    } catch (err) {
      console.error('Store: Error updating blog post:', err)
      error.value = err instanceof Error ? err.message : 'Failed to update blog post'
      throw err
    } finally {
      loading.value = false
    }
  }

  const setNotification = (notif: { type: 'success' | 'error' | 'info'; message: string }) => {
    notification.value = notif
    // Clear notification after 5 seconds
    setTimeout(() => {
      notification.value = null
    }, 5000)
  }

  const clearNotification = () => {
    notification.value = null
  }

  return {
    // State
    posts,
    currentPost,
    loading,
    error,
    notification,
    // Getters
    postsByTag,
    // Actions
    fetchPosts,
    fetchAdminPosts,
    fetchPostBySlug,
    fetchPostById,
    fetchPostsByTag,
    createPost,
    updatePost,
    setNotification,
    clearNotification,
  }
})
