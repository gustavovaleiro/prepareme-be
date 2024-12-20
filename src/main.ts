import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { configureRoutes } from './infrastructure/web/routes';
import { errorHandler } from './infrastructure/web/middleware/errorHandler';
import { recoveryMiddleware } from './infrastructure/web/middleware/recovery';
import { setupSwagger } from './infrastructure/web/swagger';
import { DatabaseConnection } from './infrastructure/config/database';
import { container } from './infrastructure/config/di';
import { env } from './infrastructure/config/env';
import { createLogger } from './infrastructure/logging/Logger';
import { securityMiddleware } from './infrastructure/web/middleware/security';
import { logContext } from './infrastructure/logging/LogContext';

const logger = createLogger('Application');

async function bootstrap() {
  try {
    const dbConnection = DatabaseConnection.getInstance();
    await dbConnection.connect();

    const app = express();

    // Logging context middleware
    app.use(logContext.middleware());

    // Global error recovery
    app.use(recoveryMiddleware);

    // Security middleware
    app.use(cors());
    app.use(helmet({
      contentSecurityPolicy: false
    }));
    app.use(securityMiddleware);
    app.use(express.json());

    // Setup Swagger
    setupSwagger(app);

    // Configure routes
    configureRoutes(app);

    // Error handling - must be last
    app.use(errorHandler);

    app.listen(env.PORT, () => {
      logger.info(`Server is running on port ${env.PORT}`);
    });

    process.on('SIGTERM', async () => {
      logger.info('SIGTERM signal received. Closing HTTP server...');
      await dbConnection.disconnect();
      process.exit(0);
    });

  } catch (error) {
    logger.error('Application failed to start', error instanceof Error ? error : new Error('Unknown error'));
    process.exit(1);
  }
}

bootstrap();