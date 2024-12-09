import { describe, it, expect, beforeEach } from 'vitest';
import { TutorChain } from '../tutorChain';
import { ResponseType, TutorInteraction } from '@/types';

describe('TutorChain Integration Tests', () => {
  let tutorChain: TutorChain;

  beforeEach(() => {
    tutorChain = new TutorChain();
  });

  describe('OpenAI Integration', () => {
    it('should successfully call OpenAI API', async () => {
      const interaction: TutorInteraction = {
        userQuery: "What is a promise in JavaScript?",
        skillLevel: "INTERMEDIATE",
        currentTopic: "JavaScript Async"
      };

      const response = await tutorChain.generateResponse(interaction);
      
      expect(response.content).toBeTruthy();
      expect(response.type).toBeDefined();
    });

    it('should handle large responses', async () => {
      const interaction: TutorInteraction = {
        userQuery: "Explain everything about React hooks",
        skillLevel: "ADVANCED",
        currentTopic: "React Hooks"
      };

      const response = await tutorChain.generateResponse(interaction);
      
      expect(response.content.length).toBeGreaterThan(100);
      expect(response.followUpQuestions?.length).toBeGreaterThan(0);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle complex questions', async () => {
      const interaction: TutorInteraction = {
        userQuery: "How do React hooks, context, and Redux work together in a large application?",
        skillLevel: "ADVANCED",
        currentTopic: "React State Management"
      };

      const response = await tutorChain.generateResponse(interaction);
      
      expect(response.content).toMatch(/redux|context|hooks/i);
      expect(response.codeSnippets?.length).toBeGreaterThan(0);
    });

    it('should maintain context across multiple interactions', async () => {
      const firstInteraction: TutorInteraction = {
        userQuery: "What is Redux?",
        skillLevel: "INTERMEDIATE",
        currentTopic: "React State Management"
      };

      const firstResponse = await tutorChain.generateResponse(firstInteraction);

      const secondInteraction: TutorInteraction = {
        userQuery: "How does that compare to Context?",
        skillLevel: "INTERMEDIATE",
        currentTopic: "React State Management",
        previousInteractions: [firstResponse]
      };

      const secondResponse = await tutorChain.generateResponse(secondInteraction);
      
      expect(secondResponse.content).toMatch(/redux|context|comparison/i);
    });
  });
}); 