/**
 * Blog API Service
 * Handles all blog-related API calls
 */

import { apiGet, apiPost, apiPut, apiDelete } from './apiClient';
import type { BlogPost, BlogPostPreview, ApiResponse } from '@/types/blog';

/**
 * Fetch all blog posts
 * @param limit Optional number of posts to fetch
 */
export async function fetchBlogPosts(limit?: number): Promise<BlogPostPreview[]> {
  try {
    const endpoint = '/v1/blog';
    const params = limit ? `?limit=${limit}` : '';
    const response = await apiGet<BlogPostPreview[]>(endpoint + params);

    // Make sure we're returning the data array from the response
    if (response?.success && Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    throw error;
  }
}

/**
 * Fetch a single blog post by slug
 * @param slug The blog post slug
 */
export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost> {
  try {
    console.log(`Frontend: Fetching blog post with slug "${slug}"`);
    const response = await apiGet<BlogPost>(`/v1/blog/${slug}`);

    console.log('Frontend: API response:', response);

    if (response?.success && response.data) {
      // Return the post data from the API response
      return response.data;
    }

    throw new Error('Post not found');
  } catch (error) {
    console.error(`Frontend: Error fetching blog post with slug ${slug}:`, error);
    throw error;
  }
}

/**
 * Fetch blog posts by tag
 * @param tag The tag to filter by
 * @param limit Optional number of posts to fetch
 */
export async function fetchBlogPostsByTag(tag: string, limit?: number): Promise<BlogPostPreview[]> {
  const endpoint = limit ? `/v1/blog/tag/${tag}?limit=${limit}` : `/v1/blog/tag/${tag}`;
  const response = await apiGet<BlogPostPreview[]>(endpoint);

  if (response?.success && Array.isArray(response.data)) {
    return response.data;
  }

  return [];
}

/**
 * Create a new blog post
 * @param formData FormData containing the post data and image
 */
export async function createBlogPost(formData: FormData): Promise<BlogPost> {
  try {
    console.log('Service: Creating new blog post');
    console.log('Service: FormData entries:', Array.from(formData.entries()));

    const response = await apiPost<BlogPost>('/v1/blog', formData, {
      headers: {
        // Don't set Content-Type header, let the browser set it with the boundary for multipart/form-data
      },
    });

    console.log('Service: Create post response:', response);

    if (response?.success && response.data) {
      return response.data;
    }

    throw new Error('Failed to create blog post');
  } catch (error) {
    console.error('Service: Error creating blog post:', error);
    throw error;
  }
}

/**
 * Update an existing blog post
 * @param id The blog post ID
 * @param formData FormData containing the updated post data and image
 */
export async function updateBlogPost(id: string, formData: FormData): Promise<BlogPost> {
  try {
    console.log('Service: Updating blog post with ID:', id);
    const response = await apiPut<BlogPost>(`/v1/blog/id/${id}`, formData, {
      headers: {
        // Don't set Content-Type header, let the browser set it with the boundary for multipart/form-data
      },
    });

    console.log('Service: Received response:', response);

    if (response?.success && response.data) {
      return response.data;
    }

    throw new Error('Failed to update blog post');
  } catch (error) {
    console.error('Service: Error updating blog post:', error);
    throw error;
  }
}

/**
 * Fetch a single blog post by ID
 * @param id The blog post ID
 */
export async function fetchBlogPostById(id: string): Promise<BlogPost> {
  try {
    const response = await apiGet<BlogPost>(`/v1/blog/id/${id}`);

    if (response?.success && response.data) {
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
    const response = await apiDelete<{ id: string }>(`/v1/blog/id/${id}`);

    if (!response || !response.success) {
      throw new Error(response?.message || 'Failed to delete post');
    }
  } catch (error) {
    console.error(`Error deleting blog post with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Fetch all blog posts for admin (including unpublished)
 * @param limit Optional number of posts to fetch
 */
export async function fetchAdminPosts(limit?: number): Promise<BlogPostPreview[]> {
  try {
    const endpoint = '/v1/blog/admin/all';
    const params = limit ? `?limit=${limit}` : '';
    const response = await apiGet<BlogPostPreview[]>(endpoint + params);

    if (response?.success && Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  } catch (error) {
    console.error('Error fetching admin blog posts:', error);
    throw error;
  }
}
