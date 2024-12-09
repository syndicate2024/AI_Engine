import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TutorChain } from '../tutorChain';
import { ResponseType, TutorInteraction } from '../../../../types';

describe('TutorChain Integration Tests', () => {
    let tutorChain: TutorChain;
    const defaultContext = {
        currentModule: '',
        recentConcepts: [],
        struggledTopics: [],
        completedProjects: []
    };

    beforeEach(() => {
        vi.clearAllMocks();
        tutorChain = new TutorChain();

        // Mock OpenAI for integration tests
        vi.spyOn(tutorChain['openai'].chat.completions, 'create').mockImplementation(async () => ({
            choices: [{
                message: {
                    content: "Advanced and complex explanation with detailed implementation patterns..."
                }
            }]
        }));
    });

    describe('OpenAI Integration', () => {
        it('should successfully call OpenAI API', async () => {
            const interaction: TutorInteraction = {
                userQuery: "What is a closure?",
                skillLevel: "INTERMEDIATE",
                currentTopic: "JavaScript Functions",
                context: defaultContext,
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toBeTruthy();
            expect(response.type).toBe(ResponseType.CONCEPT_EXPLANATION);
        });

        it('should handle large responses', async () => {
            vi.spyOn(tutorChain['openai'].chat.completions, 'create').mockResolvedValueOnce({
                choices: [{
                    message: {
                        content: "A".repeat(200) // Long response
                    }
                }]
            });

            const interaction: TutorInteraction = {
                userQuery: "Explain everything about React hooks",
                skillLevel: "ADVANCED",
                currentTopic: "React Hooks",
                context: defaultContext,
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content.length).toBeGreaterThan(100);
        });
    });

    describe('Real-world Scenarios', () => {
        it('should handle complex questions', async () => {
            vi.spyOn(tutorChain['openai'].chat.completions, 'create').mockResolvedValueOnce({
                choices: [{
                    message: {
                        content: "Redux is a state management tool that works with React hooks and context..."
                    }
                }]
            });

            const interaction: TutorInteraction = {
                userQuery: "How do React hooks, context, and Redux work together?",
                skillLevel: "ADVANCED",
                currentTopic: "React State Management",
                context: defaultContext,
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toMatch(/redux|context|hooks/i);
        });

        it('should maintain context across multiple interactions', async () => {
            // First interaction
            const firstInteraction: TutorInteraction = {
                userQuery: "What is Redux?",
                skillLevel: "INTERMEDIATE",
                currentTopic: "React State Management",
                context: defaultContext,
                previousInteractions: []
            };

            const firstResponse = await tutorChain.generateResponse(firstInteraction);

            vi.spyOn(tutorChain['openai'].chat.completions, 'create').mockResolvedValueOnce({
                choices: [{
                    message: {
                        content: "Compared to Redux, React Context provides..."
                    }
                }]
            });

            // Second interaction with previous context
            const secondInteraction: TutorInteraction = {
                userQuery: "How does that compare to Context?",
                skillLevel: "INTERMEDIATE",
                currentTopic: "React State Management",
                context: defaultContext,
                previousInteractions: [firstResponse]
            };

            const secondResponse = await tutorChain.generateResponse(secondInteraction);
            expect(secondResponse.content).toMatch(/redux|context|comparison/i);
        });
    });
}); 