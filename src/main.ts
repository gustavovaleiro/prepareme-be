import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { configureRoutes } from './infrastructure/web/routes';
import { errorHandler } from './infrastructure/web/middleware/errorHandler';
import { recoveryMiddleware } from './infrastructure/web/middleware/recovery';
import { setupSwagger } from './infrastructure/web/swagger';
import { setupLogger } from './infrastructure/logging';
import { DatabaseConnection } from './infrastructure/config/database';
import { container } from './infrastructure/config/di';
import { env } from './infrastructure/config/env';
import { logger } from './infrastructure/logging';
import { securityMiddleware } from './infrastructure/web/middleware/security';

async function bootstrap() {
  try {
    setupLogger();
    
    const dbConnection = DatabaseConnection.getInstance();
    await dbConnection.connect();

    const app = express();

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
    logger.error('Application failed to start:', error);
    process.exit(1);
  }
}

bootstrap();