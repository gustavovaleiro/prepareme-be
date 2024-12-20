import winston from 'winston';
import { Format } from 'logform';

// Cores para diferentes níveis de log
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Formato personalizado para logs
const customFormat = (colorize = true): Format => {
  return winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.errors({ stack: true }),
    colorize ? winston.format.colorize({ all: true }) : winston.format.uncolorize(),
    winston.format.printf(({ timestamp, level, message, correlationId, module, ...metadata }) => {
      let msg = `${timestamp} [${level}]`;
      
      // Adiciona correlationId se disponível
      if (correlationId) {
        msg += ` [${correlationId}]`;
      }

      // Adiciona módulo se disponível
      if (module) {
        msg += ` [${module}]`;
      }

      msg += `: ${message}`;

      // Adiciona metadata se houver
      if (Object.keys(metadata).length > 0) {
        msg += `\n${JSON.stringify(metadata, null, 2)}`;
      }

      return msg;
    })
  );
};

// Configuração do logger
const createLogger = () => {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels,
    transports: [
      // Console transport
      new winston.transports.Console({
        format: customFormat(true)
      }),
      // Arquivo para todos os logs
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: customFormat(false)
      }),
      // Arquivo separado para erros
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: customFormat(false)
      })
    ]
  });
};

export const logger = createLogger();