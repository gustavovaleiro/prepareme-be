import { config } from 'dotenv';
import { z } from 'zod';
import { logger } from '../logging';

config();

const LogLevelEnum = z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']);
type LogLevel = z.infer<typeof LogLevelEnum>;

const envSchema = z.object({
  // MongoDB
  MONGODB_URI: z.string().default('mongodb://localhost:27017'),
  MONGODB_DB_NAME: z.string().default('interview_prep'),
  MONGODB_USER: z.string().optional(),
  MONGODB_PASSWORD: z.string().optional(),
  MONGODB_AUTH_SOURCE: z.string().default('admin'),
  
  // OpenAI
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4'),
  OPENAI_MAX_TOKENS: z.coerce.number().int().positive().default(2048),
  
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  
  // Logging
  LOG_LEVEL: LogLevelEnum.default('info'),
  LOG_FORMAT: z.enum(['json', 'simple']).default('simple'),
  LOG_TO_FILE: z.boolean().default(false),
  LOG_DIR: z.string().default('logs'),
});

const parseEnvVariables = () => {
  try {
    return envSchema.parse({
      MONGODB_URI: process.env.MONGODB_URI,
      MONGODB_DB_NAME: process.env.MONGODB_DB_NAME,
      MONGODB_USER: process.env.MONGODB_USER,
      MONGODB_PASSWORD: process.env.MONGODB_PASSWORD,
      MONGODB_AUTH_SOURCE: process.env.MONGODB_AUTH_SOURCE,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      OPENAI_MODEL: process.env.OPENAI_MODEL,
      OPENAI_MAX_TOKENS: process.env.OPENAI_MAX_TOKENS,
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      LOG_LEVEL: process.env.LOG_LEVEL,
      LOG_FORMAT: process.env.LOG_FORMAT,
      LOG_TO_FILE: process.env.LOG_TO_FILE === 'true',
      LOG_DIR: process.env.LOG_DIR,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map(issue => issue.path.join('.'));
      console.error(`Missing or invalid environment variables: ${missingVars.join(', ')}`);
    }
    throw error;
  }
};

export const env = parseEnvVariables();