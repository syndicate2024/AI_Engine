export enum ResponseType {
  CONCEPT_EXPLANATION = 'CONCEPT_EXPLANATION',
  CODE_REVIEW = 'CODE_REVIEW',
  ERROR_HELP = 'ERROR_HELP',
  BEST_PRACTICES = 'BEST_PRACTICES',
  RESOURCE_SUGGESTION = 'RESOURCE_SUGGESTION'
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
  additionalResources?: Resource[];
  followUpQuestions?: string[];
  codeSnippets?: CodeSnippet[];
  confidence?: number;
}

export interface TutorInteraction {
  userQuery: string;
  skillLevel: SkillLevel;
  currentTopic: string;
  context: LearningContext;
  previousInteractions: TutorResponse[];
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