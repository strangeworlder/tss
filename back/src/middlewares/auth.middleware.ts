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
    console.log('Auth header:', authHeader); // Debug log
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid auth header found'); // Debug log
      return res.status(401).json({ 
        success: false,
        message: 'No token, authorization denied',
        details: 'Authorization header is missing or invalid'
      });
    }

    // Verify token
    const token = authHeader.split(' ')[1];
    console.log('Token found:', token ? 'yes' : 'no'); // Debug log
    
    try {
      const decoded = jwt.verify(token, JWT.SECRET) as {
        id: string;
        email: string;
        role: string;
      };
      console.log('Token decoded successfully:', decoded); // Debug log

      // Check if token is in Redis (valid session)
      const redisToken = await redisClient.get(`token:${decoded.id}`);
      console.log('Redis token check:', redisToken ? 'found' : 'not found'); // Debug log
      
      if (!redisToken || redisToken !== token) {
        return res.status(401).json({ 
          success: false,
          message: 'Token is not valid',
          details: 'Token not found in Redis or does not match'
        });
      }

      // Set user in request
      req.user = decoded;
      next();
    } catch (error) {
      console.error('Token verification error:', error); // Debug log
      return res.status(401).json({ 
        success: false,
        message: 'Token is not valid',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
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