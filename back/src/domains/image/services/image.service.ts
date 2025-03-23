import { ImageSize, ImageFormat } from '../models/image.model';

export interface ImageUrlResponse {
  url: string;
  size: string;
  format: string;
}

export const getImageUrl = (
  filename: string, 
  size: ImageSize = 'LARGE', 
  format: ImageFormat = 'WEBP',
  quality: number = 85
): ImageUrlResponse => {
  // This would normally call the actual image processing service
  // For now, we'll return a mock URL
  const baseUrl = process.env.IMAGE_API_URL || 'http://localhost:3000/api/images';
  return {
    url: `${baseUrl}/${filename}?size=${size.toLowerCase()}&format=${format.toLowerCase()}&quality=${quality}`,
    size: size,
    format: format
  };
};

export const getHeroImageUrl = (filename: string): string => {
  const response = getImageUrl(filename, 'LARGE', 'WEBP', 90);
  return response.url;
}; 