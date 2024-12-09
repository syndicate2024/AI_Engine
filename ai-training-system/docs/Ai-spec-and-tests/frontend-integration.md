# Frontend Integration Architecture

## API Layer

```typescript
// src/api/AIEngine.ts

export interface APIConfig {
  aiEngineUrl: string;
  timeout?: number;
  retryAttempts?: number;
}

export class AIEngineAPI {
  private baseUrl: string;
  private timeout: number;
  private retryAttempts: number;

  constructor(config: APIConfig) {
    this.baseUrl = config.aiEngineUrl;
    this.timeout = config.timeout || 30000;
    this.retryAttempts = config.retryAttempts || 3;
  }

  async analyzeCode(code: string): Promise<CodeAnalysis> {
    return this.post('/api/code-expert/analyze', { code });
  }

  async generateVisualization(request: VisualizationRequest): Promise<Visual> {
    return this.post('/api/visual/generate', request);
  }

  async getNextLearningStep(userId: string): Promise<LearningStep> {
    return this.get(`/api/learning/${userId}/next`);
  }

  async updateLearningProgress(userId: string, progress: Progress): Promise<void> {
    return this.put(`/api/learning/${userId}/progress`, progress);
  }

  private async request(path: string, options: RequestInit): Promise<any> {
    let attempt = 0;
    while (attempt < this.retryAttempts) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(`${this.baseUrl}${path}`, {
          ...options,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        attempt++;
        if (attempt === this.retryAttempts) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  private post(path: string, body: any) {
    return this.request(path, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  private get(path: string) {
    return this.request(path, { method: 'GET' });
  }

  private put(path: string, body: any) {
    return this.request(path, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }
}

// src/api/types.ts
export interface CodeAnalysis {
  issues: CodeIssue[];
  suggestions: Suggestion[];
  complexity: number;
  security: SecurityIssue[];
}

export interface VisualizationRequest {
  code?: string;
  type: VisualizationType;
  options?: VisualizationOptions;
}

export interface LearningStep {
  id: string;
  type: StepType;
  content: any;
  requirements: string[];
  estimatedTime: number;
}
```

## Service Layer

```typescript
// src/services/AIService.ts

export class AIService {
  private api: AIEngineAPI;
  private eventEmitter: EventEmitter;

  constructor(config: AIServiceConfig) {
    this.api = new AIEngineAPI({
      aiEngineUrl: config.aiEngineUrl,
      timeout: config.timeout,
      retryAttempts: config.retryAttempts
    });
    this.eventEmitter = new EventEmitter();
  }

  async processUserCode(
    code: string,
    options: ProcessOptions = {}
  ): Promise<ProcessedResult> {
    this.eventEmitter.emit('processStart', { code });

    try {
      const [analysis, visualization] = await Promise.all([
        this.api.analyzeCode(code),
        this.api.generateVisualization({ code, type: options.visualType })
      ]);

      const nextStep = await this.api.getNextLearningStep(
        options.userId
      );

      const result = { analysis, visualization, nextStep };
      this.eventEmitter.emit('processComplete', result);
      return result;
    } catch (error) {
      this.eventEmitter.emit('processError', error);
      throw error;
    }
  }

  async updateProgress(
    userId: string,
    progress: Progress
  ): Promise<void> {
    await this.api.updateLearningProgress(userId, progress);
  }

  onProcessStart(callback: (data: any) => void) {
    this.eventEmitter.on('processStart', callback);
  }

  onProcessComplete(callback: (result: ProcessedResult) => void) {
    this.eventEmitter.on('processComplete', callback);
  }

  onProcessError(callback: (error: Error) => void) {
    this.eventEmitter.on('processError', callback);
  }
}
```

## React Integration

```typescript
// src/hooks/useAIService.ts

export function useAIService() {
  const aiService = useMemo(() => new AIService({
    aiEngineUrl: process.env.NEXT_PUBLIC_AI_ENGINE_URL,
    timeout: 30000,
    retryAttempts: 3
  }), []);

  useEffect(() => {
    const handleError = (error: Error) => {
      console.error('AI Service Error:', error);
      // Handle error (e.g., show toast notification)
    };

    aiService.onProcessError(handleError);
    return () => {
      // Cleanup listeners
    };
  }, [aiService]);

  return aiService;
}

// src/components/CodeEditor.tsx
export function CodeEditor() {
  const aiService = useAIService();
  const [code, setCode] = useState('');
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<ProcessedResult | null>(null);

  async function handleCodeSubmit() {
    try {
      setProcessing(true);
      const result = await aiService.processUserCode(code, {
        userId: getCurrentUserId(),
        visualType: 'code-flow'
      });
      setResults(result);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="code-editor">
      <MonacoEditor
        value={code}
        onChange={setCode}
        language="typescript"
      />
      <Button 
        onClick={handleCodeSubmit}
        loading={processing}
      >
        Analyze Code
      </Button>
      {results && (
        <ResultsPanel results={results} />
      )}
    </div>
  );
}
```

## Next.js API Routes

```typescript
// app/api/ai/[...path]/route.ts

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(
  req: Request,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const aiEngineUrl = process.env.AI_ENGINE_URL;
  
  try {
    const headersList = headers();
    const response = await fetch(`${aiEngineUrl}/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': headersList.get('Authorization') || '',
      },
      body: await req.text()
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error(`Error proxying to AI engine: ${error}`);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { path: string[] } }
) {
  // Similar to POST handler
}

export async function PUT(
  req: Request,
  { params }: { params: { path: string[] } }
) {
  // Similar to POST handler
}
```
