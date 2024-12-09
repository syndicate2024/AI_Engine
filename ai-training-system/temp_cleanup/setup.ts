// Set environment variables before any imports
process.env.NODE_ENV = 'test';

// For integration tests, use real API key if available
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-key';
process.env.OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4';
process.env.OPENAI_TEMPERATURE = process.env.OPENAI_TEMPERATURE || '0.7';
process.env.PORT = process.env.PORT || '3000';
process.env.LOG_LEVEL = 'error';

import { beforeAll, vi } from 'vitest';
import { AIMessageChunk } from '@langchain/core/messages';
import { ResponseType } from '../types';

// Mock the chat model for unit tests
vi.mock('../config/ai-config', () => ({
  chatModel: {
    invoke: vi.fn().mockImplementation(async (_prompt: string) => {
      // Parse the input to extract variables
      const response = {
        content: JSON.stringify({
          content: 'This is a test response',
          type: ResponseType.CONCEPT_EXPLANATION,
          confidence: 0.9,
          followUpQuestions: ['Test question?'],
          relatedConcepts: ['test concept']
        }),
        additional_kwargs: {}
      };
      return new AIMessageChunk(response);
    }),
    formatMessages: vi.fn().mockImplementation((messages: unknown[]) => messages)
  }
}));

// Additional test setup
beforeAll(() => {
  // Mock the prompt template format function for unit tests
  vi.mock('@langchain/core/prompts', () => ({
    PromptTemplate: {
      fromTemplate: () => ({
        format: async (variables: Record<string, unknown>) => {
          // Return a formatted string using the variables
          return `Skill Level: ${variables.skillLevel}
Current Topic: ${variables.currentTopic}
Previous Topics: ${variables.previousTopics || ''}
Question: ${variables.question}`;
        }
      })
    }
  }));
});

// Global test timeout (30 seconds)
export const TEST_TIMEOUT = 30000;

// Test utilities
export const testUtils = {
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  mockOpenAIResponse: (content: string) => ({
    content,
    role: 'assistant'
  }),
  createMockTutorResponse: (type: ResponseType, content: string) => ({
    content,
    type,
    confidence: 0.9,
    followUpQuestions: ['Test question?'],
    relatedConcepts: ['test concept']
  })
}; 