// @ai-protected
export interface LearningContext {
    recentConcepts?: string[];
    skillLevel?: SkillLevel;
    currentModule?: string;
    struggledTopics?: string[];
    completedProjects?: string[];  // Added this field
}

export enum SkillLevel {
    Beginner = "beginner",
    Intermediate = "intermediate",
    Advanced = "advanced",
    ADVANCED = "ADVANCED",
    INTERMEDIATE = "INTERMEDIATE"
}

// Base interface for shared properties
export interface TutorBase {
    content?: string;
    userQuery?: string;
    currentTopic?: string;
}

export interface TutorInteraction extends TutorBase {
    input?: string;
    userQuery: string;
    context?: LearningContext;
    currentTopic: string;
    previousInteractions?: (TutorInteraction | TutorResponse)[];  // Allow both types
    skillLevel?: string;
}

export interface TutorResponse extends TutorBase {
    content: string;
    type: ResponseType;
    followUpQuestions?: string[];
    codeSnippets?: string[];
    additionalResources?: string[];
}

export enum ResponseType {
    Explanation = "explanation",
    Question = "question",
    Correction = "correction",
    CONCEPT_EXPLANATION = "CONCEPT_EXPLANATION"
}
