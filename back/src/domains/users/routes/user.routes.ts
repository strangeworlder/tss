import { Router } from 'express';
import { authenticate } from '../../../middlewares/auth.middleware';
import upload from '../../../config/multer';
import { updateProfile, updateAvatar, getUsers } from '../controllers/user.controller';

const router = Router();

// Protected routes - require authentication
router.use(authenticate);

// Get all users
router.get('/', getUsers);

// Update user profile
router.put('/profile', updateProfile);

// Update user avatar
router.post('/avatar', upload.single('avatar'), updateAvatar);

export default router; 