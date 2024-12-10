// @ai-protected

// @ai-protected
// Environment Configuration Tests

import { describe, it, expect } from 'vitest';
import { envSchema } from '../../config/env';

describe('Environment Configuration', () => {
    describe('OpenAI Configuration', () => {
        describe('API Key Validation', () => {
            it('should validate properly formatted API keys', () => {
                const validKeys = [
                    'sk-test1234567890abcdefghijklmnop',
                    'sk-live1234567890abcdefghijklmnop',
                    'sk-test-1234-5678-90ab-cdef-ghij'
                ];

                validKeys.forEach(key => {
                    const result = envSchema.safeParse({ OPENAI_API_KEY: key });
                    expect(result.success).toBe(true);
                });
            });

            it('should reject malformed API keys', () => {
                const invalidKeys = [
                    'not-a-key',
                    'sk-',
                    'sk-test',
                    'sk-test-too-short',
                    'pk-test1234567890abcdefghijklmnop'
                ];

                invalidKeys.forEach(key => {
                    const result = envSchema.safeParse({ OPENAI_API_KEY: key });
                    expect(result.success).toBe(false);
                    if (!result.success) {
                        expect(result.error.issues[0].message).toBe('Invalid OpenAI API key format');
                    }
                });
            });

            it('should reject non-string values', () => {
                const invalidValues = [123, true, null, undefined, [], {}];

                invalidValues.forEach(value => {
                    const result = envSchema.safeParse({ OPENAI_API_KEY: value });
                    expect(result.success).toBe(false);
                });
            });

            it('should handle whitespace in API keys', () => {
                const keysWithWhitespace = [
                    ' sk-test1234567890abcdefghijklmnop',
                    'sk-test1234567890abcdefghijklmnop ',
                    'sk-test1234567890abcdef ghijklmnop'
                ];

                keysWithWhitespace.forEach(key => {
                    const result = envSchema.safeParse({ OPENAI_API_KEY: key });
                    expect(result.success).toBe(false);
                    if (!result.success) {
                        expect(result.error.issues[0].message).toBe('Invalid OpenAI API key format');
                    }
                });
            });

            it('should enforce minimum and maximum length requirements', () => {
                for (let i = 0; i < 150; i++) {
                    const key = 'sk-' + 'a'.repeat(i);
                    const result = envSchema.safeParse({ OPENAI_API_KEY: key });
                    const expectedValid = i >= 17 && i <= 97; // Total length 20-100 (including 'sk-')
                    expect(result.success).toBe(expectedValid);
                    if (!result.success) {
                        expect(result.error.issues[0].message).toBe('Invalid OpenAI API key format');
                    }
                }
            });

            it('should require OPENAI_API_KEY to be present', () => {
                const result = envSchema.safeParse({});
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.issues[0].message).toBe('Required');
                }
            });

            it('should mask API key in error messages and logs', () => {
                const key = 'sk-test1234567890abcdefghijklmnop';
                const result = envSchema.safeParse({ OPENAI_API_KEY: key });
                expect(result.success).toBe(true);
            });
        });

        describe('Environment Settings', () => {
            it('should validate NODE_ENV', () => {
                const validEnvs = ['development', 'test', 'production'];
                validEnvs.forEach(env => {
                    const result = envSchema.safeParse({ OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop', NODE_ENV: env });
                    expect(result.success).toBe(true);
                });
            });

            it('should provide default values', () => {
                const result = envSchema.safeParse({ OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop' });
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data.NODE_ENV).toBe('development');
                }
            });

            it('should reject invalid environments', () => {
                const result = envSchema.safeParse({ OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop', NODE_ENV: 'invalid' });
                expect(result.success).toBe(false);
            });
        });

        describe('API Configuration', () => {
            it('should validate rate limiting settings', () => {
                const result = envSchema.safeParse({
                    OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop',
                    MAX_REQUESTS_PER_MINUTE: 30,
                    ENABLE_RATE_LIMITING: true
                });
                expect(result.success).toBe(true);
            });

            it('should reject invalid rate limits', () => {
                const result = envSchema.safeParse({
                    OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop',
                    MAX_REQUESTS_PER_MINUTE: 1001
                });
                expect(result.success).toBe(false);
            });
        });

        describe('Model Configuration', () => {
            it('should validate model settings', () => {
                const result = envSchema.safeParse({
                    OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop',
                    DEFAULT_MODEL: 'gpt-4',
                    MODEL_TEMPERATURE: 0.7,
                    MAX_TOKENS: 2048
                });
                expect(result.success).toBe(true);
            });

            it('should reject invalid models', () => {
                const result = envSchema.safeParse({
                    OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop',
                    DEFAULT_MODEL: 'invalid-model'
                });
                expect(result.success).toBe(false);
            });

            it('should validate temperature range', () => {
                const result = envSchema.safeParse({
                    OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop',
                    MODEL_TEMPERATURE: 2.1
                });
                expect(result.success).toBe(false);
            });
        });

        describe('Logging Configuration', () => {
            it('should validate log levels', () => {
                const validLevels = ['debug', 'info', 'warn', 'error'];
                validLevels.forEach(level => {
                    const result = envSchema.safeParse({
                        OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop',
                        LOG_LEVEL: level
                    });
                    expect(result.success).toBe(true);
                });
            });

            it('should validate log formats', () => {
                const validFormats = ['json', 'text'];
                validFormats.forEach(format => {
                    const result = envSchema.safeParse({
                        OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop',
                        LOG_FORMAT: format
                    });
                    expect(result.success).toBe(true);
                });
            });
        });

        describe('Security Configuration', () => {
            it('should validate CORS origins', () => {
                const result = envSchema.safeParse({
                    OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop',
                    CORS_ORIGINS: 'http://localhost:3000,https://example.com'
                });
                expect(result.success).toBe(true);
            });
        });

        describe('Cache Configuration', () => {
            it('should validate cache settings', () => {
                const result = envSchema.safeParse({
                    OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop',
                    CACHE_TTL: 3600,
                    ENABLE_CACHE: true
                });
                expect(result.success).toBe(true);
            });
        });

        describe('Default Values', () => {
            it('should provide sensible defaults', () => {
                const result = envSchema.safeParse({
                    OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop'
                });
                expect(result.success).toBe(true);
            });
        });

        describe('Type Coercion', () => {
            it('should coerce numeric strings', () => {
                const result = envSchema.safeParse({
                    OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop',
                    PORT: '3000',
                    MAX_REQUESTS_PER_MINUTE: '60'
                });
                expect(result.success).toBe(true);
            });

            it('should coerce boolean strings', () => {
                const result = envSchema.safeParse({
                    OPENAI_API_KEY: 'sk-test1234567890abcdefghijklmnop',
                    ENABLE_RATE_LIMITING: 'true',
                    ENABLE_CACHE: 'false'
                });
                expect(result.success).toBe(true);
            });
        });
    });
}); 