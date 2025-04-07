/**
 * Image API Service
 * Handles all image-related API calls
 */

import { apiGet } from './apiClient';
import type { ImageMetadata } from '@/types/image';
import { ImageSizeEnum, ImageFormatEnum } from '@/types/image';

/**
 * Get the URL for an image with the specified size and format
 *
 * @param filename The image filename
 * @param size Optional size (thumbnail, medium, or full)
 * @param format Optional format (original, webp, jpeg, png)
 * @returns The full image URL
 */
export function getImageUrl(
  filename: string,
  size: ImageSizeEnum = ImageSizeEnum.FULL,
  format: ImageFormatEnum = ImageFormatEnum.WEBP
): string {
  // Build the URL with the filename
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
  let url = `${baseUrl}/v1/images/${filename}`;
  // Add size and format parameters
  const params = new URLSearchParams();

  if (size !== ImageSizeEnum.FULL) {
    params.append('size', size);
  }

  if (format !== ImageFormatEnum.ORIGINAL) {
    params.append('format', format);
  }

  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }

  return url;
}

/**
 * Fetch image metadata for a specific image
 *
 * @param filename The image filename
 * @returns Image metadata
 */
export async function fetchImageMetadata(filename: string): Promise<ImageMetadata> {
  const response = await apiGet<ImageMetadata>(`/images/metadata/${filename}`);
  return response.data;
}
