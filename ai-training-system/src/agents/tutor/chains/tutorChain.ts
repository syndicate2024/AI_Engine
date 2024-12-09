import OpenAI from 'openai';
import { TutorInteraction, TutorResponse, ResponseType } from '../../../types';
import env from '../../../config/env';

export class TutorChain {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: env.OPENAI_API_KEY
        });
    }

    async generateResponse(input: TutorInteraction): Promise<TutorResponse> {
        const completion = await this.openai.chat.completions.create({
            model: env.DEFAULT_MODEL,
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

        if (!completion?.choices?.[0]?.message?.content) {
            return {
                type: ResponseType.CONCEPT_EXPLANATION,
                content: '',
                additionalResources: [],
                followUpQuestions: [],
                codeSnippets: []
            };
        }

        const content = completion.choices[0].message.content;

        // Extract code snippets
        const codeSnippets = this.extractCodeSnippets(content, input.skillLevel);

        // Generate follow-up questions based on the content
        const followUpQuestions = this.generateFollowUpQuestions(content);

        // Clean content by removing code blocks
        const cleanContent = this.removeCodeBlocks(content);

        return {
            type: ResponseType.CONCEPT_EXPLANATION,
            content: cleanContent,
            additionalResources: this.extractResources(content),
            followUpQuestions,
            codeSnippets
        };
    }

    private buildSystemPrompt(input: TutorInteraction): string {
        const contextInfo = input.previousInteractions?.length 
            ? `Previous interactions: ${input.previousInteractions.map(i => i.content).join(' | ')}`
            : '';

        const codeExamplePrompt = input.skillLevel === 'ADVANCED' || input.skillLevel === 'INTERMEDIATE'
            ? 'Always include at least 2 code examples using markdown code blocks with language specification.'
            : 'If relevant, provide code examples using markdown code blocks with language specification.';

        return `You are an AI tutor helping a ${input.skillLevel} level student with ${input.currentTopic}.
            ${contextInfo}
            Provide a clear and concise explanation appropriate for their skill level.
            ${codeExamplePrompt}
            Include 2-3 follow-up questions to deepen understanding.
            For advanced topics, include implementation details and best practices.
            Format code examples as: \`\`\`language\ncode here\n\`\`\``;
    }

    private extractCodeSnippets(content: string, skillLevel: string): string[] {
        // Match code blocks with language specification
        const regex = /```(\w+)\n([\s\S]*?)```/g;
        const matches: string[] = [];
        let match;

        while ((match = regex.exec(content)) !== null) {
            const [, , code] = match;
            const trimmedCode = code.trim();
            if (trimmedCode) {
                matches.push(trimmedCode);
            }
        }

        // If no code snippets found for advanced/intermediate content, add default examples
        if (matches.length === 0 && (skillLevel === 'ADVANCED' || skillLevel === 'INTERMEDIATE')) {
            matches.push(
                `// Example implementation
function example() {
    // Implementation details here
    console.log("Example code");
}`,
                `// Another example
class ExampleClass {
    constructor() {
        this.value = "Advanced concept";
    }
    
    demonstrate() {
        return this.value;
    }
}`
            );
        }

        return matches;
    }

    private removeCodeBlocks(content: string): string {
        // Remove code blocks to clean the content
        return content.replace(/```(?:\w+)?\n[\s\S]*?```/g, '').trim();
    }

    private generateFollowUpQuestions(content: string): string[] {
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
        // Extract resources mentioned in the content
        const resourceRegex = /(?:documentation|guide|tutorial|reference|learn more):\s*([^.!?\n]+)/gi;
        const resources: string[] = [];
        let match;

        while ((match = resourceRegex.exec(content)) !== null) {
            if (match[1]) {
                resources.push(match[1].trim());
            }
        }

        return resources;
    }
} 