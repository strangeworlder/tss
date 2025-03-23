/**
 * Blog API Service
 * Handles all blog-related API calls
 */

import { apiGet } from './apiClient';
import type { BlogPost, BlogPostPreview, ApiResponse } from '@/types/blog';

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
export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost> {
  try {
    console.log(`Frontend: Fetching blog post with slug "${slug}"`);
    const response = await apiGet<ApiResponse<BlogPost>>(`/v1/blog/${slug}`);
    
    console.log('Frontend: API response:', response);
    
    if (response && response.success && response.data) {
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
  
  if (response && response.success && Array.isArray(response.data)) {
    return response.data;
  }
  
  return [];
} 