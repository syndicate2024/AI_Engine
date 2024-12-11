# @ai-protected
# Integration Agent Testing Guide

## Testing Status Checklist
- [ ] Basic Setup
  - [ ] Test environment configured
  - [ ] Dependencies installed
  - [ ] Mock data prepared

- [ ] Unit Tests
  - [ ] API Layer
    - [ ] Endpoint handling
    - [ ] Request validation
    - [ ] Response formatting
  - [ ] WebSocket Layer
    - [ ] Connection management
    - [ ] Event handling
    - [ ] Real-time updates
  - [ ] Authentication
    - [ ] Token validation
    - [ ] Permission checks
    - [ ] Rate limiting

- [ ] Integration Tests
  - [ ] Agent Communication
    - [ ] Request routing
    - [ ] Response handling
    - [ ] Error management
  - [ ] External Systems
    - [ ] API integrations
    - [ ] Data synchronization
    - [ ] State management
  - [ ] Security Tests
    - [ ] Authentication flows
    - [ ] Authorization rules
    - [ ] Data protection

- [ ] End-to-End Tests
  - [ ] Complete API flows
  - [ ] WebSocket scenarios
  - [ ] Security procedures

## Test Implementation Order
1. API Layer
   - Basic endpoints
   - Request handling
   - Response formatting

2. WebSocket Layer
   - Connection handling
   - Event system
   - Real-time updates

3. Authentication System
   - Token management
   - Permission system
   - Rate limiting

4. Integration Points
   - Agent communication
   - External systems
   - Security measures

## Overview
This document outlines the testing strategy and implementation for the Integration Agent.

## Test Structure
```
src/
  agents/
    integration/
      chains/
        __tests__/
          integrationAgentChain.test.ts        # Unit tests
          integrationAgentChain.integration.ts  # Integration tests
```

## Test Categories

### 1. Unit Tests
- **API Management**
  - Endpoint handling
  - Request validation
  - Response formatting

- **WebSocket System**
  - Connection management
  - Event handling
  - Real-time updates

- **Authentication**
  - Token validation
  - Permission checks
  - Rate limiting

### 2. Integration Tests
- **Agent Communication**
  - Request routing
  - Response handling
  - Error management

- **Real-world Scenarios**
  - API flows
  - WebSocket scenarios
  - Security procedures

## Running Tests
```powershell
# Run all integration agent tests
npm test src/agents/integration

# Run specific test file
npm test src/agents/integration/chains/__tests__/integrationAgentChain.test.ts

# Run with coverage
npm test src/agents/integration -- --coverage
```

## Test Implementation Guide

### Setting Up a Test
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IntegrationAgentChain } from '../integrationAgentChain';
import { APIRequest, WebSocketEvent } from '@/types';

describe('IntegrationAgentChain Tests', () => {
  let integrationAgentChain: IntegrationAgentChain;

  beforeEach(() => {
    vi.clearAllMocks();
    integrationAgentChain = new IntegrationAgentChain();
  });

  // Test cases go here
});
```

### Example Test Cases
```typescript
// API endpoint test
it('should handle API requests correctly', async () => {
  const request: APIRequest = {
    path: "/api/tutor/query",
    method: "POST",
    body: {
      query: "What is a variable?",
      skillLevel: "BEGINNER"
    }
  };

  const response = await integrationAgentChain.handleAPIRequest(request);
  
  expect(response).toMatchObject({
    status: 200,
    data: expect.any(Object),
    headers: expect.any(Object)
  });
});

// WebSocket test
it('should manage WebSocket connections', async () => {
  const event: WebSocketEvent = {
    type: "CONNECTION",
    clientId: "client123",
    data: { auth: "token123" }
  };

  const result = await integrationAgentChain.handleWSEvent(event);
  
  expect(result).toMatchObject({
    success: true,
    connectionId: expect.any(String),
    status: "CONNECTED"
  });
});
```

## Mocking Guide

### System Mocks
```typescript
// Mock API handler
vi.spyOn(integrationAgentChain['api'], 'processRequest')
  .mockResolvedValueOnce({
    status: 200,
    data: { message: "Success" }
  });

// Mock WebSocket handler
vi.spyOn(integrationAgentChain['ws'], 'handleConnection')
  .mockResolvedValueOnce({
    connected: true,
    sessionId: "session123"
  });
```

## Coverage Requirements
- Minimum 85% line coverage
- 100% coverage of API endpoints
- All WebSocket events tested
- Integration tests for security

## Best Practices
1. Test all endpoints
2. Verify WebSocket flows
3. Test authentication
4. Mock external services
5. Validate responses
6. Test rate limiting
7. Verify security

## Debugging Tests
- Log API requests
- Monitor WebSocket events
- Check authentication
- Validate responses 