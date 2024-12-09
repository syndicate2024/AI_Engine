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
  ERROR_EXPLANATION = 'ERROR_EXPLANATION',
  HINT = 'HINT',
  QUESTION = 'QUESTION'
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
  description: string;
  completed: boolean;
  timestamp: Date;
}

// Tutor interaction types
export interface TutorInteraction {
  question: string;
  response: TutorResponse;
  context: LearningContext;
  skillLevel: SkillLevel;
  currentTopic: string;
  previousInteractions: TutorInteraction[];
  timestamp: Date;
}

export interface TutorResponse {
  content: string;
  type: ResponseType;
  confidence: number;
  followUpQuestions: string[];
  relatedConcepts: string[];
}

// Context for tutor chain
export interface TutorContext {
  skillLevel: SkillLevel;
  currentTopic: string;
  learningPath: string[];
  previousInteractions: TutorInteraction[];
  currentModule: string;
  recentConcepts: string[];
  struggledTopics: string[];
  completedProjects: Project[];
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
  type: ResponseType;
  confidence: number;
  followUpQuestions?: string[];
  relatedConcepts?: string[];
}

export interface TutorContext extends LearningContext {
  skillLevel: SkillLevel;
  previousInteractions: TutorInteraction[];
  learningPath: string[];
  currentTopic: string;
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