/**
 * Blog-related type definitions
 * These match the backend data structures to ensure consistency
 */

export interface Author {
  type: 'user' | 'text';
  id?: string;
  name: string;
  avatar?: {
    filename: string;
    altText: string;
  };
}

export interface HeroImage {
  filename: string;
  altText: string;
  url?: string; // Optional URL for direct image access
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: Author;
  heroImage?: {
    filename: string;
    altText: string;
  };
  heroImageUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  isPublished: boolean;
}

// For partial blog post data (e.g. listings)
export type BlogPostPreview = Pick<
  BlogPost,
  | 'id'
  | 'title'
  | 'slug'
  | 'excerpt'
  | 'author'
  | 'heroImage'
  | 'heroImageUrl'
  | 'tags'
  | 'publishedAt'
>;

// Response structure from backend
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

export type BlogPostField =
  | 'id'
  | 'title'
  | 'slug'
  | 'excerpt'
  | 'author'
  | 'heroImage'
  | 'heroImageUrl'
  | 'tags'
  | 'publishedAt';
