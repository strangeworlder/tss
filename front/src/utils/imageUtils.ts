/**
 * Image utility functions
 * @deprecated Use imageService.ts instead
 * 
 * This file is kept for backward compatibility but will be removed in future versions.
 */

import { getImageUrl as getImageUrlFromService } from '@/api/imageService';
import type { ImageSize, ImageFormat } from '@/types/image';
import { ImageSize as ImportedImageSize, ImageFormat as ImportedImageFormat } from '@/types/image';

/**
 * Get a properly formatted image URL for the given filename and size
 * @deprecated Use imageService.getImageUrl instead
 * 
 * @param filename The image filename
 * @param size Optional size (thumbnail, medium, or full)
 * @returns The formatted image URL
 */
export const getImageUrl = (filename: string, size?: string): string => {
  // Convert string to enum value if needed
  const sizeEnum = size as ImportedImageSize;
  return getImageUrlFromService(filename, sizeEnum, ImportedImageFormat.WEBP);
};

// Constants for image sizes (for backward compatibility)
export const IMAGE_SIZE = {
  THUMBNAIL: 'thumbnail' as ImportedImageSize.THUMBNAIL,
  MEDIUM: 'medium' as ImportedImageSize.MEDIUM,
  FULL: 'full' as ImportedImageSize.FULL
}; 