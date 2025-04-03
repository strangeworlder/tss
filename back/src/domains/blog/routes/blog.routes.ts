import { Router } from 'express';
import blogController from '../controllers/blog.controller';
import upload from '../../../config/multer';
import bodyParser from 'body-parser';

const router = Router();

// Middleware
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// Common middleware for handling file uploads and data parsing
const handleFormData = (req: any, res: any, next: any) => {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    upload.single('heroImage')(req, res, next);
  } else {
    next();
  }
};

const parseRequestData = (req: any, res: any, next: any) => {
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
    req.body.excerpt = req.body.content.substring(0, 200) + '...';
  }
  
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
 * @desc    Get all blog posts
 * @access  Public
 */
router.get('/', blogController.getAllPosts);

/**
 * @route   POST /api/v1/blog
 * @desc    Create a new blog post
 * @access  Private
 */
router.post('/', 
  logRequest,
  handleFormData,
  parseRequestData,
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
router.put('/id/:id', 
  logRequest,
  handleFormData,
  parseRequestData,
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
router.delete('/id/:id', 
  logRequest,
  blogController.deletePost
);

export default router; 