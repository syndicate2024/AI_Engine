# AI Training System Test Guide

## Recent Solutions and Best Practices

### TutorChain Testing Solutions

#### 1. Type Safety and Null Handling
```typescript
// Good: Proper type handling with null coalescing
const response: TutorResponse = await tutorChain.generateResponse(interaction);
const snippets = response.codeSnippets || [];

// Bad: Unsafe access without type checking
const snippets = response.codeSnippets[0];
```

#### 2. Code Snippet Extraction
```typescript
// Good: Robust regex with proper error handling
private extractCodeSnippets(content: string): string[] {
    const regex = /```(?:javascript|js)?\n([\s\S]*?)```/g;
    const matches = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
        const code = match[1].trim();
        if (code) {
            matches.push(code);
        }
    }

    return matches;
}
```

#### 3. Mock Setup
```typescript
// Good: Centralized mock setup
const mockOpenAI = {
    chat: {
        completions: {
            create: vi.fn()
        }
    }
};

beforeAll(() => {
    vi.mock('openai', () => ({
        default: vi.fn().mockImplementation(() => mockOpenAI)
    }));
});
```

### Common Issues and Solutions

1. **Type Safety**
   - Always use proper TypeScript types
   - Handle null/undefined with coalescing operators
   - Add type annotations for async responses

2. **Mock Management**
   - Use centralized mock setup
   - Clear mocks in beforeEach
   - Provide type-safe mock responses

3. **Code Snippet Handling**
   - Use robust regex patterns
   - Handle language specifications
   - Trim whitespace properly
   - Return empty array for no matches

4. **Error Handling**
   - Use try-catch blocks
   - Log errors properly
   - Throw with meaningful messages
   - Test error scenarios

### Integration Test Best Practices

1. **Test Setup**
   ```typescript
   describe('OpenAI Integration', () => {
       beforeEach(() => {
           vi.clearAllMocks();
           tutorChain = new TutorChain();
       });
   });
   ```

2. **Context Management**
   ```typescript
   const defaultContext = {
       currentModule: '',
       recentConcepts: [],
       struggledTopics: [],
       completedProjects: []
   };
   ```

3. **Response Validation**
   ```typescript
   expect(response.content).toBeTruthy();
   expect(response.type).toBe(ResponseType.CONCEPT_EXPLANATION);
   expect(response.codeSnippets).toBeDefined();
   ```

### Environment Setup

1. **API Keys**
   - Use environment variables
   - Provide fallback for tests
   ```typescript
   apiKey: process.env.OPENAI_API_KEY || 'test-key'
   ```

2. **Test Configuration**
   ```typescript
   // vite.config.ts
   test: {
       globals: true,
       environment: 'node',
       setupFiles: ['./src/test/setup.ts'],
       env: {
           OPENAI_API_KEY: env.OPENAI_API_KEY
       }
   }
   ```

### Checklist for New Tests

1. **Unit Tests**
   - [ ] Type safety implemented
   - [ ] Proper mock setup
   - [ ] Error cases covered
   - [ ] Code snippet extraction tested
   - [ ] Context handling verified

2. **Integration Tests**
   - [ ] API integration verified
   - [ ] Large responses handled
   - [ ] Complex scenarios tested
   - [ ] Context maintained
   - [ ] Error propagation checked

3. **Environment**
   - [ ] API keys configured
   - [ ] Test setup file present
   - [ ] Mock utilities available
   - [ ] Types properly imported 