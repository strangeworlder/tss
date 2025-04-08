import { Router, type Request, type Response } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { ImageSize, ImageFormat } from '../models/image.model';
import imageService from '../services/image.service';

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
router.get('/:filename', async (req: Request, res: Response) => {
  const { filename } = req.params;
  const size = (req.query.size as ImageSize) || ImageSize.MEDIUM;
  const format = (req.query.format as ImageFormat) || ImageFormat.WEBP;
  const quality = req.query.quality ? Number.parseInt(req.query.quality as string) : 80;

  // Set CORS headers for all responses
  setCorsHeaders(res);

  try {
    // Process the image with requested parameters
    const result = await imageService.processImage(filename, {
      size,
      format,
      quality,
    });

    if (!result.imageBuffer || !result.metadata) {
      console.error(`Image not found: ${filename}`);
      return res.status(404).json({
        success: false,
        message: result.error || 'Image not found',
      });
    }

    // Set appropriate content type based on format
    res.set('Content-Type', result.metadata.mimeType);

    // Set cache control headers (1 day by default)
    res.set('Cache-Control', 'public, max-age=86400');

    // Send the processed image
    res.status(200).send(result.imageBuffer);
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process image',
    });
  }
});

// Handle OPTIONS requests for CORS preflight
router.options('/:filename', (req: Request, res: Response) => {
  setCorsHeaders(res);
  res.status(204).end();
});

export default router;
