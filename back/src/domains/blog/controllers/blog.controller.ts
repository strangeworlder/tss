import { Request, Response } from 'express';
import imageService from '../../images/services/image.service';
import BlogPostModel, { IBlogPost } from '../models/BlogPostModel';

// Get all blog posts (with optional limit)
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    // Get the limit from query params (default to 10)
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    // Get posts with the specified limit
    const posts = await BlogPostModel.find({ isPublished: true })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();
    
    // Enhance posts with hero image URLs and convert dates to strings
    const enhancedPosts = posts.map(post => {
      const typedPost = post as unknown as IBlogPost & { _id: any };
      return {
        ...typedPost,
        id: typedPost._id.toString(), // Convert MongoDB _id to id for client
        heroImageUrl: typedPost.heroImage ? imageService.getImageUrl(typedPost.heroImage.filename) : null,
        // Make sure all tags are proper strings
        tags: Array.isArray(typedPost.tags) ? typedPost.tags.map(tag => String(tag)) : [],
        // Convert dates to ISO strings for JSON serialization
        createdAt: new Date(typedPost.createdAt).toISOString(),
        updatedAt: new Date(typedPost.updatedAt).toISOString(),
        publishedAt: typedPost.publishedAt ? new Date(typedPost.publishedAt).toISOString() : null
      };
    });
    
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
export const getPost = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    console.log(`Backend: Fetching post with slug "${slug}" from params:`, req.params);
    
    // Get the post by slug
    const post = await BlogPostModel.findOne({ slug }).lean();
    
    // If post not found
    if (!post) {
      console.log(`Backend: Post with slug "${slug}" not found.`);
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }
    
    const typedPost = post as unknown as IBlogPost & { _id: any };
    console.log(`Backend: Found post with title "${typedPost.title}"`);
    
    // Add hero image URL and convert dates
    const enhancedPost = {
      ...typedPost,
      id: typedPost._id.toString(), // Convert MongoDB _id to id for client
      heroImageUrl: typedPost.heroImage ? imageService.getImageUrl(typedPost.heroImage.filename) : null,
      // Convert dates to ISO strings for JSON serialization
      createdAt: new Date(typedPost.createdAt).toISOString(),
      updatedAt: new Date(typedPost.updatedAt).toISOString(),
      publishedAt: typedPost.publishedAt ? new Date(typedPost.publishedAt).toISOString() : null
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
export const getPostsByTag = async (req: Request, res: Response) => {
  try {
    const { tag } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    // Find posts with the specified tag
    const filteredPosts = await BlogPostModel.find({ 
      isPublished: true, 
      tags: tag 
    })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean();
    
    // Enhance posts with hero image URLs
    const enhancedPosts = filteredPosts.map(post => {
      const typedPost = post as unknown as IBlogPost & { _id: any };
      return {
        ...typedPost,
        id: typedPost._id.toString(), // Convert MongoDB _id to id for client
        heroImageUrl: typedPost.heroImage ? imageService.getImageUrl(typedPost.heroImage.filename) : null,
        // Convert dates to ISO strings for JSON serialization
        createdAt: new Date(typedPost.createdAt).toISOString(),
        updatedAt: new Date(typedPost.updatedAt).toISOString(),
        publishedAt: typedPost.publishedAt ? new Date(typedPost.publishedAt).toISOString() : null
      };
    });
    
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