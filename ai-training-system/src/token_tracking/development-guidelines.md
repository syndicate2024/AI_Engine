# @ai-protected
# Development Guidelines

## Code Quality Standards

### 1. Type Safety
```typescript
// ✅ Good: Proper type handling
const response: TutorResponse = await tutorChain.generateResponse(input);
const snippets = response.codeSnippets || [];

// ❌ Bad: Unsafe access
const snippets = response.codeSnippets[0];
```

#### Key Practices
- Always use TypeScript types
- Handle null/undefined with coalescing
- Add type annotations for async responses
- Use safe array/object access patterns

### 2. Error Handling
```typescript
// ✅ Good: Proper error handling
try {
    const result = await someAsyncOperation();
    return this.processResult(result);
} catch (error) {
    console.error('Operation failed:', error);
    throw error;
}

// ❌ Bad: Missing error handling
const result = await someAsyncOperation();
return this.processResult(result);
```

#### Key Practices
- Use try-catch blocks
- Log errors properly
- Throw with meaningful messages
- Handle edge cases

### 3. Testing Standards

#### Unit Tests
```typescript
// ✅ Good: Proper mock setup and type safety
describe('TutorChain', () => {
    let tutorChain: TutorChain;
    
    beforeEach(() => {
        vi.clearAllMocks();
        tutorChain = new TutorChain();
    });

    it('should handle responses correctly', async () => {
        const response = await tutorChain.generateResponse(input);
        expect(response.type).toBe(ResponseType.CONCEPT_EXPLANATION);
    });
});
```

#### Integration Tests
```typescript
// ✅ Good: Comprehensive integration test
it('should maintain context across interactions', async () => {
    const firstResponse = await chain.generateResponse(firstInput);
    const secondResponse = await chain.generateResponse({
        ...secondInput,
        previousInteractions: [firstResponse]
    });
    expect(secondResponse.content).toMatch(/context|reference/i);
});
```

### 4. Code Organization

#### File Structure
```
src/
├── agents/
│   ├── tutor/
│   │   ├── chains/
│   │   │   ├── __tests__/
│   │   │   │   ├── tutorChain.test.ts
│   │   │   │   └── tutorChain.integration.test.ts
│   │   │   └── tutorChain.ts
│   │   └── prompts/
│   └── assessment/
└── types/
```

#### Module Organization
- Separate concerns (chains, prompts, utils)
- Group related functionality
- Keep files focused and manageable
- Include tests alongside code

### 5. Documentation

#### Code Comments
```typescript
/**
 * Generates a tutoring response based on user interaction
 * @param input - The user's interaction details
 * @returns A structured tutor response with explanations and code snippets
 * @throws Error if OpenAI API call fails
 */
async generateResponse(input: TutorInteraction): Promise<TutorResponse>
```

#### Documentation Files
- README.md for each module
- API documentation
- Test coverage reports
- Implementation guides

### 6. Environment Management

#### Configuration
```typescript
// vite.config.ts
export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        setupFiles: ['./src/test/setup.ts']
    }
});
```

#### API Keys
```typescript
// ✅ Good: Safe API key handling
const apiKey = process.env.OPENAI_API_KEY || 'test-key';
```

### 7. Best Practices

#### Code Reviews
- Check type safety
- Verify error handling
- Review test coverage
- Validate documentation

#### Development Flow
1. Write tests first
2. Implement feature
3. Add documentation
4. Review and refactor

#### Maintenance
- Keep dependencies updated
- Monitor test coverage
- Update documentation
- Review and improve regularly 