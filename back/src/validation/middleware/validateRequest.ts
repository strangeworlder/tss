import type { Request, Response, NextFunction } from 'express';
import { type AnyZodObject, ZodError } from 'zod';

/**
 * Middleware factory for request validation using Zod schemas
 * @param schema Zod schema to validate against
 * @returns Express middleware function
 */
export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body against schema
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  };
};
