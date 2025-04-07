import { v4 as uuidv4 } from 'uuid';
import path from 'node:path';
import fs from 'node:fs';
import sharp from 'sharp';
import { type Image, ImageSize, ImageFormat } from '../models/image.model';

// Mock database for development - would be replaced with actual DB in production
const images: Image[] = [
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
      tags: ['example', 'test'],
    },
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
      tags: ['typescript', 'express', 'coding'],
    },
  },
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
    const image = images.find((img) => img.id === id);
    return image || null;
  },

  /**
   * Get image by filename
   */
  getImageByFilename: async (filename: string): Promise<Image | null> => {
    const image = images.find((img) => img.filename === filename);
    return image || null;
  },

  /**
   * Update image metadata
   */
  updateImageMetadata: async (
    id: string,
    data: Partial<Pick<Image, 'altText'>>
  ): Promise<Image | null> => {
    const index = images.findIndex((img) => img.id === id);

    if (index === -1) {
      return null;
    }

    const updatedImage = {
      ...images[index],
      ...data,
      updatedAt: new Date(),
    };

    images[index] = updatedImage;
    return updatedImage;
  },

  /**
   * Process an image with the given parameters
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
      // Define the directories to search for images
      const directories = [
        path.join(process.cwd(), 'public/uploads/blog-heroes'),
        path.join(process.cwd(), 'public/uploads/images'),
        path.join(process.cwd(), 'public/images'),
      ];

      // Try to find the image in any of the directories
      let imagePath: string | null = null;
      for (const dir of directories) {
        const potentialPath = path.join(dir, filename);
        if (fs.existsSync(potentialPath)) {
          imagePath = potentialPath;
          break;
        }
      }

      if (!imagePath) {
        return { error: 'Image not found' };
      }

      // Use server-side defaults if not provided
      const format = options.format || ImageFormat.WEBP;
      const quality = options.quality || 80;
      const size = options.size || ImageSize.MEDIUM;

      // Start with a Sharp instance
      let sharpInstance = sharp(imagePath);

      // Get original metadata
      const metadata = await sharpInstance.metadata();

      // Define dimension values for different sizes
      const dimensionMap = {
        [ImageSize.THUMBNAIL]: { width: 150, height: 150 },
        [ImageSize.MEDIUM]: { width: 400, height: 400 },
        [ImageSize.FULL]: { width: metadata.width, height: metadata.height },
      };

      // 1. Process size (resize image)
      if (size !== ImageSize.FULL) {
        const dimensions = dimensionMap[size];
        sharpInstance = sharpInstance.resize({
          width: dimensions.width,
          height: dimensions.height,
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // 2. Process format (convert image format)
      if (format !== ImageFormat.ORIGINAL) {
        switch (format) {
          case ImageFormat.WEBP:
            sharpInstance = sharpInstance.webp({
              quality,
              effort: 4, // Higher effort = better compression but slower
            });
            break;
          case ImageFormat.JPEG:
            sharpInstance = sharpInstance.jpeg({
              quality,
              mozjpeg: true, // Use mozjpeg for better compression
            });
            break;
          case ImageFormat.PNG:
            sharpInstance = sharpInstance.png({
              quality: Math.min(Math.floor(quality / 10), 9), // PNG quality is 0-9
              compressionLevel: 9, // Maximum compression
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
      if (format === ImageFormat.WEBP) {
        mimeType = 'image/webp';
      } else if (format === ImageFormat.PNG) {
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
          height: finalMetadata.height,
        },
      };
    } catch (error) {
      console.error('Error processing image:', error);
      return { error: 'Failed to process image' };
    }
  },

  /**
   * Get an image URL with the specified parameters
   */
  getImageUrl: (
    filename: string,
    size: ImageSize = ImageSize.MEDIUM,
    format: ImageFormat = ImageFormat.WEBP,
    quality = 85
  ): string => {
    const baseUrl = process.env.IMAGE_API_URL || 'http://localhost:4000/api/v1/images';
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
  },
};

/**
 * Get a URL for a hero image
 */
export const getHeroImageUrl = (filename: string): string => {
  const baseUrl = process.env.IMAGE_API_URL || 'http://localhost:4000/api/v1/images';
  return `${baseUrl}/${filename}`;
};

/**
 * Get an image URL
 */
export function getImageUrl(filename: string, size = 'medium'): string {
  const baseUrl = process.env.IMAGE_API_URL || 'http://localhost:4000/api/v1/images';
  return `${baseUrl}/${filename}?size=${size}`;
}

export default imageService;
