# Backend Integration Architecture

## Core Engine Integration

```typescript
// src/engine/AIEngine.ts

export class AIEngine {
  private codeExpert: CodeExpertChain;
  private visualAI: VisualAIChain;
  private projectManager: ProjectManagerChain;
  private cache: Cache;

  constructor(config: AIEngineConfig) {
    this.codeExpert = new CodeExpertChain(config.models.codeExpert);
    this.visualAI = new VisualAIChain(config.models.visualAI);
    this.projectManager = new ProjectManagerChain(config.models.projectManager);
    this.cache = new Cache(config.cache);
  }

  async analyzeCode(code: string): Promise<AnalysisResult> {
    const cacheKey = `code:${hash(code)}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const analysis = await this.codeExpert.analyzeCode({ code });
    await this.cache.set(cacheKey, analysis);
    return analysis;
  }

  async generateVisualization(request: VisRequest): Promise<Visual> {
    return this.visualAI.generateDiagram(request);
  }

  async processLearningStep(userId: string): Promise<LearningStep> {
    return this.projectManager.getNextStep(userId);
  }
}

// src/engine/types.ts
export interface AIEngineConfig {
  models: {
    codeExpert: ModelConfig;
    visualAI: ModelConfig;
    projectManager: ModelConfig;
  };
  cache: CacheConfig;
}
```

## Express Server Setup

```typescript
// src/server/index.ts

import express from 'express';
import { AIEngine } from '../engine/AIEngine';
import { errorHandler } from './middleware/error';
import { rateLimiter } from './middleware/rateLimiter';
import { auth } from './middleware/auth';

const app = express();
const engine = new AIEngine({
  models: {
    codeExpert: { /* config */ },
    visualAI: { /* config */ },
    projectManager: { /* config */ }
  },
  cache: { /* config */ }
});

app.use(express.json());
app.use(rateLimiter);
app.use(auth);

// Routes
app.post('/api/code-expert/analyze', async (req, res) => {
  const { code } = req.body;
  const analysis = await engine.analyzeCode(code);
  res.json(analysis);
});

app.post('/api/visual/generate', async (req, res) => {
  const visual = await engine.generateVisualization(req.body);
  res.json(visual);
});

app.get('/api/learning/:userId/next', async (req, res) => {
  const { userId } = req.params;
  const step = await engine.processLearningStep(userId);
  res.json(step);
});

app.use(errorHandler);

// src/server/middleware/error.ts
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
};
```

## Database Integration

```typescript
// src/db/index.ts

export class Database {
  private client: MongoClient;
  
  constructor(config: DBConfig) {
    this.client = new MongoClient(config.uri);
  }

  async connect() {
    await this.client.connect();
  }

  async saveAnalysis(analysis: CodeAnalysis): Promise<void> {
    const collection = this.client.db().collection('analyses');
    await collection.insertOne({
      ...analysis,
      timestamp: new Date()
    });
  }

  async getLearningProgress(userId: string): Promise<Progress> {
    const collection = this.client.db().collection('progress');
    return collection.findOne({ userId });
  }
}
```

## Queue System

```typescript
// src/queue/index.ts

export class QueueSystem {
  private queue: Bull.Queue;
  
  constructor(config: QueueConfig) {
    this.queue = new Bull('ai-tasks', {
      redis: config.redis
    });
    
    this.setupWorkers();
  }

  private setupWorkers() {
    this.queue.process('analyze', async (job) => {
      const { code } = job.data;
      // Process analysis job
    });

    this.queue.process('visualize', async (job) => {
      const { request } = job.data;
      // Process visualization job
    });
  }

  async queueAnalysis(code: string): Promise<string> {
    const job = await this.queue.add('analyze', { code });
    return job.id;
  }

  async queueVisualization(request: VisRequest): Promise<string> {
    const job = await this.queue.add('visualize', { request });
    return job.id;
  }
}
```

## Logging and Monitoring

```typescript
// src/monitoring/index.ts

export class Monitoring {
  private metrics: MetricsClient;
  private logger: Logger;

  constructor(config: MonitoringConfig) {
    this.metrics = new MetricsClient(config.metrics);
    this.logger = new Logger(config.logging);
  }

  logAnalysis(analysis: CodeAnalysis) {
    this.logger.info('Code analysis completed', {
      timestamp: new Date(),
      complexity: analysis.complexity,
      issues: analysis.issues.length
    });

    this.metrics.increment('analyses_completed');
    this.metrics.gauge('analysis_complexity', analysis.complexity);
  }

  async getMetrics(): Promise<Metrics> {
    return this.metrics.collect();
  }
}
```

## Configuration

```typescript
// src/config/index.ts

export const config = {
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost'
  },
  ai: {
    models: {
      codeExpert: {
        model: process.env.CODE_EXPERT_MODEL,
        temperature: 0.3
      },
      visualAI: {
        model: process.env.VISUAL_AI_MODEL,
        temperature: 0.2
      },
      projectManager: {
        model: process.env.PROJECT_MANAGER_MODEL,
        temperature: 0.4
      }
    }
  },
  database: {
    uri: process.env.MONGODB_URI,
    options: {
      retryWrites: true,
      w: 'majority'
    }
  },
  queue: {
    redis: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379')
    }
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600'),
    max: parseInt(process.env.CACHE_MAX || '1000')
  },
  monitoring: {
    metrics: {
      provider: process.env.METRICS_PROVIDER || 'prometheus',
      endpoint: process.env.METRICS_ENDPOINT
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      format: process.env.LOG_FORMAT || 'json'
    }
  }
};

// src/server/app.ts
import express from 'express';
import { config } from '../config';
import { AIEngine } from '../engine/AIEngine';
import { Database } from '../db';
import { QueueSystem } from '../queue';
import { Monitoring } from '../monitoring';

export async function createApp() {
  const db = new Database(config.database);
  await db.connect();

  const queue = new QueueSystem(config.queue);
  const monitoring = new Monitoring(config.monitoring);
  const engine = new AIEngine(config.ai);

  const app = express();
  app.use(express.json());

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Metrics endpoint
  app.get('/metrics', async (req, res) => {
    const metrics = await monitoring.getMetrics();
    res.json(metrics);
  });

  // AI endpoints with queue integration
  app.post('/api/code-expert/analyze', async (req, res) => {
    const jobId = await queue.queueAnalysis(req.body.code);
    res.json({ jobId });
  });

  app.get('/api/jobs/:jobId', async (req, res) => {
    const result = await queue.getJobResult(req.params.jobId);
    res.json(result);
  });

  return app;
}

// src/index.ts
import { createApp } from './server/app';
import { config } from './config';

async function start() {
  try {
    const app = await createApp();
    app.listen(config.server.port, () => {
      console.log(`Server running on port ${config.server.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();