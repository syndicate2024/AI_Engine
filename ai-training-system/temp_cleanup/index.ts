// Core types for the AI Training System

// Skill levels and response types
export enum SkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

export enum ResponseType {
  CONCEPT_EXPLANATION = 'CONCEPT_EXPLANATION',
  CODE_REVIEW = 'CODE_REVIEW',
  ERROR_HELP = 'ERROR_HELP',
  BEST_PRACTICES = 'BEST_PRACTICES',
  RESOURCE_SUGGESTION = 'RESOURCE_SUGGESTION',
  PROGRESS_CHECK = 'PROGRESS_CHECK'
}

// Learning context and progress tracking
export interface LearningContext {
  currentModule: string;
  recentConcepts: string[];
  struggledTopics: string[];
  completedProjects: Project[];
}

export interface Project {
  id: string;
  name: string;
  topics: string[];
  completed: boolean;
  feedback?: string;
}

// Tutor interaction types
export interface TutorInteraction {
  context: LearningContext;
  userQuery: string;
  skillLevel: SkillLevel;
  currentTopic: string;
  previousInteractions: Interaction[];
}

export interface Interaction {
  timestamp: string;
  query: string;
  response: string;
  type: ResponseType;
}

// Response structures
export interface TutorResponse {
  type: ResponseType;
  content: string;
  additionalResources?: Resource[];
  followUpQuestions?: string[];
  codeSnippets?: CodeSnippet[];
}

export interface Resource {
  type: 'documentation' | 'tutorial' | 'exercise' | 'example';
  title: string;
  url?: string;
  content?: string;
  relevance: number;
}

export interface CodeSnippet {
  code: string;
  language: string;
  explanation: string;
  focus?: string[];
}

// Re-export all types from validation.ts
export * from './validation';

// AI Configuration Types
export interface AIModelConfig {
  modelName: string;
  temperature: number;
  maxTokens: number;
  streaming: boolean;
}

export interface TutorConfig {
  maxResponseTokens: number;
  maxContextTokens: number;
  defaultTemperature: number;
  systemPromptTokens: number;
}

export interface AssessmentConfig {
  maxQuestions: number;
  minQuestions: number;
  defaultDifficulty: string;
  timeoutSeconds: number;
}

export interface ResourceConfig {
  maxResourcesPerQuery: number;
  cacheTimeoutMinutes: number;
  maxContentLength: number;
}

// Response Types
export type TutorResponseType = 'explanation' | 'example' | 'question' | 'correction' | 'hint';

// Tutor Types
export interface TutorResponse {
  content: string;
  type: TutorResponseType;
  confidence: number;
  followUpQuestions?: string[];
  relatedConcepts?: string[];
}

export interface TutorContext {
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  previousInteractions: TutorInteraction[];
  learningPath: string[];
  currentTopic: string;
}

export interface TutorInteraction {
  question: string;
  response: TutorResponse;
  timestamp: Date;
  feedback?: {
    helpful: boolean;
    comments?: string;
  };
}

// Assessment Types
export interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'coding' | 'open-ended';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topic: string;
  correctAnswer?: string;
  options?: string[];
}

export interface AssessmentResult {
  questionId: string;
  correct: boolean;
  response: string;
  feedback: string;
  timeSpent: number;
}

export interface Assessment {
  id: string;
  topic: string;
  questions: AssessmentQuestion[];
  results?: AssessmentResult[];
  completed: boolean;
  score?: number;
}

// Resource Types
export interface LearningResource {
  id: string;
  title: string;
  type: 'documentation' | 'tutorial' | 'exercise' | 'example';
  content: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[];
}

export interface ResourceMetadata {
  id: string;
  title: string;
  type: string;
  summary: string;
  lastUpdated: Date;
  popularity: number;
}

// Progress Tracking Types
export interface LearningProgress {
  userId: string;
  topic: string;
  status: 'not-started' | 'in-progress' | 'completed';
  assessments: Assessment[];
  resources: ResourceMetadata[];
  lastActivity: Date;
}

export interface ProgressSnapshot {
  timestamp: Date;
  skillLevel: string;
  completedTopics: string[];
  currentTopic: string;
  assessmentScores: Record<string, number>;
  timeSpent: number;
}