/**
 * @fileoverview Integration tests for the AI Tutor Chain
 * Tests the interaction between components and with the OpenAI service
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { generateTutorResponse } from '../tutorChain';
import { TutorContext, SkillLevel, ResponseType, Project } from '../../../../types';

describe('Tutor Chain Integration Tests', () => {
  let mockContext: TutorContext;

  beforeEach(() => {
    mockContext = {
      skillLevel: SkillLevel.BEGINNER,
      currentTopic: 'JavaScript Basics',
      learningPath: ['Introduction', 'Variables'],
      previousInteractions: [],
      currentModule: 'Programming Fundamentals',
      recentConcepts: ['variables', 'data types'],
      struggledTopics: [],
      completedProjects: [] as Project[]
    };
  });

  describe('OpenAI Interactions', () => {
    it('should generate coherent responses', async () => {
      const response = await generateTutorResponse(mockContext, 'What is JavaScript?');
      expect(response.type).toBe(ResponseType.CONCEPT_EXPLANATION);
      expect(response.content).toBeTruthy();
      expect(response.confidence).toBeGreaterThan(0);
      expect(response.followUpQuestions).toBeDefined();
      expect(response.relatedConcepts).toBeDefined();
    });

    it('should adapt responses based on skill level', async () => {
      const advancedContext = {
        ...mockContext,
        skillLevel: SkillLevel.ADVANCED
      };
      const response = await generateTutorResponse(advancedContext, 'Explain closures');
      expect(response.content).toBeTruthy();
      expect(response.type).toBe(ResponseType.CONCEPT_EXPLANATION);
    });

    it('should maintain conversation context', async () => {
      const firstResponse = await generateTutorResponse(mockContext, 'What is JavaScript?');
      const contextWithHistory = {
        ...mockContext,
        previousInteractions: [
          {
            question: 'What is JavaScript?',
            response: firstResponse,
            context: mockContext,
            skillLevel: mockContext.skillLevel,
            currentTopic: mockContext.currentTopic,
            previousInteractions: [],
            timestamp: new Date()
          }
        ]
      };
      const response = await generateTutorResponse(contextWithHistory, 'How does it differ from Java?');
      expect(response.content).toBeTruthy();
      expect(response.type).toBe(ResponseType.CONCEPT_EXPLANATION);
    });

    it('should handle code review requests', async () => {
      const response = await generateTutorResponse(mockContext, 'Review my code: function test() {}');
      expect(response.type).toBe(ResponseType.CODE_REVIEW);
      expect(response.content).toBeTruthy();
    });

    it('should provide error explanations', async () => {
      const response = await generateTutorResponse(mockContext, 'Why am I getting TypeError?');
      expect(response.type).toBe(ResponseType.ERROR_EXPLANATION);
      expect(response.content).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed questions gracefully', async () => {
      const response = await generateTutorResponse(mockContext, '???');
      expect(response.content).toBeTruthy();
      expect(response.confidence).toBeLessThan(1);
    });

    it('should handle long inputs', async () => {
      const longQuestion = 'a'.repeat(1000);
      const response = await generateTutorResponse(mockContext, longQuestion);
      expect(response.content).toBeTruthy();
      expect(response.type).toBeDefined();
    });
  });
}); 