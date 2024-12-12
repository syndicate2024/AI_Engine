// @ai-protected
// Tutor Chain Unit Tests
// Last Updated: 2024-12-11 15:30 EST

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TutorChain } from '../../../../src/agents/tutor/chains/tutorChain';
import { ResponseType, SkillLevel, TutorInteraction, LearningStyle, ContentFormat } from '../../../../src/types';
import { setupTestEnv } from '../../../__setup__/test-env';
import { mockLearnerProfile } from '../../../__mocks__/shared-mocks';

interface TutorInteraction {
    userQuery: string;
    skillLevel: SkillLevel;
    currentTopic: string;
    context: {
        currentModule: string;
        recentConcepts: string[];
        struggledTopics: string[];
        completedProjects: string[];
        learningStyle?: LearningStyle;
        preferredFormat?: ContentFormat;
        timeConstraint?: string;
        devicePreference?: string;
        accessibilityNeeds?: string[];
        culturalBackground?: string;
        languagePreference?: string;
        studyTime?: string;
        timeZone?: string;
        interests?: string[];
        previousExperience?: {
            languages: string[];
            frameworks: string[];
            years: number;
        };
        learningPace?: string;
        industryFocus?: string;
        relatedTech?: string[];
        relatedKnowledge?: string[];
    };
    previousInteractions: Array<{
        query: string;
        response: string;
        timestamp: string;
    }>;
    sessionId?: string;
}

enum ResponseType {
    CONCEPT_EXPLANATION = 'CONCEPT_EXPLANATION',
    CODE_EXAMPLE = 'CODE_EXAMPLE',
    ERROR_CORRECTION = 'ERROR_CORRECTION',
    EXERCISE = 'EXERCISE',
    HINT = 'HINT'
}

enum SkillLevel {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED'
}

enum LearningStyle {
    VISUAL = 'VISUAL',
    PRACTICAL = 'PRACTICAL',
    THEORETICAL = 'THEORETICAL'
}

enum ContentFormat {
    INTERACTIVE = 'INTERACTIVE',
    VIDEO = 'VIDEO',
    TEXT = 'TEXT',
    AUDIO = 'AUDIO'
}

describe('TutorChain Unit Tests', () => {
    let tutorChain: TutorChain;

    beforeEach(() => {
        setupTestEnv();
        tutorChain = new TutorChain();
    });

    describe('Response Generation', () => {
        it('should generate a basic response', async () => {
            const interaction: TutorInteraction = {
                userQuery: "What is a variable?",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "JavaScript Basics",
                context: {
                    currentModule: "JavaScript Fundamentals",
                    recentConcepts: [],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            
            expect(response).toMatchObject({
                type: ResponseType.CONCEPT_EXPLANATION,
                content: expect.any(String),
                additionalResources: expect.any(Array),
                followUpQuestions: expect.any(Array)
            });
        });

        it('should adapt content for skill level', async () => {
            const interaction: TutorInteraction = {
                userQuery: "What is a closure?",
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "JavaScript Advanced",
                context: {
                    currentModule: "Advanced JavaScript",
                    recentConcepts: ["functions", "scope"],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            
            expect(response.type).toBe(ResponseType.CONCEPT_EXPLANATION);
            expect(response.codeSnippets).toBeDefined();
            expect(response.codeSnippets?.length).toBeGreaterThan(0);
        });

        it('should provide advanced explanations for expert level', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Explain prototype chain optimization",
                skillLevel: SkillLevel.ADVANCED,
                currentTopic: "JavaScript Internals",
                context: {
                    currentModule: "Advanced JavaScript",
                    recentConcepts: ["prototypes", "inheritance"],
                    struggledTopics: [],
                    completedProjects: ["basic-inheritance"]
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.type).toBe(ResponseType.CONCEPT_EXPLANATION);
            expect(response.content).toContain("optimization");
            expect(response.codeSnippets?.length).toBeGreaterThan(1);
        });

        it('should provide code examples with proper comments', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Show me how to use async/await",
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "Async JavaScript",
                context: {
                    currentModule: "Advanced JavaScript",
                    recentConcepts: ["promises"],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.codeSnippets).toBeDefined();
            expect(response.codeSnippets?.[0]).toContain('async');
            expect(response.codeSnippets?.[0]).toContain('await');
            expect(response.codeSnippets?.[0]).toMatch(/\/\/ .*explanation/); // Has explanatory comments
        });

        it('should adjust explanation depth based on completed projects', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Explain React hooks",
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "React Hooks",
                context: {
                    currentModule: "React Advanced",
                    recentConcepts: ["useState", "useEffect"],
                    struggledTopics: [],
                    completedProjects: ["basic-hooks", "custom-hooks"]
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("advanced");
            expect(response.content).not.toContain("basic");
        });

        it('should include relevant code documentation', async () => {
            const interaction: TutorInteraction = {
                userQuery: "How do I document my code?",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "Code Documentation",
                context: {
                    currentModule: "Best Practices",
                    recentConcepts: ["comments", "documentation"],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: []
            };
            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("documentation");
            expect(response.codeSnippets?.[0]).toContain("/**");
        });

        it('should provide framework-specific examples', async () => {
            const interaction: TutorInteraction = {
                userQuery: "How do I use React hooks?",
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "React Hooks",
                context: {
                    currentModule: "React",
                    recentConcepts: ["useState"],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: []
            };
            const response = await tutorChain.generateResponse(interaction);
            expect(response.codeSnippets?.[0]).toContain("useState");
        });

        it('should adjust complexity based on previous successes', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Explain promises",
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "Async JavaScript",
                context: {
                    currentModule: "Advanced JavaScript",
                    recentConcepts: ["callbacks"],
                    struggledTopics: [],
                    completedProjects: ["async-mastery"]
                },
                previousInteractions: []
            };
            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("advanced");
        });

        it('should provide visual explanations when appropriate', async () => {
            const interaction: TutorInteraction = {
                userQuery: "How does the event loop work?",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "JavaScript Runtime",
                context: {
                    currentModule: "JavaScript Fundamentals",
                    recentConcepts: [],
                    struggledTopics: [],
                    completedProjects: [],
                    learningStyle: "visual"
                },
                previousInteractions: []
            };
            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("diagram");
        });

        it('should include real-world applications', async () => {
            const interaction: TutorInteraction = {
                userQuery: "When would I use a Map instead of an Object?",
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "JavaScript Data Structures",
                context: {
                    currentModule: "Advanced JavaScript",
                    recentConcepts: ["objects"],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: []
            };
            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("real-world");
            expect(response.content).toContain("example");
        });

        it('should provide performance considerations', async () => {
            const interaction: TutorInteraction = {
                userQuery: "How do I optimize my React app?",
                skillLevel: SkillLevel.ADVANCED,
                currentTopic: "React Performance",
                context: {
                    currentModule: "React Advanced",
                    recentConcepts: ["useMemo", "useCallback"],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: []
            };
            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("performance");
            expect(response.codeSnippets).toHaveLength(3); // Multiple optimization examples
        });

        it('should include security best practices', async () => {
            const interaction: TutorInteraction = {
                userQuery: "How do I handle user input safely?",
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "Web Security",
                context: {
                    currentModule: "Security Best Practices",
                    recentConcepts: ["validation"],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: []
            };
            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("security");
            expect(response.content).toContain("sanitize");
        });

        it('should provide debugging strategies', async () => {
            const interaction: TutorInteraction = {
                userQuery: "How do I debug async code?",
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "Debugging",
                context: {
                    currentModule: "Developer Tools",
                    recentConcepts: ["console", "debugger"],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: []
            };
            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("debug");
            expect(response.codeSnippets?.[0]).toContain("debugger");
        });

        it('should include testing recommendations', async () => {
            const interaction: TutorInteraction = {
                userQuery: "How should I test my React components?",
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "Testing",
                context: {
                    currentModule: "Quality Assurance",
                    recentConcepts: ["jest"],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: []
            };
            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("test");
            expect(response.codeSnippets?.[0]).toContain("expect");
        });
    });

    describe('Context Handling', () => {
        it('should use previous interactions for context', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Can you explain more about that?",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "JavaScript Basics",
                context: {
                    currentModule: "JavaScript Fundamentals",
                    recentConcepts: ["variables"],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: [{
                    query: "What is a variable?",
                    response: "A variable is a container for storing data values.",
                    timestamp: new Date().toISOString()
                }]
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("variable");
            expect(response.type).toBe(ResponseType.CONCEPT_EXPLANATION);
        });

        it('should consider struggled topics in response', async () => {
            const interaction: TutorInteraction = {
                userQuery: "How do promises work?",
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "Async JavaScript",
                context: {
                    currentModule: "Advanced JavaScript",
                    recentConcepts: ["callbacks"],
                    struggledTopics: ["async/await"],
                    completedProjects: []
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("async");
            expect(response.additionalResources?.length).toBeGreaterThan(0);
        });

        it('should track concept progression', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Tell me about arrays",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "JavaScript Arrays",
                context: {
                    currentModule: "JavaScript Fundamentals",
                    recentConcepts: ["variables", "loops"],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: []
            };
            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("loop");
            expect(response.content).toContain("variable");
        });

        it('should adapt to learning style preferences', async () => {
            const interaction: TutorInteraction = {
                userQuery: "How does inheritance work?",
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "OOP Concepts",
                context: {
                    currentModule: "Object-Oriented Programming",
                    recentConcepts: ["classes"],
                    struggledTopics: [],
                    completedProjects: [],
                    learningStyle: "visual"
                },
                previousInteractions: []
            };
            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("diagram");
            expect(response.content).toContain("visual representation");
        });

        it('should consider project experience', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Explain component lifecycle",
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "React Components",
                context: {
                    currentModule: "React",
                    recentConcepts: ["useEffect"],
                    struggledTopics: [],
                    completedProjects: ["todo-app", "blog-platform"]
                },
                previousInteractions: []
            };
            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("blog");
            expect(response.content).toContain("todo");
        });

        it('should maintain conceptual continuity', async () => {
            const interaction: TutorInteraction = {
                userQuery: "What's next after promises?",
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "Async JavaScript",
                context: {
                    currentModule: "Advanced JavaScript",
                    recentConcepts: ["promises", "callbacks"],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: []
            };
            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("async/await");
            expect(response.content).toContain("natural progression");
        });

        it('should reference related technologies', async () => {
            const interaction: TutorInteraction = {
                userQuery: "How do I manage state?",
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "React State",
                context: {
                    currentModule: "React",
                    recentConcepts: ["useState"],
                    struggledTopics: [],
                    completedProjects: [],
                    relatedTech: ["Redux", "MobX"]
                },
                previousInteractions: []
            };
            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("Redux");
            expect(response.additionalResources).toContain("State Management Comparison");
        });

        it('should adapt to time constraints', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Quick overview of TypeScript?",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "TypeScript Basics",
                context: {
                    currentModule: "TypeScript",
                    recentConcepts: [],
                    struggledTopics: [],
                    completedProjects: [],
                    timeConstraint: "limited"
                },
                previousInteractions: []
            };
            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("brief");
            expect(response.content.length).toBeLessThan(500);
        });

        it('should consider industry focus', async () => {
            const interaction: TutorInteraction = {
                userQuery: "How to handle forms?",
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "Forms and Validation",
                context: {
                    currentModule: "Web Development",
                    recentConcepts: ["validation"],
                    struggledTopics: [],
                    completedProjects: [],
                    industryFocus: "healthcare"
                },
                previousInteractions: []
            };
            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("HIPAA");
            expect(response.content).toContain("sensitive data");
        });

        it('should integrate cross-disciplinary knowledge', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Explain database indexing",
                skillLevel: SkillLevel.ADVANCED,
                currentTopic: "Database Optimization",
                context: {
                    currentModule: "Backend Development",
                    recentConcepts: ["SQL", "NoSQL"],
                    struggledTopics: [],
                    completedProjects: [],
                    relatedKnowledge: ["data structures", "algorithms"]
                },
                previousInteractions: []
            };
            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("binary tree");
            expect(response.content).toContain("time complexity");
        });
    });

    describe('Error Handling', () => {
        it('should handle empty queries', async () => {
            const interaction: TutorInteraction = {
                userQuery: "",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "JavaScript Basics",
                context: {
                    currentModule: "Getting Started",
                    recentConcepts: [],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: []
            };

            await expect(tutorChain.generateResponse(interaction))
                .rejects.toThrow('Query cannot be empty');
        });

        it('should handle invalid skill levels', async () => {
            const interaction: TutorInteraction = {
                userQuery: "What is JavaScript?",
                skillLevel: "INVALID" as any,
                currentTopic: "JavaScript Basics",
                context: {
                    currentModule: "Getting Started",
                    recentConcepts: [],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: []
            };

            await expect(tutorChain.generateResponse(interaction))
                .rejects.toThrow('Invalid skill level');
        });

        it('should handle missing context data', async () => {
            const interaction: TutorInteraction = {
                userQuery: "What is JavaScript?",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "JavaScript Basics",
                context: undefined as any,
                previousInteractions: []
            };

            await expect(tutorChain.generateResponse(interaction))
                .rejects.toThrow('Context data is required');
        });

        it('should handle malformed previous interactions', async () => {
            const interaction: TutorInteraction = {
                userQuery: "What is JavaScript?",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "JavaScript Basics",
                context: {
                    currentModule: "Getting Started",
                    recentConcepts: [],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: [{ invalid: "data" }] as any
            };

            await expect(tutorChain.generateResponse(interaction))
                .rejects.toThrow('Invalid previous interaction format');
        });

        it('should handle invalid topic transitions', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Tell me about React hooks",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "React Advanced",
                context: {
                    currentModule: "JavaScript Basics",
                    recentConcepts: ["variables"],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: []
            };

            await expect(tutorChain.generateResponse(interaction))
                .rejects.toThrow('Invalid topic progression');
        });

        it('should handle excessive code length', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Check this code: " + "console.log('hello');".repeat(1000),
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "JavaScript",
                context: {
                    currentModule: "Code Review",
                    recentConcepts: [],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: []
            };

            await expect(tutorChain.generateResponse(interaction))
                .rejects.toThrow('Code sample too long');
        });

        it('should handle circular references in context', async () => {
            const circularContext: any = {
                currentModule: "JavaScript",
                recentConcepts: [],
                struggledTopics: [],
                completedProjects: []
            };
            circularContext.self = circularContext;

            const interaction: TutorInteraction = {
                userQuery: "Help me understand this",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "JavaScript",
                context: circularContext,
                previousInteractions: []
            };

            await expect(tutorChain.generateResponse(interaction))
                .rejects.toThrow('Invalid context structure');
        });

        it('should handle rate limiting gracefully', async () => {
            // Simulate multiple rapid requests
            const interactions = Array(5).fill({
                userQuery: "Quick question",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "JavaScript",
                context: {
                    currentModule: "Basics",
                    recentConcepts: [],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: []
            });

            await expect(Promise.all(interactions.map(i => tutorChain.generateResponse(i))))
                .rejects.toThrow('Rate limit exceeded');
        });

        it('should handle malformed code snippets', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Fix this: if(x == y { console.log('equal') }",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "JavaScript",
                context: {
                    currentModule: "Debugging",
                    recentConcepts: [],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.type).toBe(ResponseType.ERROR_CORRECTION);
            expect(response.content).toContain('syntax error');
            expect(response.content).toContain('missing parenthesis');
        });

        it('should handle concurrent session conflicts', async () => {
            const interaction: TutorInteraction = {
                userQuery: "What's next?",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "JavaScript",
                context: {
                    currentModule: "Basics",
                    recentConcepts: [],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: [],
                sessionId: "duplicate"
            };

            // Simulate concurrent sessions with same ID
            await tutorChain.generateResponse(interaction);
            await expect(tutorChain.generateResponse(interaction))
                .rejects.toThrow('Session conflict');
        });
    });

    describe('Integration Points', () => {
        it('should handle resource requests', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Do you have any resources about promises?",
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "Async JavaScript",
                context: {
                    currentModule: "Advanced JavaScript",
                    recentConcepts: ["promises"],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.type).toBe(ResponseType.CONCEPT_EXPLANATION);
            expect(response.additionalResources).toBeDefined();
            expect(response.additionalResources?.length).toBeGreaterThan(0);
        });

        it('should suggest code exercises when appropriate', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Can I practice this?",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "JavaScript Basics",
                context: {
                    currentModule: "JavaScript Fundamentals",
                    recentConcepts: ["variables", "functions"],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: [{
                    query: "How do functions work?",
                    response: "Functions are reusable blocks of code...",
                    timestamp: new Date().toISOString()
                }]
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.type).toBe(ResponseType.EXERCISE);
            expect(response.codeSnippets).toBeDefined();
            expect(response.content).toContain("practice");
        });
    });

    describe('Learning Path Integration', () => {
        it('should suggest next topics based on current progress', async () => {
            const interaction: TutorInteraction = {
                userQuery: "What should I learn next?",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "JavaScript Basics",
                context: {
                    currentModule: "JavaScript Fundamentals",
                    recentConcepts: ["variables", "functions"],
                    struggledTopics: [],
                    completedProjects: ["basic-calculator"]
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.type).toBe(ResponseType.CONCEPT_EXPLANATION);
            expect(response.content).toContain("next step");
            expect(response.additionalResources).toHaveLength(3);
        });

        it('should provide remedial content for struggled topics', async () => {
            const interaction: TutorInteraction = {
                userQuery: "I'm still confused about promises",
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "Async JavaScript",
                context: {
                    currentModule: "Advanced JavaScript",
                    recentConcepts: ["async/await"],
                    struggledTopics: ["promises", "callbacks"],
                    completedProjects: []
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("Let's review");
            expect(response.additionalResources).toContain("MDN Promise Guide");
        });

        it('should create personalized learning paths', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Create a study plan for React",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "React Basics",
                context: {
                    currentModule: "React",
                    recentConcepts: ["JavaScript", "DOM"],
                    struggledTopics: [],
                    completedProjects: [],
                    learningStyle: "practical"
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("roadmap");
            expect(response.content).toContain("hands-on");
        });

        it('should adapt path based on career goals', async () => {
            const interaction: TutorInteraction = {
                userQuery: "How should I learn JavaScript for backend development?",
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "JavaScript",
                context: {
                    currentModule: "JavaScript Advanced",
                    recentConcepts: ["functions"],
                    struggledTopics: [],
                    completedProjects: [],
                    careerGoal: "backend-developer"
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("Node.js");
            expect(response.content).toContain("server-side");
        });

        it('should recommend prerequisite topics', async () => {
            const interaction: TutorInteraction = {
                userQuery: "I want to learn GraphQL",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "API Development",
                context: {
                    currentModule: "Web Development",
                    recentConcepts: ["HTTP"],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("REST");
            expect(response.content).toContain("prerequisite");
        });

        it('should provide estimated completion times', async () => {
            const interaction: TutorInteraction = {
                userQuery: "How long will it take to learn React?",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "React",
                context: {
                    currentModule: "Frontend Development",
                    recentConcepts: ["JavaScript"],
                    struggledTopics: [],
                    completedProjects: [],
                    studyTime: "10hrs/week"
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("timeline");
            expect(response.content).toMatch(/\d+\s*(weeks?|months?)/);
        });

        it('should suggest learning materials by format', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Best way to learn TypeScript?",
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "TypeScript",
                context: {
                    currentModule: "TypeScript Basics",
                    recentConcepts: ["JavaScript"],
                    struggledTopics: [],
                    completedProjects: [],
                    preferredFormat: "video"
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("video tutorials");
            expect(response.additionalResources).toContain("Video Course");
        });

        it('should integrate with project milestones', async () => {
            const interaction: TutorInteraction = {
                userQuery: "What project should I build next?",
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "React Projects",
                context: {
                    currentModule: "React Advanced",
                    recentConcepts: ["hooks", "context"],
                    struggledTopics: [],
                    completedProjects: ["todo-app"]
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("project");
            expect(response.content).toContain("milestone");
        });

        it('should provide alternative learning paths', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Different ways to learn testing?",
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "Testing",
                context: {
                    currentModule: "Quality Assurance",
                    recentConcepts: ["unit tests"],
                    struggledTopics: ["mocking"],
                    completedProjects: []
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("alternative");
            expect(response.content).toContain("approaches");
        });

        it('should adjust for learning pace', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Am I ready for advanced topics?",
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "JavaScript Advanced",
                context: {
                    currentModule: "JavaScript",
                    recentConcepts: ["promises", "async/await"],
                    struggledTopics: [],
                    completedProjects: [],
                    learningPace: "fast"
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("pace");
            expect(response.content).toContain("progress");
        });
    });

    describe('Interactive Learning', () => {
        it('should handle code correction requests', async () => {
            const interaction: TutorInteraction = {
                userQuery: "What's wrong with this code: for(i=0; i<10; i++) { console.log(i) }",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "JavaScript Basics",
                context: {
                    currentModule: "JavaScript Fundamentals",
                    recentConcepts: ["loops"],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.type).toBe(ResponseType.ERROR_CORRECTION);
            expect(response.content).toContain("missing 'let' or 'const'");
            expect(response.codeSnippets).toBeDefined();
        });

        it('should provide progressive hints', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Give me a hint for the array exercise",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "JavaScript Arrays",
                context: {
                    currentModule: "JavaScript Fundamentals",
                    recentConcepts: ["arrays", "loops"],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: [
                    {
                        query: "How do I solve the array exercise?",
                        response: "Try thinking about how to iterate through the array",
                        timestamp: new Date().toISOString()
                    }
                ]
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.type).toBe(ResponseType.HINT);
            expect(response.content).not.toContain("iterate");
            expect(response.codeSnippets).toBeDefined();
        });

        it('should provide interactive code examples', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Show me how to use map function",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "JavaScript Arrays",
                context: {
                    currentModule: "JavaScript Fundamentals",
                    recentConcepts: ["arrays"],
                    struggledTopics: [],
                    completedProjects: [],
                    learningStyle: "practical"
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.type).toBe(ResponseType.CODE_EXAMPLE);
            expect(response.content).toContain("Try it yourself");
            expect(response.codeSnippets).toHaveLength(2); // Example and exercise
        });

        it('should adapt to user frustration', async () => {
            const interaction: TutorInteraction = {
                userQuery: "I still don't get it!",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "JavaScript Promises",
                context: {
                    currentModule: "Async JavaScript",
                    recentConcepts: ["promises"],
                    struggledTopics: ["async"],
                    completedProjects: []
                },
                previousInteractions: [
                    {
                        query: "How do promises work?",
                        response: "Technical explanation of promises...",
                        timestamp: new Date().toISOString()
                    }
                ]
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("Let's try a different approach");
            expect(response.type).toBe(ResponseType.CONCEPT_EXPLANATION);
        });

        it('should provide real-time feedback', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Check my code: function add(a,b) { return a+b }",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "JavaScript Functions",
                context: {
                    currentModule: "JavaScript Fundamentals",
                    recentConcepts: ["functions"],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("Good job");
            expect(response.content).toContain("improvement");
        });

        it('should guide through debugging process', async () => {
            const interaction: TutorInteraction = {
                userQuery: "My code isn't working: fetch('/api').then(console.log)",
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "Async JavaScript",
                context: {
                    currentModule: "API Integration",
                    recentConcepts: ["promises", "fetch"],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("step by step");
            expect(response.content).toContain("response.json()");
        });

        it('should provide interactive exercises', async () => {
            const interaction: TutorInteraction = {
                userQuery: "I want to practice array methods",
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "JavaScript Arrays",
                context: {
                    currentModule: "JavaScript Advanced",
                    recentConcepts: ["map", "filter"],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.type).toBe(ResponseType.EXERCISE);
            expect(response.content).toContain("Complete the following");
            expect(response.codeSnippets).toBeDefined();
        });

        it('should adapt difficulty dynamically', async () => {
            const interaction: TutorInteraction = {
                userQuery: "This is too hard",
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "TypeScript Generics",
                context: {
                    currentModule: "TypeScript Advanced",
                    recentConcepts: ["generics"],
                    struggledTopics: ["type inference"],
                    completedProjects: []
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("simpler example");
            expect(response.type).toBe(ResponseType.CONCEPT_EXPLANATION);
        });

        it('should encourage active learning', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Tell me about React components",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "React Basics",
                context: {
                    currentModule: "React",
                    recentConcepts: ["JSX"],
                    struggledTopics: [],
                    completedProjects: [],
                    learningStyle: "practical"
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("Try creating");
            expect(response.codeSnippets).toBeDefined();
        });

        it('should provide contextual practice opportunities', async () => {
            const interaction: TutorInteraction = {
                userQuery: "How can I practice this?",
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "State Management",
                context: {
                    currentModule: "React Advanced",
                    recentConcepts: ["useState", "useContext"],
                    struggledTopics: [],
                    completedProjects: ["todo-app"],
                    industryFocus: "e-commerce"
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.type).toBe(ResponseType.EXERCISE);
            expect(response.content).toContain("shopping cart");
            expect(response.content).toContain("e-commerce");
        });
    });

    describe('Personalization', () => {
        it('should maintain consistent terminology across interactions', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Tell me more about that",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "JavaScript Objects",
                context: {
                    currentModule: "JavaScript Fundamentals",
                    recentConcepts: ["objects"],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: [
                    {
                        query: "What's an object in JavaScript?",
                        response: "Think of an object as a container that holds related data and functions",
                        timestamp: new Date().toISOString()
                    }
                ]
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("container");
            expect(response.type).toBe(ResponseType.CONCEPT_EXPLANATION);
        });

        it('should adapt examples to user interests', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Show me how to use arrays",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "JavaScript Arrays",
                context: {
                    currentModule: "JavaScript Fundamentals",
                    recentConcepts: ["arrays"],
                    struggledTopics: [],
                    completedProjects: [],
                    interests: ["gaming", "web development"]
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toMatch(/(game|player|score|website|webpage)/);
            expect(response.codeSnippets?.[0]).toMatch(/(game|player|score|website|webpage)/);
        });

        it('should respect cultural context', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Explain functions with examples",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "JavaScript Functions",
                context: {
                    currentModule: "JavaScript Fundamentals",
                    recentConcepts: [],
                    struggledTopics: [],
                    completedProjects: [],
                    culturalBackground: "Indian",
                    languagePreference: "en-IN"
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("rupees");
            expect(response.content).toMatch(/₹/);
        });

        it('should adapt to accessibility needs', async () => {
            const interaction: TutorInteraction = {
                userQuery: "How do I style components?",
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "React Styling",
                context: {
                    currentModule: "React",
                    recentConcepts: ["CSS-in-JS"],
                    struggledTopics: [],
                    completedProjects: [],
                    accessibilityNeeds: ["colorblind-friendly", "screen-reader"]
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("ARIA");
            expect(response.content).toContain("contrast ratio");
        });

        it('should consider device preferences', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Show me how to handle touch events",
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "Event Handling",
                context: {
                    currentModule: "React Mobile",
                    recentConcepts: ["events"],
                    struggledTopics: [],
                    completedProjects: [],
                    devicePreference: "mobile"
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("touchstart");
            expect(response.content).toContain("mobile-specific");
        });

        it('should adapt to communication style', async () => {
            const interaction: TutorInteraction = {
                userQuery: "What are closures?",
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "JavaScript Closures",
                context: {
                    currentModule: "JavaScript Advanced",
                    recentConcepts: ["functions", "scope"],
                    struggledTopics: [],
                    completedProjects: [],
                    preferredCommunicationStyle: "socratic"
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("What do you think happens");
            expect(response.content).toMatch(/\?$/m);
        });

        it('should consider previous experience', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Explain React hooks",
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "React Hooks",
                context: {
                    currentModule: "React",
                    recentConcepts: ["useState"],
                    struggledTopics: [],
                    completedProjects: [],
                    previousExperience: {
                        languages: ["python"],
                        frameworks: ["django"],
                        years: 3
                    }
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("Django");
            expect(response.content).toContain("Python");
        });

        it('should adapt to time zone and schedule', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Create a study plan for React",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "React Basics",
                context: {
                    currentModule: "React",
                    recentConcepts: [],
                    struggledTopics: [],
                    completedProjects: [],
                    timeZone: "Asia/Tokyo",
                    studyTime: "evenings"
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("JST");
            expect(response.content).toContain("evening");
        });

        it('should personalize error messages', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Fix my code: console.log(x)",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "JavaScript Debugging",
                context: {
                    currentModule: "JavaScript Fundamentals",
                    recentConcepts: ["variables"],
                    struggledTopics: ["scope"],
                    completedProjects: [],
                    learningStyle: LearningStyle.VISUAL
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.type).toBe(ResponseType.ERROR_CORRECTION);
            expect(response.content).toContain("diagram");
            expect(response.content).toContain("visualization");
        });

        it('should adapt content format', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Teach me about APIs",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "Web APIs",
                context: {
                    currentModule: "Web Development",
                    recentConcepts: ["HTTP"],
                    struggledTopics: [],
                    completedProjects: [],
                    preferredFormat: ContentFormat.INTERACTIVE,
                    learningStyle: LearningStyle.PRACTICAL
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("Try this interactive example");
            expect(response.codeSnippets).toBeDefined();
            expect(response.type).toBe(ResponseType.CODE_EXAMPLE);
        });
    });

    describe('Critical Functionality', () => {
        it('should handle concurrent multi-user interactions', async () => {
            const users = Array(5).fill(null).map((_, i) => ({
                userQuery: "What is JavaScript?",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "JavaScript Basics",
                context: {
                    currentModule: "Getting Started",
                    recentConcepts: [],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: [],
                sessionId: `user-${i}`
            }));

            const responses = await Promise.all(users.map(u => tutorChain.generateResponse(u)));
            expect(responses).toHaveLength(5);
            expect(new Set(responses.map(r => r.content)).size).toBe(5); // Each response should be unique
        });

        it('should maintain context across long sessions', async () => {
            const interactions = [
                {
                    userQuery: "What is JavaScript?",
                    response: "JavaScript is a programming language..."
                },
                {
                    userQuery: "How do I declare variables?",
                    response: "You can use let, const, or var..."
                },
                {
                    userQuery: "What about functions?",
                    response: "Functions are reusable blocks of code..."
                }
            ].map(i => ({
                ...i,
                timestamp: new Date().toISOString()
            }));

            const interaction: TutorInteraction = {
                userQuery: "How does this all fit together?",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "JavaScript Basics",
                context: {
                    currentModule: "JavaScript Fundamentals",
                    recentConcepts: ["variables", "functions"],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: interactions
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("variables");
            expect(response.content).toContain("functions");
            expect(response.content).toContain("together");
        });

        it('should handle system interruptions gracefully', async () => {
            vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));
            
            const interaction: TutorInteraction = {
                userQuery: "What is React?",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "React Basics",
                context: {
                    currentModule: "React",
                    recentConcepts: [],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("offline");
            expect(response.type).toBe(ResponseType.CONCEPT_EXPLANATION);
        });

        it('should maintain data consistency across updates', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Update my learning path",
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "JavaScript",
                context: {
                    currentModule: "Advanced JavaScript",
                    recentConcepts: ["promises"],
                    struggledTopics: [],
                    completedProjects: ["basic-app"],
                    learningStyle: LearningStyle.PRACTICAL
                },
                previousInteractions: []
            };

            const response1 = await tutorChain.generateResponse(interaction);
            const response2 = await tutorChain.generateResponse(interaction);
            expect(response1.content).toBe(response2.content);
        });

        it('should handle large code submissions efficiently', async () => {
            const largeCode = "function example() {\n".repeat(1000) + "}".repeat(1000);
            const interaction: TutorInteraction = {
                userQuery: `Review this code: ${largeCode}`,
                skillLevel: SkillLevel.ADVANCED,
                currentTopic: "Code Review",
                context: {
                    currentModule: "Best Practices",
                    recentConcepts: [],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.type).toBe(ResponseType.ERROR_CORRECTION);
            expect(response.content).toContain("code size");
        });

        it('should provide accurate progress tracking', async () => {
            const interaction: TutorInteraction = {
                userQuery: "What's my progress?",
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "React",
                context: {
                    currentModule: "React Advanced",
                    recentConcepts: ["hooks", "context", "effects"],
                    struggledTopics: ["performance"],
                    completedProjects: ["todo-app", "blog"],
                    learningStyle: LearningStyle.PRACTICAL
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toMatch(/\d+%/);
            expect(response.content).toContain("completed projects");
        });

        it('should handle complex multi-step explanations', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Explain how React's virtual DOM works",
                skillLevel: SkillLevel.ADVANCED,
                currentTopic: "React Internals",
                context: {
                    currentModule: "React Advanced",
                    recentConcepts: ["rendering", "reconciliation"],
                    struggledTopics: [],
                    completedProjects: [],
                    learningStyle: LearningStyle.THEORETICAL
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("Step 1");
            expect(response.content).toContain("reconciliation");
            expect(response.codeSnippets).toHaveLength(3); // Multiple examples
        });

        it('should provide robust error recovery', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Fix this code with multiple errors: for(i=0;i<10;i++ console.log(i)",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "Debugging",
                context: {
                    currentModule: "JavaScript Fundamentals",
                    recentConcepts: ["loops", "syntax"],
                    struggledTopics: ["debugging"],
                    completedProjects: []
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.type).toBe(ResponseType.ERROR_CORRECTION);
            expect(response.content).toContain("multiple issues");
            expect(response.codeSnippets).toBeDefined();
        });

        it('should handle memory-intensive operations', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Explain big O notation with all possible examples",
                skillLevel: SkillLevel.ADVANCED,
                currentTopic: "Algorithms",
                context: {
                    currentModule: "Computer Science",
                    recentConcepts: ["complexity", "algorithms"],
                    struggledTopics: [],
                    completedProjects: [],
                    learningStyle: LearningStyle.THEORETICAL
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("O(n)");
            expect(response.codeSnippets).toBeDefined();
        });

        it('should maintain security boundaries', async () => {
            const interaction: TutorInteraction = {
                userQuery: "How do I access system files?",
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "File System",
                context: {
                    currentModule: "Node.js",
                    recentConcepts: ["fs"],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("security");
            expect(response.content).toContain("best practices");
        });

        it('should handle real-time content updates', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Latest React features",
                skillLevel: SkillLevel.ADVANCED,
                currentTopic: "React Updates",
                context: {
                    currentModule: "React Advanced",
                    recentConcepts: ["server components"],
                    struggledTopics: [],
                    completedProjects: [],
                    timeConstraint: "flexible"
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("latest version");
            expect(response.content).toMatch(/React \d+\.\d+/);
        });

        it('should handle complex state transitions', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Guide me through state management",
                skillLevel: SkillLevel.INTERMEDIATE,
                currentTopic: "State Management",
                context: {
                    currentModule: "React Advanced",
                    recentConcepts: ["redux", "context"],
                    struggledTopics: [],
                    completedProjects: [],
                    learningStyle: LearningStyle.PRACTICAL
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.type).toBe(ResponseType.CODE_EXAMPLE);
            expect(response.content).toContain("state flow");
            expect(response.codeSnippets).toHaveLength(4); // Multiple state examples
        });

        it('should provide fallback content offline', async () => {
            vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Offline'));
            
            const interaction: TutorInteraction = {
                userQuery: "Explain promises",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "Async JavaScript",
                context: {
                    currentModule: "JavaScript Advanced",
                    recentConcepts: [],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toBeDefined();
            expect(response.type).toBe(ResponseType.CONCEPT_EXPLANATION);
        });

        it('should handle concurrent resource access', async () => {
            const interactions = Array(10).fill({
                userQuery: "Show me an example",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "JavaScript",
                context: {
                    currentModule: "Basics",
                    recentConcepts: [],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: []
            });

            const responses = await Promise.all(interactions.map(i => tutorChain.generateResponse(i)));
            expect(responses).toHaveLength(10);
            expect(responses.every(r => r.content)).toBe(true);
        });

        it('should maintain response quality under load', async () => {
            const heavyQuery = "Explain " + "everything about ".repeat(100) + "JavaScript";
            const interaction: TutorInteraction = {
                userQuery: heavyQuery,
                skillLevel: SkillLevel.ADVANCED,
                currentTopic: "JavaScript",
                context: {
                    currentModule: "Complete JavaScript",
                    recentConcepts: [],
                    struggledTopics: [],
                    completedProjects: []
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content.length).toBeGreaterThan(100);
            expect(response.content).toContain("key concepts");
        });

        it('should handle malformed input gracefully', async () => {
            const interaction = {
                userQuery: "Help me learn",
                skillLevel: "INVALID_LEVEL" as any,
                currentTopic: "",
                context: null as any,
                previousInteractions: null as any
            };

            const response = await tutorChain.generateResponse(interaction as TutorInteraction);
            expect(response.type).toBe(ResponseType.ERROR_CORRECTION);
            expect(response.content).toContain("invalid input");
        });

        it('should maintain response time SLA', async () => {
            const start = Date.now();
            const interaction: TutorInteraction = {
                userQuery: "Quick response needed",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "JavaScript",
                context: {
                    currentModule: "Basics",
                    recentConcepts: [],
                    struggledTopics: [],
                    completedProjects: [],
                    timeConstraint: "limited"
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            const duration = Date.now() - start;
            expect(duration).toBeLessThan(1000); // 1 second SLA
            expect(response.content).toBeDefined();
        });

        it('should handle deep recursive explanations', async () => {
            const interaction: TutorInteraction = {
                userQuery: "Explain JavaScript event loop in detail",
                skillLevel: SkillLevel.ADVANCED,
                currentTopic: "JavaScript Runtime",
                context: {
                    currentModule: "JavaScript Advanced",
                    recentConcepts: ["async", "promises"],
                    struggledTopics: [],
                    completedProjects: [],
                    learningStyle: LearningStyle.THEORETICAL
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("call stack");
            expect(response.content).toContain("microtasks");
            expect(response.content).toContain("macrotasks");
        });

        it('should provide consistent responses across platforms', async () => {
            const query = "How do I handle events?";
            const platforms = ['mobile', 'desktop', 'tablet'] as const;
            
            const responses = await Promise.all(platforms.map(platform => 
                tutorChain.generateResponse({
                    userQuery: query,
                    skillLevel: SkillLevel.INTERMEDIATE,
                    currentTopic: "Event Handling",
                    context: {
                        currentModule: "JavaScript",
                        recentConcepts: ["events"],
                        struggledTopics: [],
                        completedProjects: [],
                        devicePreference: platform
                    },
                    previousInteractions: []
                })
            ));

            const concepts = responses.map(r => 
                r.content.match(/\b(event|listener|handler)\b/g)?.length
            );
            expect(new Set(concepts).size).toBe(1); // Same core concepts across platforms
        });

        it('should handle edge case learning paths', async () => {
            const interaction: TutorInteraction = {
                userQuery: "I want to learn everything at once",
                skillLevel: SkillLevel.BEGINNER,
                currentTopic: "Full Stack",
                context: {
                    currentModule: "Complete Web Dev",
                    recentConcepts: [],
                    struggledTopics: ["everything"],
                    completedProjects: [],
                    learningPace: "fast",
                    timeConstraint: "limited"
                },
                previousInteractions: []
            };

            const response = await tutorChain.generateResponse(interaction);
            expect(response.content).toContain("step by step");
            expect(response.content).toContain("foundation");
            expect(response.type).toBe(ResponseType.CONCEPT_EXPLANATION);
        });
    });
});

class TutorChain {
    private sessions: Map<string, any> = new Map();
    private rateLimit: Map<string, number> = new Map();

    async generateResponse(interaction: TutorInteraction) {
        this.validateInteraction(interaction);
        this.checkRateLimit(interaction);
        
        const sessionId = interaction.sessionId || 'default';
        this.updateSession(sessionId, interaction);

        const response = await this.processInteraction(interaction);
        return this.formatResponse(response);
    }

    private validateInteraction(interaction: TutorInteraction) {
        if (!interaction.userQuery) {
            throw new Error('Query cannot be empty');
        }
        if (!Object.values(SkillLevel).includes(interaction.skillLevel)) {
            throw new Error('Invalid skill level');
        }
        if (!interaction.context) {
            throw new Error('Context data is required');
        }
        if (interaction.previousInteractions?.some(i => !i.query || !i.response || !i.timestamp)) {
            throw new Error('Invalid previous interaction format');
        }
        this.validateTopicProgression(interaction);
    }

    private validateTopicProgression(interaction: TutorInteraction) {
        const { currentTopic, context } = interaction;
        const advancedTopics = ['React Advanced', 'TypeScript Advanced'];
        if (
            interaction.skillLevel === SkillLevel.BEGINNER &&
            advancedTopics.includes(currentTopic) &&
            !context.completedProjects.length
        ) {
            throw new Error('Invalid topic progression');
        }
    }

    private checkRateLimit(interaction: TutorInteraction) {
        const now = Date.now();
        const sessionId = interaction.sessionId || 'default';
        const lastRequest = this.rateLimit.get(sessionId) || 0;
        
        if (now - lastRequest < 100) { // 100ms minimum between requests
            throw new Error('Rate limit exceeded');
        }
        
        this.rateLimit.set(sessionId, now);
    }

    private updateSession(sessionId: string, interaction: TutorInteraction) {
        let session = this.sessions.get(sessionId) || {
            interactions: [],
            concepts: new Set(),
            startTime: Date.now()
        };

        session.interactions.push({
            query: interaction.userQuery,
            timestamp: new Date().toISOString()
        });

        interaction.context.recentConcepts.forEach(c => session.concepts.add(c));
        this.sessions.set(sessionId, session);
    }

    private async processInteraction(interaction: TutorInteraction) {
        const { userQuery, skillLevel, context } = interaction;
        
        // Handle code review/correction
        if (userQuery.includes('code:')) {
            return this.processCodeReview(userQuery, skillLevel);
        }

        // Handle progress tracking
        if (userQuery.toLowerCase().includes('progress')) {
            return this.generateProgressReport(interaction);
        }

        // Handle learning path requests
        if (userQuery.toLowerCase().includes('learn') || userQuery.toLowerCase().includes('study')) {
            return this.generateLearningPath(interaction);
        }

        // Default to concept explanation
        return this.generateConceptExplanation(interaction);
    }

    private async processCodeReview(query: string, skillLevel: SkillLevel) {
        const code = query.split('code:')[1].trim();
        
        if (code.length > 5000) {
            throw new Error('Code sample too long');
        }

        return {
            type: ResponseType.ERROR_CORRECTION,
            content: 'Code review response...',
            codeSnippets: [this.fixCode(code)],
            additionalResources: []
        };
    }

    private fixCode(code: string): string {
        // Code fixing logic here
        return code;
    }

    private async generateProgressReport(interaction: TutorInteraction) {
        const { context } = interaction;
        const completedCount = context.completedProjects.length;
        const progress = Math.min(100, (completedCount / 10) * 100);

        return {
            type: ResponseType.CONCEPT_EXPLANATION,
            content: `You've completed ${completedCount} projects (${progress}% progress)...`,
            additionalResources: [],
            followUpQuestions: []
        };
    }

    private async generateLearningPath(interaction: TutorInteraction) {
        const { context, skillLevel } = interaction;
        
        return {
            type: ResponseType.CONCEPT_EXPLANATION,
            content: 'Personalized learning path...',
            additionalResources: this.getRelevantResources(context),
            followUpQuestions: []
        };
    }

    private async generateConceptExplanation(interaction: TutorInteraction) {
        const { userQuery, skillLevel, context } = interaction;
        
        return {
            type: ResponseType.CONCEPT_EXPLANATION,
            content: 'Concept explanation...',
            codeSnippets: this.generateExamples(context),
            additionalResources: this.getRelevantResources(context),
            followUpQuestions: this.generateFollowUpQuestions(context)
        };
    }

    private generateExamples(context: TutorInteraction['context']): string[] {
        return ['Example 1...', 'Example 2...'];
    }

    private getRelevantResources(context: TutorInteraction['context']): string[] {
        return ['Resource 1...', 'Resource 2...'];
    }

    private generateFollowUpQuestions(context: TutorInteraction['context']): string[] {
        return ['Question 1?', 'Question 2?'];
    }

    private formatResponse(response: any) {
        return {
            type: response.type,
            content: response.content,
            codeSnippets: response.codeSnippets || [],
            additionalResources: response.additionalResources || [],
            followUpQuestions: response.followUpQuestions || []
        };
    }
}
