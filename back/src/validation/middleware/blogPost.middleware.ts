import { Request, Response, NextFunction } from 'express';
import { blogPostCreateSchema, blogPostUpdateSchema } from '../schemas/blogPost.schema';
import { validateRequest } from './validateRequest';

/**
 * Middleware to validate blog post creation request
 */
export const validateBlogPostCreate = validateRequest(blogPostCreateSchema);

/**
 * Middleware to validate blog post update request
 */
export const validateBlogPostUpdate = validateRequest(blogPostUpdateSchema);
