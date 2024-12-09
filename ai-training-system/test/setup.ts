import { beforeAll, vi } from 'vitest';
import { ResponseType } from '../src/types';

// Mock OpenAI response
const mockOpenAIResponse = {
    id: 'mock-id',
    choices: [{
        message: {
            content: `This is a detailed mock OpenAI response about React hooks, context, and Redux in modern web development. 
            These tools work together to provide efficient state management and component lifecycle control.
            
            Here's an example of using hooks with context:
            \`\`\`javascript
            const value = useContext(MyContext);
            console.log('Context value:', value);
            \`\`\`
            
            Some follow-up questions to consider:
            1. How does useContext compare to Redux for state management?
            2. What are the best practices for using hooks in large applications?
            3. Can you explain the performance implications of context vs redux?`,
            role: 'assistant'
        }
    }]
};

// Mock OpenAI client
const mockOpenAI = {
    chat: {
        completions: {
            create: vi.fn().mockResolvedValue(mockOpenAIResponse)
        }
    }
};

// Export mock data and utilities for tests
export { mockOpenAI, mockOpenAIResponse };

// Setup global mocks
beforeAll(() => {
    // Mock OpenAI
    vi.mock('openai', () => ({
        default: vi.fn().mockImplementation(() => mockOpenAI)
    }));

    // Mock environment variables
    process.env.OPENAI_API_KEY = 'mock-api-key';
}); 