// Integration test setup
import { beforeAll, afterAll } from 'vitest';
import dotenv from 'dotenv';

beforeAll(() => {
  // Load environment variables from .env file
  dotenv.config();

  // Verify required environment variables
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'test-key') {
    throw new Error('OPENAI_API_KEY is required for integration tests');
  }

  if (!process.env.OPENAI_MODEL) {
    throw new Error('OPENAI_MODEL is required for integration tests');
  }
});

afterAll(() => {
  // Cleanup after tests if needed
});

// Global test timeout (30 seconds)
export const TEST_TIMEOUT = 30000; 