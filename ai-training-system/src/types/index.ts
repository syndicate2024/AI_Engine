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