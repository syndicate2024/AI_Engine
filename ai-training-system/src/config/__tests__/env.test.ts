import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { envSchema } from '../env';
import type { z } from 'zod';

// Mock the env module
vi.mock('../env', async () => {
    const actual = await vi.importActual<{ envSchema: z.ZodSchema }>('../env');
    return {
        ...actual,
        envSchema: actual.envSchema
    };
});

describe('Environment Configuration', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        // Reset process.env before each test
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        // Restore process.env after each test
        process.env = originalEnv;
    });

    describe('OpenAI Configuration', () => {
        it('should validate a valid OpenAI API key', () => {
            const env = {
                OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop'
            };

            const result = envSchema.safeParse(env);
            expect(result.success).toBe(true);
        });

        it('should reject an invalid OpenAI API key', () => {
            const env = {
                OPENAI_API_KEY: 'invalid-key'
            };

            const result = envSchema.safeParse(env);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('Invalid OpenAI API key format');
            }
        });
    });

    describe('Environment Settings', () => {
        it('should accept valid NODE_ENV values', () => {
            const validEnvs = ['development', 'test', 'production'];
            
            validEnvs.forEach(env => {
                const result = envSchema.safeParse({ 
                    OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop',
                    NODE_ENV: env 
                });
                expect(result.success).toBe(true);
            });
        });

        it('should reject invalid NODE_ENV values', () => {
            const result = envSchema.safeParse({ 
                OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop',
                NODE_ENV: 'staging' 
            });
            expect(result.success).toBe(false);
        });

        it('should validate port numbers', () => {
            const validPorts = [3000, 8080, 1024, 65535];
            const invalidPorts = [80, 443, 65536, -1, 0];

            validPorts.forEach(port => {
                const result = envSchema.safeParse({ 
                    OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop',
                    PORT: port 
                });
                expect(result.success).toBe(true);
            });

            invalidPorts.forEach(port => {
                const result = envSchema.safeParse({ 
                    OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop',
                    PORT: port 
                });
                expect(result.success).toBe(false);
            });
        });
    });

    describe('API Configuration', () => {
        it('should validate rate limiting settings', () => {
            const validConfig = {
                OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop',
                MAX_REQUESTS_PER_MINUTE: 60,
                ENABLE_RATE_LIMITING: true
            };

            const result = envSchema.safeParse(validConfig);
            expect(result.success).toBe(true);
        });

        it('should reject invalid rate limits', () => {
            const invalidConfig = {
                OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop',
                MAX_REQUESTS_PER_MINUTE: 1001
            };

            const result = envSchema.safeParse(invalidConfig);
            expect(result.success).toBe(false);
        });
    });

    describe('Model Configuration', () => {
        it('should validate model names', () => {
            const validModels = ['gpt-4', 'gpt-3.5-turbo'];
            const invalidModels = ['gpt-5', 'invalid-model'];

            validModels.forEach(model => {
                const result = envSchema.safeParse({ 
                    OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop',
                    DEFAULT_MODEL: model 
                });
                expect(result.success).toBe(true);
            });

            invalidModels.forEach(model => {
                const result = envSchema.safeParse({ 
                    OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop',
                    DEFAULT_MODEL: model 
                });
                expect(result.success).toBe(false);
            });
        });

        it('should validate temperature range', () => {
            const validTemps = [0, 0.7, 1, 2];
            const invalidTemps = [-1, 2.1, 3];

            validTemps.forEach(temp => {
                const result = envSchema.safeParse({ 
                    OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop',
                    MODEL_TEMPERATURE: temp 
                });
                expect(result.success).toBe(true);
            });

            invalidTemps.forEach(temp => {
                const result = envSchema.safeParse({ 
                    OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop',
                    MODEL_TEMPERATURE: temp 
                });
                expect(result.success).toBe(false);
            });
        });

        it('should validate max tokens', () => {
            const validTokens = [100, 2048, 4096];
            const invalidTokens = [0, -1, 4097];

            validTokens.forEach(tokens => {
                const result = envSchema.safeParse({ 
                    OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop',
                    MAX_TOKENS: tokens 
                });
                expect(result.success).toBe(true);
            });

            invalidTokens.forEach(tokens => {
                const result = envSchema.safeParse({ 
                    OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop',
                    MAX_TOKENS: tokens 
                });
                expect(result.success).toBe(false);
            });
        });
    });

    describe('Logging Configuration', () => {
        it('should validate log levels', () => {
            const validLevels = ['debug', 'info', 'warn', 'error'];
            const invalidLevels = ['trace', 'fatal'];

            validLevels.forEach(level => {
                const result = envSchema.safeParse({ 
                    OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop',
                    LOG_LEVEL: level 
                });
                expect(result.success).toBe(true);
            });

            invalidLevels.forEach(level => {
                const result = envSchema.safeParse({ 
                    OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop',
                    LOG_LEVEL: level 
                });
                expect(result.success).toBe(false);
            });
        });

        it('should validate log formats', () => {
            const validFormats = ['json', 'text'];
            const invalidFormats = ['xml', 'csv'];

            validFormats.forEach(format => {
                const result = envSchema.safeParse({ 
                    OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop',
                    LOG_FORMAT: format 
                });
                expect(result.success).toBe(true);
            });

            invalidFormats.forEach(format => {
                const result = envSchema.safeParse({ 
                    OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop',
                    LOG_FORMAT: format 
                });
                expect(result.success).toBe(false);
            });
        });
    });

    describe('Security Configuration', () => {
        it('should validate CORS origins', () => {
            const validOrigins = [
                'http://localhost:3000',
                'https://example.com',
                'https://api.example.com'
            ].join(',');

            const invalidOrigins = [
                'not-a-url',
                'ftp://invalid-protocol.com',
                'http:/invalid-url'
            ].join(',');

            const result = envSchema.safeParse({ 
                OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop',
                CORS_ORIGINS: validOrigins 
            });
            expect(result.success).toBe(true);

            const invalidResult = envSchema.safeParse({ 
                OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop',
                CORS_ORIGINS: invalidOrigins 
            });
            expect(invalidResult.success).toBe(false);
        });
    });

    describe('Cache Configuration', () => {
        it('should validate cache TTL', () => {
            const validTTLs = [1, 3600, 86400];
            const invalidTTLs = [0, -1, 86401];

            validTTLs.forEach(ttl => {
                const result = envSchema.safeParse({ 
                    OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop',
                    CACHE_TTL: ttl 
                });
                expect(result.success).toBe(true);
            });

            invalidTTLs.forEach(ttl => {
                const result = envSchema.safeParse({ 
                    OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop',
                    CACHE_TTL: ttl 
                });
                expect(result.success).toBe(false);
            });
        });
    });

    describe('Default Values', () => {
        it('should provide correct default values', () => {
            const result = envSchema.safeParse({ 
                OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop' 
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toMatchObject({
                    NODE_ENV: 'development',
                    PORT: 3000,
                    MAX_REQUESTS_PER_MINUTE: 60,
                    DEFAULT_MODEL: 'gpt-4',
                    FALLBACK_MODEL: 'gpt-3.5-turbo',
                    MODEL_TEMPERATURE: 0.7,
                    MAX_TOKENS: 2048,
                    LOG_LEVEL: 'info',
                    LOG_FORMAT: 'text',
                    ENABLE_RATE_LIMITING: true,
                    CORS_ORIGINS: ['http://localhost:3000'],
                    CACHE_TTL: 3600,
                    ENABLE_CACHE: true
                });
            }
        });
    });

    describe('Type Coercion', () => {
        it('should coerce string values to numbers', () => {
            const result = envSchema.safeParse({ 
                OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop',
                PORT: '3000',
                MAX_REQUESTS_PER_MINUTE: '60',
                MODEL_TEMPERATURE: '0.7',
                MAX_TOKENS: '2048',
                CACHE_TTL: '3600'
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(typeof result.data.PORT).toBe('number');
                expect(typeof result.data.MAX_REQUESTS_PER_MINUTE).toBe('number');
                expect(typeof result.data.MODEL_TEMPERATURE).toBe('number');
                expect(typeof result.data.MAX_TOKENS).toBe('number');
                expect(typeof result.data.CACHE_TTL).toBe('number');
            }
        });

        it('should coerce string values to booleans', () => {
            const result = envSchema.safeParse({ 
                OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop',
                ENABLE_RATE_LIMITING: 'true',
                ENABLE_CACHE: 'false'
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(typeof result.data.ENABLE_RATE_LIMITING).toBe('boolean');
                expect(typeof result.data.ENABLE_CACHE).toBe('boolean');
                expect(result.data.ENABLE_RATE_LIMITING).toBe(true);
                expect(result.data.ENABLE_CACHE).toBe(false);
            }
        });
    });
}); 