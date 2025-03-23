import express from 'express';
import blogController from '../controllers/blog.controller';

const router = express.Router();

// GET /api/v1/blog - Get all blog posts
router.get('/', blogController.getAllPosts);

// GET /api/v1/blog/:slug - Get a single blog post by slug
router.get('/:slug', blogController.getPost);

// GET /api/v1/blog/tag/:tag - Get posts by tag
router.get('/tag/:tag', blogController.getPostsByTag);

export default router; 