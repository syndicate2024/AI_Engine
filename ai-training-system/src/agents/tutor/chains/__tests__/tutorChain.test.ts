/**
 * @fileoverview Unit tests for the AI Tutor Chain
 * Tests the core functionality of the tutor chain without making actual API calls
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TutorChain } from '../tutorChain';
import { ResponseType, TutorInteraction } from '../../../../types';
import { mockOpenAI } from '../../../../../test/setup';

describe('TutorChain Unit Tests', () => {
    let tutorChain: TutorChain;

    beforeEach(() => {
        vi.clearAllMocks();
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
    });

    describe('Error Handling', () => {
        it('should handle API errors gracefully', async () => {
            vi.spyOn(mockOpenAI.chat.completions, 'create')
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
            vi.spyOn(mockOpenAI.chat.completions, 'create')
                .mockResolvedValueOnce({
                    choices: [{ message: { content: '' } }]
                } as any);

            const response = await tutorChain.generateResponse({
                userQuery: "test",
                skillLevel: "BEGINNER",
                currentTopic: "test"
            });

            expect(response.content).toBe('');
        });
    });

    describe('Code Examples', () => {
        it('should extract code snippets correctly', async () => {
            vi.spyOn(mockOpenAI.chat.completions, 'create')
                .mockResolvedValueOnce({
                    choices: [{
                        message: {
                            content: 'Here is an example:\n```javascript\nconsole.log("test");\n```'
                        }
                    }]
                } as any);

            const response = await tutorChain.generateResponse({
                userQuery: "Show me a console.log example",
                skillLevel: "BEGINNER",
                currentTopic: "JavaScript Basics"
            });

            expect(response.codeSnippets?.length).toBe(1);
            expect(response.codeSnippets?.[0]).toContain('console.log');
        });
    });
}); 