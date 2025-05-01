import type { Request, Response, NextFunction } from 'express';
import { type AnyZodObject, ZodError } from 'zod';
import { CustomError } from '../utils/errors';

/**
 * Formats a Zod validation error into a more user-friendly format
 * @param error Zod validation error
 * @returns Formatted error object
 */
export function formatZodError(error: ZodError) {
  return error.errors.map((err) => ({
    path: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));
}

/**
 * Logs validation errors to the console with more detail
 * @param context Additional context information
 * @param error Zod validation error
 */
export function logValidationError(context: string, error: ZodError) {
  console.error(`Validation error in ${context}:`, error.errors);
}

/**
 * Creates a validation middleware using a Zod schema
 * @param schema - The Zod schema to validate against
 * @param errorStatusCode - The HTTP status code to return on validation failure (default: 400)
 * @returns Express middleware function
 */
export const validate = (schema: AnyZodObject, errorStatusCode = 400) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the request data being validated
      console.log(`${req.method} route hit:`, {
        method: req.method,
        path: req.path,
        params: req.params,
        query: req.query,
        body: req.body,
        headers: {
          authorization: req.headers.authorization ? 'Bearer [token]' : 'Missing',
          'content-type': req.headers['content-type'],
        },
      });

      // Validate request body, query, and params against the schema
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format and log Zod validation errors
        const formattedErrors = formatZodError(error);
        logValidationError('request', error);

        return res.status(errorStatusCode).json({
          success: false,
          message: 'Validation failed',
          errors: formattedErrors,
        });
      }

      // Handle other errors
      return next(error);
    }
  };
};

/**
 * Creates a response validation middleware using a Zod schema
 * @param schema - The Zod schema to validate against
 * @returns Express middleware function
 */
export const validateResponse = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    res.json = function (data) {
      try {
        // Validate the response data
        const result = schema.safeParse(data);

        if (!result.success) {
          // Log detailed validation errors
          console.error('Response validation failed with errors:');

          for (const err of result.error.errors) {
            console.error(`Path: ${err.path.join('.')}`);
            console.error(`Code: ${err.code}`);
            console.error(`Message: ${err.message}`);
            if (err.validation) {
              console.error('Validation details:', err.validation);
            }
            console.error('---');
          }

          // Create a detailed error with context
          throw new CustomError('Response validation failed', 500, 'RESPONSE_VALIDATION_ERROR', {
            validationErrors: result.error.errors,
            endpoint: req.originalUrl,
            method: req.method,
            responseDataType: typeof data,
            responseStructure: Object.keys(data || {}),
          });
        }

        return originalJson.call(this, data);
      } catch (error) {
        if (error instanceof ZodError) {
          // Log the validation errors and include details
          console.error('Response validation failed:', error.errors);

          // Create a detailed error with context
          throw new CustomError('Response validation failed', 500, 'RESPONSE_VALIDATION_ERROR', {
            validationErrors: error.errors,
          });
        }
        throw error;
      }
    };
    next();
  };
};

export function validateRequest(schema: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        const errors = result.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        throw new CustomError('Validation failed', 400, 'VALIDATION_ERROR', { errors });
      }
      req.body = result.data;
      next();
    } catch (error) {
      if (error instanceof CustomError) {
        next(error);
      } else if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        next(new CustomError('Validation failed', 400, 'VALIDATION_ERROR', { errors }));
      } else {
        next(error);
      }
    }
  };
}
