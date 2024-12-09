import OpenAI from 'openai';
import { TutorInteraction, TutorResponse, ResponseType } from '../../../types';

export class TutorChain {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || 'test-key'
        });
    }

    async generateResponse(input: TutorInteraction): Promise<TutorResponse> {
        try {
            const completion = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: 'system',
                        content: this.buildSystemPrompt(input)
                    },
                    {
                        role: 'user',
                        content: input.userQuery
                    }
                ]
            });

            const content = completion?.choices?.[0]?.message?.content || '';

            // Ensure codeSnippets is always defined as an array
            const codeSnippets = this.extractCodeSnippets(content).map(code => ({
                code,
                explanation: 'Code example',
                language: 'javascript',
                focus: []
            }));

            return {
                type: ResponseType.CONCEPT_EXPLANATION,
                content,
                additionalResources: [],
                followUpQuestions: [],
                codeSnippets
            };
        } catch (error) {
            console.error('Error generating response:', error);
            throw error;
        }
    }

    private buildSystemPrompt(input: TutorInteraction): string {
        const contextInfo = input.previousInteractions?.length 
            ? `Previous interactions: ${input.previousInteractions.map(i => i.content).join(' | ')}`
            : '';

        return `You are an AI tutor helping a ${input.skillLevel} level student with ${input.currentTopic}.
            ${contextInfo}
            Provide a clear and concise explanation appropriate for their skill level.`;
    }

    private extractCodeSnippets(content: string): string[] {
        // Match code blocks with or without language specification
        const regex = /```(?:javascript|js)?\n([\s\S]*?)```/g;
        const matches = [];
        let match;

        while ((match = regex.exec(content)) !== null) {
            // Get the code inside the block and trim whitespace
            const code = match[1].trim();
            if (code) {
                matches.push(code);
            }
        }

        return matches;
    }
} 