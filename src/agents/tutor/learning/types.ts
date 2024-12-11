// @ai-protected

export interface LearningNode {
    id: string;
    topic: string;
    prerequisites: string[];
    difficulty: number;
    estimatedTimeMinutes: number;
    dependencies: string[];
    nextTopics: string[];
    concepts: string[];
}

export interface TopicMetadata {
    requiredFor: string[];
    buildingBlocks: string[];
    commonStruggles: string[];
    remedialContent: string[];
    practiceExercises: string[];
}

export interface LearningPath {
    nodes: LearningNode[];
    currentNode: string;
    completedNodes: string[];
    struggledNodes: string[];
    recommendedPath: string[];
}

export interface LearningProgress {
    userId: string;
    currentTopic: string;
    completedTopics: string[];
    struggledTopics: string[];
    topicScores: Map<string, number>;
    averageCompletionTime: number;
    lastActivity: Date;
}

export interface TopicRecommendation {
    topic: string;
    reason: string;
    priority: number;
    prerequisites: string[];
    estimatedTime: number;
    remedialContent?: string[];
}

export interface PathOptimizationResult {
    recommendedPath: string[];
    remedialTopics: string[];
    estimatedTotalTime: number;
    prerequisites: Map<string, string[]>;
    alternativePaths?: string[][];
}

export interface LearningMetrics {
    completionRate: number;
    averageScore: number;
    struggledTopicsCount: number;
    timeSpentMinutes: number;
    conceptMastery: Map<string, number>;
    learningPace: 'slow' | 'moderate' | 'fast';
}

export interface PathValidation {
    isValid: boolean;
    missingPrerequisites: string[];
    skillGaps: string[];
    recommendations: string[];
    alternativePath?: string[];
} 