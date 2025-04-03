import { Request, Response } from 'express';
import BlogPost from '../models/BlogPost';
import upload from '../config/multer';

export const updatePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: any = {};

    console.log('Backend: Starting update process for post:', id);
    console.log('Backend: Raw request body:', req.body);
    console.log('Backend: Request file:', req.file);
    console.log('Backend: Request headers:', req.headers);

    // Handle text fields
    if (req.body.title) {
      updateData.title = req.body.title;
      // Generate slug from title
      updateData.slug = req.body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      console.log('Backend: Title and slug update:', {
        title: updateData.title,
        slug: updateData.slug
      });
    }

    if (req.body.content) {
      updateData.content = req.body.content;
      // Generate excerpt if not provided
      updateData.excerpt = req.body.excerpt || req.body.content.substring(0, 200);
      console.log('Backend: Content and excerpt update:', {
        content: req.body.content.substring(0, 50) + '...',
        excerpt: updateData.excerpt
      });
    }

    if (req.body.tags) {
      try {
        updateData.tags = JSON.parse(req.body.tags);
        console.log('Backend: Tags update:', updateData.tags);
      } catch (e) {
        console.error('Backend: Error parsing tags:', e);
        updateData.tags = req.body.tags;
      }
    }

    if (req.body.publishDate) {
      updateData.publishDate = new Date(req.body.publishDate);
      console.log('Backend: Publish date update:', updateData.publishDate);
    }

    // Ensure author is set
    updateData.author = {
      name: 'Admin',
      avatar: null
    };

    // Handle hero image if uploaded
    if (req.file) {
      updateData.heroImage = {
        url: `/uploads/${req.file.filename}`,
        alt: req.body.title || 'Blog post hero image'
      };
      console.log('Backend: Hero image update:', updateData.heroImage);
    }

    console.log('Backend: Final update data:', updateData);

    // Find the existing post first
    const existingPost = await BlogPost.findById(id);
    console.log('Backend: Existing post:', existingPost);

    if (!existingPost) {
      console.log('Backend: Post not found');
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Perform the update
    console.log('Backend: Attempting to update post with data:', updateData);
    const post = await BlogPost.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).exec();

    console.log('Backend: Update result:', post);

    if (!post) {
      console.log('Backend: Update failed - no post returned');
      return res.status(500).json({
        success: false,
        message: 'Failed to update post'
      });
    }

    // Verify the update
    const verifiedPost = await BlogPost.findById(id);
    console.log('Backend: Verified post after update:', verifiedPost);

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Backend: Error updating blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating blog post',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const createPost = async (req: Request, res: Response) => {
  try {
    console.log('Controller: Creating new post');
    console.log('Controller: Request body:', req.body);
    console.log('Controller: Request file:', req.file);

    const { title, content, excerpt, tags, publishDate } = req.body;
    
    // Validate required fields
    if (!title || !content) {
      console.log('Controller: Missing required fields');
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
    const existingPost = await BlogPost.findOne({ slug });
    if (existingPost) {
      console.log('Controller: Slug already exists');
      return res.status(400).json({ 
        success: false, 
        message: 'A post with this title already exists' 
      });
    }

    // Create new post
    const newPost = new BlogPost({
      title,
      slug,
      content,
      excerpt: excerpt || content.substring(0, 200),
      tags: tags ? JSON.parse(tags) : [],
      publishDate: publishDate ? new Date(publishDate) : new Date(),
      author: {
        name: 'Admin', // Default author name
        avatar: null
      },
      heroImage: req.file ? {
        url: `/uploads/${req.file.filename}`,
        alt: title
      } : null
    });

    console.log('Controller: Saving new post to database:', newPost);
    const savedPost = await newPost.save();
    console.log('Controller: Post saved successfully:', savedPost);

    res.status(201).json({
      success: true,
      data: savedPost
    });
  } catch (error) {
    console.error('Controller: Error creating post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating post',
      error: error.message 
    });
  }
};

export const getPosts = async (req: Request, res: Response) => {
  try {
    const posts = await BlogPost.find()
      .sort({ publishDate: -1 })
      .exec();

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blog posts'
    });
  }
};

export const getPostBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const post = await BlogPost.findOne({ slug });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blog post'
    });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blog post'
    });
  }
}; 