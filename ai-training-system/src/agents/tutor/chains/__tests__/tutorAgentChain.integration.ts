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
    it('should successfully communicate with OpenAI API', async () => {
      const interaction: TutorInteraction = {
        userQuery: "What is a promise in JavaScript?",
        skillLevel: "INTERMEDIATE",
        currentTopic: "JavaScript Async"
      };

      const response = await tutorAgentChain.generateResponse(interaction);
      
      expect(response.content).toBeTruthy();
      expect(response.type).toBeDefined();
      expect(response.content.length).toBeGreaterThan(100);
    });

    it('should process complex responses correctly', async () => {
      const interaction: TutorInteraction = {
        userQuery: "Explain the event loop, promises, and async/await in detail",
        skillLevel: "ADVANCED",
        currentTopic: "JavaScript Async"
      };

      const response = await tutorAgentChain.generateResponse(interaction);
      
      expect(response.content).toMatch(/event loop|promise|async|await/i);
      expect(response.codeSnippets?.length).toBeGreaterThan(1);
      expect(response.followUpQuestions?.length).toBeGreaterThan(2);
    });
  });

  describe('Agent Interactions', () => {
    it('should integrate with assessment agent feedback', async () => {
      const assessmentFeedback = {
        userQuery: "Help me understand array methods better",
        skillLevel: "BEGINNER",
        currentTopic: "JavaScript Arrays",
        context: {
          currentModule: "JavaScript Fundamentals",
          recentConcepts: ["variables", "loops"],
          struggledTopics: ["array methods", "callbacks"],
          completedProjects: []
        }
      };

      const response = await tutorAgentChain.generateResponse(assessmentFeedback);
      
      expect(response.content).toMatch(/array|method|example/i);
      expect(response.type).toBe(ResponseType.CONCEPT_EXPLANATION);
      expect(response.codeSnippets?.length).toBeGreaterThan(0);
    });

    it('should integrate with progress agent updates', async () => {
      const progressUpdate = {
        userQuery: "What should I learn next?",
        skillLevel: "INTERMEDIATE",
        currentTopic: "React State",
        context: {
          currentModule: "React Fundamentals",
          recentConcepts: ["useState", "props"],
          struggledTopics: [],
          completedProjects: ["todo-app"]
        }
      };

      const response = await tutorAgentChain.generateResponse(progressUpdate);
      
      expect(response.content).toMatch(/useEffect|context|lifecycle/i);
      expect(response.type).toBe(ResponseType.RESOURCE_SUGGESTION);
      expect(response.additionalResources?.length).toBeGreaterThan(1);
    });

    it('should integrate with resource agent suggestions', async () => {
      const resourceRequest = {
        userQuery: "I need more practice with React hooks",
        skillLevel: "INTERMEDIATE",
        currentTopic: "React Hooks",
        context: {
          currentModule: "React Advanced",
          recentConcepts: ["useState", "useEffect"],
          struggledTopics: ["custom hooks"],
          completedProjects: ["basic-hooks"]
        }
      };

      const response = await tutorAgentChain.generateResponse(resourceRequest);
      
      expect(response.additionalResources).toBeDefined();
      expect(response.additionalResources?.length).toBeGreaterThan(2);
      expect(response.additionalResources?.[0]).toMatchObject({
        type: expect.stringMatching(/documentation|exercise|tutorial/),
        title: expect.stringContaining('React'),
        relevance: expect.any(Number)
      });
    });
  });
}); 