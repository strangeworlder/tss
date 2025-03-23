import { Router } from 'express';
import { register, login, logout, registerValidation, loginValidation } from '../controllers/auth.controller';
import { authenticate } from '../../../middlewares/auth.middleware';

const router = Router();

// Auth routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', authenticate, logout);

export default router; 