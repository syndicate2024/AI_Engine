# Resource Agent Testing Guide

## Overview
This document outlines the testing strategy and implementation for the Resource Agent.

## Test Structure
```
src/
  agents/
    resource/
      chains/
        __tests__/
          resourceAgentChain.test.ts        # Unit tests
          resourceAgentChain.integration.ts  # Integration tests
```

## Test Categories

### 1. Unit Tests
- **Resource Management**
  - Resource indexing
  - Content retrieval
  - Metadata handling
  - Resource validation

- **Content Processing**
  - Content extraction
  - Format conversion
  - Quality validation
  - Metadata enrichment

- **Resource Recommendations**
  - Relevance scoring
  - Difficulty matching
  - Topic alignment
  - Learning path integration

### 2. Integration Tests
- **Agent Integration**
  - Tutor agent sync
  - Assessment agent feedback
  - Progress agent updates

- **Real-world Scenarios**
  - Resource discovery flows
  - Content adaptation
  - Dynamic recommendations

## Running Tests
```powershell
# Run all resource agent tests
npm test src/agents/resource

# Run specific test file
npm test src/agents/resource/chains/__tests__/resourceAgentChain.test.ts

# Run with coverage
npm test src/agents/resource -- --coverage
```

## Test Implementation Guide

### Setting Up a Test
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ResourceAgentChain } from '../resourceAgentChain';
import { ResourceType, ContentRequest } from '@/types';

describe('ResourceAgentChain Tests', () => {
  let resourceAgentChain: ResourceAgentChain;

  beforeEach(() => {
    vi.clearAllMocks();
    resourceAgentChain = new ResourceAgentChain();
  });

  // Test cases go here
});
```

### Example Test Cases
```typescript
// Resource retrieval test
it('should retrieve appropriate resources', async () => {
  const request: ContentRequest = {
    topic: "JavaScript Basics",
    skillLevel: "BEGINNER",
    resourceType: ResourceType.TUTORIAL
  };

  const resources = await resourceAgentChain.findResources(request);
  
  expect(resources).toMatchObject({
    items: expect.arrayContaining([
      expect.objectContaining({
        id: expect.any(String),
        type: ResourceType.TUTORIAL,
        content: expect.any(String),
        metadata: expect.any(Object)
      })
    ]),
    totalCount: expect.any(Number)
  });
});

// Resource recommendation test
it('should recommend relevant resources', async () => {
  const context = {
    userId: "user123",
    currentTopic: "JavaScript Functions",
    progress: 0.6,
    recentTopics: ["variables", "control-flow"]
  };

  const recommendations = await resourceAgentChain.getRecommendations(context);
  
  expect(recommendations).toMatchObject({
    recommended: expect.arrayContaining([
      expect.objectContaining({
        resourceId: expect.any(String),
        relevanceScore: expect.any(Number),
        reason: expect.any(String)
      })
    ]),
    nextSteps: expect.any(Array)
  });
});
```

## Mocking Guide

### OpenAI Mocks
```typescript
// Mock resource processing
vi.spyOn(resourceAgentChain['openai'].chat.completions, 'create')
  .mockResolvedValueOnce({
    choices: [{
      message: {
        content: JSON.stringify({
          resources: [
            {
              id: "res123",
              type: "TUTORIAL",
              title: "JavaScript Variables",
              content: "Tutorial content here"
            }
          ]
        })
      }
    }]
  } as any);

// Mock recommendation generation
vi.spyOn(resourceAgentChain['openai'].chat.completions, 'create')
  .mockResolvedValueOnce({
    choices: [{
      message: {
        content: JSON.stringify({
          recommendations: [
            {
              resourceId: "res123",
              relevanceScore: 0.85,
              reason: "Matches current learning path"
            }
          ]
        })
      }
    }]
  } as any);
```

## Coverage Requirements
- Minimum 80% line coverage
- 100% coverage of resource processing logic
- All resource types must be tested
- Integration tests for recommendation flows

## Best Practices
1. Test all resource types
2. Verify content processing
3. Test recommendation accuracy
4. Mock AI responses consistently
5. Validate metadata handling
6. Test content adaptation
7. Verify resource quality

## Debugging Tests
- Log resource processing
- Verify recommendation logic
- Check content extraction
- Monitor AI interactions 

## Testing Status Checklist
- [ ] Basic Setup
  - [ ] Test environment configured
  - [ ] Dependencies installed
  - [ ] Mock data prepared

- [ ] Unit Tests
  - [ ] Resource Management
    - [ ] Resource indexing
    - [ ] Content retrieval
    - [ ] Metadata handling
  - [ ] Content Processing
    - [ ] Content extraction
    - [ ] Format conversion
    - [ ] Quality validation
  - [ ] Recommendation Engine
    - [ ] Relevance scoring
    - [ ] Difficulty matching
    - [ ] Topic alignment

- [ ] Integration Tests
  - [ ] Tutor Agent Integration
    - [ ] Resource delivery
    - [ ] Content adaptation
  - [ ] Assessment Agent Integration
    - [ ] Resource difficulty
    - [ ] Topic matching
  - [ ] Progress Agent Integration
    - [ ] Resource tracking
    - [ ] Usage analytics

- [ ] End-to-End Tests
  - [ ] Resource discovery flows
  - [ ] Content adaptation
  - [ ] Dynamic recommendations

## Test Implementation Order
1. Resource Management
   - Basic indexing
   - Content handling
   - Metadata processing

2. Content Processing
   - Extraction logic
   - Format handling
   - Quality checks

3. Recommendation System
   - Scoring algorithms
   - Matching logic
   - Adaptation rules

4. Integration Points
   - Agent communication
   - Content delivery
   - Usage tracking