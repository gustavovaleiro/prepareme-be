import mongoose from 'mongoose';
import { env } from '../../config/env';

export const createMongooseOptions = (): mongoose.ConnectOptions => {
  const options: mongoose.ConnectOptions = {
    dbName: env.MONGODB_DB_NAME,
    autoIndex: env.NODE_ENV !== 'production',
  };

  if (env.MONGODB_USER && env.MONGODB_PASSWORD) {
    options.auth = {
      username: env.MONGODB_USER,
      password: env.MONGODB_PASSWORD,
    };
    options.authSource = env.MONGODB_AUTH_SOURCE;
  }

  return options;
};