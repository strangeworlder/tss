/**
 * Blog Post Types Module
 * Re-exports shared blog post types and enums for use in the backend
 */

import { BlogPostStatus, BlogPostModerationStatus, type IBlogPost } from '@shared/types/blog';

/**
 * Re-export shared blog post interface
 * @see {@link IBlogPost} in @shared/types/blog
 */
export type { IBlogPost };

/**
 * Re-export blog post status enum
 * @see {@link BlogPostStatus} in @shared/types/blog
 */
export { BlogPostStatus };

/**
 * Re-export blog post moderation status enum
 * @see {@link BlogPostModerationStatus} in @shared/types/blog
 */
export { BlogPostModerationStatus };
