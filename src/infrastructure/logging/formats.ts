import winston from 'winston';
import { env } from '../config/env';

// Custom format for detailed info
const detailedFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  const metaStr = Object.keys(metadata).length 
    ? `\n${JSON.stringify(metadata, null, 2)}`
    : '';
    
  return `${timestamp} [${level.toUpperCase()}] ${message}${metaStr}`;
});

// Console format with colors and details
export const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
  detailedFormat
);

// File format in JSON for better parsing
export const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
  winston.format.json()
);