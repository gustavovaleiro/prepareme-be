import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';

interface LogContext {
  correlationId: string;
  module?: string;
}

export class LogContextManager {
  private static instance: LogContextManager;
  private storage: AsyncLocalStorage<LogContext>;

  private constructor() {
    this.storage = new AsyncLocalStorage<LogContext>();
  }

  static getInstance(): LogContextManager {
    if (!LogContextManager.instance) {
      LogContextManager.instance = new LogContextManager();
    }
    return LogContextManager.instance;
  }

  getContext(): LogContext | undefined {
    return this.storage.getStore();
  }

  run(context: LogContext, callback: () => void | Promise<void>): void | Promise<void> {
    return this.storage.run(context, callback);
  }

  middleware() {
    return (req: any, res: any, next: any) => {
      const correlationId = req.headers['x-correlation-id'] || randomUUID();
      this.run({ correlationId }, next);
    };
  }
}

export const logContext = LogContextManager.getInstance();