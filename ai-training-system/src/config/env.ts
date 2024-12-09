import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

// Custom validators
const isValidOpenAIKey = (key: string) => {
    return key.startsWith('sk-') && key.length > 20;
};

const isValidPort = (port: number) => {
    return port >= 1024 && port <= 65535;
};

// Environment variable schema
const envSchema = z.object({
    // OpenAI Configuration
    OPENAI_API_KEY: z.string()
        .min(1, 'OpenAI API key is required')
        .refine(isValidOpenAIKey, 'Invalid OpenAI API key format'),
    
    // Environment
    NODE_ENV: z.enum(['development', 'test', 'production'])
        .default('development'),
    
    // API Configuration
    MAX_REQUESTS_PER_MINUTE: z.coerce.number()
        .positive('Must be a positive number')
        .max(1000, 'Rate limit cannot exceed 1000 requests per minute')
        .default(60),
    
    PORT: z.coerce.number()
        .refine(isValidPort, 'Port must be between 1024 and 65535')
        .default(3000),
    
    // Model Configuration
    DEFAULT_MODEL: z.string()
        .refine(
            model => ['gpt-4', 'gpt-3.5-turbo'].includes(model),
            'Model must be either gpt-4 or gpt-3.5-turbo'
        )
        .default('gpt-4'),
    
    FALLBACK_MODEL: z.string()
        .refine(
            model => ['gpt-4', 'gpt-3.5-turbo'].includes(model),
            'Fallback model must be either gpt-4 or gpt-3.5-turbo'
        )
        .default('gpt-3.5-turbo'),
    
    MODEL_TEMPERATURE: z.coerce.number()
        .min(0, 'Temperature must be between 0 and 2')
        .max(2, 'Temperature must be between 0 and 2')
        .default(0.7),
    
    MAX_TOKENS: z.coerce.number()
        .positive('Must be a positive number')
        .max(4096, 'Cannot exceed model maximum token limit')
        .default(2048),
    
    // Logging
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error'])
        .default('info'),
    
    LOG_FORMAT: z.enum(['json', 'text'])
        .default('text'),
    
    // Security
    ENABLE_RATE_LIMITING: z.union([
        z.boolean(),
        z.string().transform(str => str.toLowerCase() === 'true')
    ]).default(true),
    
    CORS_ORIGINS: z.string()
        .transform(str => str.split(','))
        .pipe(z.array(z.string().url('Invalid URL in CORS origins')))
        .default('http://localhost:3000')
        .transform(val => Array.isArray(val) ? val : [val]),
    
    // Cache Configuration
    CACHE_TTL: z.coerce.number()
        .positive('Must be a positive number')
        .max(86400, 'Cache TTL cannot exceed 24 hours')
        .default(3600),
    
    ENABLE_CACHE: z.union([
        z.boolean(),
        z.string().transform(str => str.toLowerCase() === 'true')
    ]).default(true),
});

// Parse and validate environment variables
const env = envSchema.parse(process.env);

// Export validated environment variables
export default env;

// Export schema for testing
export { envSchema }; 