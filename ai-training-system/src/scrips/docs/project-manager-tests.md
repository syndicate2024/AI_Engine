# Project Manager Test Implementation

## 1. Unit Tests
```typescript
// src/agents/projectManager/chains/__tests__/projectManagerChain.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProjectManagerChain } from '../projectManagerChain';
import { LearningPath, ProjectContext, Strategy } from '@/types';
import { mockLearningPath } from '@/test/setup';

describe('ProjectManagerChain Unit Tests', () => {
  let projectManagerChain: ProjectManagerChain;

  beforeEach(() => {
    vi.clearAllMocks();
    projectManagerChain = new ProjectManagerChain();
  });

  describe('Learning Path Generation', () => {
    it('should generate optimized learning path', async () => {
      const context = {
        currentSkills: ['javascript', 'react-basics'],
        goals: ['fullstack-development'],
        timeframe: '3 months'
      };

      const path = await projectManagerChain.generatePath(context);
      expect(path.modules).toHaveLength(1);
      expect(path.estimatedDuration).toBe('3 months');
      expect(path.milestones).toBeDefined();
    });

    it('should adapt to skill level', async () => {
      const beginnerContext = {
        currentSkills: ['html', 'css'],
        goals: ['javascript'],
        timeframe: '1 month'
      };

      const beginnerPath = await projectManagerChain.generatePath(beginnerContext);
      expect(beginnerPath.difficulty).toBe('beginner');
      expect(beginnerPath.prerequisites).toHaveLength(0);
    });
  });

  describe('Progress Tracking', () => {
    it('should track learning progress', async () => {
      const progress = {
        completedModules: ['js-basics', 'js-advanced'],
        assessmentScores: [85, 90],
        timeSpent: '2 weeks'
      };

      const analysis = await projectManagerChain.analyzeProgress(progress);
      expect(analysis.status).toBe('on-track');
      expect(analysis.recommendations).toHaveLength(1);
    });

    it('should detect learning gaps', async () => {
      const progress = {
        completedModules: ['react-basics'],
        assessmentScores: [60],
        strugglingTopics: ['hooks']
      };

      const analysis = await projectManagerChain.analyzeProgress(progress);
      expect(analysis.gaps).toContain('hooks');
      expect(analysis.remediation).toBeDefined();
    });
  });

  describe('Resource Allocation', () => {
    it('should allocate learning resources', async () => {
      const learner = {
        pace: 'fast',
        availability: '20hrs/week',
        preferences: ['video', 'practice']
      };

      const allocation = await projectManagerChain.allocateResources(learner);
      expect(allocation.schedule).toBeDefined();
      expect(allocation.resources).toHaveLength(1);
    });

    it('should optimize resource distribution', async () => {
      const constraints = {
        timeLimit: '4 weeks',
        priority: ['essential', 'practical']
      };

      const optimization = await projectManagerChain.optimizeAllocation(constraints);
      expect(optimization.distribution).toBeDefined();
      expect(optimization.efficiency).toBeGreaterThan(0.8);
    });
  });

  describe('Agent Coordination', () => {
    it('should coordinate AI agents', async () => {
      const task = {
        type: 'code-review',
        complexity: 'high',
        deadline: '2 days'
      };

      const coordination = await projectManagerChain.coordinateAgents(task);
      expect(coordination.assignments).toBeDefined();
      expect(coordination.timeline).toMatch(/\d+ hours/);
    });

    it('should handle agent failures', async () => {
      vi.spyOn(projectManagerChain['codeExpert'], 'analyze')
        .mockRejectedValueOnce(new Error('Agent Error'));

      const task = {
        type: 'code-review',
        priority: 'high'
      };

      const coordination = await projectManagerChain.coordinateAgents(task);
      expect(coordination.status).toBe('reassigned');
      expect(coordination.fallback).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid learning paths', async () => {
      const invalidContext = {
        currentSkills: [],
        goals: ['invalid-goal']
      };

      await expect(projectManagerChain.generatePath(invalidContext))
        .rejects.toThrow('Invalid learning goal');
    });

    it('should handle API failures', async () => {
      vi.spyOn(projectManagerChain['openai'].chat.completions, 'create')
        .mockRejectedValueOnce(new Error('API Error'));

      await expect(projectManagerChain.generatePath(mockLearningPath))
        .rejects.toThrow('API Error');
    });
  });
});
```

## 2. Integration Tests
```typescript
// src/agents/projectManager/chains/__tests__/projectManagerChain.integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { ProjectManagerChain } from '../projectManagerChain';
import { LearningContext, AgentTask } from '@/types';

describe('ProjectManagerChain Integration Tests', () => {
  let projectManagerChain: ProjectManagerChain;

  beforeEach(() => {
    projectManagerChain = new ProjectManagerChain();
  });

  describe('Complete Learning Journey', () => {
    it('should manage full learning cycle', async () => {
      const context = {
        learner: {
          skills: ['javascript'],
          goals: ['fullstack'],
          availability: '20hrs/week'
        },
        duration: '3 months'
      };

      const path = await projectManagerChain.generatePath(context);
      const firstModule = await projectManagerChain.startModule(path.modules[0]);
      const progress = await projectManagerChain.trackProgress(firstModule);
      
      expect(path.modules).toBeDefined();
      expect(firstModule.status).toBe('in-progress');
      expect(progress.metrics).toBeDefined();
    });

    it('should adapt to learning speed', async () => {
      const context = {
        learner: {
          skills: ['react'],
          pace: 'fast',
          completedModules: ['react-basics']
        }
      };

      const adaptation = await projectManagerChain.adaptPath(context);
      
      expect(adaptation.newPath).toBeDefined();
      expect(adaptation.adjustments).toContain('accelerated');
      expect(adaptation.nextModules).toHaveLength(1);
    });
  });

  describe('Agent Collaboration', () => {
    it('should coordinate multiple agents effectively', async () => {
      const task: AgentTask = {
        type: 'project-review',
        requirements: ['code-quality', 'learning-progress'],
        deadline: '24h'
      };

      const coordination = await projectManagerChain.orchestrateAgents(task);
      const results = await Promise.all(coordination.tasks.map(t => t.execute()));
      
      expect(results).toHaveLength(2);
      expect(coordination.status).toBe('completed');
    });

    it('should handle agent dependencies', async () => {
      const task = {
        primary: 'code-review',
        dependent: 'learning-assessment',
        sequence: 'sequential'
      };

      const workflow = await projectManagerChain.createWorkflow(task);
      expect(workflow.steps).toHaveLength(2);
      expect(workflow.dependencies).toBeDefined();
    });
  });

  describe('Resource Management', () => {
    it('should manage resource allocation across learning path', async () => {
      const resources = {
        tutors: ['code-expert', 'visual-ai'],
        materials: ['documentation', 'exercises'],
        timeSlots: ['morning', 'evening']
      };

      const allocation = await projectManagerChain.manageResources(resources);
      expect(allocation.schedule).toBeDefined();
      expect(allocation.conflicts).toEqual([]);
    });

    it('should optimize resource utilization', async () => {
      const usage = {
        current: {
          tutors: 0.7,
          materials: 0.5
        },
        target: 0.9
      };

      const optimization = await projectManagerChain.optimizeUsage(usage);
      expect(optimization.efficiency).toBeGreaterThan(usage.current.tutors);
      expect(optimization.recommendations).toBeDefined();
    });
  });
});
```

## Test Coverage Areas
1. Learning Path Management
   - Path generation
   - Adaptation
   - Milestone tracking
   - Progress analysis

2. Resource Management
   - Allocation
   - Optimization
   - Scheduling
   - Conflict resolution

3. Agent Coordination
   - Task distribution
   - Workflow management
   - Dependency handling
   - Error recovery

4. Progress Tracking
   - Metrics collection
   - Performance analysis
   - Gap detection
   - Adaptation triggers

5. Error Handling
   - Invalid inputs
   - API failures
   - Resource conflicts
   - Agent failures

6. Integration Testing
   - Full learning cycles
   - Multi-agent coordination
   - Resource optimization
   - System adaptation

## Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test src/agents/projectManager/chains/__tests__/projectManagerChain.test.ts

# Run with coverage
npm test -- --coverage
```