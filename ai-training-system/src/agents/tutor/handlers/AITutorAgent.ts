import { ChatOpenAI } from '@langchain/openai';
import { TUTOR_PROMPTS, RESPONSE_TEMPLATES } from '../prompts/tutorPrompts';
import {
  LearningContext,
  TutorInteraction,
  TutorResponse,
  ResponseType,
  SkillLevel,
  CodeSnippet,
  Resource
} from '../../../types';

export class AITutorAgent {
  private model: ChatOpenAI;
  private learningContext: LearningContext;

  constructor() {
    this.model = new ChatOpenAI({
      temperature: 0.7,
      modelName: 'gpt-4-turbo',
    });

    // Initialize with empty context
    this.learningContext = {
      currentModule: '',
      recentConcepts: [],
      struggledTopics: [],
      completedProjects: []
    };
  }

  // Main response generation method
  async generateResponse(input: TutorInteraction): Promise<TutorResponse> {
    try {
      const responseType = this.determineResponseType(input.userQuery);
      const rawResponse = await this.generateSpecificResponse(input, responseType);
      const formattedResponse = await this.formatResponse(rawResponse, input, responseType);
      this.updateContext(input);
      return formattedResponse;
    } catch (error) {
      console.error('Error generating tutor response:', error);
      throw error;
    }
  }

  private determineResponseType(query: string): ResponseType {
    if (query.toLowerCase().includes('error')) {
      return ResponseType.ERROR_HELP;
    }
    if (query.toLowerCase().includes('review')) {
      return ResponseType.CODE_REVIEW;
    }
    if (query.toLowerCase().includes('best') && query.toLowerCase().includes('practice')) {
      return ResponseType.BEST_PRACTICES;
    }
    return ResponseType.CONCEPT_EXPLANATION;
  }

  private async generateSpecificResponse(
    input: TutorInteraction,
    type: ResponseType
  ): Promise<string> {
    const response = await this.model.invoke(
      await this.getPromptForResponseType(input, type)
    );
    return response.content.toString();
  }

  private async getPromptForResponseType(
    input: TutorInteraction,
    type: ResponseType
  ): Promise<string> {
    switch (type) {
      case ResponseType.CONCEPT_EXPLANATION:
        return TUTOR_PROMPTS.conceptExplanation.format({
          concept: input.currentTopic,
          skillLevel: input.skillLevel,
          context: input.context.recentConcepts.join(', '),
          focusAreas: input.context.struggledTopics.join(', ')
        });
      
      case ResponseType.CODE_REVIEW:
        return TUTOR_PROMPTS.codeReview.format({
          code: input.userQuery,
          skillLevel: input.skillLevel,
          previousInteractions: JSON.stringify(input.previousInteractions)
        });
      
      case ResponseType.ERROR_HELP:
        return TUTOR_PROMPTS.errorHelp.format({
          error: input.userQuery,
          context: input.context.currentModule,
          skillLevel: input.skillLevel,
          previousAttempts: input.previousInteractions
            .map(i => i.query)
            .join('\n')
        });
      
      case ResponseType.BEST_PRACTICES:
        return TUTOR_PROMPTS.practiceExercise.format({
          concept: input.currentTopic,
          skillLevel: input.skillLevel,
          relatedConcepts: input.context.recentConcepts.join(', '),
          previousExercises: input.previousInteractions
            .filter(i => i.type === ResponseType.BEST_PRACTICES)
            .map(i => i.query)
            .join('\n')
        });
      
      default:
        return TUTOR_PROMPTS.conceptExplanation.format({
          concept: input.currentTopic,
          skillLevel: input.skillLevel,
          context: '',
          focusAreas: ''
        });
    }
  }

  private async formatResponse(
    content: string,
    input: TutorInteraction,
    type: ResponseType
  ): Promise<TutorResponse> {
    // Format using the standard response template
    const formattedContent = await this.model.invoke(
      await RESPONSE_TEMPLATES.standardResponse.format({
        topic: input.currentTopic,
        skillLevel: input.skillLevel,
        responseType: type,
        content: content
      })
    );

    // Extract code snippets if present
    const codeSnippets = this.extractCodeSnippets(formattedContent.content.toString());
    
    // Generate follow-up questions based on the response
    const followUpQuestions = await this.generateFollowUpQuestions(
      input,
      formattedContent.content.toString()
    );

    return {
      type,
      content: formattedContent.content.toString(),
      followUpQuestions,
      codeSnippets,
      confidence: 1.0,
      additionalResources: await this.generateResources(input)
    };
  }

  private extractCodeSnippets(content: string): CodeSnippet[] {
    // Simple regex to extract code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const snippets: CodeSnippet[] = [];
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      snippets.push({
        language: match[1] || 'plaintext',
        code: match[2].trim(),
        explanation: 'Code snippet from response',
        focus: []
      });
    }

    return snippets;
  }

  private async generateFollowUpQuestions(
    input: TutorInteraction,
    rawResponse: string
  ): Promise<string[]> {
    // Extract 2-3 follow-up questions from the response
    const questions = rawResponse
      .split('\n')
      .filter(line => line.trim().endsWith('?'))
      .slice(0, 3);

    return questions.length > 0 ? questions : [
      `Can you explain more about ${input.currentTopic}?`,
      `How would you apply this in a real-world scenario?`
    ];
  }

  private async generateResources(
    input: TutorInteraction
  ): Promise<Resource[]> {
    // Generate resources based on the current topic
    return [
      {
        type: 'documentation',
        title: `Official Documentation - ${input.currentTopic}`,
        relevance: 1
      },
      {
        type: 'tutorial',
        title: `Interactive Tutorial - ${input.currentTopic}`,
        relevance: 0.8
      },
      {
        type: 'exercise',
        title: `Practice Exercise - ${input.currentTopic}`,
        relevance: 0.9
      }
    ];
  }

  private updateContext(input: TutorInteraction): void {
    this.learningContext = {
      ...input.context,
      recentConcepts: [
        input.currentTopic,
        ...input.context.recentConcepts
      ].slice(0, 5)
    };
  }
} 