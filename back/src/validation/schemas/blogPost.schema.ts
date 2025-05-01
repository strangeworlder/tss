import { z } from 'zod';
import { BlogPostStatus, BlogPostModerationStatus } from '@shared/types/blog/blog';

/**
 * Schema for avatar (matches IAuthor.avatar)
 */
export const avatarSchema = z.object({
  filename: z.string(),
  altText: z.string(),
});

/**
 * Schema for author information (matches IAuthor interface)
 */
export const authorSchema = z.object({
  type: z.enum(['user', 'text']),
  id: z.string().optional(),
  name: z.string(),
  avatar: avatarSchema.optional(),
});

/**
 * Schema for hero image (matches IHeroImage interface)
 */
export const heroImageSchema = z.object({
  filename: z.string(),
  altText: z.string(),
  url: z.string().optional(), // url is added by API for client display
});

/**
 * Core blog post schema (matches IBlogPost interface exactly)
 */
export const blogPostSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
  slug: z.string().min(1, 'Slug is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  author: authorSchema,
  heroImage: heroImageSchema.optional(),
  tags: z.array(z.string()),
  status: z.nativeEnum(BlogPostStatus),
  publishAt: z.string().optional(),
  timezone: z.string(),
  version: z.number().min(1, 'Version must be at least 1'),
  hasActiveUpdate: z.boolean(),
  pendingUpdateId: z.string().optional(),
  originalPostId: z.string().optional(),
  moderationStatus: z.nativeEnum(BlogPostModerationStatus),
  abuseScore: z.number(),
  lastModeratedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * Schema for blog post creation - flattened for API usability
 * Will be transformed to match IBlogPost structure
 */
export const blogPostCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  slug: z.string().optional(),
  // Author can be either a string (JSON) or an object
  author: z.union([z.string(), authorSchema]).optional(),
  // Author information flattened for API usability
  authorType: z.enum(['user', 'text']).optional(),
  authorName: z.string().optional(),
  authorId: z.string().optional(),
  authorAvatarFilename: z.string().optional(),
  authorAvatarAltText: z.string().optional(),
  // Hero image flattened
  heroImageFilename: z.string().optional(),
  heroImageAltText: z.string().optional(),
  // Other fields
  tags: z
    .union([
      z.string(), // For JSON stringified arrays
      z.array(z.string()),
    ])
    .optional(),
  status: z.nativeEnum(BlogPostStatus).optional(),
  publishAt: z.string().optional(), // Accept any string format for parsing
  publishedAt: z.string().optional(), // Alternative field name
  timezone: z.string().default('UTC'),
  // Support isPublished boolean flag
  isPublished: z
    .union([
      z.string(), // For 'true'/'false' strings
      z.boolean(),
    ])
    .optional(),
});

/**
 * Schema for blog post update - similar to create but all fields optional
 */
export const blogPostUpdateSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  slug: z.string().optional(),
  // Author can be either a string (JSON) or an object
  author: z.union([z.string(), authorSchema]).optional(),
  // Author information flattened
  authorType: z.enum(['user', 'text']).optional(),
  authorName: z.string().optional(),
  authorId: z.string().optional(),
  authorAvatarFilename: z.string().optional(),
  authorAvatarAltText: z.string().optional(),
  // Hero image flattened
  heroImageFilename: z.string().optional(),
  heroImageAltText: z.string().optional(),
  // Other fields
  tags: z
    .union([
      z.string(), // For JSON stringified arrays
      z.array(z.string()),
    ])
    .optional(),
  status: z.nativeEnum(BlogPostStatus).optional(),
  publishAt: z.string().optional(), // Accept any string format for parsing
  publishedAt: z.string().optional(), // Alternative field name
  timezone: z.string().optional(),
  version: z.number().optional(),
  hasActiveUpdate: z.boolean().optional(),
  moderationStatus: z.nativeEnum(BlogPostModerationStatus).optional(),
  abuseScore: z.number().optional(),
  // Support isPublished boolean flag
  isPublished: z
    .union([
      z.string(), // For 'true'/'false' strings
      z.boolean(),
    ])
    .optional(),
});

/**
 * Schema for blog post ID params
 */
export const blogPostIdParamsSchema = z.object({
  id: z.string(),
});

/**
 * Schema for blog post response with success wrapper
 */
export const blogPostResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  count: z.number().optional(),
  data: z.union([blogPostSchema, z.array(blogPostSchema)]).optional(),
  error: z.string().optional(),
});

/**
 * Type definitions derived from schemas
 */
export type BlogPostInput = z.infer<typeof blogPostSchema>;
export type BlogPostCreateInput = z.infer<typeof blogPostCreateSchema>;
export type BlogPostUpdateInput = z.infer<typeof blogPostUpdateSchema>;
export type BlogPostResponse = z.infer<typeof blogPostResponseSchema>;
