import { Request, Response, NextFunction } from 'express';
import { logger } from '../../logging';
import { ZodError } from 'zod';
import { MongooseError } from 'mongoose';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Handle known error types
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation error',
      errors: err.errors
    });
  }

  if (err instanceof MongooseError) {
    return res.status(500).json({
      status: 'error',
      message: 'Database error'
    });
  }

  // Handle unknown errors without exposing details
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};