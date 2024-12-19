import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { configureRoutes } from './infrastructure/web/routes';
import { errorHandler } from './infrastructure/web/middleware/errorHandler';
import { setupSwagger } from './infrastructure/web/swagger';
import { setupLogger } from './infrastructure/logging';
import { connectDatabase } from './infrastructure/config/database';
import { container } from './infrastructure/config/di';

async function bootstrap() {
  const app = express();
  const logger = setupLogger();

  // Middleware
  app.use(cors());
  app.use(helmet());
  app.use(express.json());

  // Setup Swagger
  setupSwagger(app);

  // Configure routes
  configureRoutes(app);

  // Error handling
  app.use(errorHandler);

  // Database connection
  await connectDatabase();

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Application failed to start:', error);
  process.exit(1);
});