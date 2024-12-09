export enum ResponseType {
  CONCEPT_EXPLANATION = 'CONCEPT_EXPLANATION',
  CODE_EXAMPLE = 'CODE_EXAMPLE',
  ERROR_CORRECTION = 'ERROR_CORRECTION',
  PRACTICE_EXERCISE = 'PRACTICE_EXERCISE'
}

export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface LearningContext {
  currentModule: string;
  recentConcepts: string[];
  struggledTopics: string[];
  completedProjects: string[];
}

export interface CodeSnippet {
  language: string;
  code: string;
  explanation: string;
  focus: string[];
}

export interface Resource {
  type: 'documentation' | 'tutorial' | 'exercise' | 'video' | 'article';
  title: string;
  url?: string;
  relevance: number;
  description?: string;
}

export interface TutorResponse {
  type: ResponseType;
  content: string;
  additionalResources?: string[];
  followUpQuestions?: string[];
  codeSnippets?: string[];
}

export interface TutorInteraction {
  userQuery: string;
  skillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  currentTopic: string;
  previousInteractions?: TutorResponse[];
}

export interface OpenAIConfig {
  modelName: string;
  temperature: number;
  maxTokens: number;
}

export interface AgentConfig {
  openai: OpenAIConfig;
  prompts: {
    [key: string]: string;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

export interface ErrorResponse {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

// Mock response for testing
export const mockTutorResponse: TutorResponse = {
  type: ResponseType.CONCEPT_EXPLANATION,
  content: "This is a mock response for testing",
  additionalResources: ["https://example.com/resource"],
  followUpQuestions: ["What would you like to learn next?"],
  codeSnippets: ["console.log('Hello World');"]
}; 