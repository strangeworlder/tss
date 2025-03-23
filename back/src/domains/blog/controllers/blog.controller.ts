import { Request, Response } from 'express';
import { getPosts, getPostBySlug } from '../models/post.model';
import { getHeroImageUrl } from '../../images/services/image.service';
import imageService from '../../images/services/image.service';
import type { ApiResponse } from '@/types/blog';

// Get all blog posts (with optional limit)
export const getAllPosts = (req: Request, res: Response) => {
  try {
    // Get the limit from query params (default to 10)
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    // Get posts with the specified limit
    const posts = getPosts(limit);
    
    // Enhance posts with hero image URLs and convert dates to strings
    const enhancedPosts = posts.map(post => ({
      ...post,
      heroImageUrl: post.heroImage ? imageService.getImageUrl(post.heroImage.filename) : null,
      // Make sure all tags are proper strings
      tags: Array.isArray(post.tags) ? post.tags.map(tag => String(tag)) : [],
      // Convert dates to ISO strings for JSON serialization
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null
    }));
    
    return res.status(200).json({
      success: true,
      count: posts.length,
      data: enhancedPosts
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get a single blog post by slug
export const getPost = (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    // Get the post by slug
    const post = getPostBySlug(slug);
    
    // If post not found
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }
    
    // Add hero image URL
    const enhancedPost = {
      ...post,
      heroImageUrl: post.heroImage ? imageService.getImageUrl(post.heroImage.filename) : null
    };
    
    return res.status(200).json({
      success: true,
      data: enhancedPost,
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get blog posts by tag
export const getPostsByTag = (req: Request, res: Response) => {
  try {
    const { tag } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    // Get all posts
    const allPosts = getPosts();
    
    // Filter by tag - ensure we only return published posts
    const filteredPosts = allPosts
      .filter(post => post.isPublished && post.tags.includes(tag))
      .slice(0, limit);
    
    // Enhance posts with hero image URLs
    const enhancedPosts = filteredPosts.map(post => ({
      ...post,
      heroImageUrl: post.heroImage ? imageService.getImageUrl(post.heroImage.filename) : null,
      // Convert dates to ISO strings for JSON serialization
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null
    }));
    
    return res.status(200).json({
      success: true,
      count: enhancedPosts.length,
      data: enhancedPosts
    });
  } catch (error) {
    console.error('Error fetching posts by tag:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

export default {
  getAllPosts,
  getPost,
  getPostsByTag
}; 