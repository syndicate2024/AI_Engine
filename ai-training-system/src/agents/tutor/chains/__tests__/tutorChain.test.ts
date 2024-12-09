/**
 * @fileoverview Unit tests for the AI Tutor Chain
 * Tests the core functionality of the tutor chain without making actual API calls
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TutorChain } from '../tutorChain';
import { ResponseType, TutorInteraction } from '@/types';
import { mockTutorResponse } from '@/test/setup';

describe('TutorChain Unit Tests', () => {
  let tutorChain: TutorChain;

  beforeEach(() => {
    vi.clearAllMocks();
    tutorChain = new TutorChain();
  });

  describe('Basic Response Generation', () => {
    it('should generate a basic response', async () => {
      const interaction: TutorInteraction = {
        userQuery: "What is a variable?",
        skillLevel: "BEGINNER",
        currentTopic: "JavaScript Basics",
        context: {
          currentModule: "JavaScript Fundamentals",
          recentConcepts: [],
          struggledTopics: [],
          completedProjects: []
        },
        previousInteractions: []
      };

      const response = await tutorChain.generateResponse(interaction);
      
      expect(response).toMatchObject({
        type: ResponseType.CONCEPT_EXPLANATION,
        content: expect.any(String),
        additionalResources: expect.any(Array),
        followUpQuestions: expect.any(Array)
      });
    });

    it('should include appropriate follow-up questions', async () => {
      const interaction: TutorInteraction = {
        userQuery: "How do I use async/await?",
        skillLevel: "INTERMEDIATE",
        currentTopic: "JavaScript Async",
        context: {
          currentModule: "JavaScript Async",
          recentConcepts: [],
          struggledTopics: [],
          completedProjects: []
        },
        previousInteractions: []
      };

      const response = await tutorChain.generateResponse(interaction);
      
      expect(response.followUpQuestions).toBeDefined();
      expect(response.followUpQuestions?.length).toBeGreaterThan(0);
    });
  });

  describe('Skill Level Adaptation', () => {
    it('should adapt content for beginners', async () => {
      const interaction: TutorInteraction = {
        userQuery: "What is a closure?",
        skillLevel: "BEGINNER",
        currentTopic: "JavaScript Functions",
        context: {
          currentModule: "JavaScript Functions",
          recentConcepts: [],
          struggledTopics: [],
          completedProjects: []
        },
        previousInteractions: []
      };

      const response = await tutorChain.generateResponse(interaction);
      
      expect(response.type).toBe(ResponseType.CONCEPT_EXPLANATION);
      expect(response.content).toMatch(/basic|fundamental|simple/i);
    });

    it('should provide advanced content for experts', async () => {
      const interaction: TutorInteraction = {
        userQuery: "What is a closure?",
        skillLevel: "ADVANCED",
        currentTopic: "JavaScript Functions",
        context: {
          currentModule: "JavaScript Advanced",
          recentConcepts: ["functions", "scope"],
          struggledTopics: [],
          completedProjects: []
        },
        previousInteractions: []
      };

      const response = await tutorChain.generateResponse(interaction);
      
      expect(response.content).toMatch(/advanced|complex|detailed/i);
      expect(response.codeSnippets?.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      vi.spyOn(tutorChain['model'], 'invoke')
        .mockRejectedValueOnce(new Error('API Error'));

      await expect(async () => {
        await tutorChain.generateResponse({
          userQuery: "test",
          skillLevel: "BEGINNER",
          currentTopic: "test",
          context: {
            currentModule: "test",
            recentConcepts: [],
            struggledTopics: [],
            completedProjects: []
          },
          previousInteractions: []
        });
      }).rejects.toThrow('API Error');
    });

    it('should handle empty responses', async () => {
      vi.spyOn(tutorChain['model'], 'invoke')
        .mockResolvedValueOnce({ content: '' });

      const response = await tutorChain.generateResponse({
        userQuery: "test",
        skillLevel: "BEGINNER",
        currentTopic: "test",
        context: {
          currentModule: "test",
          recentConcepts: [],
          struggledTopics: [],
          completedProjects: []
        },
        previousInteractions: []
      });

      expect(response.content).toBe('No response generated. Please try again.');
    });
  });

  describe('Context Awareness', () => {
    it('should consider previous interactions', async () => {
      const interaction: TutorInteraction = {
        userQuery: "Can you explain more?",
        skillLevel: "INTERMEDIATE",
        currentTopic: "JavaScript Functions",
        context: {
          currentModule: "JavaScript Functions",
          recentConcepts: [],
          struggledTopics: [],
          completedProjects: []
        },
        previousInteractions: [mockTutorResponse]
      };

      const response = await tutorChain.generateResponse(interaction);
      expect(response.content).toBeTruthy();
    });

    it('should maintain topic context', async () => {
      const interaction: TutorInteraction = {
        userQuery: "What about performance?",
        skillLevel: "ADVANCED",
        currentTopic: "React Hooks",
        context: {
          currentModule: "React Advanced",
          recentConcepts: ["hooks", "performance"],
          struggledTopics: [],
          completedProjects: []
        },
        previousInteractions: [{
          type: ResponseType.CONCEPT_EXPLANATION,
          content: "React hooks are functions that...",
          additionalResources: [],
          followUpQuestions: []
        }]
      };

      const response = await tutorChain.generateResponse(interaction);
      expect(response.content).toMatch(/react|hooks|performance/i);
    });
  });

  describe('Code Examples', () => {
    it('should provide code snippets when appropriate', async () => {
      const interaction: TutorInteraction = {
        userQuery: "Show me how to use array methods",
        skillLevel: "INTERMEDIATE",
        currentTopic: "JavaScript Arrays",
        context: {
          currentModule: "JavaScript Arrays",
          recentConcepts: [],
          struggledTopics: [],
          completedProjects: []
        },
        previousInteractions: []
      };

      const response = await tutorChain.generateResponse(interaction);
      
      expect(response.codeSnippets).toBeDefined();
      expect(response.codeSnippets?.length).toBeGreaterThan(0);
      expect(response.codeSnippets?.[0].code).toMatch(/\[\]/); // Should contain array syntax
    });

    it('should format code snippets correctly', async () => {
      const interaction: TutorInteraction = {
        userQuery: "How do I write a for loop?",
        skillLevel: "BEGINNER",
        currentTopic: "JavaScript Basics",
        context: {
          currentModule: "JavaScript Basics",
          recentConcepts: [],
          struggledTopics: [],
          completedProjects: []
        },
        previousInteractions: []
      };

      const response = await tutorChain.generateResponse(interaction);
      
      expect(response.codeSnippets?.[0].code).toMatch(/for\s*\(/); // Should contain for loop syntax
      expect(response.content).toMatch(/loop|iterate/i);
    });
  });

  describe('Resource Suggestions', () => {
    it('should provide relevant resources', async () => {
      const interaction: TutorInteraction = {
        userQuery: "What are the best practices for React hooks?",
        skillLevel: "INTERMEDIATE",
        currentTopic: "React Hooks",
        context: {
          currentModule: "React Hooks",
          recentConcepts: [],
          struggledTopics: [],
          completedProjects: []
        },
        previousInteractions: []
      };

      const response = await tutorChain.generateResponse(interaction);
      
      expect(response.additionalResources).toBeDefined();
      expect(response.additionalResources?.length).toBeGreaterThan(0);
      expect(response.additionalResources?.[0].title).toMatch(/react|hooks/i);
    });
  });
}); 