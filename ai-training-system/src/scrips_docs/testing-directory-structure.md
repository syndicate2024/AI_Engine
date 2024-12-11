# @ai-protected
# AI Engine Testing Directory Structure

## Project Root Structure
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

## Detailed Test Directory Structure
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

## Test File Naming Convention
- All test files must end with `.test.ts`
- Name should clearly indicate what's being tested
- Follow pattern: `[feature]-[type].test.ts`

## Key Points
1. NO tests should be placed in `src/` directory
2. ALL tests go in the `tests/` directory
3. Each agent gets its own subdirectory in `unit/agents/`
4. Integration tests focus on agent interactions
5. Mocks and fixtures are shared across all tests

## Example Test File Structure
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

## Integration Test Example
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

## Test Setup Example
```typescript
// tests/__setup__/test-env.ts

import { vi } from 'vitest';
import { setupLangChain } from '../__mocks__/langchain';
import { setupOpenAI } from '../__mocks__/openai';

export function setupTestEnv() {
  // Clear all mocks
  vi.clearAllMocks();
  
  // Setup test environment
  setupLangChain();
  setupOpenAI();
  
  // Additional setup as needed
}
```

## Important Notes
1. Never mix implementation and test code
2. Always use relative imports for test utilities
3. Keep tests close to what they're testing in the directory structure
4. Share common test utilities through `__setup__` and `__mocks__`
5. Use consistent patterns across all test files

## Migration Guide
If you currently have tests in multiple locations:

1. Create the new structure in `tests/`
2. Move ALL tests to their appropriate locations
3. Update import paths
4. Remove old test directories
5. Update test scripts in package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest tests/unit",
    "test:integration": "vitest tests/integration",
    "test:coverage": "vitest --coverage"
  }
}
```