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

// Get a single blog post by ID
export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`Backend: Fetching post with ID "${id}" from params:`, req.params);
    
    // Get the post by ID
    const post = await BlogPostModel.findById(id).lean();
    
    // If post not found
    if (!post) {
      console.log(`Backend: Post with ID "${id}" not found.`);
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

// Update a blog post
export const updatePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existingPost = await BlogPostModel.findById(id);
    
    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const updatedPost = await BlogPostModel.findByIdAndUpdate(id, req.body, { new: true });
    return res.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new blog post
export const createPost = async (req: Request, res: Response) => {
  try {
    console.log('Backend: [3] Controller - createPost started');
    console.log('Backend: [3] Request body:', req.body);
    console.log('Backend: [3] Request file:', req.file);
    
    const { title, content, excerpt, tags, publishedAt, isPublished, authorName } = req.body;
    
    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }
    
    // Create slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Check if slug already exists
    const existingPost = await BlogPostModel.findOne({ slug });
    if (existingPost) {
      return res.status(400).json({
        success: false,
        message: 'A post with this title already exists'
      });
    }
    
    // Create new post
    const newPost = new BlogPostModel({
      title,
      slug,
      content,
      excerpt: excerpt || content.substring(0, 200) + '...',
      tags: tags || [],
      publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      isPublished: isPublished !== undefined ? isPublished : true,
      author: {
        name: authorName || 'Admin',
        avatar: null
      },
      heroImage: req.file ? {
        filename: req.file.filename,
        altText: title
      } : {
        filename: 'default-hero.jpg',
        altText: 'Default hero image'
      }
    });
    
    console.log('Backend: [3] Saving new post:', newPost);
    const savedPost = await newPost.save();
    console.log('Backend: [3] Post saved successfully');
    
    // Enhance the post with hero image URL and convert dates
    const enhancedPost = {
      ...savedPost.toObject(),
      id: savedPost._id.toString(),
      heroImageUrl: savedPost.heroImage ? imageService.getImageUrl(savedPost.heroImage.filename) : null,
      createdAt: new Date(savedPost.createdAt).toISOString(),
      updatedAt: new Date(savedPost.updatedAt).toISOString(),
      publishedAt: savedPost.publishedAt ? new Date(savedPost.publishedAt).toISOString() : null
    };
    
    return res.status(201).json({
      success: true,
      data: enhancedPost
    });
  } catch (error) {
    console.error('Backend: [3] Error creating post:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating post',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete a blog post
export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    console.log('Backend: [3] Controller - deletePost started');
    console.log('Backend: [3] Deleting post with ID:', id);
    
    // Find and delete the post
    const deletedPost = await BlogPostModel.findByIdAndDelete(id);
    
    if (!deletedPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    console.log('Backend: [3] Post deleted successfully');
    
    return res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
      data: {
        id: deletedPost._id.toString()
      }
    });
  } catch (error) {
    console.error('Backend: [3] Error deleting post:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting post',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export default {
  getAllPosts,
  getPost,
  getPostsByTag,
  getPostById,
  updatePost,
  createPost,
  deletePost
}; 