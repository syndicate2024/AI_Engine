/**
 * @fileoverview Unit tests for the AI Tutor Chain
 * Tests the core functionality of the tutor chain without making actual API calls
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateTutorResponse } from '../tutorChain';
import { TutorContext, SkillLevel, TutorResponse } from '../../../../types';
import { chatModel } from '../../../../config/ai-config';
import { AIMessage } from '@langchain/core/messages';

// Mock the AI config module
vi.mock('../../../../config/ai-config', () => ({
  chatModel: {
    invoke: vi.fn()
  }
}));

/**
 * Creates a mock AI response with consistent structure
 * @param type - The type of response (explanation, example, etc.)
 * @param content - The main content of the response
 * @returns A mock AIMessage with JSON stringified content
 */
const createMockResponse = (type: string, content: string): AIMessage => {
  const response: TutorResponse = {
    content,
    type: type as any,
    confidence: 0.9,
    followUpQuestions: ["What are let and const?", "How does variable scope work?"],
    relatedConcepts: ["data types", "scope", "hoisting"]
  };
  return new AIMessage({ content: JSON.stringify(response) });
};

describe('tutorChain', () => {
  let mockContext: TutorContext;

  beforeEach(() => {
    mockContext = {
      skillLevel: SkillLevel.BEGINNER,
      currentTopic: 'JavaScript Variables',
      learningPath: ['Programming Basics', 'JavaScript Intro'],
      previousInteractions: [],
      currentModule: 'JavaScript Basics',
      recentConcepts: ['Programming Fundamentals'],
      struggledTopics: [],
      completedProjects: []
    };

    // Reset mock for each test
    vi.mocked(chatModel.invoke).mockReset();
    // Set default mock response
    vi.mocked(chatModel.invoke).mockResolvedValue(
      createMockResponse('explanation', "Here's an explanation of variables in JavaScript")
    );
  });

  describe('Basic Functionality', () => {
    it('should generate a valid tutor response', async () => {
      const question = "Can you explain variables in JavaScript?";
      const response = await generateTutorResponse(mockContext, question);

      expect(response).toMatchObject({
        type: expect.any(String),
        content: expect.any(String),
        confidence: expect.any(Number),
        followUpQuestions: expect.any(Array),
        relatedConcepts: expect.any(Array)
      });
    });

    it('should maintain context in the response', async () => {
      const question = "How do variables work?";
      const response = await generateTutorResponse(mockContext, question);

      expect(response.content).toBeDefined();
      expect(response.type).toMatch(/^(explanation|example|question|correction|hint)$/);
      expect(response.confidence).toBeGreaterThan(0);
      expect(response.confidence).toBeLessThanOrEqual(1);
    });

    it('should generate follow-up questions', async () => {
      const question = "What are variables?";
      const response = await generateTutorResponse(mockContext, question);

      expect(response.followUpQuestions).toBeDefined();
      expect(response.followUpQuestions?.length).toBeGreaterThan(0);
    });

    it('should include related concepts', async () => {
      const question = "Explain variables";
      const response = await generateTutorResponse(mockContext, question);

      expect(response.relatedConcepts).toBeDefined();
      expect(response.relatedConcepts?.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should throw ValidationError for empty question', async () => {
      await expect(
        generateTutorResponse(mockContext, '')
      ).rejects.toThrow('Question must be a non-empty string');
    });

    it('should throw ValidationError for invalid skill level', async () => {
      const invalidContext = { 
        ...mockContext, 
        skillLevel: 'expert' as SkillLevel 
      };
      await expect(
        generateTutorResponse(invalidContext, 'test question')
      ).rejects.toThrow();
    });

    it('should throw ValidationError for missing learning path', async () => {
      const invalidContext = { 
        ...mockContext, 
        learningPath: undefined as unknown as string[] 
      };
      await expect(
        generateTutorResponse(invalidContext, 'test question')
      ).rejects.toThrow('Learning path must be an array');
    });

    it('should throw ValidationError for missing current topic', async () => {
      const invalidContext = { 
        ...mockContext, 
        currentTopic: '' 
      };
      await expect(
        generateTutorResponse(invalidContext, 'test question')
      ).rejects.toThrow();
    });

    it('should handle AI service errors', async () => {
      vi.mocked(chatModel.invoke).mockRejectedValueOnce(new Error('API Error'));
      await expect(
        generateTutorResponse(mockContext, 'test question')
      ).rejects.toThrow('Failed to generate tutor response');
    });
  });

  describe('Response Types', () => {
    it('should handle explanation type', async () => {
      vi.mocked(chatModel.invoke).mockResolvedValueOnce(
        createMockResponse('explanation', "Here's an explanation")
      );
      const response = await generateTutorResponse(mockContext, 'What are variables?');
      expect(response.type).toBe('explanation');
    });

    it('should handle example type', async () => {
      vi.mocked(chatModel.invoke).mockResolvedValueOnce(
        createMockResponse('example', "Here's an example of variable usage")
      );
      const response = await generateTutorResponse(mockContext, 'Show me variable examples');
      expect(response.type).toBe('example');
    });

    it('should handle correction type', async () => {
      vi.mocked(chatModel.invoke).mockResolvedValueOnce(
        createMockResponse('correction', "Let me correct that understanding")
      );
      const response = await generateTutorResponse(mockContext, 'Is var the best way to declare variables?');
      expect(response.type).toBe('correction');
    });
  });

  describe('Context Handling', () => {
    it('should use context in generating responses', async () => {
      await generateTutorResponse(mockContext, 'What are variables?');
      expect(vi.mocked(chatModel.invoke)).toHaveBeenCalledWith(
        expect.stringContaining(mockContext.skillLevel)
      );
      expect(vi.mocked(chatModel.invoke)).toHaveBeenCalledWith(
        expect.stringContaining(mockContext.currentTopic)
      );
    });

    it('should handle empty previous interactions', async () => {
      mockContext.previousInteractions = [];
      const response = await generateTutorResponse(mockContext, 'What are variables?');
      expect(response).toBeDefined();
    });

    it('should handle multiple previous interactions', async () => {
      const mockResponse = createMockResponse('explanation', 'JavaScript is a programming language');
      mockContext.previousInteractions = [
        {
          userQuery: 'What is JavaScript?',
          response: JSON.parse(mockResponse.content) as TutorResponse,
          context: mockContext,
          skillLevel: mockContext.skillLevel,
          currentTopic: mockContext.currentTopic,
          previousInteractions: [],
          timestamp: new Date()
        }
      ];
      const response = await generateTutorResponse(mockContext, 'What are variables?');
      expect(response).toBeDefined();
    });
  });
}); 