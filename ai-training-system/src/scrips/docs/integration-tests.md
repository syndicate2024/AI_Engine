# Integration Tests

## Frontend Tests

```typescript
// src/api/__tests__/AIEngine.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AIEngineAPI } from '../AIEngine';
import { mockFetch } from '@/test/utils';

describe('AIEngineAPI', () => {
  let api: AIEngineAPI;

  beforeEach(() => {
    vi.clearAllMocks();
    api = new AIEngineAPI({
      aiEngineUrl: 'http://localhost:3000',
      timeout: 1000
    });
  });

  describe('API Calls', () => {
    it('should make code analysis request', async () => {
      const mockResponse = { issues: [], suggestions: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await api.analyzeCode('const x = 1;');
      expect(result).toEqual(mockResponse);
    });

    it('should handle timeouts', async () => {
      mockFetch.mockImplementationOnce(() => new Promise(resolve => {
        setTimeout(resolve, 2000);
      }));

      await expect(api.analyzeCode('const x = 1;')).rejects.toThrow('timeout');
    });

    it('should retry failed requests', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });

      const result = await api.analyzeCode('const x = 1;');
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});

// src/services/__tests__/AIService.test.ts
describe('AIService', () => {
  let service: AIService;

  beforeEach(() => {
    service = new AIService({
      aiEngineUrl: 'http://localhost:3000'
    });
  });

  it('should process code and emit events', async () => {
    const onStart = vi.fn();
    const onComplete = vi.fn();
    service.onProcessStart(onStart);
    service.onProcessComplete(onComplete);

    await service.processUserCode('const x = 1;');

    expect(onStart).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalled();
  });
});

// src/components/__tests__/CodeEditor.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CodeEditor } from '../CodeEditor';

describe('CodeEditor', () => {
  it('should submit code for analysis', async () => {
    render(<CodeEditor />);
    const editor = screen.getByRole('textbox');
    const button = screen.getByText('Analyze Code');

    fireEvent.change(editor, { target: { value: 'const x = 1;' } });
    fireEvent.click(button);

    expect(await screen.findByText('Loading...')).toBeInTheDocument();
    expect(await screen.findByTestId('results-panel')).toBeInTheDocument();
  });
});
```

## Backend Tests

```typescript
// src/engine/__tests__/AIEngine.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AIEngine } from '../AIEngine';

describe('AIEngine', () => {
  let engine: AIEngine;

  beforeEach(() => {
    engine = new AIEngine({
      models: {
        codeExpert: { temperature: 0.3 },
        visualAI: { temperature: 0.2 },
        projectManager: { temperature: 0.4 }
      },
      cache: { ttl: 3600 }
    });
  });

  it('should use cache for repeated analyses', async () => {
    const code = 'const x = 1;';
    const firstResult = await engine.analyzeCode(code);
    const secondResult = await engine.analyzeCode(code);

    expect(firstResult).toEqual(secondResult);
    expect(engine['codeExpert'].analyzeCode).toHaveBeenCalledTimes(1);
  });
});

// src/server/__tests__/app.test.ts
import request from 'supertest';
import { createApp } from '../app';

describe('Express App', () => {
  let app: Express.Application;

  beforeAll(async () => {
    app = await createApp();
  });

  it('should handle code analysis requests', async () => {
    const response = await request(app)
      .post('/api/code-expert/analyze')
      .send({ code: 'const x = 1;' });

    expect(response.status).toBe(200);
    expect(response.body.jobId).toBeDefined();
  });

  it('should rate limit excessive requests', async () => {
    const requests = Array(100).fill(0).map(() => 
      request(app)
        .post('/api/code-expert/analyze')
        .send({ code: 'const x = 1;' })
    );

    const responses = await Promise.all(requests);
    expect(responses.some(r => r.status === 429)).toBe(true);
  });
});

// src/queue/__tests__/QueueSystem.test.ts
describe('QueueSystem', () => {
  let queue: QueueSystem;

  beforeEach(async () => {
    queue = new QueueSystem({ redis: { host: 'localhost' } });
    await queue.clear();
  });

  it('should process analysis jobs', async () => {
    const jobId = await queue.queueAnalysis('const x = 1;');
    const result = await queue.getJobResult(jobId);
    
    expect(result.status).toBe('completed');
    expect(result.data).toBeDefined();
  });

  it('should handle failed jobs', async () => {
    vi.spyOn(queue['engine'], 'analyzeCode')
      .mockRejectedValueOnce(new Error('Analysis failed'));

    const jobId = await queue.queueAnalysis('const x = 1;');
    const result = await queue.getJobResult(jobId);
    
    expect(result.status).toBe('failed');
    expect(result.error).toBeDefined();
  });
});

// src/monitoring/__tests__/Monitoring.test.ts
describe('Monitoring', () => {
  let monitoring: Monitoring;

  beforeEach(() => {
    monitoring = new Monitoring({
      metrics: { provider: 'prometheus' },
      logging: { level: 'info' }
    });
  });

  it('should track analysis metrics', async () => {
    monitoring.logAnalysis({
      complexity: 5,
      issues: ['issue1', 'issue2']
    });

    const metrics = await monitoring.getMetrics();
    expect(metrics.analyses_completed).toBe(1);
    expect(metrics.analysis_complexity).toBe(5);
  });
});
```

## Test Coverage Areas

1. Frontend Integration
   - API calls and retries
   - Timeout handling
   - Event emission
   - UI component rendering
   - Error states
   - Loading states

2. Backend Integration
   - Engine coordination
   - Caching behavior
   - Queue processing
   - Rate limiting
   - Error handling
   - Metrics collection

## Running Tests

```bash
# Frontend tests
npm test src/api/__tests__
npm test src/services/__tests__
npm test src/components/__tests__

# Backend tests
npm test src/engine/__tests__
npm test src/server/__tests__
npm test src/queue/__tests__
npm test src/monitoring/__tests__

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test src/api/__tests__/AIEngine.test.ts
```