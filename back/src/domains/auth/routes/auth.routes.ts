import { Router, type RequestHandler } from 'express';
import {
  register,
  login,
  logout,
  getCurrentUser,
  registerValidation,
  loginValidation,
} from '../controllers/auth.controller';
import { authenticate } from '../../../middlewares/auth.middleware';

const router = Router();

// Auth routes
router.post('/register', registerValidation, register as RequestHandler);
router.post('/login', loginValidation, login as RequestHandler);
router.post('/logout', authenticate as RequestHandler, logout as RequestHandler);
router.get('/me', authenticate as RequestHandler, getCurrentUser as RequestHandler);

export default router;
