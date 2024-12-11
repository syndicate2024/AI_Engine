// @ai-protected
// Tutor Chain Unit Tests
// Last Updated: 2024-12-11 14:20 EST

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TutorChain } from '@/agents/tutor/chains/tutorChain';
import { ResponseType, TutorInteraction } from '@/types';
import { mockOpenAI } from '../../../__mocks__/openai';
import { setupTestEnv } from '../../../__setup__/test-env';

describe('TutorChain Unit Tests', () => {
    let tutorChain: TutorChain;

    beforeEach(() => {
        setupTestEnv();
        tutorChain = new TutorChain();
    });

    describe('Basic Response Generation', () => {
        it('should generate a basic response', async () => {
            const interaction: TutorInteraction = {
                userQuery: "What is a variable?",
                skillLevel: "BEGINNER",
                currentTopic: "JavaScript Basics"
            };

            const response = await tutorChain.generateResponse(interaction);
            
            expect(response).toMatchObject({
                type: ResponseType.CONCEPT_EXPLANATION,
                content: expect.any(String),
                additionalResources: expect.any(Array),
                followUpQuestions: expect.any(Array)
            });
        });

        it('should include appropriate follow-up questions', async () => {
            const interaction: TutorInteraction = {
                userQuery: "How do I use async/await?",
                skillLevel: "INTERMEDIATE",
                currentTopic: "JavaScript Async"
            };

            const response = await tutorChain.generateResponse(interaction);
            
            expect(response.followUpQuestions).toBeDefined();
            expect(response.followUpQuestions?.length).toBeGreaterThan(0);
        });

        it('should handle very long queries', async () => {
            const longQuery = "Can you explain ".repeat(100) + "this concept?";
            const interaction: TutorInteraction = {
                userQuery: longQuery,
                skillLevel: "BEGINNER",
                currentTopic: "JavaScript Basics"
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toBeTruthy();
        });

        it('should handle queries with special characters', async () => {
            const interaction: TutorInteraction = {
                userQuery: "How do I handle <script>alert('xss')</script> in React?",
                skillLevel: "INTERMEDIATE",
                currentTopic: "React Security"
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toBeTruthy();
        });
    });

    describe('Skill Level Adaptation', () => {
        it('should adapt content for beginners', async () => {
            const interaction: TutorInteraction = {
                userQuery: "What is a closure?",
                skillLevel: "BEGINNER",
                currentTopic: "JavaScript Functions"
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toBeTruthy();
            expect(response.type).toBe(ResponseType.CONCEPT_EXPLANATION);
        });

        it('should provide advanced content for experts', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Explain closure optimization patterns",
                skillLevel: "ADVANCED",
                currentTopic: "JavaScript Performance"
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toBeTruthy();
            expect(response.codeSnippets?.length).toBeGreaterThan(0);
        });

        it('should handle skill level transitions', async () => {
            const responses = await Promise.all([
                tutorChain.generateResponse({
                    userQuery: "What is React?",
                    skillLevel: "BEGINNER",
                    currentTopic: "React Basics"
                }),
                tutorChain.generateResponse({
                    userQuery: "What is React?",
                    skillLevel: "INTERMEDIATE",
                    currentTopic: "React Basics"
                }),
                tutorChain.generateResponse({
                    userQuery: "What is React?",
                    skillLevel: "ADVANCED",
                    currentTopic: "React Basics"
                })
            ]);

            responses.forEach(response => {
                expect(response.content).toBeTruthy();
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle API errors gracefully', async () => {
            vi.spyOn(mockOpenAI, 'createChatCompletion')
                .mockRejectedValueOnce(new Error('API Error'));

            await expect(async () => {
                await tutorChain.generateResponse({
                    userQuery: "test",
                    skillLevel: "BEGINNER",
                    currentTopic: "test"
                });
            }).rejects.toThrow('API Error');
        });

        it('should handle empty responses', async () => {
            vi.spyOn(mockOpenAI, 'createChatCompletion')
                .mockResolvedValueOnce({
                    choices: [{ message: { content: '' } }]
                });

            const response = await tutorChain.generateResponse({
                userQuery: "test",
                skillLevel: "BEGINNER",
                currentTopic: "test"
            });

            expect(response.content).toBe('');
        });

        it('should handle malformed responses', async () => {
            vi.spyOn(mockOpenAI, 'createChatCompletion')
                .mockResolvedValueOnce({
                    choices: [{ message: { content: 'invalid json' } }]
                });

            const response = await tutorChain.generateResponse({
                userQuery: "test",
                skillLevel: "BEGINNER",
                currentTopic: "test"
            });

            expect(response.content).toBeTruthy();
        });

        it('should handle network timeouts', async () => {
            vi.spyOn(mockOpenAI, 'createChatCompletion')
                .mockRejectedValueOnce(new Error('Network timeout'));

            await expect(async () => {
                await tutorChain.generateResponse({
                    userQuery: "test",
                    skillLevel: "BEGINNER",
                    currentTopic: "test"
                });
            }).rejects.toThrow('Network timeout');
        });
    });
});
