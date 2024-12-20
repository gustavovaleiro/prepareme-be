import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../logging';

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected = false;

  private constructor() {}

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      const options: mongoose.ConnectOptions = {
        dbName: env.MONGODB_DB_NAME,
        autoIndex: env.NODE_ENV !== 'production',
      };

      // Add authentication if credentials are provided
      if (env.MONGODB_USER && env.MONGODB_PASSWORD) {
        options.auth = {
          username: env.MONGODB_USER,
          password: env.MONGODB_PASSWORD,
        };
        options.authSource = env.MONGODB_AUTH_SOURCE;
      }

      await mongoose.connect(env.MONGODB_URI, options);
      this.isConnected = true;
      logger.info('Connected to MongoDB');
    } catch (error) {
      logger.error('MongoDB connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('Disconnected from MongoDB');
    } catch (error) {
      logger.error('MongoDB disconnection error:', error);
      throw error;
    }
  }
}