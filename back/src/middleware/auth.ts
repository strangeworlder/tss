import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../domains/users/models/user.model';
import { AuthUser } from '../types/express';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Auth middleware: Processing request');
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    console.log('Auth middleware: Token present:', !!token);

    if (!token) {
      console.log('Auth middleware: No token provided');
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('Auth middleware: JWT_SECRET not set in environment');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error',
      });
    }

    const decoded = jwt.verify(token, jwtSecret) as { id: string; email: string; role: string };
    console.log('Auth middleware: Token decoded:', {
      id: decoded.id,
      role: decoded.role,
    });

    const user = await User.findById(decoded.id);
    console.log('Auth middleware: User found:', !!user);

    if (!user) {
      console.log('Auth middleware: User not found');
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Add user to request using the AuthUser type
    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    console.log('Auth middleware: User added to request:', {
      id: user._id,
      role: user.role,
    });

    next();
  } catch (error) {
    console.error('Auth middleware: Error:', error);
    return res.status(401).json({
      success: false,
      message: 'Token is not valid',
    });
  }
};

export const isAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (req.user.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden: Admin access required' });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const authMiddleware = {
  isAdmin,
};
