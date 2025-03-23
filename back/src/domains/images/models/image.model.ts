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

// Available image sizes/styles
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