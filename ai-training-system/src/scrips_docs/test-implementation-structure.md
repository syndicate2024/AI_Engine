# @ai-protected
# Complete Test Implementation

## Core Testing Structure

```bash
src/
├── __tests__/                  # Root test directory
│   ├── setup/                  # Shared test setup
│   │   ├── mocks/             # Shared mocks
│   │   ├── fixtures/          # Test data
│   │   └── helpers/           # Test utilities
│   │
│   ├── integration/           # Cross-agent integration tests
│   │   ├── learning-flow/     # Full learning flow tests
│   │   ├── resource-flow/     # Resource management tests
│   │   └── evaluation-flow/   # Evaluation flow tests
│   │
│   └── agents/               # Individual agent tests
│       ├── code-expert/
│       ├── project-manager/
│       ├── visual/
│       └── ...
│
└── agents/                   # Actual agent implementations
    ├── code-expert/
    ├── project-manager/
    ├── visual/
    └── ...
```

## Shared Test Setup

```typescript
// src/__tests__/setup/test-setup.ts
import { vi } from 'vitest';
import { setupLangChain } from './langchain-setup';
import { setupMockAI } from './ai-setup';

export function setupTestEnvironment() {
  // Common test setup
  setupLangChain();
  setupMockAI();
  
  // Reset all mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });
}

// src/__tests__/setup/mocks/shared-mocks.ts
export const mockLearnerProfile = {
  id: 'test-learner',
  skillLevel: 'INTERMEDIATE',
  goals: ['fullstack-js']
};

export const mockCodeSubmission = {
  code: 'function test() { return true; }',
  language: 'javascript'
};

// Add other common mocks
```

## Integration Test Example

```typescript
// src/__tests__/integration/learning-flow/complete-learning-cycle.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { setupTestEnvironment } from '../../setup/test-setup';
import { AIEngine } from '@/engine/AIEngine';
import * as mocks from '../../setup/mocks/shared-mocks';

describe('Complete Learning Cycle', () => {
  let engine: AIEngine;

  beforeEach(() => {
    setupTestEnvironment();
    engine = new AIEngine();
  });

  it('should complete full learning cycle', async () => {
    // 1. Initial Assessment
    const assessment = await engine.assessmentPath.conductAssessment(
      mocks.mockLearnerProfile
    );

    // 2. Generate Learning Path
    const learningPath = await engine.projectManager.createLearningPath(
      assessment
    );

    // 3. Create Learning Materials
    const materials = await engine.progressiveLearning.generateMaterials(
      learningPath.firstModule
    );

    // 4. Process Code Submission
    const evaluation = await engine.evaluation.processSubmission(
      mocks.mockCodeSubmission
    );

    // Verify complete flow
    expect(assessment).toBeDefined();
    expect(learningPath.modules).toHaveLength(1);
    expect(materials).toBeDefined();
    expect(evaluation.feedback).toBeDefined();
  });
});
```

## Individual Agent Testing

```typescript
// src/__tests__/agents/code-expert/code-expert.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { setupTestEnvironment } from '../../setup/test-setup';
import { CodeExpertChain } from '@/agents/code-expert/codeExpertChain';
import * as mocks from '../../setup/mocks/shared-mocks';

describe('CodeExpertChain', () => {
  let codeExpert: CodeExpertChain;

  beforeEach(() => {
    setupTestEnvironment();
    codeExpert = new CodeExpertChain();
  });

  it('should analyze code', async () => {
    const analysis = await codeExpert.analyzeCode(
      mocks.mockCodeSubmission
    );
    expect(analysis.quality).toBeDefined();
  });
});
```

## Key Testing Principles

1. **Shared Resources**
   - Use common mocks and fixtures
   - Share test utilities
   - Maintain consistent setup

2. **Integration First**
   - Focus on complete flows
   - Test agent interactions
   - Verify system behavior

3. **Individual Agent Tests**
   - Specific functionality
   - Error cases
   - Edge scenarios

## Test Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./src/__tests__/setup/test-setup.ts'],
    include: ['src/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/agents/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/__tests__/**']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

## Running Tests

```bash
# Run all tests
npm test

# Run integration tests only
npm test src/__tests__/integration

# Run specific agent tests
npm test src/__tests__/agents/code-expert

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

## LangChain Setup

```typescript
// src/__tests__/setup/langchain-setup.ts
import { ChatOpenAI } from 'langchain/chat_models';
import { HumanMessage, SystemMessage } from 'langchain/schema';

export function setupLangChain() {
  // Setup mock LangChain responses
  vi.mock('langchain/chat_models', () => ({
    ChatOpenAI: vi.fn(() => ({
      call: vi.fn().mockResolvedValue({
        content: 'Mocked AI response'
      })
    }))
  }));
}
```

## Test Guidelines

1. **Structure**
   - Keep tests in `__tests__` directory
   - Mirror source directory structure
   - Use descriptive file names

2. **Organization**
   - Integration tests first
   - Agent-specific tests second
   - Shared resources in setup

3. **Patterns**
   - Use beforeEach for setup
   - Clear mocks between tests
   - Consistent naming

4. **Coverage**
   - Focus on full flows
   - Test edge cases
   - Verify error handling

5. **Maintenance**
   - Keep mocks updated
   - Maintain shared utilities
   - Document test patterns

## Example Test Flow

```typescript
// src/__tests__/integration/learning-flow/resource-learning.test.ts
describe('Resource Learning Flow', () => {
  it('should provide complete learning experience', async () => {
    // 1. Setup
    const engine = new AIEngine();
    
    // 2. Initial learning path
    const path = await engine.assessmentPath.createPath(
      mocks.mockLearnerProfile
    );
    
    // 3. Get resources
    const resources = await engine.resource.getResources(
      path.currentTopic
    );
    
    // 4. Create tutorial
    const tutorial = await engine.progressiveLearning.createTutorial(
      resources[0]
    );
    
    // 5. Evaluate understanding
    const assessment = await engine.evaluation.assessUnderstanding(
      mocks.mockSubmission
    );

    // Verify complete flow
    expect(path).toBeDefined();
    expect(resources).toHaveLength(1);
    expect(tutorial.steps).toBeDefined();
    expect(assessment.mastery).toBeDefined();
  });
});
```