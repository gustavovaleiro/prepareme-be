import { Request, Response, NextFunction } from 'express';
import { ApplicationError, ExternalServiceError, TimeoutError } from '../../errors/ApplicationError';
import { ZodError } from 'zod';
import { MongooseError } from 'mongoose';
import { createLogger } from '../../logging/Logger';

const logger = createLogger('ErrorHandler');

interface ErrorResponse {
  status: string;
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
  path: string;
  correlationId?: string;
  requestId?: string;
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Se os headers já foram enviados, não podemos enviar outro erro
  if (res.headersSent) {
    logger.error('Headers already sent', err);
    return next(err);
  }

  const response: ErrorResponse = {
    status: 'error',
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
    timestamp: new Date().toISOString(),
    path: req.path,
    correlationId: req.headers['x-correlation-id'] as string,
    requestId: req.headers['x-request-id'] as string
  };

  // Tratamento específico para cada tipo de erro
  if (err instanceof ApplicationError) {
    response.code = err.code;
    response.message = err.message;
    response.details = err.details;
    
    if (err instanceof TimeoutError) {
      logger.error('Request timeout occurred', err, {
        path: req.path,
        method: req.method
      });
    } else if (err instanceof ExternalServiceError) {
      logger.error('External service error', err, {
        service: err.details
      });
    } else if (err.statusCode >= 500) {
      logger.error('Application error occurred', err);
    } else {
      logger.warn('Application error occurred', {
        code: err.code,
        message: err.message
      });
    }
    
    return res.status(err.statusCode).json(response);
  }

  if (err instanceof ZodError) {
    response.code = 'VALIDATION_ERROR';
    response.message = 'Validation error';
    response.details = err.errors;
    
    logger.warn('Validation error occurred', {
      errors: err.errors
    });
    
    return res.status(400).json(response);
  }

  if (err instanceof MongooseError) {
    response.code = 'DATABASE_ERROR';
    response.message = 'Database operation failed';
    
    logger.error('Database error occurred', err);
    
    return res.status(500).json(response);
  }

  // Log de erros não tratados
  logger.error('Unhandled error occurred', err);
  
  // Garante que a conexão seja fechada
  res.status(500).json(response);
};