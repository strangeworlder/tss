import { Router, type Request, type Response } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { ImageSize, ImageFormat } from '../models/image.model';

const router = Router();

// Image directories
const imagesDir = path.join(__dirname, '../../../../public/images');
const uploadsDir = path.join(__dirname, '../../../../public/uploads/images');
const blogHeroesDir = path.join(__dirname, '../../../../public/uploads/blog-heroes');

/**
 * Helper function to set CORS headers for images
 */
function setCorsHeaders(res: Response) {
  // Allow specific origins rather than using wildcard
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
  ];
  const origin = allowedOrigins.includes(String(res.req.headers.origin))
    ? String(res.req.headers.origin)
    : allowedOrigins[0];

  res.set('Access-Control-Allow-Origin', origin);
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  res.set('Cross-Origin-Embedder-Policy', 'credentialless');
}

/**
 * @route   GET /api/v1/images/:filename
 * @desc    Serve images with optional resizing
 * @access  Public
 */
router.get('/:filename', (req: Request, res: Response) => {
  const { filename } = req.params;
  const { size = 'medium', format = 'webp' } = req.query;

  // Set CORS headers for all responses
  setCorsHeaders(res);

  // Log request info
  console.log(`Image request: ${filename} from origin: ${req.headers.origin}`);

  // Try to find the image in blog heroes directory first
  const blogHeroPath = path.join(blogHeroesDir, filename);
  if (fs.existsSync(blogHeroPath)) {
    // Set additional headers for content type
    if (filename.endsWith('.webp')) {
      res.set('Content-Type', 'image/webp');
    } else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
      res.set('Content-Type', 'image/jpeg');
    } else if (filename.endsWith('.png')) {
      res.set('Content-Type', 'image/png');
    }

    return res.sendFile(blogHeroPath, (err) => {
      if (err) {
        console.error('Error serving image from blog heroes:', err);
        return res.status(404).json({
          success: false,
          message: 'Image not found in blog heroes directory',
        });
      }
    });
  }

  // Try to find the image in uploads directory
  const uploadPath = path.join(uploadsDir, filename);
  if (fs.existsSync(uploadPath)) {
    // Set additional headers for content type
    if (filename.endsWith('.webp')) {
      res.set('Content-Type', 'image/webp');
    } else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
      res.set('Content-Type', 'image/jpeg');
    } else if (filename.endsWith('.png')) {
      res.set('Content-Type', 'image/png');
    }

    return res.sendFile(uploadPath, (err) => {
      if (err) {
        console.error('Error serving image from uploads:', err);
        return res.status(404).json({
          success: false,
          message: 'Image not found in uploads directory',
        });
      }
    });
  }

  // If not in uploads, try the regular images directory
  const imagePath = path.join(imagesDir, filename);
  if (fs.existsSync(imagePath)) {
    // Set additional headers for content type
    if (filename.endsWith('.webp')) {
      res.set('Content-Type', 'image/webp');
    } else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
      res.set('Content-Type', 'image/jpeg');
    } else if (filename.endsWith('.png')) {
      res.set('Content-Type', 'image/png');
    }

    return res.sendFile(imagePath, (err) => {
      if (err) {
        console.error('Error serving image:', err);
        return res.status(404).json({
          success: false,
          message: 'Image not found in images directory',
        });
      }
    });
  }

  // If image doesn't exist in any location, send an error
  console.error(`Image not found: ${filename}`);
  console.log(`Looked in: ${blogHeroPath} and ${uploadPath} and ${imagePath}`);

  return res.status(404).json({
    success: false,
    message: 'Image not found',
  });
});

// Handle OPTIONS requests for CORS preflight
router.options('/:filename', (req: Request, res: Response) => {
  setCorsHeaders(res);
  res.status(204).end();
});

export default router;
