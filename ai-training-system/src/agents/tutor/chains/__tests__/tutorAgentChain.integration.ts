import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TutorAgentChain } from '../tutorAgentChain';
import { ResponseType, TutorInteraction, LearningContext } from '../../../../types';

describe('TutorAgentChain Integration Tests', () => {
  let tutorAgentChain: TutorAgentChain;
  const defaultContext: LearningContext = {
    currentModule: '',
    recentConcepts: [],
    struggledTopics: [],
    completedProjects: []
  };

  beforeEach(() => {
    vi.clearAllMocks();
    tutorAgentChain = new TutorAgentChain();
  });

  describe('OpenAI Integration', () => {
    it('should successfully call OpenAI API', async () => {
      const interaction: TutorInteraction = {
        userQuery: "What is a promise in JavaScript?",
        skillLevel: "INTERMEDIATE",
        currentTopic: "JavaScript Async",
        context: defaultContext,
        previousInteractions: []
      };

      const response = await tutorAgentChain.generateResponse(interaction);
      const parsedContent = JSON.parse(response.content);
      
      expect(parsedContent.content).toBeTruthy();
      expect(parsedContent.type).toBe(ResponseType.CONCEPT_EXPLANATION);
    });

    it('should handle large responses', async () => {
      const interaction: TutorInteraction = {
        userQuery: "Explain everything about React hooks",
        skillLevel: "ADVANCED",
        currentTopic: "React Hooks",
        context: defaultContext,
        previousInteractions: []
      };

      const response = await tutorAgentChain.generateResponse(interaction);
      const parsedContent = JSON.parse(response.content);
      
      expect(parsedContent.content.length).toBeGreaterThan(100);
      expect(parsedContent.followUpQuestions?.length).toBeGreaterThan(0);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle complex questions', async () => {
      const interaction: TutorInteraction = {
        userQuery: "How do React hooks, context, and Redux work together in a large application?",
        skillLevel: "ADVANCED",
        currentTopic: "React State Management",
        context: {
          currentModule: "React Advanced",
          recentConcepts: ["Hooks", "Context", "Redux"],
          struggledTopics: [],
          completedProjects: []
        },
        previousInteractions: []
      };

      // Mock response for complex question
      vi.spyOn(tutorAgentChain['model'], 'invoke')
        .mockResolvedValueOnce({
          content: JSON.stringify({
            type: ResponseType.CONCEPT_EXPLANATION,
            content: "Advanced explanation of React state management patterns, integrating hooks with Redux and Context API...",
            additionalResources: ["React Docs", "Redux Docs"],
            followUpQuestions: ["How does Redux middleware interact with hooks?"],
            codeSnippets: [{
              code: "const [state, dispatch] = useReducer(reducer, []);\nconst store = useContext(StoreContext);",
              explanation: "Integration of hooks with Redux and Context"
            }]
          })
        });

      const response = await tutorAgentChain.generateResponse(interaction);
      const parsedContent = JSON.parse(response.content);
      
      expect(parsedContent.content).toMatch(/redux|context|hooks/i);
      expect(parsedContent.codeSnippets.length).toBeGreaterThan(0);
    });

    it('should maintain context across multiple interactions', async () => {
      const firstInteraction: TutorInteraction = {
        userQuery: "What is Redux?",
        skillLevel: "INTERMEDIATE",
        currentTopic: "React State Management",
        context: defaultContext,
        previousInteractions: []
      };

      const firstResponse = await tutorAgentChain.generateResponse(firstInteraction);
      const parsedFirstContent = JSON.parse(firstResponse.content);
      expect(parsedFirstContent.type).toBe(ResponseType.CONCEPT_EXPLANATION);

      const secondInteraction: TutorInteraction = {
        userQuery: "How does it compare to Context API?",
        skillLevel: "INTERMEDIATE",
        currentTopic: "React State Management",
        context: {
          ...defaultContext,
          recentConcepts: ['redux']
        },
        previousInteractions: [firstResponse]
      };

      const secondResponse = await tutorAgentChain.generateResponse(secondInteraction);
      const parsedSecondContent = JSON.parse(secondResponse.content);
      expect(parsedSecondContent.content).toMatch(/redux|context|comparison/i);
    });
  });
}); 