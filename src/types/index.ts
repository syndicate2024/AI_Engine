// @ai-protected
// Core types for the tutor system

export enum ResponseType {
    CONCEPT_EXPLANATION = 'concept_explanation',
    ERROR_CORRECTION = 'error_correction',
    HINT = 'hint',
    EXERCISE = 'exercise',
    CODE_EXAMPLE = 'code_example',
    LEARNING_PATH = 'learning_path'
}

export enum SkillLevel {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced'
}

export enum LearningStyle {
    VISUAL = 'visual',
    AUDITORY = 'auditory',
    KINESTHETIC = 'kinesthetic',
    READ_WRITE = 'read_write',
    PRACTICAL = 'practical',
    THEORETICAL = 'theoretical'
}

export enum ContentFormat {
    TEXT = 'text',
    VIDEO = 'video',
    INTERACTIVE = 'interactive',
    DIAGRAM = 'diagram'
}

export interface TutorContext {
    recentConcepts: string[];
    struggledTopics: string[];
    completedProjects: string[];
    interests?: string[];
    currentTopic: string;
    learningStyle?: LearningStyle;
    preferredFormat?: ContentFormat;
    mastery?: Record<string, number>;
    lastActive?: string;
    progress?: {
        currentTopic: string;
        topicsCompleted: number;
        exercisesCompleted: number;
    };
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