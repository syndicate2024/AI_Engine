// @ai-protected
// Core types for the tutor system

export enum ResponseType {
    CONCEPT_EXPLANATION = 'concept_explanation',
    ERROR_CORRECTION = 'error_correction',
    HINT = 'hint',
    EXERCISE = 'exercise'
}

export enum SkillLevel {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced'
}

export interface TutorContext {
    recentConcepts: string[];
    struggledTopics: string[];
    completedProjects: string[];
    interests?: string[];
    currentTopic: string;
}

export interface TutorInteraction {
    userQuery: string;
    skillLevel: SkillLevel;
    context: TutorContext;
    previousInteractions: {
        query: string;
        response: string;
        timestamp: Date;
    }[];
    currentTopic: string;
} 