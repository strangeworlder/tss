/**
 * Image API Service
 * Handles all image-related API calls
 */

import { apiGet } from './apiClient';
import type { ImageMetadata } from '@/types/image';
import { ImageSize, ImageFormat } from '@/types/image';

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
  size: ImageSize = ImageSize.FULL,
  format: ImageFormat = ImageFormat.WEBP
): string {
  // Build the URL with the filename
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
  let url = `${baseUrl}/images/${filename}`;
  
  // Add size and format parameters
  const params = new URLSearchParams();
  
  if (size !== ImageSize.FULL) {
    params.append('size', size);
  }
  
  if (format !== ImageFormat.ORIGINAL) {
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