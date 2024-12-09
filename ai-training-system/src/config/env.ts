import { z } from 'zod';

// Environment variable schema
const envSchema = z.object({
  // OpenAI Configuration
  OPENAI_API_KEY: z.string().min(1).startsWith('sk-'),
  OPENAI_MODEL: z.string().default('gpt-4'),
  OPENAI_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.7),
  
  // Application Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().positive().default(3000),
  
  // Database Configuration (if needed)
  DATABASE_URL: z.string().url().optional(),
  
  // Security
  JWT_SECRET: z.string().min(32).optional(),
  API_RATE_LIMIT: z.coerce.number().positive().default(100),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().positive().default(60000), // 1 minute
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().positive().default(100),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

// Process environment variables
const validateEnv = () => {
  try {
    return envSchema.parse({
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      OPENAI_MODEL: process.env.OPENAI_MODEL,
      OPENAI_TEMPERATURE: process.env.OPENAI_TEMPERATURE,
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      DATABASE_URL: process.env.DATABASE_URL,
      JWT_SECRET: process.env.JWT_SECRET,
      API_RATE_LIMIT: process.env.API_RATE_LIMIT,
      RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
      RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
      LOG_LEVEL: process.env.LOG_LEVEL,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:', JSON.stringify(error.errors, null, 2));
      process.exit(1);
    }
    throw error;
  }
};

// Export validated environment variables
export const env = validateEnv();

// Type helper
export type Env = z.infer<typeof envSchema>;

// Example usage:
// import { env } from './config/env';
// console.log(env.OPENAI_API_KEY); // Typed and validated