import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../domains/users/models/user.model';
import { JwtPayload } from 'jsonwebtoken';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Auth middleware: Processing request');
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    console.log('Auth middleware: Token present:', !!token);

    if (!token) {
      console.log('Auth middleware: No token provided');
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; email: string; role: string };
    console.log('Auth middleware: Token decoded:', {
      id: decoded.id,
      role: decoded.role
    });

    const user = await User.findById(decoded.id);
    console.log('Auth middleware: User found:', !!user);

    if (!user) {
      console.log('Auth middleware: User not found');
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add user to request
    (req as any).user = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    };

    console.log('Auth middleware: User added to request:', {
      id: user._id,
      role: user.role
    });

    next();
  } catch (error) {
    console.error('Auth middleware: Error:', error);
    return res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
}; 