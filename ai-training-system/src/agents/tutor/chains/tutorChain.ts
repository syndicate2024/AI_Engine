import OpenAI from 'openai';
import { TutorInteraction, TutorResponse, ResponseType, CodeSnippet } from '../../../types';

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

            return {
                type: ResponseType.CONCEPT_EXPLANATION,
                content,
                additionalResources: [],
                followUpQuestions: [],
                codeSnippets: this.extractCodeSnippets(content)
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

    private extractCodeSnippets(content: string): CodeSnippet[] {
        const snippetMatches = content.match(/```(?:js|javascript)?\n([\s\S]*?)```/g) || [];
        return snippetMatches.map(match => {
            const code = match.replace(/```(?:js|javascript)?\n|```/g, '').trim();
            return {
                code,
                explanation: 'Code example'
            };
        });
    }
} 