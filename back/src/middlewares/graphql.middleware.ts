import type { MiddlewareFn } from 'type-graphql';
import jwt from 'jsonwebtoken';
import { JWT } from '../config/config';
import { redisClient } from '../db/redis/connection';

// Auth middleware for GraphQL
export const AuthMiddleware: MiddlewareFn<any> = async ({ context }, next) => {
  try {
    const authorization = context.req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new Error('Not authenticated');
    }

    const token = authorization.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, JWT.SECRET) as {
      id: string;
      email: string;
      role: string;
    };

    // Check if token is in Redis (valid session)
    const redisToken = await redisClient.get(`token:${decoded.id}`);
    if (!redisToken || redisToken !== token) {
      throw new Error('Not authenticated');
    }

    // Set user in context
    context.user = decoded;

    return next();
  } catch (error) {
    throw new Error('Not authenticated');
  }
};
