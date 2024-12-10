# Code Expert Test Implementation

## 1. Unit Tests
```typescript
// src/agents/codeExpert/chains/__tests__/codeExpertChain.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CodeExpertChain } from '../codeExpertChain';
import { CodeAnalysis, FrameworkType, CodeContext } from '@/types';
import { mockCodeAnalysis } from '@/test/setup';

describe('CodeExpertChain Unit Tests', () => {
  let codeExpertChain: CodeExpertChain;

  beforeEach(() => {
    vi.clearAllMocks();
    codeExpertChain = new CodeExpertChain();
  });

  describe('Code Analysis', () => {
    it('should analyze code structure', async () => {
      const analysis: CodeAnalysis = {
        code: `
          function example() {
            return Promise.resolve('test');
          }
        `,
        context: {
          projectType: 'Node.js',
          frameworks: ['express']
        }
      };

      const result = await codeExpertChain.analyzeCode(analysis);
      expect(result.patterns).toBeDefined();
      expect(result.suggestions).toHaveLength(1);
      expect(result.securityIssues).toEqual([]);
    });

    it('should detect security vulnerabilities', async () => {
      const analysis: CodeAnalysis = {
        code: `
          app.get('/api', (req, res) => {
            eval(req.query.input);
          });
        `,
        context: {
          projectType: 'Node.js',
          frameworks: ['express']
        }
      };

      const result = await codeExpertChain.analyzeCode(analysis);
      expect(result.securityIssues).toHaveLength(1);
      expect(result.securityIssues[0]).toMatch(/eval.*security/i);
    });
  });

  describe('Framework Learning', () => {
    it('should learn new framework patterns', async () => {
      const framework = {
        name: 'Remix',
        version: '2.0.0',
        documentation: 'https://remix.run/docs'
      };

      const knowledge = await codeExpertChain.learnFramework(framework);
      expect(knowledge.patterns).toBeDefined();
      expect(knowledge.bestPractices).toHaveLength(1);
    });

    it('should detect framework usage', async () => {
      const code = `
        import { json } from '@remix-run/node';
        import { useLoaderData } from '@remix-run/react';
      `;

      const detection = await codeExpertChain.detectFramework(code);
      expect(detection.name).toBe('Remix');
      expect(detection.confidence).toBeGreaterThan(0.8);
    });
  });

  describe('Project Generation', () => {
    it('should generate project boilerplate', async () => {
      const spec = {
        type: 'web',
        framework: 'next',
        features: ['auth', 'api']
      };

      const project = await codeExpertChain.generateProject(spec);
      expect(project.files).toHaveLength(1);
      expect(project.dependencies).toContain('next');
    });

    it('should configure testing setup', async () => {
      const config = {
        framework: 'jest',
        coverage: true
      };

      const setup = await codeExpertChain.setupTesting(config);
      expect(setup.config).toMatch(/jest/);
      expect(setup.scripts).toContain('test:coverage');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid code gracefully', async () => {
      const analysis: CodeAnalysis = {
        code: 'const x =',
        context: { projectType: 'Node.js' }
      };

      await expect(codeExpertChain.analyzeCode(analysis))
        .rejects.toThrow('Invalid syntax');
    });

    it('should handle API failures', async () => {
      vi.spyOn(codeExpertChain['openai'].chat.completions, 'create')
        .mockRejectedValueOnce(new Error('API Error'));

      await expect(codeExpertChain.analyzeCode(mockCodeAnalysis))
        .rejects.toThrow('API Error');
    });
  });

  describe('Performance Analysis', () => {
    it('should identify performance issues', async () => {
      const code = `
        function slowFunction() {
          return new Array(1000000).fill(0).map(x => x + 1);
        }
      `;

      const analysis = await codeExpertChain.analyzePerformance(code);
      expect(analysis.issues).toHaveLength(1);
      expect(analysis.suggestions).toMatch(/memory.*usage/i);
    });
  });
});
```

## 2. Integration Tests
```typescript
// src/agents/codeExpert/chains/__tests__/codeExpertChain.integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { CodeExpertChain } from '../codeExpertChain';
import { CodeAnalysis, ProjectSpec } from '@/types';

describe('CodeExpertChain Integration Tests', () => {
  let codeExpertChain: CodeExpertChain;

  beforeEach(() => {
    codeExpertChain = new CodeExpertChain();
  });

  describe('Real Project Analysis', () => {
    it('should analyze complete React project', async () => {
      const projectFiles = [
        {
          path: 'src/App.tsx',
          content: `// React component code...`
        },
        {
          path: 'src/api/index.ts',
          content: `// API integration code...`
        }
      ];

      const analysis = await codeExpertChain.analyzeProject(projectFiles);
      expect(analysis.frameworks).toContain('react');
      expect(analysis.suggestions).toBeDefined();
    });

    it('should handle large codebases', async () => {
      const largeProject = Array(100).fill(0).map((_, i) => ({
        path: `src/component${i}.tsx`,
        content: `// Component ${i} code...`
      }));

      const analysis = await codeExpertChain.analyzeProject(largeProject);
      expect(analysis.performance).toBeDefined();
      expect(analysis.dependencies).toBeDefined();
    });
  });

  describe('Framework Integration', () => {
    it('should integrate with unknown frameworks', async () => {
      const customFramework = {
        name: 'CustomFramework',
        patterns: ['custom-framework'],
        api: { /* API docs */ }
      };

      await codeExpertChain.learnFramework(customFramework);
      const analysis = await codeExpertChain.analyzeCode({
        code: `import { Component } from 'custom-framework';`,
        context: { projectType: 'web' }
      });

      expect(analysis.frameworks).toContain('CustomFramework');
    });
  });

  describe('Project Generation Workflow', () => {
    it('should generate and analyze project', async () => {
      const spec: ProjectSpec = {
        type: 'fullstack',
        frontend: 'next',
        backend: 'express',
        database: 'postgres'
      };

      const project = await codeExpertChain.generateProject(spec);
      const analysis = await codeExpertChain.analyzeProject(project.files);

      expect(project.files).toBeDefined();
      expect(analysis.quality.score).toBeGreaterThan(0.8);
    });
  });
});
```

## Test Coverage Areas
1. Code Analysis
   - Structure analysis
   - Pattern detection
   - Security scanning
   - Performance analysis

2. Framework Learning
   - Pattern recognition
   - Best practices
   - Integration capabilities
   - Version management

3. Project Generation
   - Boilerplate creation
   - Testing setup
   - Configuration management
   - Dependency handling

4. Error Handling
   - Invalid inputs
   - API failures
   - Syntax errors
   - Resource limitations

5. Performance Testing
   - Code optimization
   - Resource usage
   - Scaling analysis
   - Bottleneck detection

6. Integration Testing
   - Framework detection
   - Project analysis
   - Multi-file processing
   - System interactions

## Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test src/agents/codeExpert/chains/__tests__/codeExpertChain.test.ts

# Run with coverage
npm test -- --coverage
```