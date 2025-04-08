import type { Request, Response } from 'express';
import { ImageSize, ImageFormat } from '../models/image.model';
import imageService from '../services/image.service';

/**
 * Image controller for handling REST API requests
 */
export const imageController = {
  /**
   * Get and process an image
   */
  getImage: async (req: Request, res: Response): Promise<void> => {
    try {
      const { filename } = req.params;
      const size = (req.query.size as ImageSize) || ImageSize.FULL;
      const format = (req.query.format as ImageFormat) || ImageFormat.WEBP;
      const quality = req.query.quality ? Number.parseInt(req.query.quality as string) : 80;

      // Process the image with requested parameters
      const result = await imageService.processImage(filename, {
        size,
        format,
        quality,
      });

      if (!result.imageBuffer || !result.metadata) {
        res.status(404).json({ error: result.error || 'Image not found' });
        return;
      }

      // Set appropriate content type based on format
      const contentType = result.metadata.mimeType as string;
      res.contentType(contentType);

      // Set cache control headers (1 day by default)
      res.setHeader('Cache-Control', 'public, max-age=86400');

      // Send the processed image
      res.status(200).send(result.imageBuffer);
    } catch (error) {
      console.error('Error processing image:', error);
      res.status(500).json({ error: 'Failed to process image' });
    }
  },
};
