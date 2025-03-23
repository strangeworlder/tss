import { Router } from 'express';
import blogController from '../controllers/blog.controller';

const router = Router();

/**
 * @route   GET /api/v1/blog
 * @desc    Get all blog posts
 * @access  Public
 */
router.get('/', blogController.getAllPosts);

/**
 * @route   GET /api/v1/blog/tag/:tag
 * @desc    Get blog posts by tag
 * @access  Public
 */
router.get('/tag/:tag', blogController.getPostsByTag);

// Legacy endpoints for backward compatibility
router.get('/posts', blogController.getAllPosts);
router.get('/posts/:slug', blogController.getPost);

/**
 * @route   GET /api/v1/blog/:slug
 * @desc    Get a single blog post by slug
 * @access  Public
 */
router.get('/:slug', blogController.getPost);

export default router; 