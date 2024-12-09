// Set environment variables before any imports
process.env.NODE_ENV = 'test';

// Load test environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import { beforeAll, vi } from 'vitest';
import { ResponseType, TutorResponse } from '../types';
import { BaseMessage } from '@langchain/core/messages';

// Create a mock response factory
const createMockResponse = (type = ResponseType.CONCEPT_EXPLANATION): TutorResponse => ({
    content: 'This is a test response',
    type,
    confidence: 0.9,
    followUpQuestions: ['Test question?'],
    relatedConcepts: ['test concept']
});

// Mock the output parsers
vi.mock('@langchain/core/output_parsers', () => ({
    JsonOutputParser: vi.fn().mockImplementation(() => ({
        parse: vi.fn().mockImplementation((text: string) => {
            if (typeof text !== 'string') {
                throw new Error('Expected string input');
            }
            return createMockResponse();
        })
    }))
}));

// Mock the RunnableSequence
vi.mock('@langchain/core/runnables', () => ({
    RunnableSequence: {
        from: vi.fn().mockImplementation(() => ({
            invoke: vi.fn().mockImplementation(async () => createMockResponse())
        }))
    }
}));

// Mock the chat model
vi.mock('../config/ai-config', () => ({
    chatModel: {
        invoke: vi.fn().mockImplementation(async () => ({
            content: JSON.stringify(createMockResponse()),
            type: 'ai',
            _getType: () => 'ai'
        }))
    }
}));

// Test setup
beforeAll(() => {
    vi.mock('@langchain/core/prompts', () => ({
        PromptTemplate: {
            fromTemplate: () => ({
                format: async (variables: Record<string, unknown>) => {
                    return `Skill Level: ${variables.skillLevel}
Current Topic: ${variables.currentTopic}
Previous Topics: ${variables.previousTopics || ''}
Question: ${variables.question}`;
                }
            })
        }
    }));
});

export const TEST_TIMEOUT = 30000;

export const testUtils = {
    wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
    mockOpenAIResponse: (content: string) => ({
        content,
        role: 'assistant'
    }),
    createMockTutorResponse: createMockResponse
};

export const mockTutorResponse: TutorResponse = {
    type: ResponseType.CONCEPT_EXPLANATION,
    content: "This is a test response",
    additionalResources: [],
    followUpQuestions: []
};

// Mock LangChain classes if needed
vi.mock('@langchain/openai', () => ({
    ChatOpenAI: vi.fn().mockImplementation(() => ({
        call: vi.fn().mockResolvedValue(mockTutorResponse)
    }))
})); 