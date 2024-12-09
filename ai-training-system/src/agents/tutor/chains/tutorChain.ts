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

            // Extract code snippets
            const codeSnippets = this.extractCodeSnippets(content);

            // Generate follow-up questions based on the content
            const followUpQuestions = this.generateFollowUpQuestions(content, input.skillLevel);

            // Clean content by removing code blocks
            const cleanContent = this.removeCodeBlocks(content);

            return {
                type: ResponseType.CONCEPT_EXPLANATION,
                content: cleanContent,
                additionalResources: this.extractResources(content),
                followUpQuestions,
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
            Provide a clear and concise explanation appropriate for their skill level.
            Include 2-3 follow-up questions to deepen understanding.
            If relevant, provide code examples using markdown code blocks with language specification.`;
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

    private removeCodeBlocks(content: string): string {
        // Remove code blocks to clean the content
        return content.replace(/```(?:javascript|js)?\n[\s\S]*?```/g, '').trim();
    }

    private generateFollowUpQuestions(content: string, skillLevel: string): string[] {
        // Extract questions that start with common question words
        const questionRegex = /(?:What|How|Why|Can you|Could you|Please explain|Explain).*?\?/g;
        const questions = content.match(questionRegex) || [];
        
        // If no questions found in content, generate default ones
        if (questions.length === 0) {
            return [
                "Can you explain this concept with a different example?",
                "How would you apply this in a real-world scenario?",
                "What are some common pitfalls to avoid?"
            ];
        }

        return questions;
    }

    private extractResources(content: string): string[] {
        // Extract URLs or resource mentions
        const urlRegex = /https?:\/\/[^\s]+/g;
        const resources = content.match(urlRegex) || [];
        
        // Add some default resources if none found
        if (resources.length === 0) {
            resources.push("https://developer.mozilla.org/");
        }
        
        return resources;
    }
} 