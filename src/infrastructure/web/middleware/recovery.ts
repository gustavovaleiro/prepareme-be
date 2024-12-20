import { Request, Response, NextFunction } from 'express';
import { logger } from '../../logging';

export const recoveryMiddleware = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  // Catch unhandled promise rejections
  process.on('unhandledRejection', (reason: Error) => {
    logger.error('Unhandled Promise Rejection:', reason);
    // Don't exit the process, just log it
  });

  // Catch uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', error);
    // Don't exit the process, just log it
  });

  next();
};