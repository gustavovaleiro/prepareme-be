import { logger as winstonLogger } from './LoggerConfig';
import { logContext } from './LogContext';

class Logger {
  private module?: string;

  constructor(module?: string) {
    this.module = module;
  }

  private getMetadata() {
    const context = logContext.getContext();
    return {
      correlationId: context?.correlationId,
      module: this.module
    };
  }

  error(message: string, error?: Error, metadata: object = {}) {
    winstonLogger.error(message, {
      ...this.getMetadata(),
      ...metadata,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : undefined
    });
  }

  warn(message: string, metadata: object = {}) {
    winstonLogger.warn(message, {
      ...this.getMetadata(),
      ...metadata
    });
  }

  info(message: string, metadata: object = {}) {
    winstonLogger.info(message, {
      ...this.getMetadata(),
      ...metadata
    });
  }

  http(message: string, metadata: object = {}) {
    winstonLogger.http(message, {
      ...this.getMetadata(),
      ...metadata
    });
  }

  debug(message: string, metadata: object = {}) {
    winstonLogger.debug(message, {
      ...this.getMetadata(),
      ...metadata
    });
  }
}

export const createLogger = (module?: string) => new Logger(module);