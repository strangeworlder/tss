import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT } from '../config/config';
import { redisClient } from '../db/redis/connection';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

// Middleware to verify JWT token
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT.SECRET) as {
        id: string;
        email: string;
        role: string;
      };

      // Check if token is in Redis (valid session)
      const redisToken = await redisClient.get(`token:${decoded.id}`);
      if (!redisToken || redisToken !== token) {
        return res.status(401).json({ message: 'Token is not valid' });
      }

      // Set user in request
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Middleware to verify admin role
export const authorizeAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  next();
};

export default {
  authenticate,
  authorizeAdmin,
}; 