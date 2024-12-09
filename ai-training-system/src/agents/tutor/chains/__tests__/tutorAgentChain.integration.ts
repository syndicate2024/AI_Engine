import { describe, it, expect, beforeEach } from 'vitest';
import { TutorAgentChain } from '../tutorAgentChain';
import { ResponseType, TutorInteraction } from '../../../../types';
import { mockOpenAIResponse } from '../../../../../test/setup';

describe('TutorAgentChain Integration Tests', () => {
  let tutorAgentChain: TutorAgentChain;

  beforeEach(() => {
    tutorAgentChain = new TutorAgentChain();
  });

  describe('OpenAI Integration', () => {
    it('should successfully call OpenAI API', async () => {
      const interaction: TutorInteraction = {
        userQuery: "What is a promise in JavaScript?",
        skillLevel: "INTERMEDIATE",
        currentTopic: "JavaScript Async",
        context: {
          currentModule: "JavaScript Async Programming",
          recentConcepts: ["callbacks"],
          struggledTopics: [],
          completedProjects: []
        },
        previousInteractions: []
      };

      const response = await tutorAgentChain.generateResponse(interaction);
      
      expect(response.content).toBeTruthy();
      expect(response.type).toBeDefined();
      expect(response.content.length).toBeGreaterThan(100);
    });

    it('should handle large responses', async () => {
      const interaction: TutorInteraction = {
        userQuery: "Explain everything about React hooks",
        skillLevel: "ADVANCED",
        currentTopic: "React Hooks",
        context: {
          currentModule: "React Advanced",
          recentConcepts: ["components", "state"],
          struggledTopics: [],
          completedProjects: []
        },
        previousInteractions: []
      };

      const response = await tutorAgentChain.generateResponse(interaction);
      
      expect(response.content.length).toBeGreaterThan(100);
      expect(response.followUpQuestions?.length).toBeGreaterThan(0);
    });
  });

  describe('Cross-Agent Integration', () => {
    it('should integrate with assessment agent feedback', async () => {
      const assessmentFeedback: TutorInteraction = {
        userQuery: "Help me understand array methods better",
        skillLevel: "BEGINNER",
        currentTopic: "JavaScript Arrays",
        context: {
          currentModule: "JavaScript Fundamentals",
          recentConcepts: ["variables", "loops"],
          struggledTopics: ["array methods", "callbacks"],
          completedProjects: []
        },
        previousInteractions: []
      };

      const response = await tutorAgentChain.generateResponse(assessmentFeedback);
      
      expect(response.content).toMatch(/array|method|example/i);
      expect(response.type).toBe(ResponseType.CONCEPT_EXPLANATION);
      expect(response.codeSnippets?.length).toBeGreaterThan(0);
    });

    it('should adapt to progress agent updates', async () => {
      const progressUpdate: TutorInteraction = {
        userQuery: "What should I learn next?",
        skillLevel: "INTERMEDIATE",
        currentTopic: "React State",
        context: {
          currentModule: "React Fundamentals",
          recentConcepts: ["useState", "props"],
          struggledTopics: [],
          completedProjects: ["todo-app"]
        },
        previousInteractions: []
      };

      const response = await tutorAgentChain.generateResponse(progressUpdate);
      
      expect(response.content).toMatch(/useEffect|context|lifecycle/i);
      expect(response.type).toBe(ResponseType.RESOURCE_SUGGESTION);
      expect(response.additionalResources?.length).toBeGreaterThan(1);
    });
  });

  describe('Long-Running Sessions', () => {
    it('should maintain context over multiple interactions', async () => {
      // First interaction
      const firstResponse = await tutorAgentChain.generateResponse({
        userQuery: "What is useEffect?",
        skillLevel: "INTERMEDIATE",
        currentTopic: "React Hooks",
        context: {
          currentModule: "React Advanced",
          recentConcepts: [],
          struggledTopics: [],
          completedProjects: []
        },
        previousInteractions: []
      });

      // Second interaction
      const secondResponse = await tutorAgentChain.generateResponse({
        userQuery: "What about cleanup?",
        skillLevel: "INTERMEDIATE",
        currentTopic: "React Hooks",
        context: {
          currentModule: "React Advanced",
          recentConcepts: ["useEffect"],
          struggledTopics: [],
          completedProjects: []
        },
        previousInteractions: [firstResponse]
      });

      // Third interaction
      const thirdResponse = await tutorAgentChain.generateResponse({
        userQuery: "Can you show an example?",
        skillLevel: "INTERMEDIATE",
        currentTopic: "React Hooks",
        context: {
          currentModule: "React Advanced",
          recentConcepts: ["useEffect", "cleanup"],
          struggledTopics: [],
          completedProjects: []
        },
        previousInteractions: [firstResponse, secondResponse]
      });

      expect(thirdResponse.content).toMatch(/useEffect|cleanup|example/i);
      expect(thirdResponse.codeSnippets?.length).toBeGreaterThan(0);
      expect(thirdResponse.content).toMatch(/return|unmount|subscription/i);
    });
  });
}); 