import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { Image, ImageSize, ImageFormat } from '../models/image.model';

// Mock database for development - would be replaced with actual DB in production
let images: Image[] = [
  {
    id: '1',
    filename: 'placeholder1.webp',
    originalFilename: 'example.jpg',
    path: '/uploads/images/placeholder1.webp',
    url: '/api/images/placeholder1.webp',
    size: 1024 * 50, // 50KB
    width: 1024,
    height: 1024,
    mimeType: 'image/webp',
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
    filename: 'placeholder2.webp',
    originalFilename: 'placeholder2.webp',
    path: '/uploads/images/placeholder2.webp',
    url: '/api/images/placeholder2.webp',
    size: 1024 * 120, // 120KB
    width: 1200,
    height: 600,
    mimeType: 'image/webp',
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
    imageBuffer?: Buffer;
    metadata?: Partial<Image>;
    error?: string;
  }> => {
    try {
      // First, find the image in our "database"
      const image = await imageService.getImageByFilename(filename);
      let imagePath: string;
      
      if (!image) {
        // If not in our database, check if it exists in the uploads directory
        const uploadsPath = path.join(process.cwd(), 'public/uploads/images', filename);
        
        if (!fs.existsSync(uploadsPath)) {
          return { error: 'Image not found' };
        }
        
        imagePath = uploadsPath;
      } else {
        // If image exists in our mock DB, read from the actual path
        imagePath = path.join(process.cwd(), 'public', image.path.replace(/^\//, ''));
        
        if (!fs.existsSync(imagePath)) {
          // Fallback to uploads directory if path in DB is wrong
          const uploadsPath = path.join(process.cwd(), 'public/uploads/images', filename);
          
          if (!fs.existsSync(uploadsPath)) {
            return { error: 'Image file not found on disk' };
          }
          
          imagePath = uploadsPath;
        }
      }
      
      // Start with a Sharp instance
      let sharpInstance = sharp(imagePath);
      
      // Get original metadata
      const metadata = await sharpInstance.metadata();
      
      // Define dimension values for different sizes
      const dimensionMap = {
        [ImageSize.THUMBNAIL]: { width: 150, height: 150 },
        [ImageSize.MEDIUM]: { width: 400, height: 300 },
        [ImageSize.FULL]: { width: metadata.width, height: metadata.height }
      };
      
      // 1. Process size (resize image)
      if (options.size && options.size !== ImageSize.FULL) {
        const dimensions = dimensionMap[options.size];
        sharpInstance = sharpInstance.resize({
          width: dimensions.width,
          height: dimensions.height,
          fit: 'inside',
          withoutEnlargement: true
        });
      }
      
      // 2. Process format (convert image format)
      if (options.format && options.format !== ImageFormat.ORIGINAL) {
        switch (options.format) {
          case ImageFormat.WEBP:
            sharpInstance = sharpInstance.webp({ 
              quality: options.quality || 80
            });
            break;
          case ImageFormat.JPEG:
            sharpInstance = sharpInstance.jpeg({ 
              quality: options.quality || 80
            });
            break;
          case ImageFormat.PNG:
            sharpInstance = sharpInstance.png({ 
              quality: options.quality ? Math.min(Math.floor(options.quality / 10), 9) : 8
            });
            break;
        }
      }
      
      // 3. Get the processed image as a buffer
      const imageBuffer = await sharpInstance.toBuffer();
      
      // 4. Get the final metadata
      const finalMetadata = await sharp(imageBuffer).metadata();
      
      // Determine the output MIME type
      let mimeType = 'image/jpeg'; // Default fallback
      if (options.format === ImageFormat.WEBP) {
        mimeType = 'image/webp';
      } else if (options.format === ImageFormat.PNG) {
        mimeType = 'image/png';
      } else if (finalMetadata.format) {
        mimeType = `image/${finalMetadata.format}`;
      }
      
      return {
        imageBuffer,
        metadata: {
          mimeType,
          filename,
          width: finalMetadata.width,
          height: finalMetadata.height
        }
      };
    } catch (error) {
      console.error('Error processing image:', error);
      return { error: 'Failed to process image' };
    }
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