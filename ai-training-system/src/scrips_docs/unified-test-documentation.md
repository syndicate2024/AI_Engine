# @ai-protected
# Unified Test Documentation
Last Updated: 2024-12-11 14:30 EST

## Current Implementation Status
Last Verified: 2024-12-11 14:00 EST

### Current Project Root Structure
```
ai-orchestration-engine/
├── src/
│   ├── agents/                  # All agent implementations
│   └── config/                  # Configuration files
│
└── tests/                       # Single source of truth for ALL tests
    ├── __setup__/              # Test setup and configuration
    ├── __mocks__/              # Shared mocks for all tests
    ├── __fixtures__/           # Test data and fixtures
    ├── unit/                   # All unit tests
    ├── integration/            # All integration tests
    └── e2e/                    # End-to-end tests
```

### Detailed Test Directory Structure (Implemented)
```
tests/
├── __setup__/
│   ├── jest.setup.ts           # Jest configuration
│   ├── test-env.ts             # Test environment setup
│   └── global-setup.ts         # Global test setup
│
├── __mocks__/
│   ├── langchain.ts            # LangChain mocks
│   ├── openai.ts               # OpenAI mocks
│   └── shared-mocks.ts         # Common mocks
│
├── __fixtures__/
│   ├── learner-profiles.ts     # Test learner data
│   ├── code-samples.ts         # Test code samples
│   └── test-responses.ts       # Mock API responses
│
├── unit/
│   ├── agents/
│   │   ├── code-expert/
│   │   │   └── code-expert-chain.test.ts
│   │   ├── project-manager/
│   │   │   └── project-manager-chain.test.ts
│   │   ├── visual-ai/
│   │   │   └── visual-ai-chain.test.ts
│   │   ├── tutor/
│   │   │   └── tutor-chain.test.ts
│   │   ├── assessment-path/
│   │   │   └── assessment-path-chain.test.ts
│   │   ├── progressive-learning/
│   │   │   └── progressive-learning-chain.test.ts
│   │   ├── resource/
│   │   │   └── resource-chain.test.ts
│   │   └── evaluation/
│   │       └── evaluation-chain.test.ts
│   └── config/
│       └── config.test.ts
│
└── integration/
    ├── workflows/
    │   ├── learning-path.test.ts
    │   ├── code-evaluation.test.ts
    │   └── resource-management.test.ts
    └── agent-integration/
        ├── tutor-code-expert.test.ts
        ├── assessment-progress.test.ts
        └── visual-resource.test.ts
```

## Test Implementation Guidelines
Last Updated: 2024-12-11 14:05 EST

### File Naming Convention
- All test files must end with `.test.ts`
- Name should clearly indicate what's being tested
- Follow pattern: `[feature]-[type].test.ts`

### Test File Structure Example
```typescript
// tests/unit/agents/code-expert/code-expert-chain.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { CodeExpertChain } from '@/agents/code-expert/code-expert-chain';
import { mockLearnerProfile } from '../../../__mocks__/shared-mocks';
import { setupTestEnv } from '../../../__setup__/test-env';

describe('CodeExpertChain', () => {
  let codeExpert: CodeExpertChain;

  beforeEach(() => {
    setupTestEnv();
    codeExpert = new CodeExpertChain();
  });

  // Tests go here...
});
```

### Integration Test Example
```typescript
// tests/integration/workflows/learning-path.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { setupIntegrationTest } from '../../__setup__/test-env';
import { AIEngine } from '@/engine/ai-engine';
import { mockLearnerProfile } from '../../__mocks__/shared-mocks';

describe('Learning Path Integration', () => {
  let engine: AIEngine;

  beforeEach(() => {
    setupIntegrationTest();
    engine = new AIEngine();
  });

  // Integration tests go here...
});
```

## Key Implementation Points
1. NO tests should be placed in `src/` directory
2. ALL tests go in the `tests/` directory
3. Each agent gets its own subdirectory in `unit/agents/`
4. Integration tests focus on agent interactions
5. Mocks and fixtures are shared across all tests

## Protection Rules
- All test specification files are marked as @ai-protected
- Test structure should not be modified without documentation
- Changes to test patterns require team review
- Core test utilities in __setup__ are protected

## Complete Test Implementation Details
Last Updated: 2024-12-11 14:30 EST

### Integration Test Examples

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

### Individual Agent Testing

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

### Example Test Flow

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

## Test Setup Script
```typescript
// scripts/setup-test-structure.ts
import fs from 'fs-extra';
import path from 'path';

const projectRoot = process.cwd();
const testsDir = path.join(projectRoot, 'tests');

// Base directory structure
const directories = [
  '__setup__',
  '__mocks__',
  '__fixtures__',
  'unit/agents/code-expert',
  'unit/agents/project-manager',
  'unit/agents/visual-ai',
  'unit/agents/tutor',
  'unit/agents/assessment-path',
  'unit/agents/progressive-learning',
  'unit/agents/resource',
  'unit/agents/evaluation',
  'unit/config',
  'integration/workflows',
  'integration/agent-integration',
  'e2e'
].map(dir => path.join(testsDir, dir));

// Base test files
const baseFiles = {
  // Setup files
  '__setup__/jest.setup.ts': `
import { vi } from 'vitest'
import '@testing-library/jest-dom'

// Global test setup
beforeEach(() => {
  vi.clearAllMocks()
})
  `,
  '__setup__/test-env.ts': `
import { vi } from 'vitest'
import { setupLangChain } from '../__mocks__/langchain'
import { setupOpenAI } from '../__mocks__/openai'

export function setupTestEnv() {
  vi.clearAllMocks()
  setupLangChain()
  setupOpenAI()
}

export function setupIntegrationTest() {
  setupTestEnv()
  // Additional integration setup
}
  `,
  
  // Mock files
  '__mocks__/langchain.ts': `
import { vi } from 'vitest'

export const setupLangChain = () => {
  vi.mock('langchain/chat_models', () => ({
    ChatOpenAI: vi.fn(() => ({
      call: vi.fn().mockResolvedValue({
        content: 'Mocked AI response'
      })
    }))
  }))
}
  `,
  '__mocks__/openai.ts': `
import { vi } from 'vitest'

export const setupOpenAI = () => {
  vi.mock('openai', () => ({
    OpenAI: vi.fn(() => ({
      createChatCompletion: vi.fn().mockResolvedValue({
        choices: [{ message: { content: 'Mocked OpenAI response' } }]
      })
    }))
  }))
}
  `,
  '__mocks__/shared-mocks.ts': `
export const mockLearnerProfile = {
  id: 'test-learner',
  skillLevel: 'INTERMEDIATE',
  goals: ['fullstack-js']
}

export const mockCodeSubmission = {
  code: 'function test() { return true; }',
  language: 'javascript'
}
  `
};

// Implementation of createTestStructure function...
[Rest of the setup script implementation]

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

### 1. Structure
- Keep tests in `__tests__` directory
- Mirror source directory structure
- Use descriptive file names

### 2. Organization
- Integration tests first
- Agent-specific tests second
- Shared resources in setup

### 3. Patterns
- Use beforeEach for setup
- Clear mocks between tests
- Consistent naming

### 4. Coverage
- Focus on full flows
- Test edge cases
- Verify error handling

### 5. Maintenance
- Keep mocks updated
- Maintain shared utilities
- Document test patterns

## Change Log
- 2024-12-11 14:30 EST: Added all missing implementation details, examples, and setup scripts
- 2024-12-11 14:25 EST: Added complete test implementation details and setup scripts
- 2024-12-11 14:10 EST: Removed deprecated test documentation files
- 2024-12-11 14:05 EST: Initial unified test documentation created
- 2024-12-11 14:00 EST: Test directory structure implemented
- 2024-12-11 13:49 EST: Base test directories created