# @ai-protected
# Resource Agent Test Implementation

## 1. Unit Tests
```typescript
// src/agents/resource/__tests__/resourceChain.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ResourceChain } from '../resourceChain';
import { 
  Resource, 
  Topic, 
  LearnerProfile,
  Framework 
} from '@/types';
import { mockResource, mockLearnerProfile } from '@/test/setup';

describe('ResourceChain', () => {
  let resourceChain: ResourceChain;

  beforeEach(() => {
    vi.clearAllMocks();
    resourceChain = new ResourceChain();
  });

  describe('Resource Curation', () => {
    it('should curate topic-specific resources', async () => {
      const topic: Topic = {
        name: 'React Hooks',
        skillLevel: 'INTERMEDIATE',
        context: ['functional-programming', 'state-management']
      };

      const resources = await resourceChain.curateResources(topic);
      
      expect(resources).toHaveLength(1);
      expect(resources[0].type).toBeDefined();
      expect(resources[0].relevance).toBeGreaterThan(0.8);
      expect(resources[0].metadata.tags).toContain('react-hooks');
    });

    it('should adapt to skill level', async () => {
      const beginnerTopic = {
        name: 'JavaScript Basics',
        skillLevel: 'BEGINNER'
      };

      const advancedTopic = {
        name: 'JavaScript Basics',
        skillLevel: 'ADVANCED'
      };

      const beginnerResources = await resourceChain.curateResources(beginnerTopic);
      const advancedResources = await resourceChain.curateResources(advancedTopic);

      expect(beginnerResources[0].complexity).toBe('BEGINNER');
      expect(advancedResources[0].complexity).toBe('ADVANCED');
    });
  });

  describe('Knowledge Base Management', () => {
    it('should add new resources to knowledge base', async () => {
      const newResource: Resource = {
        title: 'Advanced React Patterns',
        url: 'https://example.com/react-patterns',
        type: 'ARTICLE',
        tags: ['react', 'patterns', 'advanced']
      };

      await resourceChain.addToKnowledgeBase(newResource);
      const kb = await resourceChain.getKnowledgeBase();
      
      expect(kb.resources).toContain(newResource);
      expect(kb.metadata.lastUpdated).toBeDefined();
    });

    it('should validate resources before adding', async () => {
      const invalidResource = {
        title: 'Invalid Resource',
        url: 'not-a-url'
      };

      await expect(resourceChain.addToKnowledgeBase(invalidResource))
        .rejects.toThrow('Invalid resource format');
    });
  });

  describe('Framework Updates', () => {
    it('should track framework updates', async () => {
      const framework: Framework = {
        name: 'Next.js',
        version: '13.0',
        features: ['app-router', 'server-components']
      };

      await resourceChain.trackFrameworkUpdate(framework);
      const updates = await resourceChain.getFrameworkUpdates();
      
      expect(updates).toContain(framework);
      expect(updates[0].lastChecked).toBeDefined();
    });

    it('should detect breaking changes', async () => {
      const oldVersion = {
        name: 'Next.js',
        version: '12.0'
      };

      const newVersion = {
        name: 'Next.js',
        version: '13.0',
        breakingChanges: ['pages-router-deprecated']
      };

      const analysis = await resourceChain.analyzeFrameworkChanges(oldVersion, newVersion);
      expect(analysis.breakingChanges).toHaveLength(1);
      expect(analysis.migrationGuide).toBeDefined();
    });
  });

  describe('Resource Relevance', () => {
    it('should evaluate resource relevance', async () => {
      const resource = mockResource;
      const learner = mockLearnerProfile;

      const relevance = await resourceChain.evaluateRelevance(resource, learner);
      
      expect(relevance.score).toBeGreaterThan(0.5);
      expect(relevance.factors).toBeDefined();
      expect(relevance.recommendations).toHaveLength(1);
    });

    it('should prioritize recent resources', async () => {
      const oldResource = {
        ...mockResource,
        timestamp: new Date('2020-01-01')
      };

      const newResource = {
        ...mockResource,
        timestamp: new Date()
      };

      const relevanceOld = await resourceChain.evaluateRelevance(oldResource, mockLearnerProfile);
      const relevanceNew = await resourceChain.evaluateRelevance(newResource, mockLearnerProfile);

      expect(relevanceNew.score).toBeGreaterThan(relevanceOld.score);
    });
  });

  describe('Content Updates', () => {
    it('should detect outdated content', async () => {
      const resources = [mockResource];
      const outdated = await resourceChain.detectOutdatedContent(resources);
      
      expect(outdated.items).toBeDefined();
      expect(outdated.recommendations).toHaveLength(1);
    });

    it('should suggest content updates', async () => {
      const resource = mockResource;
      const updates = await resourceChain.suggestContentUpdates(resource);
      
      expect(updates.changes).toBeDefined();
      expect(updates.priority).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle resource fetch failures', async () => {
      vi.spyOn(resourceChain['fetcher'], 'fetch')
        .mockRejectedValueOnce(new Error('Network error'));

      await expect(resourceChain.fetchResource('invalid-url'))
        .rejects.toThrow('Network error');
    });

    it('should handle validation failures', async () => {
      const invalidResource = {
        title: '',
        content: null
      };

      await expect(resourceChain.validateResource(invalidResource))
        .rejects.toThrow('Validation failed');
    });
  });
});
```

## 2. Integration Tests
```typescript
// src/agents/resource/__tests__/resource.integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { ResourceChain } from '../resourceChain';
import { ProgressiveLearningChain } from '@/agents/progressive-learning/progressiveLearningChain';
import { AssessmentChain } from '@/agents/assessment/assessmentChain';

describe('Resource Integration Tests', () => {
  let resource: ResourceChain;
  let progressiveLearning: ProgressiveLearningChain;
  let assessment: AssessmentChain;

  beforeEach(() => {
    resource = new ResourceChain();
    progressiveLearning = new ProgressiveLearningChain();
    assessment = new AssessmentChain();
  });

  describe('Learning Path Integration', () => {
    it('should provide resources for learning path', async () => {
      const learningPath = await progressiveLearning.createPath(mockLearnerProfile);
      const resources = await resource.getResourcesForPath(learningPath);

      expect(resources.length).toBeGreaterThan(0);
      expect(resources[0].relevance).toBeGreaterThan(0.8);
    });

    it('should adapt resources based on assessment', async () => {
      const assessmentResult = await assessment.evaluateSkill(mockLearnerProfile);
      const resources = await resource.getAdaptedResources(assessmentResult);

      expect(resources[0].difficulty).toBe(assessmentResult.level);
    });
  });

  describe('Real-time Updates', () => {
    it('should handle framework updates in real-time', async () => {
      const framework = {
        name: 'React',
        version: '18.0'
      };

      await resource.trackFrameworkUpdate(framework);
      const affectedPaths = await progressiveLearning.getAffectedPaths(framework);
      const updatedResources = await resource.updateAffectedResources(affectedPaths);

      expect(updatedResources.length).toBeGreaterThan(0);
      expect(updatedResources[0].version).toBe('18.0');
    });
  });

  describe('Content Synchronization', () => {
    it('should sync resources across learning modules', async () => {
      const modules = await progressiveLearning.getActiveModules();
      const synced = await resource.syncResources(modules);

      expect(synced.success).toBe(true);
      expect(synced.updatedModules).toHaveLength(modules.length);
    });
  });
});
```

## Test Coverage Areas
1. Resource Curation
   - Topic relevance
   - Skill level adaptation
   - Quality assessment
   - Content validation

2. Knowledge Base Management
   - Resource addition
   - Content validation
   - Update tracking
   - Access patterns

3. Framework Updates
   - Version tracking
   - Breaking changes
   - Migration guidance
   - Update notifications

4. Resource Relevance
   - Scoring system
   - Temporal relevance
   - User context
   - Recommendations

5. Content Updates
   - Outdated detection
   - Update suggestions
   - Priority assessment
   - Content refresh

6. Integration Testing
   - Learning path alignment
   - Assessment integration
   - Real-time updates
   - Content synchronization

## Running Tests
```bash
# Run all tests
npm test src/agents/resource/__tests__

# Run specific test file
npm test src/agents/resource/__tests__/resourceChain.test.ts

# Run with coverage
npm test -- --coverage
```