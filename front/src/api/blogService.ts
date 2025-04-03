/**
 * Blog API Service
 * Handles all blog-related API calls
 */

import { apiGet, apiPost, apiPut, apiDelete } from './apiClient';
import type { BlogPost, BlogPostPreview, ApiResponse } from '@/types/blog';
import { apiClient } from './apiClient';

/**
 * Fetch all blog posts
 * @param limit Optional number of posts to fetch
 */
export async function fetchBlogPosts(limit?: number): Promise<BlogPostPreview[]> {
  try {
    const endpoint = `/v1/blog`;
    const params = limit ? `?limit=${limit}` : '';
    const response = await apiGet<BlogPostPreview[]>(endpoint + params);
    
    // Make sure we're returning the data array from the response
    if (response && response.success && Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    throw error;
  }
}

/**
 * Fetch a single blog post by slug
 * @param slug The blog post slug
 */
export const getPostBySlug = async (slug: string): Promise<BlogPost> => {
  try {
    const response: ApiResponse<BlogPost> = await apiGet<BlogPost>(`/v1/blog/${slug}`);
    if (!response.success || !response.data) {
      throw new Error('Post not found');
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    throw error;
  }
};

/**
 * Fetch blog posts by tag
 * @param tag The tag to filter by
 * @param limit Optional number of posts to fetch
 */
export async function fetchBlogPostsByTag(tag: string, limit?: number): Promise<BlogPostPreview[]> {
  const endpoint = limit ? `/v1/blog/tag/${tag}?limit=${limit}` : `/v1/blog/tag/${tag}`;
  const response = await apiGet<BlogPostPreview[]>(endpoint);
  
  if (response && response.success && Array.isArray(response.data)) {
    return response.data;
  }
  
  return [];
}

/**
 * Create a new blog post
 * @param formData FormData containing the post data and image
 */
export const createPost = async (postData: FormData): Promise<BlogPost> => {
  try {
    const response: ApiResponse<BlogPost> = await apiPost<BlogPost>('/v1/blog', postData);
    if (!response.success || !response.data) {
      throw new Error('Failed to create post');
    }
    return response.data;
  } catch (error) {
    console.error('Error creating blog post:', error);
    throw error;
  }
};

/**
 * Update an existing blog post
 * @param id The blog post ID
 * @param formData FormData containing the updated post data and image
 */
export const updatePost = async (id: string, postData: FormData): Promise<BlogPost> => {
  try {
    const response: ApiResponse<BlogPost> = await apiPut<BlogPost>(`/v1/blog/id/${id}`, postData);
    if (!response.success || !response.data) {
      throw new Error('Failed to update post');
    }
    return response.data;
  } catch (error) {
    console.error('Error updating blog post:', error);
    throw error;
  }
};

/**
 * Fetch a single blog post by ID
 * @param id The blog post ID
 */
export async function fetchBlogPostById(id: string): Promise<BlogPost> {
  try {
    const response = await apiGet<ApiResponse<BlogPost>>(`/v1/blog/id/${id}`);
    
    if (response && response.success && response.data) {
      return response.data;
    }
    
    throw new Error('Post not found');
  } catch (error) {
    console.error(`Error fetching blog post with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a blog post
 * @param id The blog post ID
 */
export async function deleteBlogPost(id: string): Promise<void> {
  try {
    const response = await apiDelete<ApiResponse<{ id: string }>>(`/v1/blog/id/${id}`);
    
    if (!response || !response.success) {
      throw new Error(response?.message || 'Failed to delete post');
    }
  } catch (error) {
    console.error(`Error deleting blog post with ID ${id}:`, error);
    throw error;
  }
} 