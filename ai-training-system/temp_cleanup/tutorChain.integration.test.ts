/**
 * @fileoverview Integration tests for the AI Tutor Chain
 * Tests the system with real API calls to OpenAI
 * Requires a valid OpenAI API key in the environment
 */

import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { generateTutorResponse } from '../tutorChain';
import { TutorContext, SkillLevel, TutorInteraction, LearningContext } from '../../../../types';

describe('Tutor Chain Integration Tests', () => {
  let context: TutorContext;

  beforeAll(() => {
    // Ensure we have the OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required for integration tests');
    }
  });

  beforeEach(() => {
    // Initialize a complete context for each test
    context = {
      skillLevel: SkillLevel.BEGINNER,
      currentTopic: 'JavaScript Variables',
      learningPath: ['Programming Basics', 'JavaScript Intro'],
      previousInteractions: [],
      currentModule: 'JavaScript Basics',
      recentConcepts: ['Programming Fundamentals'],
      struggledTopics: [],
      completedProjects: []
    };
  });

  /**
   * Tests for real API interactions
   * These tests make actual calls to OpenAI's API
   */
  describe('Real API Interactions', () => {
    it('should generate coherent responses with real OpenAI API', async () => {
      const question = "What are variables in JavaScript?";
      const response = await generateTutorResponse(context, question);

      expect(response.content).toContain('variable');
      expect(response.confidence).toBeGreaterThan(0.5);
      expect(response.followUpQuestions?.length).toBeGreaterThan(0);
    }, 30000); // Increased timeout for API call

    it('should adapt response based on skill level', async () => {
      const beginnerResponse = await generateTutorResponse(context, "What is a variable?");
      
      context.skillLevel = SkillLevel.ADVANCED;
      const advancedResponse = await generateTutorResponse(context, "What is a variable?");

      expect(beginnerResponse.content).not.toBe(advancedResponse.content);
      expect(beginnerResponse.content.length).toBeLessThanOrEqual(advancedResponse.content.length);
    }, 30000);

    it('should maintain conversation context across interactions', async () => {
      // Create initial interaction
      const firstQuestion = "What is a variable?";
      const firstResponse = await generateTutorResponse(context, firstQuestion);
      
      // Create a proper TutorInteraction with complete context
      const interaction: TutorInteraction = {
        userQuery: firstQuestion,
        response: firstResponse,
        context: {
          currentModule: context.currentModule,
          recentConcepts: context.recentConcepts,
          struggledTopics: context.struggledTopics,
          completedProjects: context.completedProjects
        },
        skillLevel: context.skillLevel,
        currentTopic: context.currentTopic,
        previousInteractions: [],
        timestamp: new Date()
      };
      
      // Update context with the interaction
      context.previousInteractions = [interaction];

      const followUpQuestion = "How do I declare one?";
      const secondResponse = await generateTutorResponse(context, followUpQuestion);

      expect(secondResponse.content).toContain('declare');
      expect(secondResponse.type).toBe('example');
    }, 30000);
  });

  /**
   * Tests for error handling with the real API
   * Verifies proper handling of API errors and rate limits
   */
  describe('Error Handling with Real API', () => {
    it('should handle API errors gracefully', async () => {
      const originalKey = process.env.OPENAI_API_KEY;
      try {
        process.env.OPENAI_API_KEY = 'invalid-key';
        await expect(
          generateTutorResponse(context, "What is a variable?")
        ).rejects.toThrow();
      } finally {
        process.env.OPENAI_API_KEY = originalKey;
      }
    }, 10000);

    it('should handle concurrent requests', async () => {
      const questions = [
        "What are variables?",
        "How do I declare variables?",
        "What is variable scope?",
        "What are const and let?",
        "How do I use variables?"
      ];

      const responses = await Promise.allSettled(
        questions.map(q => generateTutorResponse(context, q))
      );

      const successfulResponses = responses.filter(
        r => r.status === 'fulfilled'
      );
      expect(successfulResponses.length).toBeGreaterThan(0);
    }, 50000);
  });

  /**
   * Tests for response quality
   * Verifies that responses meet educational standards
   */
  describe('Response Quality', () => {
    it('should provide code examples when appropriate', async () => {
      const response = await generateTutorResponse(
        context,
        "Can you show me how to declare variables in JavaScript?"
      );

      expect(response.content).toMatch(/```js|javascript/);
      expect(response.type).toBe('example');
    }, 30000);

    it('should include relevant concepts', async () => {
      const response = await generateTutorResponse(
        context,
        "What are the different ways to declare variables in JavaScript?"
      );

      const expectedConcepts = ['let', 'const', 'var'];
      expect(response.relatedConcepts).toBeDefined();
      expect(response.relatedConcepts?.some(
        concept => expectedConcepts.some(
          expected => concept.toLowerCase().includes(expected)
        )
      )).toBe(true);
    }, 30000);

    it('should provide progressive learning path', async () => {
      const response = await generateTutorResponse(
        context,
        "What should I learn next after variables?"
      );

      expect(response.followUpQuestions).toBeDefined();
      expect(response.relatedConcepts).toBeDefined();
      expect(response.content).toContain('next');
    }, 30000);

    it('should maintain appropriate complexity for skill level', async () => {
      // Test beginner response
      const beginnerResponse = await generateTutorResponse(
        { ...context, skillLevel: SkillLevel.BEGINNER },
        "What is variable scope?"
      );

      // Test advanced response
      const advancedResponse = await generateTutorResponse(
        { ...context, skillLevel: SkillLevel.ADVANCED },
        "What is variable scope?"
      );

      // Advanced response should be more detailed
      expect(advancedResponse.content.length).toBeGreaterThan(beginnerResponse.content.length);
      
      // Beginner response should avoid complex terms
      const complexTerms = ['lexical', 'hoisting', 'temporal dead zone'];
      const hasComplexTerms = (text: string) => 
        complexTerms.some(term => text.toLowerCase().includes(term));
      
      expect(hasComplexTerms(beginnerResponse.content)).toBe(false);
      expect(hasComplexTerms(advancedResponse.content)).toBe(true);
    }, 30000);
  });
}); 