/**
 * Image-related type definitions
 * Mirrors backend image services definitions
 */

// Available image sizes
export enum ImageSize {
  THUMBNAIL = 'thumbnail',
  MEDIUM = 'medium',
  FULL = 'full'
}

// Available image formats
export enum ImageFormat {
  ORIGINAL = 'original',
  WEBP = 'webp',
  JPEG = 'jpeg',
  PNG = 'png'
}

// Image metadata structure
export interface ImageMetadata {
  id: string;
  filename: string;
  originalFilename?: string;
  path?: string;
  url: string;
  size: number; // size in bytes
  width: number;
  height: number;
  mimeType: string;
  altText: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

// Image URL response from API
export interface ImageUrlResponse {
  url: string;
  size: string;
  format: string;
} 