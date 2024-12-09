import { describe, it, expect, beforeEach } from 'vitest';
import { TutorChain } from '../tutorChain';
import { ResponseType, TutorInteraction } from '../../../../types';

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

        it('should handle rate limiting', async () => {
            // Make multiple requests in quick succession
            const promises = Array(5).fill(null).map(() => 
                tutorChain.generateResponse({
                    userQuery: "Quick test",
                    skillLevel: "BEGINNER",
                    currentTopic: "Testing"
                })
            );

            const responses = await Promise.all(promises);
            expect(responses).toHaveLength(5);
            responses.forEach(response => {
                expect(response.content).toBeTruthy();
            });
        });

        it('should handle concurrent requests', async () => {
            const topics = ['Variables', 'Functions', 'Objects', 'Arrays', 'Promises'];
            const promises = topics.map(topic => 
                tutorChain.generateResponse({
                    userQuery: `Explain ${topic}`,
                    skillLevel: "BEGINNER",
                    currentTopic: "JavaScript Basics"
                })
            );

            const responses = await Promise.all(promises);
            expect(responses).toHaveLength(topics.length);
            responses.forEach(response => {
                expect(response.content).toBeTruthy();
            });
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

        it('should adapt explanations based on skill level', async () => {
            const topics = ['JavaScript Basics', 'React Fundamentals', 'State Management'];
            const skillLevels: Array<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'> = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

            for (const topic of topics) {
                const responses = await Promise.all(
                    skillLevels.map(level => 
                        tutorChain.generateResponse({
                            userQuery: `Explain ${topic}`,
                            skillLevel: level,
                            currentTopic: topic
                        })
                    )
                );

                responses.forEach((response, index) => {
                    expect(response.content).toBeTruthy();
                    if (skillLevels[index] === 'ADVANCED') {
                        expect(response.codeSnippets?.length).toBeGreaterThan(0);
                    }
                });
            }
        });

        it('should handle learning path progression', async () => {
            const learningPath: Array<{
                query: string;
                topic: string;
                skillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
            }> = [
                {
                    query: "What is JavaScript?",
                    topic: "JavaScript Basics",
                    skillLevel: "BEGINNER"
                },
                {
                    query: "How do functions work?",
                    topic: "JavaScript Functions",
                    skillLevel: "BEGINNER"
                },
                {
                    query: "Explain callbacks",
                    topic: "JavaScript Async",
                    skillLevel: "INTERMEDIATE"
                },
                {
                    query: "Show me async/await",
                    topic: "JavaScript Async",
                    skillLevel: "INTERMEDIATE"
                }
            ];

            const responses = [];
            for (const step of learningPath) {
                const response = await tutorChain.generateResponse({
                    userQuery: step.query,
                    skillLevel: step.skillLevel,
                    currentTopic: step.topic,
                    previousInteractions: responses
                });
                responses.push(response);
            }

            expect(responses).toHaveLength(learningPath.length);
            responses.forEach(response => {
                expect(response.content).toBeTruthy();
                expect(response.followUpQuestions?.length).toBeGreaterThan(0);
            });
        });

        it('should handle complex learning scenarios', async () => {
            const scenario = async () => {
                // Start with basic concept
                const basicResponse = await tutorChain.generateResponse({
                    userQuery: "What is state management?",
                    skillLevel: "BEGINNER",
                    currentTopic: "React Basics"
                });

                // Ask for clarification
                const clarificationResponse = await tutorChain.generateResponse({
                    userQuery: "Can you explain that with an example?",
                    skillLevel: "BEGINNER",
                    currentTopic: "React Basics",
                    previousInteractions: [basicResponse]
                });

                // Deep dive into specific concept
                const deepDiveResponse = await tutorChain.generateResponse({
                    userQuery: "How does useState work internally?",
                    skillLevel: "ADVANCED",
                    currentTopic: "React Hooks",
                    previousInteractions: [basicResponse, clarificationResponse]
                });

                return [basicResponse, clarificationResponse, deepDiveResponse];
            };

            const responses = await scenario();
            expect(responses).toHaveLength(3);
            responses.forEach(response => {
                expect(response.content).toBeTruthy();
                expect(response.type).toBeDefined();
            });
        });

        it('should handle cross-topic questions', async () => {
            const interaction: TutorInteraction = {
                userQuery: "How do JavaScript promises work with React's useEffect?",
                skillLevel: "INTERMEDIATE",
                currentTopic: "React Hooks"
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toBeTruthy();
            expect(response.content).toMatch(/promise|useEffect|async/i);
            expect(response.codeSnippets?.length).toBeGreaterThan(0);
        });
    });
}); 