import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, sendError } from '../utils/response';
import { env } from '../config/env';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(`[Error] ${req.method} ${req.path}:`, err);

  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.errorCode, err.errors);
  }

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(
      res,
      'Validation error',
      400,
      'VALIDATION_ERROR',
      formattedErrors
    );
  }

  // Fallback for syntax errors or unexpected errors
  const message = env.NODE_ENV === 'production' ? 'Internal server error' : err.message || 'Internal server error';
  return sendError(res, message, 500, 'INTERNAL_SERVER_ERROR');
}
