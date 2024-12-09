import { vi } from 'vitest';
import { ResponseType, TutorResponse } from '../src/types';

// Mock OpenAI responses
export const mockOpenAIResponse = {
  choices: [{
    message: {
      content: JSON.stringify({
        type: ResponseType.CONCEPT_EXPLANATION,
        content: "This is a detailed explanation of the concept...",
        codeSnippets: [
          {
            language: "javascript",
            code: "const example = () => { /* code here */ }",
            explanation: "Example function"
          }
        ],
        followUpQuestions: [
          "What about advanced use cases?",
          "How does this compare to alternatives?"
        ]
      })
    }
  }]
};

// Mock tutor response
export const mockTutorResponse: TutorResponse = {
  type: ResponseType.CONCEPT_EXPLANATION,
  content: "Functions are reusable blocks of code that perform specific tasks...",
  additionalResources: [
    {
      type: 'documentation',
      title: 'MDN Functions Guide',
      url: 'https://developer.mozilla.org/docs/Web/JavaScript/Guide/Functions',
      relevance: 1.0
    }
  ],
  followUpQuestions: [
    "How do you pass parameters to a function?",
    "What is function scope?"
  ],
  codeSnippets: [
    {
      language: 'javascript',
      code: 'function greet(name) {\n  return `Hello, ${name}!`;\n}',
      explanation: 'A simple greeting function',
      focus: ['function declaration', 'parameter', 'template literal']
    }
  ],
  confidence: 0.95
};

// Mock API error
export const mockAPIError = new Error('API Error');

// Global test setup
vi.mock('@langchain/openai', () => ({
  ChatOpenAI: vi.fn().mockImplementation(() => ({
    model: 'gpt-4-turbo',
    temperature: 0.7,
    invoke: vi.fn().mockResolvedValue({ content: mockOpenAIResponse.choices[0].message.content })
  }))
})); 