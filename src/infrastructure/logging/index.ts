import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env';
import { consoleFormat, fileFormat } from './formats';

// Create logs directory if logging to files
const ensureLogDirectory = () => {
  if (env.LOG_TO_FILE && !fs.existsSync(env.LOG_DIR)) {
    fs.mkdirSync(env.LOG_DIR, { recursive: true });
  }
};

// Configure transports based on environment
const getTransports = (): winston.transport[] => {
  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: consoleFormat
    })
  ];

  if (env.LOG_TO_FILE) {
    transports.push(
      new winston.transports.File({
        filename: path.join(env.LOG_DIR, 'error.log'),
        level: 'error',
        format: fileFormat
      }),
      new winston.transports.File({
        filename: path.join(env.LOG_DIR, 'combined.log'),
        format: fileFormat
      })
    );
  }

  return transports;
};

// Create logger instance
export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  levels: winston.config.npm.levels,
  transports: getTransports(),
  // Exit on error: false to prevent process exit on logging errors
  exitOnError: false
});

// Add request context
export const addRequestContext = (req: any) => ({
  requestId: req.id,
  method: req.method,
  path: req.path,
  ip: req.ip
});

// Helper methods for structured logging
export const logInfo = (message: string, metadata: object = {}) => {
  logger.info(message, { metadata });
};

export const logWarning = (message: string, metadata: object = {}) => {
  logger.warn(message, { metadata });
};

export const logError = (message: string, error: Error, metadata: object = {}) => {
  logger.error(message, {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    ...metadata
  });
};

export const setupLogger = () => {
  ensureLogDirectory();
  
  logInfo('Logger initialized', {
    environment: env.NODE_ENV,
    logLevel: env.LOG_LEVEL,
    logFormat: env.LOG_FORMAT,
    logToFile: env.LOG_TO_FILE
  });

  return logger;
};