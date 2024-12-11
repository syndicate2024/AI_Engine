# @ai-protected
# Assessment Agent Testing Guide

## Testing Status Checklist
- [ ] Basic Setup
  - [ ] Test environment configured
  - [ ] Dependencies installed
  - [ ] Mock data prepared

- [ ] Unit Tests
  - [ ] Question Generation
    - [ ] Different difficulty levels
    - [ ] Various question types
    - [ ] Topic coverage
  - [ ] Answer Evaluation
    - [ ] Scoring accuracy
    - [ ] Feedback generation
    - [ ] Progress tracking
  - [ ] Knowledge Assessment
    - [ ] Skill level detection
    - [ ] Gap analysis
    - [ ] Learning recommendations

- [ ] Integration Tests
  - [ ] Tutor Agent Integration
    - [ ] Knowledge sharing
    - [ ] Context synchronization
  - [ ] Progress Agent Integration
    - [ ] Score reporting
    - [ ] Progress updates
  - [ ] Resource Agent Integration
    - [ ] Resource recommendations
    - [ ] Content adaptation

- [ ] End-to-End Tests
  - [ ] Complete assessment flows
  - [ ] Adaptive difficulty
  - [ ] Learning path updates

## Test Structure
```
src/
  agents/
    assessment/
      chains/
        __tests__/
          assessmentAgentChain.test.ts        # Unit tests
          assessmentAgentChain.integration.ts  # Integration tests
```

## Test Implementation Guide

### Setting Up Tests
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AssessmentAgentChain } from '../assessmentAgentChain';
import { AssessmentType, StudentResponse } from '@/types';

describe('AssessmentAgentChain Tests', () => {
  let assessmentAgentChain: AssessmentAgentChain;

  beforeEach(() => {
    vi.clearAllMocks();
    assessmentAgentChain = new AssessmentAgentChain();
  });

  // Test cases go here
});
```

### Example Test Cases
```typescript
// Assessment generation test
it('should generate appropriate assessment questions', async () => {
  const request = {
    topic: "JavaScript Basics",
    skillLevel: "BEGINNER",
    questionCount: 3
  };

  const assessment = await assessmentAgentChain.generateAssessment(request);
  
  expect(assessment).toMatchObject({
    questions: expect.arrayContaining([
      expect.objectContaining({
        question: expect.any(String),
        type: expect.any(String),
        difficulty: expect.any(String)
      })
    ]),
    metadata: expect.any(Object)
  });
});

// Response evaluation test
it('should evaluate student responses correctly', async () => {
  const studentResponse: StudentResponse = {
    questionId: "1",
    answer: "A variable is a container for storing data values",
    confidence: 0.8
  };

  const evaluation = await assessmentAgentChain.evaluateResponse(studentResponse);
  
  expect(evaluation).toMatchObject({
    score: expect.any(Number),
    feedback: expect.any(String),
    correctness: expect.any(Number),
    suggestedTopics: expect.any(Array)
  });
});
```

### Mocking Guide
```typescript
// Mock assessment generation
vi.spyOn(assessmentAgentChain['openai'].chat.completions, 'create')
  .mockResolvedValueOnce({
    choices: [{
      message: {
        content: JSON.stringify({
          questions: [
            {
              id: "1",
              question: "What is a variable?",
              type: "OPEN_ENDED",
              difficulty: "BEGINNER"
            }
          ]
        })
      }
    }]
  } as any);

// Mock evaluation response
vi.spyOn(assessmentAgentChain['openai'].chat.completions, 'create')
  .mockResolvedValueOnce({
    choices: [{
      message: {
        content: JSON.stringify({
          score: 0.85,
          feedback: "Good understanding of variables",
          suggestedTopics: ["Data Types", "Scope"]
        })
      }
    }]
  } as any);
```

## Running Tests
```powershell
# Run all assessment agent tests
npm test src/agents/assessment

# Run specific test file
npm test src/agents/assessment/chains/__tests__/assessmentAgentChain.test.ts

# Run with coverage
npm test src/agents/assessment -- --coverage
```

## Coverage Requirements
- Minimum 80% line coverage
- 100% coverage of evaluation logic
- All question types must be tested
- Integration tests for complete assessment flows

## Best Practices
1. Test all question types
2. Verify scoring accuracy
3. Test edge cases in responses
4. Mock AI responses consistently
5. Validate feedback quality
6. Test difficulty adaptation
7. Verify progress tracking

## Debugging Tests
- Log assessment generation
- Verify evaluation logic
- Check scoring calculations
- Monitor AI interactions 