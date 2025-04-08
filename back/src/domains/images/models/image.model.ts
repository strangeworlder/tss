export interface Image {
  id: string;
  filename: string;
  originalFilename: string;
  path: string;
  url: string;
  size: number;
  width: number;
  height: number;
  mimeType: string;
  altText: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    [key: string]: any;
  };
}

// Available image sizes
export enum ImageSize {
  THUMBNAIL = 'thumbnail',
  MEDIUM = 'medium',
  FULL = 'full',
  HERO = 'hero',
}

// Available image formats
export enum ImageFormat {
  ORIGINAL = 'original',
  WEBP = 'webp',
  JPEG = 'jpeg',
  PNG = 'png',
}

// Image processing options
export interface ImageProcessingOptions {
  size?: ImageSize;
  format?: ImageFormat;
  quality?: number;
}

// Image processing result
export interface ImageProcessingResult {
  imageBuffer?: Buffer;
  metadata?: {
    mimeType: string;
    filename: string;
    width?: number;
    height?: number;
  };
  error?: string;
}
