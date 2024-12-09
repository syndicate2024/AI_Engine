/**
 * @fileoverview Unit tests for the AI Tutor Chain
 * Tests the core functionality of the tutor chain without making actual API calls
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateTutorResponse } from '../tutorChain';
import { TutorContext, SkillLevel, ResponseType, Project } from '../../../../types';
import { chatModel } from '../../../../config/ai-config';
import { AIMessageChunk } from '@langchain/core/messages';
import { ValidationError, AIServiceError } from '../../../../utils/error-handling';

describe('Tutor Chain Unit Tests', () => {
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

    // Reset mocks
    vi.clearAllMocks();
  });

  describe('Input Validation', () => {
    it('should throw ValidationError for empty context', async () => {
      await expect(generateTutorResponse({} as TutorContext, 'test'))
        .rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for empty question', async () => {
      await expect(generateTutorResponse(mockContext, ''))
        .rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid skill level', async () => {
      const invalidContext = {
        ...mockContext,
        skillLevel: 'expert' as SkillLevel
      };
      await expect(generateTutorResponse(invalidContext, 'test'))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('Response Generation', () => {
    it('should generate concept explanation response', async () => {
      const response = await generateTutorResponse(mockContext, 'What is JavaScript?');
      expect(response.type).toBe(ResponseType.CONCEPT_EXPLANATION);
      expect(response.content).toBeTruthy();
      expect(response.confidence).toBeGreaterThan(0);
    });

    it('should generate code review response', async () => {
      vi.mocked(chatModel.invoke).mockResolvedValueOnce(
        new AIMessageChunk({
          content: JSON.stringify({
            content: 'Code review feedback',
            type: ResponseType.CODE_REVIEW,
            confidence: 0.9,
            followUpQuestions: ['Test question?'],
            relatedConcepts: ['test concept']
          }),
          additional_kwargs: {}
        })
      );

      const response = await generateTutorResponse(mockContext, 'Review my code: function test() {}');
      expect(response.type).toBe(ResponseType.CODE_REVIEW);
      expect(response.content).toBeTruthy();
    });

    it('should handle error explanations', async () => {
      vi.mocked(chatModel.invoke).mockResolvedValueOnce(
        new AIMessageChunk({
          content: JSON.stringify({
            content: 'Error explanation',
            type: ResponseType.ERROR_EXPLANATION,
            confidence: 0.9,
            followUpQuestions: ['Test question?'],
            relatedConcepts: ['test concept']
          }),
          additional_kwargs: {}
        })
      );

      const response = await generateTutorResponse(mockContext, 'Why am I getting TypeError?');
      expect(response.type).toBe(ResponseType.ERROR_EXPLANATION);
      expect(response.content).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle AI service errors', async () => {
      vi.mocked(chatModel.invoke).mockRejectedValueOnce(new Error('API Error'));
      await expect(generateTutorResponse(mockContext, 'test'))
        .rejects.toThrow(AIServiceError);
    });

    it('should handle malformed AI responses', async () => {
      vi.mocked(chatModel.invoke).mockResolvedValueOnce(
        new AIMessageChunk({ content: 'invalid json', additional_kwargs: {} })
      );
      await expect(generateTutorResponse(mockContext, 'test'))
        .rejects.toThrow();
    });

    it('should handle response validation failures', async () => {
      vi.mocked(chatModel.invoke).mockResolvedValueOnce(
        new AIMessageChunk({ content: '{}', additional_kwargs: {} })
      );
      await expect(generateTutorResponse(mockContext, 'test'))
        .rejects.toThrow();
    });
  });

  describe('Context Handling', () => {
    it('should use context in generating responses', async () => {
      const response = await generateTutorResponse(mockContext, 'What should I learn next?');
      expect(response.content).toBeTruthy();
      expect(response.relatedConcepts).toBeDefined();
    });

    it('should adapt response based on skill level', async () => {
      const advancedContext = {
        ...mockContext,
        skillLevel: SkillLevel.ADVANCED
      };
      const response = await generateTutorResponse(advancedContext, 'Explain closures');
      expect(response.content).toBeTruthy();
      expect(response.type).toBe(ResponseType.CONCEPT_EXPLANATION);
    });
  });
}); 