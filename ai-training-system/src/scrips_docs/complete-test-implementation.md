# Complete Test Implementation

## 1. Unit Tests
```typescript
// src/agents/tutor/chains/__tests__/tutorChain.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TutorChain } from '../tutorChain';
import { ResponseType, TutorInteraction } from '@/types';
import { mockTutorResponse } from '@/test/setup';

describe('TutorChain Unit Tests', () => {
  let tutorChain: TutorChain;

  beforeEach(() => {
    vi.clearAllMocks();
    tutorChain = new TutorChain();
  });

  describe('Basic Response Generation', () => {
    it('should generate a basic response', async () => {
      const interaction: TutorInteraction = {
        userQuery: "What is a variable?",
        skillLevel: "BEGINNER",
        currentTopic: "JavaScript Basics"
      };

      const response = await tutorChain.generateResponse(interaction);
      
      expect(response).toMatchObject({
        type: ResponseType.CONCEPT_EXPLANATION,
        content: expect.any(String),
        additionalResources: expect.any(Array),
        followUpQuestions: expect.any(Array)
      });
    });

    it('should include appropriate follow-up questions', async () => {
      const interaction: TutorInteraction = {
        userQuery: "How do I use async/await?",
        skillLevel: "INTERMEDIATE",
        currentTopic: "JavaScript Async"
      };

      const response = await tutorChain.generateResponse(interaction);
      
      expect(response.followUpQuestions).toBeDefined();
      expect(response.followUpQuestions?.length).toBeGreaterThan(0);
    });
  });

  describe('Skill Level Adaptation', () => {
    it('should adapt content for beginners', async () => {
      const interaction: TutorInteraction = {
        userQuery: "What is a closure?",
        skillLevel: "BEGINNER",
        currentTopic: "JavaScript Functions"
      };

      const response = await tutorChain.generateResponse(interaction);
      
      expect(response.type).toBe(ResponseType.CONCEPT_EXPLANATION);
      expect(response.content).toMatch(/basic|fundamental|simple/i);
    });

    it('should provide advanced content for experts', async () => {
      const interaction: TutorInteraction = {
        userQuery: "What is a closure?",
        skillLevel: "ADVANCED",
        currentTopic: "JavaScript Functions"
      };

      const response = await tutorChain.generateResponse(interaction);
      
      expect(response.content).toMatch(/advanced|complex|detailed/i);
      expect(response.codeSnippets?.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      vi.spyOn(tutorChain['openai'].chat.completions, 'create')
        .mockRejectedValueOnce(new Error('API Error'));

      await expect(async () => {
        await tutorChain.generateResponse({
          userQuery: "test",
          skillLevel: "BEGINNER",
          currentTopic: "test"
        });
      }).rejects.toThrow('API Error');
    });

    it('should handle empty responses', async () => {
      vi.spyOn(tutorChain['openai'].chat.completions, 'create')
        .mockResolvedValueOnce({
          choices: [{ message: { content: '' } }]
        } as any);

      const response = await tutorChain.generateResponse({
        userQuery: "test",
        skillLevel: "BEGINNER",
        currentTopic: "test"
      });

      expect(response.content).toBe('No response generated. Please try again.');
    });
  });

  describe('Context Awareness', () => {
    it('should consider previous interactions', async () => {
      const interaction: TutorInteraction = {
        userQuery: "Can you explain more?",
        skillLevel: "INTERMEDIATE",
        currentTopic: "JavaScript Functions",
        previousInteractions: [mockTutorResponse]
      };

      const response = await tutorChain.generateResponse(interaction);
      expect(response.content).toBeTruthy();
    });

    it('should maintain topic context', async () => {
      const interaction: TutorInteraction = {
        userQuery: "What about performance?",
        skillLevel: "ADVANCED",
        currentTopic: "React Hooks",
        previousInteractions: [{
          type: ResponseType.CONCEPT_EXPLANATION,
          content: "React hooks are functions that...",
          additionalResources: [],
          followUpQuestions: []
        }]
      };

      const response = await tutorChain.generateResponse(interaction);
      expect(response.content).toMatch(/react|hooks|performance/i);
    });
  });

  describe('Code Examples', () => {
    it('should provide code snippets when appropriate', async () => {
      const interaction: TutorInteraction = {
        userQuery: "Show me how to use array methods",
        skillLevel: "INTERMEDIATE",
        currentTopic: "JavaScript Arrays"
      };

      const response = await tutorChain.generateResponse(interaction);
      
      expect(response.codeSnippets).toBeDefined();
      expect(response.codeSnippets?.length).toBeGreaterThan(0);
      expect(response.codeSnippets?.[0]).toMatch(/\[\]/); // Should contain array syntax
    });

    it('should format code snippets correctly', async () => {
      const interaction: TutorInteraction = {
        userQuery: "How do I write a for loop?",
        skillLevel: "BEGINNER",
        currentTopic: "JavaScript Basics"
      };

      const response = await tutorChain.generateResponse(interaction);
      
      expect(response.codeSnippets?.[0]).toMatch(/for\s*\(/); // Should contain for loop syntax
      expect(response.content).toMatch(/loop|iterate/i);
    });
  });

  describe('Resource Suggestions', () => {
    it('should provide relevant resources', async () => {
      const interaction: TutorInteraction = {
        userQuery: "What are the best practices for React hooks?",
        skillLevel: "INTERMEDIATE",
        currentTopic: "React Hooks"
      };

      const response = await tutorChain.generateResponse(interaction);
      
      expect(response.additionalResources).toBeDefined();
      expect(response.additionalResources?.length).toBeGreaterThan(0);
      expect(response.additionalResources?.[0]).toMatch(/react|hooks/i);
    });
  });
});
```

## 2. Integration Tests
```typescript
// src/agents/tutor/chains/__tests__/tutorChain.integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { TutorChain } from '../tutorChain';
import { ResponseType, TutorInteraction } from '@/types';

describe('TutorChain Integration Tests', () => {
  let tutorChain: TutorChain;

  beforeEach(() => {
    tutorChain = new TutorChain();
  });

  describe('OpenAI Integration', () => {
    it('should successfully call OpenAI API', async () => {
      const interaction: TutorInteraction = {
        userQuery: "What is a promise in JavaScript?",
        skillLevel: "INTERMEDIATE",
        currentTopic: "JavaScript Async"
      };

      const response = await tutorChain.generateResponse(interaction);
      
      expect(response.content).toBeTruthy();
      expect(response.type).toBeDefined();
    });

    it('should handle large responses', async () => {
      const interaction: TutorInteraction = {
        userQuery: "Explain everything about React hooks",
        skillLevel: "ADVANCED",
        currentTopic: "React Hooks"
      };

      const response = await tutorChain.generateResponse(interaction);
      
      expect(response.content.length).toBeGreaterThan(100);
      expect(response.followUpQuestions?.length).toBeGreaterThan(0);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle complex questions', async () => {
      const interaction: TutorInteraction = {
        userQuery: "How do React hooks, context, and Redux work together in a large application?",
        skillLevel: "ADVANCED",
        currentTopic: "React State Management"
      };

      const response = await tutorChain.generateResponse(interaction);
      
      expect(response.content).toMatch(/redux|context|hooks/i);
      expect(response.codeSnippets?.length).toBeGreaterThan(0);
    });

    it('should maintain context across multiple interactions', async () => {
      const firstInteraction: TutorInteraction = {
        userQuery: "What is Redux?",
        skillLevel: "INTERMEDIATE",
        currentTopic: "React State Management"
      };

      const firstResponse = await tutorChain.generateResponse(firstInteraction);

      const secondInteraction: TutorInteraction = {
        userQuery: "How does that compare to Context?",
        skillLevel: "INTERMEDIATE",
        currentTopic: "React State Management",
        previousInteractions: [firstResponse]
      };

      const secondResponse = await tutorChain.generateResponse(secondInteraction);
      
      expect(secondResponse.content).toMatch(/redux|context|comparison/i);
    });
  });
});
```

## Test Coverage Areas
1. Basic Response Generation
   - Content generation
   - Response format
   - Follow-up questions

2. Skill Level Adaptation
   - Beginner content
   - Advanced content
   - Content complexity

3. Error Handling
   - API errors
   - Empty responses
   - Invalid inputs

4. Context Awareness
   - Previous interactions
   - Topic continuity
   - Learning progression

5. Code Examples
   - Syntax correctness
   - Context appropriateness
   - Format validation

6. Resource Suggestions
   - Relevance
   - Quality
   - Context

7. Integration Testing
   - API interaction
   - Real-world scenarios
   - Multi-step interactions

## Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test src/agents/tutor/chains/__tests__/tutorChain.test.ts

# Run with coverage
npm test -- --coverage
```

These tests provide comprehensive coverage of the tutor chain functionality, including both unit tests for individual components and integration tests for real-world scenarios.
