import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { Image, ImageSize, ImageFormat } from '../models/image.model';

// Mock database for development - would be replaced with actual DB in production
let images: Image[] = [
  {
    id: '1',
    filename: 'example-image.jpg',
    originalFilename: 'example.jpg',
    path: '/uploads/images/example-image.jpg',
    url: '/api/images/example-image.jpg',
    size: 1024 * 50, // 50KB
    width: 800,
    height: 600,
    mimeType: 'image/jpeg',
    altText: 'Example image',
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      author: 'John Doe',
      tags: ['example', 'test']
    }
  },
  {
    id: '2',
    filename: 'typescript-express-hero.jpg',
    originalFilename: 'typescript-express.jpg',
    path: '/uploads/images/typescript-express-hero.jpg',
    url: '/api/images/typescript-express-hero.jpg',
    size: 1024 * 120, // 120KB
    width: 1200,
    height: 600,
    mimeType: 'image/jpeg',
    altText: 'TypeScript and Express code on a computer screen',
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      author: 'Jane Developer',
      tags: ['typescript', 'express', 'coding']
    }
  }
];

const imageService = {
  /**
   * Get all images
   */
  getAllImages: async (): Promise<Image[]> => {
    return images;
  },

  /**
   * Get image by ID
   */
  getImageById: async (id: string): Promise<Image | null> => {
    const image = images.find(img => img.id === id);
    return image || null;
  },

  /**
   * Get image by filename
   */
  getImageByFilename: async (filename: string): Promise<Image | null> => {
    const image = images.find(img => img.filename === filename);
    return image || null;
  },

  /**
   * Update image metadata
   */
  updateImageMetadata: async (
    id: string, 
    data: Partial<Pick<Image, 'altText'>>
  ): Promise<Image | null> => {
    const index = images.findIndex(img => img.id === id);
    
    if (index === -1) {
      return null;
    }
    
    const updatedImage = {
      ...images[index],
      ...data,
      updatedAt: new Date()
    };
    
    images[index] = updatedImage;
    return updatedImage;
  },

  /**
   * Process an image with the given parameters
   * This would be called by the REST endpoint
   */
  processImage: async (
    filename: string,
    options: {
      size?: ImageSize;
      format?: ImageFormat;
      quality?: number;
    }
  ): Promise<{
    imageBuffer: Buffer | null;
    metadata: Partial<Image> | null;
    error?: string;
  }> => {
    // Find the image
    const image = await imageService.getImageByFilename(filename);
    
    if (!image) {
      return { imageBuffer: null, metadata: null, error: 'Image not found' };
    }
    
    // Use server-side defaults if not provided
    const format = options.format || ImageFormat.WEBP;
    const quality = options.quality || 80;
    const size = options.size || ImageSize.FULL;
    
    // Mock implementation - in production, we would use Sharp or another library
    // to actually process the image
    return {
      imageBuffer: Buffer.from('mock image data'),
      metadata: {
        id: image.id,
        filename: image.filename,
        mimeType: format === ImageFormat.ORIGINAL 
          ? image.mimeType
          : format === ImageFormat.WEBP 
            ? 'image/webp' 
            : format === ImageFormat.JPEG 
              ? 'image/jpeg' 
              : format === ImageFormat.PNG 
                ? 'image/png' 
                : image.mimeType,
        width: size === ImageSize.THUMBNAIL 
          ? 150 
          : size === ImageSize.MEDIUM 
            ? 400 
            : image.width,
        height: size === ImageSize.THUMBNAIL 
          ? 150 
          : size === ImageSize.MEDIUM 
            ? 300 
            : image.height,
        size: image.size // This would change based on processing in a real implementation
      }
    };
  },
  
  /**
   * Get an image URL with the specified parameters
   * This would be used by the frontend to construct image URLs
   */
  getImageUrl: (
    filename: string,
    size: ImageSize = ImageSize.FULL,
    format: ImageFormat = ImageFormat.WEBP,
    quality: number = 85
  ): string => {
    const baseUrl = process.env.IMAGE_API_URL || 'http://localhost:3000/api/v1/images';
    const params = new URLSearchParams();
    
    if (size !== ImageSize.FULL) {
      params.append('size', size);
    }
    
    if (format !== ImageFormat.ORIGINAL) {
      params.append('format', format);
    }
    
    if (quality !== 85) {
      params.append('quality', quality.toString());
    }
    
    const queryString = params.toString();
    if (queryString) {
      return `${baseUrl}/${filename}?${queryString}`;
    }
    
    return `${baseUrl}/${filename}`;
  }
};

// Function to get formatted image URL from the image API
export const getHeroImageUrl = (filename: string): string => {
  // For development, use a deterministic placeholder if the file doesn't exist
  const doesFileExist = images.some(img => img.filename === filename);
  
  if (!doesFileExist) {
    // Using Lorem Picsum to generate random images based on the filename
    // This creates a deterministic hash from the filename so the same filename always gets the same image
    const hash = filename
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0) % 1000;
    
    return `https://picsum.photos/seed/${hash}/1200/600`;
  }
  
  // For production or if the file exists, use the actual image service
  return imageService.getImageUrl(filename, ImageSize.FULL, ImageFormat.WEBP, 90);
};

export default imageService; 