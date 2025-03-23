import express from 'express';
import { imageController } from '../controllers/image.controller';

const router = express.Router();

// GET /api/images/:filename - Process and retrieve an image
router.get('/:filename', imageController.getImage);

export default router; 