import { Router } from 'express';
import path from 'path';

const router = Router();

// Image directory
const imagesDir = path.join(__dirname, '../../../../public/images');

/**
 * @route   GET /api/images/:filename
 * @desc    Serve images with optional resizing
 * @access  Public
 */
router.get('/:filename', (req, res) => {
  const { filename } = req.params;
  const { size = 'medium' } = req.query;
  
  // In a real app, you would resize the image based on the size parameter
  // For now, just serve the static file
  res.sendFile(path.join(imagesDir, filename), (err) => {
    if (err) {
      console.error('Error serving image:', err);
      res.status(404).json({ 
        success: false, 
        message: 'Image not found' 
      });
    }
  });
});

export default router; 