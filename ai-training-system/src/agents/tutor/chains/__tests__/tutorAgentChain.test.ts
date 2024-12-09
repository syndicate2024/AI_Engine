import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TutorAgentChain } from '../tutorAgentChain';
import { ResponseType, TutorInteraction, TutorResponse } from '../../../../types';
import { mockTutorResponse, mockOpenAIResponse, mockAPIError } from '../../../../../test/setup';

describe('TutorAgentChain Tests', () => {
  let tutorAgentChain: TutorAgentChain;

  beforeEach(() => {
    vi.clearAllMocks();
    tutorAgentChain = new TutorAgentChain();
  });

  describe('Response Generation', () => {
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

      const response = await tutorAgentChain.generateResponse(interaction);
      
      expect(response).toMatchObject({
        content: expect.any(String),
        type: ResponseType.CONCEPT_EXPLANATION,
        additionalResources: expect.any(Array),
        followUpQuestions: expect.any(Array)
      });
    });

    it('should adapt content to skill level', async () => {
      const interaction: TutorInteraction = {
        userQuery: "Explain closures",
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

      const response = await tutorAgentChain.generateResponse(interaction);
      
      expect(response.content).toMatch(/advanced|complex|detailed/i);
      expect(response.codeSnippets?.length).toBeGreaterThan(0);
    });

    it('should generate appropriate follow-up questions', async () => {
      const interaction: TutorInteraction = {
        userQuery: "What is async/await?",
        skillLevel: "INTERMEDIATE",
        currentTopic: "JavaScript Async",
        context: {
          currentModule: "JavaScript Async Programming",
          recentConcepts: ["promises"],
          struggledTopics: [],
          completedProjects: []
        },
        previousInteractions: []
      };

      const response = await tutorAgentChain.generateResponse(interaction);
      
      expect(response.followUpQuestions).toBeDefined();
      expect(response.followUpQuestions?.length).toBeGreaterThan(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      vi.spyOn(tutorAgentChain.model.chat.completions, 'create')
        .mockRejectedValueOnce(new Error('API Error'));

      await expect(async () => {
        await tutorAgentChain.generateResponse({
          userQuery: "test",
          skillLevel: "BEGINNER",
          currentTopic: "test"
        });
      }).rejects.toThrow('API Error');
    });

    it('should handle empty responses', async () => {
      vi.spyOn(tutorAgentChain.model.chat.completions, 'create')
        .mockResolvedValueOnce({
          choices: [{ message: { content: '' } }]
        });

      const response = await tutorAgentChain.generateResponse({
        userQuery: "test",
        skillLevel: "BEGINNER",
        currentTopic: "test"
      });

      expect(response.content).toBe('No response generated. Please try again.');
    });

    it('should handle invalid inputs', async () => {
      const invalidInteraction = {
        userQuery: "",
        skillLevel: "INVALID_LEVEL",
        currentTopic: ""
      };

      await expect(async () => {
        await tutorAgentChain.generateResponse(invalidInteraction as TutorInteraction);
      }).rejects.toThrow();
    });
  });

  describe('Context Management', () => {
    it('should maintain previous interactions', async () => {
      const firstResponse = await tutorAgentChain.generateResponse({
        userQuery: "What is useState?",
        skillLevel: "INTERMEDIATE",
        currentTopic: "React Hooks"
      });

      const secondResponse = await tutorAgentChain.generateResponse({
        userQuery: "Can you explain more?",
        skillLevel: "INTERMEDIATE",
        currentTopic: "React Hooks",
        previousInteractions: [firstResponse]
      });

      expect(secondResponse.content).toMatch(/useState|hook|state/i);
      expect(secondResponse.type).toBe(ResponseType.CONCEPT_EXPLANATION);
    });

    it('should maintain topic continuity', async () => {
      const responses = await Promise.all([
        tutorAgentChain.generateResponse({
          userQuery: "What are React hooks?",
          skillLevel: "INTERMEDIATE",
          currentTopic: "React Hooks",
          context: {
            currentModule: "React Advanced",
            recentConcepts: [],
            struggledTopics: [],
            completedProjects: []
          },
          previousInteractions: []
        }),
        tutorAgentChain.generateResponse({
          userQuery: "Show me an example",
          skillLevel: "INTERMEDIATE",
          currentTopic: "React Hooks",
          context: {
            currentModule: "React Advanced",
            recentConcepts: ["hooks"],
            struggledTopics: [],
            completedProjects: []
          },
          previousInteractions: []
        }),
        tutorAgentChain.generateResponse({
          userQuery: "What about cleanup?",
          skillLevel: "INTERMEDIATE",
          currentTopic: "React Hooks",
          context: {
            currentModule: "React Advanced",
            recentConcepts: ["hooks", "useEffect"],
            struggledTopics: [],
            completedProjects: []
          },
          previousInteractions: []
        })
      ]);

      responses.forEach((response: TutorResponse) => {
        expect(response.content).toMatch(/react|hook|useState|useEffect/i);
        expect(response.type).toBeDefined();
      });
    });
  });
}); 