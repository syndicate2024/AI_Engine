import { ChatOpenAI } from '@langchain/openai';
import { TUTOR_PROMPTS, RESPONSE_TEMPLATES } from '../prompts/tutorPrompts';
import {
  LearningContext,
  TutorInteraction,
  TutorResponse,
  ResponseType,
  CodeSnippet,
  Resource
} from '../../../types';

export class TutorAgentChain {
  public model: ChatOpenAI;
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

  async generateResponse(input: TutorInteraction): Promise<TutorResponse> {
    try {
      // Validate input
      this.validateInput(input);

      // Determine response type
      const responseType = this.determineResponseType(input.userQuery);

      // Generate response
      const rawResponse = await this.generateSpecificResponse(input, responseType);
      if (!rawResponse) {
        return {
          type: responseType,
          content: 'No response generated. Please try again.',
          additionalResources: [],
          followUpQuestions: []
        };
      }

      // Format response
      const formattedResponse = await this.formatResponse(rawResponse, input, responseType);

      // Update learning context
      this.updateContext(input);

      return formattedResponse;
    } catch (error) {
      console.error('Error generating tutor response:', error);
      throw error;
    }
  }

  private validateInput(input: TutorInteraction): void {
    if (!input.userQuery || !input.skillLevel || !input.currentTopic) {
      throw new Error('Invalid input: Missing required fields');
    }

    if (!['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(input.skillLevel)) {
      throw new Error('Invalid skill level');
    }
  }

  private determineResponseType(query: string): ResponseType {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('error')) {
      return ResponseType.ERROR_HELP;
    }
    if (lowerQuery.includes('review')) {
      return ResponseType.CODE_REVIEW;
    }
    if (lowerQuery.includes('best') && lowerQuery.includes('practice')) {
      return ResponseType.BEST_PRACTICES;
    }
    if (lowerQuery.includes('resource') || lowerQuery.includes('more practice') || lowerQuery.includes('what next')) {
      return ResponseType.RESOURCE_SUGGESTION;
    }
    return ResponseType.CONCEPT_EXPLANATION;
  }

  private async generateSpecificResponse(
    input: TutorInteraction,
    type: ResponseType
  ): Promise<string> {
    const prompt = await this.getPromptForResponseType(input, type);
    const response = await this.model.invoke(prompt);
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
          context: input.context?.recentConcepts?.join(', ') || '',
          focusAreas: input.context?.struggledTopics?.join(', ') || ''
        });
      
      case ResponseType.CODE_REVIEW:
        return TUTOR_PROMPTS.codeReview.format({
          code: input.userQuery,
          skillLevel: input.skillLevel,
          previousInteractions: JSON.stringify(input.previousInteractions || [])
        });
      
      case ResponseType.ERROR_HELP:
        return TUTOR_PROMPTS.errorHelp.format({
          error: input.userQuery,
          context: input.context?.currentModule || '',
          skillLevel: input.skillLevel,
          previousAttempts: (input.previousInteractions || [])
            .map((interaction: TutorResponse) => interaction.content)
            .join('\n')
        });
      
      case ResponseType.BEST_PRACTICES:
        return TUTOR_PROMPTS.practiceExercise.format({
          concept: input.currentTopic,
          skillLevel: input.skillLevel,
          relatedConcepts: input.context?.recentConcepts?.join(', ') || '',
          previousExercises: (input.previousInteractions || [])
            .filter((interaction: TutorResponse) => interaction.type === ResponseType.BEST_PRACTICES)
            .map((interaction: TutorResponse) => interaction.content)
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
    const formattedContent = await this.model.invoke(
      RESPONSE_TEMPLATES.standardResponse.format({
        topic: input.currentTopic,
        skillLevel: input.skillLevel,
        responseType: type,
        content: content
      })
    );

    const codeSnippets = this.extractCodeSnippets(formattedContent.content.toString());
    const followUpQuestions = await this.generateFollowUpQuestions(input, formattedContent.content.toString());
    const additionalResources = await this.generateResources(input);

    return {
      type,
      content: formattedContent.content.toString(),
      followUpQuestions,
      codeSnippets,
      additionalResources
    };
  }

  private extractCodeSnippets(content: string): CodeSnippet[] {
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
    const questions = rawResponse
      .split('\n')
      .filter(line => line.trim().endsWith('?'))
      .slice(0, 3);

    return questions.length > 0 ? questions : [
      `Can you explain more about ${input.currentTopic}?`,
      `How would you apply this in a real-world scenario?`,
      `What are some common pitfalls to avoid?`
    ];
  }

  private async generateResources(
    input: TutorInteraction
  ): Promise<Resource[]> {
    const baseResources: Resource[] = [
      {
        type: 'documentation',
        title: `Official Documentation - ${input.currentTopic}`,
        relevance: 1.0
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

    // Add context-specific resources
    if (input.context?.struggledTopics?.length > 0) {
      baseResources.push({
        type: 'tutorial',
        title: `Deep Dive: ${input.context.struggledTopics[0]}`,
        relevance: 1.0
      });
    }

    return baseResources;
  }

  private updateContext(input: TutorInteraction): void {
    if (!input.context) return;

    this.learningContext = {
      ...input.context,
      recentConcepts: [
        input.currentTopic,
        ...(input.context.recentConcepts || [])
      ].slice(0, 5)
    };
  }
} 