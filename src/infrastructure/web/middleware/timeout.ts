import { Request, Response, NextFunction } from 'express';
import { TimeoutError } from '../../errors/ApplicationError';
import { createLogger } from '../../logging/Logger';

const logger = createLogger('TimeoutMiddleware');

export const timeout = (limit: number) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Flag para controlar se o timeout já ocorreu
  let timeoutOccurred = false;

  // Armazena a referência original do next
  const originalNext = next;

  // Sobrescreve o next para evitar chamadas múltiplas
  next = (err?: any) => {
    if (!timeoutOccurred) {
      timeoutOccurred = true;
      originalNext(err);
    }
  };

  const timeoutId = setTimeout(() => {
    if (!res.headersSent) {
      timeoutOccurred = true;
      logger.warn('Request timeout', {
        path: req.path,
        method: req.method,
        duration: limit
      });
      
      // Destrói a conexão para interromper operações pendentes
      if (!res.headersSent) {
        res.destroy();
      }

      // Limpa os event listeners para evitar memory leaks
      res.removeAllListeners();
      req.removeAllListeners();
      
      next(new TimeoutError(req.path));
    }
  }, limit);

  // Cleanup function
  const cleanup = () => {
    clearTimeout(timeoutId);
  };

  // Registra os listeners para cleanup
  res.once('finish', cleanup);
  res.once('close', cleanup);

  // Continua o processamento
  next();
};