/**
 * @fileoverview Unit tests for the AI Tutor Chain
 * Tests the core functionality of the tutor chain without making actual API calls
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TutorChain } from '../tutorChain';
import { ResponseType, TutorInteraction, TutorResponse } from '../../../../types';
import { mockOpenAI } from '../../../../../test/setup';

describe('TutorChain', () => {
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
    });

    it('should provide advanced content for experts', async () => {
        mockOpenAI.chat.completions.create.mockResolvedValueOnce({
            choices: [{
                message: {
                    content: "Advanced and complex explanation of closures..."
                }
            }]
        });

        const interaction: TutorInteraction = {
            userQuery: "What is a closure?",
            skillLevel: "ADVANCED",
            currentTopic: "JavaScript Functions",
            context: defaultContext,
            previousInteractions: []
        };

        const response = await tutorChain.generateResponse(interaction);
        expect(response.content).toMatch(/advanced|complex/i);
        expect(response.type).toBe(ResponseType.CONCEPT_EXPLANATION);
    });

    it('should extract code snippets from content', async () => {
        const codeContent = `Here's an example:
        \`\`\`javascript
        const array = [1, 2, 3];
        array.map(x => x * 2);
        \`\`\``;

        mockOpenAI.chat.completions.create.mockResolvedValueOnce({
            choices: [{
                message: {
                    content: codeContent
                }
            }]
        });

        const interaction: TutorInteraction = {
            userQuery: "Show me array methods",
            skillLevel: "INTERMEDIATE",
            currentTopic: "JavaScript Arrays",
            context: defaultContext,
            previousInteractions: []
        };

        const response: TutorResponse = await tutorChain.generateResponse(interaction);
        const snippets = response.codeSnippets || [];
        
        expect(snippets).toHaveLength(1);
        expect(snippets[0].code).toContain('array.map');
        expect(snippets[0].language).toBe('javascript');
    });

    it('should handle API errors', async () => {
        mockOpenAI.chat.completions.create.mockRejectedValueOnce(
            new Error('API Error')
        );

        const interaction: TutorInteraction = {
            userQuery: "test",
            skillLevel: "BEGINNER",
            currentTopic: "test",
            context: defaultContext,
            previousInteractions: []
        };

        await expect(tutorChain.generateResponse(interaction)).rejects.toThrow('API Error');
    });
}); 