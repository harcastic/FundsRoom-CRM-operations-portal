import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly errors?: any;

  constructor(message: string, statusCode: number = 400, errorCode: string = 'BAD_REQUEST', errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export function sendSuccess<T>(
  res: Response,
  data?: T,
  message: string = 'Success',
  statusCode: number = 200,
  pagination?: PaginationMeta
) {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined && { data }),
    ...(pagination && { pagination }),
  });
}

export function sendError(
  res: Response,
  message: string,
  statusCode: number = 400,
  errorCode: string = 'BAD_REQUEST',
  errors?: any
) {
  return res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    ...(errors && { errors }),
  });
}
