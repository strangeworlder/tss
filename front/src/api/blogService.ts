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
  const endpoint = limit ? `/blog?limit=${limit}` : '/blog';
  const response = await apiGet<BlogPostPreview[]>(endpoint);
  return response.data;
}

/**
 * Fetch a single blog post by slug
 * @param slug The blog post slug
 */
export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost> {
  const response = await apiGet<BlogPost>(`/blog/${slug}`);
  return response.data;
}

/**
 * Fetch blog posts by tag
 * @param tag The tag to filter by
 * @param limit Optional number of posts to fetch
 */
export async function fetchBlogPostsByTag(tag: string, limit?: number): Promise<BlogPostPreview[]> {
  const endpoint = limit ? `/blog/tag/${tag}?limit=${limit}` : `/blog/tag/${tag}`;
  const response = await apiGet<BlogPostPreview[]>(endpoint);
  return response.data;
} 