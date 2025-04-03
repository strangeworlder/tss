import { Request, Response } from 'express';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import User, { IUser, UserDocument } from '../../users/models/user.model';
import { JWT } from '../../../config/config';
import { redisClient } from '../../../db/redis/connection';
import { UserRole } from '../../users/models/user.model';

// Validation rules
export const registerValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    console.log('Register request body:', req.body);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, bio } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create and save new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      bio,
      role: UserRole.USER
    });

    const savedUser = await user.save() as UserDocument;
    console.log('User saved successfully:', savedUser._id);

    // Generate JWT token
    const token = jwt.sign(
      { id: savedUser._id.toString(), email: savedUser.email, role: savedUser.role },
      JWT.SECRET as Secret,
      { expiresIn: JWT.EXPIRY } as SignOptions
    );

    // Store token in Redis for session management
    try {
      await redisClient.set(`token:${savedUser._id.toString()}`, token, {
        EX: 60 * 60 * 24, // 24 hours (in seconds)
      });
      console.log('Token stored in Redis for user:', savedUser._id);
    } catch (redisError) {
      console.error('Redis error during registration:', redisError);
      // Continue with registration even if Redis fails
    }

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: savedUser._id.toString(),
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role,
        bio: savedUser.bio,
        avatar: savedUser.avatar
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ 
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    console.log('Login attempt for email:', req.body.email);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    const foundUser = await User.findOne({ email }) as UserDocument;
    if (!foundUser) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password is correct
    const isMatch = await foundUser.comparePassword(password);
    if (!isMatch) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('User authenticated successfully:', foundUser._id);

    // Generate JWT token
    const token = jwt.sign(
      { id: foundUser._id.toString(), email: foundUser.email, role: foundUser.role },
      JWT.SECRET as Secret,
      { expiresIn: JWT.EXPIRY } as SignOptions
    );

    console.log('JWT token generated for user:', foundUser._id);

    try {
      // Store token in Redis for session management
      await redisClient.set(`token:${foundUser._id.toString()}`, token, {
        EX: 60 * 60 * 24, // 24 hours (in seconds)
      });
      console.log('Token stored in Redis for user:', foundUser._id);
    } catch (redisError) {
      console.error('Redis error during login:', redisError);
      // Continue with the login even if Redis fails
    }

    const response = {
      message: 'Login successful',
      token,
      user: {
        id: foundUser._id.toString(),
        email: foundUser.email,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        role: foundUser.role,
        bio: foundUser.bio,
        avatar: foundUser.avatar
      }
    };

    console.log('Sending successful login response for user:', foundUser._id);
    return res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Logout user
export const logout = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (userId) {
      try {
        // Remove token from Redis
        await redisClient.del(`token:${userId}`);
      } catch (redisError) {
        console.error('Redis error during logout:', redisError);
        // Continue with the logout even if Redis fails
      }
    }

    return res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findById(userId) as UserDocument;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        bio: user.bio,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
  registerValidation,
  loginValidation,
}; 