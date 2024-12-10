// @ai-protected
// Tutor Chain Unit Tests

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
                });

            const response = await tutorChain.generateResponse({
                userQuery: "test",
                skillLevel: "BEGINNER",
                currentTopic: "test"
            });

            expect(response.content).toBe('');
        });

        it('should handle malformed responses', async () => {
            vi.spyOn(mockOpenAI.chat.completions, 'create')
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
            vi.spyOn(mockOpenAI.chat.completions, 'create')
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

    describe('Code Examples', () => {
        it('should extract code snippets correctly', async () => {
            vi.spyOn(mockOpenAI.chat.completions, 'create')
                .mockResolvedValueOnce({
                    choices: [{
                        message: {
                            content: 'Here is an example:\n```javascript\nconsole.log("test");\n```'
                        }
                    }]
                });

            const response = await tutorChain.generateResponse({
                userQuery: "Show me a console.log example",
                skillLevel: "BEGINNER",
                currentTopic: "JavaScript Basics"
            });

            expect(response.codeSnippets?.length).toBe(1);
            expect(response.codeSnippets?.[0]).toContain('console.log');
        });

        it('should handle multiple code snippets', async () => {
            vi.spyOn(mockOpenAI.chat.completions, 'create')
                .mockResolvedValueOnce({
                    choices: [{
                        message: {
                            content: `First example:
                            \`\`\`javascript
                            const x = 1;
                            \`\`\`
                            Second example:
                            \`\`\`javascript
                            const y = 2;
                            \`\`\``
                        }
                    }]
                });

            const response = await tutorChain.generateResponse({
                userQuery: "Show me variable examples",
                skillLevel: "BEGINNER",
                currentTopic: "JavaScript Basics"
            });

            expect(response.codeSnippets?.length).toBe(2);
        });

        it('should handle code snippets with different languages', async () => {
            vi.spyOn(mockOpenAI.chat.completions, 'create')
                .mockResolvedValueOnce({
                    choices: [{
                        message: {
                            content: `JavaScript:
                            \`\`\`javascript
                            const x = 1;
                            \`\`\`
                            Python:
                            \`\`\`python
                            x = 1
                            \`\`\`
                            Java:
                            \`\`\`java
                            int x = 1;
                            \`\`\``
                        }
                    }]
                });

            const response = await tutorChain.generateResponse({
                userQuery: "Show me variables in different languages",
                skillLevel: "BEGINNER",
                currentTopic: "Programming Basics"
            });

            expect(response.codeSnippets?.length).toBe(3);
        });
    });

    describe('Context Handling', () => {
        it('should consider previous interactions', async () => {
            const firstResponse = await tutorChain.generateResponse({
                userQuery: "What is useState?",
                skillLevel: "INTERMEDIATE",
                currentTopic: "React Hooks"
            });

            const secondResponse = await tutorChain.generateResponse({
                userQuery: "How does it compare to useReducer?",
                skillLevel: "INTERMEDIATE",
                currentTopic: "React Hooks",
                previousInteractions: [firstResponse]
            });

            expect(secondResponse.content).toBeTruthy();
            expect(secondResponse.type).toBe(ResponseType.CONCEPT_EXPLANATION);
        });

        it('should maintain topic continuity', async () => {
            const responses = await Promise.all([
                tutorChain.generateResponse({
                    userQuery: "What are React hooks?",
                    skillLevel: "BEGINNER",
                    currentTopic: "React Basics"
                }),
                tutorChain.generateResponse({
                    userQuery: "Show me useState",
                    skillLevel: "BEGINNER",
                    currentTopic: "React Hooks"
                }),
                tutorChain.generateResponse({
                    userQuery: "Now explain useEffect",
                    skillLevel: "BEGINNER",
                    currentTopic: "React Hooks"
                })
            ]);

            expect(responses).toHaveLength(3);
            responses.forEach(response => {
                expect(response.content).toBeTruthy();
                expect(response.type).toBe(ResponseType.CONCEPT_EXPLANATION);
            });
        });

        it('should handle topic transitions', async () => {
            const responses = [];
            const topics = [
                "JavaScript Basics",
                "JavaScript Functions",
                "JavaScript Objects",
                "JavaScript Classes"
            ];

            for (const topic of topics) {
                const response = await tutorChain.generateResponse({
                    userQuery: `Explain ${topic}`,
                    skillLevel: "BEGINNER",
                    currentTopic: topic,
                    previousInteractions: responses
                });
                responses.push(response);
            }

            expect(responses).toHaveLength(topics.length);
            responses.forEach(response => {
                expect(response.content).toBeTruthy();
                expect(response.followUpQuestions?.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Resource Management', () => {
        it('should provide relevant documentation links', async () => {
            const interaction: TutorInteraction = {
                userQuery: "How do I learn React?",
                skillLevel: "BEGINNER",
                currentTopic: "React Basics"
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.additionalResources).toBeDefined();
            expect(response.additionalResources?.length).toBeGreaterThan(0);
            expect(response.additionalResources?.[0]).toMatch(/react|documentation|tutorial/i);
        });

        it('should prioritize official documentation', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Explain React hooks documentation",
                skillLevel: "INTERMEDIATE",
                currentTopic: "React Hooks"
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.additionalResources?.some(r => r.includes('reactjs.org'))).toBeTruthy();
        });
    });

    describe('Security Considerations', () => {
        it('should sanitize code examples', async () => {
            const interaction: TutorInteraction = {
                userQuery: "How to prevent XSS in React?",
                skillLevel: "ADVANCED",
                currentTopic: "React Security"
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toMatch(/sanitize|escape|dangerouslySetInnerHTML/i);
            expect(response.codeSnippets?.some(s => s.includes('dangerouslySetInnerHTML'))).toBeTruthy();
        });

        it('should warn about security implications', async () => {
            const interaction: TutorInteraction = {
                userQuery: "How to use eval in JavaScript?",
                skillLevel: "INTERMEDIATE",
                currentTopic: "JavaScript Security"
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toMatch(/security|risk|danger|avoid/i);
        });
    });

    describe('Performance Optimization', () => {
        it('should suggest performance best practices', async () => {
            const interaction: TutorInteraction = {
                userQuery: "How to optimize React performance?",
                skillLevel: "ADVANCED",
                currentTopic: "React Performance"
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toMatch(/memo|useMemo|useCallback|performance/i);
        });

        it('should provide complexity analysis', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Explain array sorting complexity",
                skillLevel: "ADVANCED",
                currentTopic: "Algorithms"
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toMatch(/O\(n log n\)|complexity|performance/i);
        });
    });

    describe('Error Prevention', () => {
        it('should warn about common pitfalls', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Common mistakes in async/await",
                skillLevel: "INTERMEDIATE",
                currentTopic: "JavaScript Async"
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toMatch(/mistake|error|pitfall|avoid/i);
        });

        it('should provide error handling examples', async () => {
            const interaction: TutorInteraction = {
                userQuery: "How to handle errors in promises",
                skillLevel: "INTERMEDIATE",
                currentTopic: "JavaScript Async"
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.codeSnippets?.some(s => s.includes('catch'))).toBeTruthy();
        });
    });

    describe('Cross-Platform Compatibility', () => {
        it('should address browser compatibility', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Browser support for fetch API",
                skillLevel: "INTERMEDIATE",
                currentTopic: "Web APIs"
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toMatch(/browser|compatibility|support/i);
        });

        it('should suggest polyfills when needed', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Using new JavaScript features",
                skillLevel: "INTERMEDIATE",
                currentTopic: "JavaScript Features"
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toMatch(/polyfill|babel|transpile|compatibility/i);
        });
    });
}); 