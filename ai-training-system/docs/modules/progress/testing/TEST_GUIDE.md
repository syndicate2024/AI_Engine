# Progress Agent Testing Guide

## Testing Status Checklist
- [ ] Basic Setup
  - [ ] Test environment configured
  - [ ] Dependencies installed
  - [ ] Mock data prepared

- [ ] Unit Tests
  - [ ] Progress Recording
    - [ ] Milestone tracking
    - [ ] Achievement logging
    - [ ] Performance metrics
  - [ ] Analytics Processing
    - [ ] Progress calculations
    - [ ] Trend analysis
    - [ ] Goal tracking
  - [ ] Path Management
    - [ ] Path creation
    - [ ] Path updates
    - [ ] Dependency tracking

- [ ] Integration Tests
  - [ ] Tutor Agent Integration
    - [ ] Learning updates
    - [ ] Path synchronization
  - [ ] Assessment Agent Integration
    - [ ] Score processing
    - [ ] Skill updates
  - [ ] Resource Agent Integration
    - [ ] Resource tracking
    - [ ] Usage analytics

- [ ] End-to-End Tests
  - [ ] Complete learning paths
  - [ ] Long-term tracking
  - [ ] Multi-topic progress

## Test Structure
```
src/
  agents/
    progress/
      chains/
        __tests__/
          progressAgentChain.test.ts        # Unit tests
          progressAgentChain.integration.ts  # Integration tests
```

## Test Implementation Guide

### Setting Up Tests
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProgressAgentChain } from '../progressAgentChain';
import { LearningPath, Progress } from '@/types';

describe('ProgressAgentChain Tests', () => {
  let progressAgentChain: ProgressAgentChain;

  beforeEach(() => {
    vi.clearAllMocks();
    progressAgentChain = new ProgressAgentChain();
  });

  // Test cases go here
});
```

### Example Test Cases
```typescript
// Progress recording test
it('should record learning progress correctly', async () => {
  const progressData = {
    userId: "user123",
    topicId: "js-basics",
    completionStatus: 0.75,
    assessmentScores: [0.8, 0.9]
  };

  const result = await progressAgentChain.recordProgress(progressData);
  
  expect(result).toMatchObject({
    updated: true,
    newProgress: expect.any(Number),
    recommendations: expect.any(Array)
  });
});

// Learning path test
it('should update learning path based on progress', async () => {
  const pathUpdate = {
    userId: "user123",
    currentTopic: "js-basics",
    completedMilestones: ["variables", "functions"],
    nextMilestone: "objects"
  };

  const updatedPath = await progressAgentChain.updateLearningPath(pathUpdate);
  
  expect(updatedPath).toMatchObject({
    currentProgress: expect.any(Number),
    nextSteps: expect.any(Array),
    recommendations: expect.any(Array)
  });
});
```

### Mocking Guide
```typescript
// Mock progress data storage
vi.spyOn(progressAgentChain['db'], 'saveProgress')
  .mockResolvedValueOnce({
    success: true,
    progressId: "prog123"
  });

// Mock learning path retrieval
vi.spyOn(progressAgentChain['db'], 'getLearningPath')
  .mockResolvedValueOnce({
    userId: "user123",
    path: {
      topics: ["js-basics", "js-advanced"],
      currentTopic: "js-basics",
      progress: 0.75
    }
  });
```

## Running Tests
```powershell
# Run all progress agent tests
npm test src/agents/progress

# Run specific test file
npm test src/agents/progress/chains/__tests__/progressAgentChain.test.ts

# Run with coverage
npm test src/agents/progress -- --coverage
```

## Coverage Requirements
- Minimum 85% line coverage
- 100% coverage of progress calculations
- All path management functions tested
- Integration tests for data flow

## Best Practices
1. Test all progress metrics
2. Verify calculation accuracy
3. Test path dependencies
4. Mock database consistently
5. Validate progress updates
6. Test long-term tracking
7. Verify data persistence

## Debugging Tests
- Log progress updates
- Verify calculations
- Check path updates
- Monitor data flow
- Validate metrics 