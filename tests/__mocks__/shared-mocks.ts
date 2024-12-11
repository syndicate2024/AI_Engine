// @ai-protected
// Shared Test Mocks

import { LearnerProfile, SkillLevel } from '@/types';
import { SkillLevel, TutorContext, TutorInteraction } from '../../src/types';

export const mockLearnerProfile: LearnerProfile = {
    id: 'test-learner-1',
    skillLevel: SkillLevel.BEGINNER,
    currentModule: 'JavaScript Fundamentals',
    completedModules: [],
    struggledTopics: [],
    strengths: [],
    learningStyle: 'visual',
    preferredExamples: ['web', 'games'],
    lastActive: new Date().toISOString(),
    progress: {
        currentTopic: 'Variables and Data Types',
        topicsCompleted: 0,
        exercisesCompleted: 0,
        projectsCompleted: 0
    }
};

export const mockTutorContext: TutorContext = {
    recentConcepts: ['variables', 'functions', 'loops'],
    struggledTopics: ['recursion'],
    completedProjects: ['calculator', 'todo-list'],
    interests: ['gaming', 'web development'],
    currentTopic: 'functions'
};

export const mockTutorInteraction: TutorInteraction = {
    userQuery: 'How do I create a function?',
    skillLevel: SkillLevel.BEGINNER,
    context: mockTutorContext,
    previousInteractions: [
        {
            query: 'What is a variable?',
            response: 'A variable is a container for storing data values.',
            timestamp: new Date('2024-01-01')
        }
    ],
    currentTopic: 'functions'
};

export const mockExerciseSubmission = `
function greet(name) {
    return "Hello, " + name;
}
`;

export const mockCodeWithErrors = `
for(i=0; i<10; i++) {
    console.log(x);
    while(true) {
        // infinite loop
    }
}
`;

export const mockSuccessfulSubmission = `
function calculateSum(a: number, b: number): number {
    return a + b;
}
`;

export const mockHintRequest = 'Can you give me a hint about functions?';

export const mockCodeCorrectionRequest = 'What is wrong with this code: for(i=0; i<10; i++) { console.log(i); }';

export const mockLearningPathQuery = 'What should I learn next after functions?';
