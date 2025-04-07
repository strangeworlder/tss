import type { Request, Response } from 'express';
import imageService from '../../images/services/image.service';
import BlogPostModel, { type IBlogPost } from '../models/BlogPostModel';
import User, { IUser, UserRole } from '../../users/models/user.model';

// Get all published blog posts
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    // Get the limit from query params (default to 10)
    const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : 10;

    // Only get published posts
    const query = { isPublished: true };

    // Get posts with the specified limit
    const posts = await BlogPostModel.find(query).sort({ publishedAt: -1 }).limit(limit).lean();

    // Enhance posts with hero image URLs and convert dates to strings
    const enhancedPosts = posts.map((post) => {
      const typedPost = post as unknown as IBlogPost & { _id: any };
      return {
        ...typedPost,
        id: typedPost._id.toString(),
        heroImageUrl: typedPost.heroImage
          ? imageService.getImageUrl(typedPost.heroImage.filename)
          : null,
        tags: Array.isArray(typedPost.tags) ? typedPost.tags.map((tag) => String(tag)) : [],
        createdAt: new Date(typedPost.createdAt).toISOString(),
        updatedAt: new Date(typedPost.updatedAt).toISOString(),
        publishedAt: typedPost.publishedAt ? new Date(typedPost.publishedAt).toISOString() : null,
        isPublished: typedPost.isPublished,
      };
    });

    return res.status(200).json({
      success: true,
      count: posts.length,
      data: enhancedPosts,
    });
  } catch (error: unknown) {
    console.error('Error fetching posts:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get all blog posts for admin (including unpublished)
export const getAllAdminPosts = async (req: Request, res: Response) => {
  try {
    // Verify admin role
    if (req.user?.role !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized. Admin access required.',
      });
    }

    // Get the limit from query params (default to 50 for admin view)
    const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : 50;

    // Get all posts without filtering by isPublished
    const posts = await BlogPostModel.find()
      .sort({ updatedAt: -1 }) // Sort by last updated for admin view
      .limit(limit)
      .lean();

    // Enhance posts with hero image URLs and convert dates to strings
    const enhancedPosts = posts.map((post) => {
      const typedPost = post as unknown as IBlogPost & { _id: any };
      return {
        ...typedPost,
        id: typedPost._id.toString(),
        heroImageUrl: typedPost.heroImage
          ? imageService.getImageUrl(typedPost.heroImage.filename)
          : null,
        tags: Array.isArray(typedPost.tags) ? typedPost.tags.map((tag) => String(tag)) : [],
        createdAt: new Date(typedPost.createdAt).toISOString(),
        updatedAt: new Date(typedPost.updatedAt).toISOString(),
        publishedAt: typedPost.publishedAt ? new Date(typedPost.publishedAt).toISOString() : null,
        isPublished: typedPost.isPublished,
      };
    });

    return res.status(200).json({
      success: true,
      count: posts.length,
      data: enhancedPosts,
    });
  } catch (error: unknown) {
    console.error('Error fetching admin posts:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get a single blog post by slug
export const getPost = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    // Get the post by slug
    const post = await BlogPostModel.findOne({ slug }).lean();

    // If post not found
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const typedPost = post as unknown as IBlogPost & { _id: any };

    // Add hero image URL and convert dates
    const enhancedPost = {
      ...typedPost,
      id: typedPost._id.toString(), // Convert MongoDB _id to id for client
      heroImageUrl: typedPost.heroImage
        ? imageService.getImageUrl(typedPost.heroImage.filename)
        : null,
      // Convert dates to ISO strings for JSON serialization
      createdAt: new Date(typedPost.createdAt).toISOString(),
      updatedAt: new Date(typedPost.updatedAt).toISOString(),
      publishedAt: typedPost.publishedAt ? new Date(typedPost.publishedAt).toISOString() : null,
    };

    return res.status(200).json({
      success: true,
      data: enhancedPost,
    });
  } catch (error: unknown) {
    console.error('Error fetching post:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get blog posts by tag
export const getPostsByTag = async (req: Request, res: Response) => {
  try {
    const { tag } = req.params;
    const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : 10;

    // Find posts with the specified tag
    const filteredPosts = await BlogPostModel.find({
      isPublished: true,
      tags: tag,
    })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();

    // Enhance posts with hero image URLs
    const enhancedPosts = filteredPosts.map((post) => {
      const typedPost = post as unknown as IBlogPost & { _id: any };
      return {
        ...typedPost,
        id: typedPost._id.toString(), // Convert MongoDB _id to id for client
        heroImageUrl: typedPost.heroImage
          ? imageService.getImageUrl(typedPost.heroImage.filename)
          : null,
        // Convert dates to ISO strings for JSON serialization
        createdAt: new Date(typedPost.createdAt).toISOString(),
        updatedAt: new Date(typedPost.updatedAt).toISOString(),
        publishedAt: typedPost.publishedAt ? new Date(typedPost.publishedAt).toISOString() : null,
      };
    });

    return res.status(200).json({
      success: true,
      count: enhancedPosts.length,
      data: enhancedPosts,
    });
  } catch (error: unknown) {
    console.error('Error fetching posts by tag:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
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
        message: 'Post not found',
      });
    }

    const typedPost = post as unknown as IBlogPost & { _id: any };
    console.log(`Backend: Found post with title "${typedPost.title}"`);

    // Add hero image URL and convert dates
    const enhancedPost = {
      ...typedPost,
      id: typedPost._id.toString(), // Convert MongoDB _id to id for client
      heroImageUrl: typedPost.heroImage
        ? imageService.getImageUrl(typedPost.heroImage.filename)
        : null,
      // Convert dates to ISO strings for JSON serialization
      createdAt: new Date(typedPost.createdAt).toISOString(),
      updatedAt: new Date(typedPost.updatedAt).toISOString(),
      publishedAt: typedPost.publishedAt ? new Date(typedPost.publishedAt).toISOString() : null,
    };

    return res.status(200).json({
      success: true,
      data: enhancedPost,
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Update a blog post
export const updatePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const updateData: any = {};

    console.log('Backend: [1] Raw request body:', req.body);

    // Parse fields that might be sent as strings
    const parsedBody = {
      ...req.body,
      isPublished: req.body.isPublished === 'true' || req.body.isPublished === true,
      tags: typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags || [],
      author: typeof req.body.author === 'string' ? JSON.parse(req.body.author) : req.body.author,
      publishedAt: req.body.publishedAt ? new Date(req.body.publishedAt) : null,
    };

    console.log('Backend: [2] Parsed request body:', parsedBody);

    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get the post
    const post = await BlogPostModel.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is admin or post author
    if (user.role !== UserRole.ADMIN && post.author.id?.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Handle author update
    if (parsedBody.author) {
      if (user.role === UserRole.ADMIN) {
        // Admin can set any user as author or use free text
        if (parsedBody.author.type === 'user' && parsedBody.author.id) {
          const authorUser = await User.findById(parsedBody.author.id);
          if (!authorUser) {
            return res.status(404).json({ message: 'Author user not found' });
          }
          updateData.author = {
            type: 'user',
            id: authorUser._id.toString(),
            name: `${authorUser.firstName} ${authorUser.lastName}`,
            avatar: authorUser.avatar,
          };
        } else {
          // Free text author
          updateData.author = {
            type: 'text',
            name: parsedBody.author.name,
          };
        }
      } else {
        // Non-admin users can only set themselves as author
        updateData.author = {
          type: 'user',
          id: user._id.toString(),
          name: `${user.firstName} ${user.lastName}`,
          avatar: user.avatar,
        };
      }
    }

    // Handle other fields
    if (parsedBody.title) {
      updateData.title = parsedBody.title;
      // Only generate a new slug if the title has changed
      if (post.title !== parsedBody.title) {
        const baseSlug = parsedBody.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        // Check if slug exists and append a number if it does
        let slug = baseSlug;
        let counter = 1;
        while (await BlogPostModel.findOne({ slug, _id: { $ne: id } })) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
        updateData.slug = slug;
      }
    }

    if (parsedBody.content) {
      updateData.content = parsedBody.content;
      updateData.excerpt = parsedBody.excerpt || parsedBody.content.substring(0, 200);
    }

    if (parsedBody.tags) {
      updateData.tags = parsedBody.tags;
    }

    if (parsedBody.publishedAt) {
      updateData.publishedAt = parsedBody.publishedAt;
    }

    if (parsedBody.isPublished !== undefined) {
      updateData.isPublished = parsedBody.isPublished;
    } else {
      // Preserve existing isPublished value if not provided in update
      updateData.isPublished = post.isPublished;
    }

    console.log('Backend: [3] Update data:', updateData);

    // Update the post
    const updatedPost = await BlogPostModel.findOneAndUpdate(
      { _id: id },
      { $set: updateData },
      {
        new: true,
        runValidators: true,
        context: 'query',
      }
    );

    if (!updatedPost) {
      console.error('Backend: Post not found after update attempt');
      return res.status(404).json({
        success: false,
        message: 'Post not found after update',
      });
    }

    // Verify the update
    const verifiedPost = await BlogPostModel.findById(id);
    if (!verifiedPost) {
      console.error('Backend: Post disappeared after update');
      return res.status(500).json({
        success: false,
        message: 'Post disappeared after update',
      });
    }

    // Convert to plain object and enhance with additional fields
    const postObject = verifiedPost.toObject();
    const enhancedPost = {
      ...postObject,
      id: postObject._id.toString(),
      _id: undefined,
      createdAt: new Date(postObject.createdAt).toISOString(),
      updatedAt: new Date(postObject.updatedAt).toISOString(),
      publishedAt: postObject.publishedAt ? new Date(postObject.publishedAt).toISOString() : null,
      heroImageUrl: postObject.heroImage
        ? imageService.getImageUrl(postObject.heroImage.filename)
        : null,
    };

    return res.status(200).json({
      success: true,
      data: enhancedPost,
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Create a new blog post
export const createPost = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Handle author information
    let author;
    if (req.body.author) {
      if (user.role === UserRole.ADMIN) {
        // Admin can set any user as author or use free text
        if (req.body.author.type === 'user' && req.body.author.id) {
          const authorUser = await User.findById(req.body.author.id);
          if (!authorUser) {
            return res.status(404).json({ message: 'Author user not found' });
          }
          author = {
            type: 'user',
            id: authorUser._id.toString(),
            name: `${authorUser.firstName} ${authorUser.lastName}`,
            avatar: authorUser.avatar,
          };
        } else {
          // Free text author
          author = {
            type: 'text',
            name: req.body.author.name,
          };
        }
      } else {
        // Non-admin users can only set themselves as author
        author = {
          type: 'user',
          id: user._id.toString(),
          name: `${user.firstName} ${user.lastName}`,
          avatar: user.avatar,
        };
      }
    } else {
      // Default to current user as author
      author = {
        type: 'user',
        id: user._id.toString(),
        name: `${user.firstName} ${user.lastName}`,
        avatar: user.avatar,
      };
    }

    // Create the post
    const baseSlug = req.body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug exists and append a number if it does
    let slug = baseSlug;
    let counter = 1;
    while (await BlogPostModel.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const post = await BlogPostModel.create({
      ...req.body,
      author,
      slug,
      excerpt: req.body.excerpt || req.body.content.substring(0, 200),
      tags: req.body.tags || [],
      publishedAt: req.body.publishedAt ? new Date(req.body.publishedAt) : null,
      isPublished: req.body.isPublished || false,
    });

    return res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Delete a blog post
export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get the post
    const post = await BlogPostModel.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is admin or post author
    if (user.role !== UserRole.ADMIN && post.author.id.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete the post
    await BlogPostModel.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Delete post error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting post',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export default {
  getAllPosts,
  getAllAdminPosts,
  getPost,
  getPostsByTag,
  getPostById,
  updatePost,
  createPost,
  deletePost,
};
