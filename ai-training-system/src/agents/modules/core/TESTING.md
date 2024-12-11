# @ai-protected
# Core Agent Testing Guide

## Testing Status Checklist
- [ ] Basic Setup
  - [ ] Test environment configured
  - [ ] Dependencies installed
  - [ ] Mock data prepared

- [ ] Unit Tests
  - [ ] Agent Management
    - [ ] Agent initialization
    - [ ] State management
    - [ ] Configuration handling
  - [ ] Message Routing
    - [ ] Message validation
    - [ ] Route resolution
    - [ ] Error handling
  - [ ] System Integration
    - [ ] OpenAI integration
    - [ ] Database connections
    - [ ] External services

- [ ] Integration Tests
  - [ ] Agent Communication
    - [ ] Inter-agent messaging
    - [ ] State synchronization
    - [ ] Event handling
  - [ ] System Operations
    - [ ] Startup sequence
    - [ ] Shutdown handling
    - [ ] Error recovery
  - [ ] Performance Tests
    - [ ] Load handling
    - [ ] Concurrency
    - [ ] Resource usage

- [ ] End-to-End Tests
  - [ ] System flows
  - [ ] Error scenarios
  - [ ] Recovery procedures

## Test Implementation Order
1. Agent Management
   - Basic initialization
   - Configuration handling
   - State management

2. Message System
   - Message routing
   - Validation rules
   - Error handling

3. System Integration
   - Service connections
   - Data persistence
   - External APIs

4. Performance Testing
   - Load testing
   - Stress testing
   - Recovery testing

## Overview
This document outlines the testing strategy and implementation for the Core Agent.

## Test Structure
```
src/
  agents/
    core/
      chains/
        __tests__/
          coreAgentChain.test.ts        # Unit tests
          coreAgentChain.integration.ts  # Integration tests
```

## Test Categories

### 1. Unit Tests
- **Agent Management**
  - Agent lifecycle
  - Configuration handling
  - State management

- **Message System**
  - Message routing
  - Validation
  - Error handling

- **System Integration**
  - Service connections
  - Data persistence
  - External APIs

### 2. Integration Tests
- **Agent Communication**
  - Inter-agent messaging
  - State synchronization
  - Event handling

- **Real-world Scenarios**
  - System operations
  - Error recovery
  - Performance testing

## Running Tests
```powershell
# Run all core agent tests
npm test src/agents/core

# Run specific test file
npm test src/agents/core/chains/__tests__/coreAgentChain.test.ts

# Run with coverage
npm test src/agents/core -- --coverage
```

## Test Implementation Guide

### Setting Up a Test
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CoreAgentChain } from '../coreAgentChain';
import { AgentConfig, SystemState } from '@/types';

describe('CoreAgentChain Tests', () => {
  let coreAgentChain: CoreAgentChain;

  beforeEach(() => {
    vi.clearAllMocks();
    coreAgentChain = new CoreAgentChain();
  });

  // Test cases go here
});
```

### Example Test Cases
```typescript
// Agent initialization test
it('should initialize agent correctly', async () => {
  const config: AgentConfig = {
    agentId: "core-1",
    settings: {
      messageTimeout: 5000,
      retryAttempts: 3
    }
  };

  const result = await coreAgentChain.initialize(config);
  
  expect(result).toMatchObject({
    initialized: true,
    status: "READY",
    config: expect.any(Object)
  });
});

// Message routing test
it('should route messages correctly', async () => {
  const message = {
    from: "tutor-agent",
    to: "assessment-agent",
    content: { type: "QUERY", data: {} }
  };

  const routingResult = await coreAgentChain.routeMessage(message);
  
  expect(routingResult).toMatchObject({
    delivered: true,
    route: expect.any(Array),
    timestamp: expect.any(Number)
  });
});
```

## Mocking Guide

### System Mocks
```typescript
// Mock system state
vi.spyOn(coreAgentChain['system'], 'getState')
  .mockResolvedValueOnce({
    agents: {
      "tutor-1": { status: "READY" },
      "assessment-1": { status: "READY" }
    },
    connections: [],
    resources: {}
  });

// Mock message broker
vi.spyOn(coreAgentChain['broker'], 'sendMessage')
  .mockResolvedValueOnce({
    sent: true,
    messageId: "msg123"
  });
```

## Coverage Requirements
- Minimum 90% line coverage
- 100% coverage of critical paths
- All message types tested
- Integration tests for system flows

## Best Practices
1. Test agent lifecycle
2. Verify message routing
3. Test error recovery
4. Mock system services
5. Validate state changes
6. Test performance
7. Verify cleanup

## Debugging Tests
- Log system state
- Monitor message flow
- Check resource usage
- Validate configurations
</rewritten_file> 