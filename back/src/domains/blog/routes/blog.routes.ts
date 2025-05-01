import { Router } from 'express';
import blogController from '../controllers/blog.controller';
import { blogHeroUpload } from '../../../config/multer';
import bodyParser from 'body-parser';
import { authenticate } from '../../../middlewares/auth.middleware';
import commentRoutes from './comment.routes';
import {
  validateBlogPostCreate,
  validateBlogPostUpdate,
} from '../../../validation/middleware/blogPost.middleware';

const router = Router();

// Middleware
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// Mount comment routes
router.use('/', commentRoutes);

// Error handling middleware
router.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled error in blog routes:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message,
  });
});

// Common middleware for handling file uploads and data parsing
const handleFormData = (req: any, res: any, next: any) => {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    try {
      // Use blogHeroUpload to handle the form data
      blogHeroUpload.single('heroImage')(req, res, (err) => {
        if (err) {
          console.error('Error handling form data:', err);
          return res.status(400).json({
            success: false,
            message: 'Error processing form data',
            error: err.message,
          });
        }
        next();
      });
    } catch (error) {
      console.error('Unexpected error in handleFormData:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  } else {
    next();
  }
};

const parseRequestData = (req: any, res: any, next: any) => {
  console.log('Backend: [2] Parsing request data');
  console.log('Backend: [2] Raw request body:', req.body);

  // Parse the tags string into an array if it exists
  if (req.body.tags) {
    try {
      req.body.tags = JSON.parse(req.body.tags);
    } catch (error) {
      console.error('Error parsing tags:', error);
      req.body.tags = [];
    }
  }

  // Parse boolean fields
  if (req.body.isPublished !== undefined) {
    req.body.isPublished = req.body.isPublished === 'true';
  }

  // Parse date fields
  if (req.body.publishedAt) {
    req.body.publishedAt = new Date(req.body.publishedAt);
  }

  // Generate excerpt if not provided
  if (!req.body.excerpt && req.body.content) {
    req.body.excerpt = `${req.body.content.substring(0, 200)}...`;
  }

  // Map authorName to author.name and preserve existing author data
  if (req.body.authorName) {
    req.body.author = {
      ...req.body.author,
      name: req.body.authorName,
    };
    req.body.authorName = undefined;
  }

  // Parse author field if it's a string
  if (typeof req.body.author === 'string') {
    try {
      req.body.author = JSON.parse(req.body.author);
    } catch (error) {
      console.error('Error parsing author:', error);
      req.body.author = {
        type: 'text',
        name: req.body.author,
      };
    }
  }

  // Only remove author if it's invalid
  if (req.body.author && !req.body.author.type) {
    req.body.author = undefined;
  }

  console.log('Backend: [2] Parsed request body:', req.body);
  next();
};

// Logging middleware
const logRequest = (req: any, res: any, next: any) => {
  console.log(`\n=== ${req.method} ROUTE HIT ===`);
  console.log(`Backend: [1] ${req.method} route hit for ${req.params.id || 'new post'}`);
  console.log('Backend: [1] Request body:', req.body);
  console.log('Backend: [1] Content-Type:', req.headers['content-type']);
  console.log('=== END ROUTE LOG ===\n');
  next();
};

// Routes

/**
 * @route   GET /api/v1/blog
 * @desc    Get all published blog posts
 * @access  Public
 */
router.get('/', blogController.getAllPosts);

/**
 * @route   GET /api/v1/blog/admin/all
 * @desc    Get all blog posts (including unpublished) for admin
 * @access  Private (Admin only)
 */
router.get('/admin/all', authenticate, blogController.getAllAdminPosts);

/**
 * @route   POST /api/v1/blog
 * @desc    Create a new blog post
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  blogHeroUpload.single('heroImage'),
  validateBlogPostCreate,
  blogController.createPost
);

/**
 * @route   GET /api/v1/blog/tag/:tag
 * @desc    Get blog posts by tag
 * @access  Public
 */
router.get('/tag/:tag', blogController.getPostsByTag);

/**
 * @route   GET /api/v1/blog/id/:id
 * @desc    Get a single blog post by ID
 * @access  Public
 */
router.get('/id/:id', blogController.getPostById);

/**
 * @route   PUT /api/v1/blog/id/:id
 * @desc    Update a blog post
 * @access  Private
 */
router.put(
  '/id/:id',
  authenticate,
  blogHeroUpload.single('heroImage'),
  validateBlogPostUpdate,
  blogController.updatePost
);

/**
 * @route   GET /api/v1/blog/:slug
 * @desc    Get a single blog post by slug
 * @access  Public
 */
router.get('/:slug', blogController.getPost);

/**
 * @route   DELETE /api/v1/blog/id/:id
 * @desc    Delete a blog post
 * @access  Private
 */
router.delete('/id/:id', authenticate, blogController.deletePost);

/**
 * @route   GET /api/v1/blog/debug/diagnose/:id
 * @desc    Temporary diagnostic endpoint to debug blog post validation issues
 * @access  Private (Admin only)
 */
router.get('/debug/diagnose/:id', authenticate, blogController.diagnosePostValidation);

// Comment routes
router.use('/:postId/comments', commentRoutes);

export default router;
