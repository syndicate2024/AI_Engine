// @ai-protected
// Tutor Chain Implementation

import { ResponseType, SkillLevel, TutorInteraction } from '../../../types';

// Learning style types for personalization
export enum LearningStyle {
    VISUAL = 'visual',
    AUDITORY = 'auditory',
    KINESTHETIC = 'kinesthetic',
    READ_WRITE = 'read_write'
}

export interface PersonalizationContext {
    learningStyle: LearningStyle;
    preferredExamples: string[];
    pacePreference: 'fast' | 'moderate' | 'slow';
    feedbackStyle: 'detailed' | 'concise';
}

export interface MasteryProgress {
    topic: string;
    level: number; // 0-100
    lastPracticed: Date;
    strengthAreas: string[];
    weakAreas: string[];
    completedExercises: number;
}

export interface ProgressTracking {
    masteryProgress: Map<string, MasteryProgress>;
    learningStreak: number;
    lastInteractionDate: Date;
    topicsInProgress: string[];
}

export interface ExerciseTemplate {
    type: 'coding' | 'quiz' | 'debugging';
    difficulty: 'easy' | 'medium' | 'hard';
    topic: string;
    instructions: string;
    startingCode?: string;
    solution?: string;
    testCases?: Array<{
        input: any;
        expectedOutput: any;
        explanation: string;
    }>;
    hints: string[];
}

export interface FeedbackResult {
    isCorrect: boolean;
    feedback: string;
    suggestions: string[];
    nextHint?: string;
    partialCredit?: number;
}

interface DifficultyMetrics {
    recentPerformance: number[];
    consecutiveSuccesses: number;
    consecutiveFailures: number;
    averageCompletionTime: number;
    topicDifficulty: Map<string, number>;
}

export class TutorChain {
    private personalizationContext: PersonalizationContext;
    private progressTracking: ProgressTracking;
    private exerciseTemplates: Map<string, ExerciseTemplate[]>;
    private difficultyMetrics: DifficultyMetrics;

    constructor() {
        // Initialize chain components and default personalization
        this.personalizationContext = {
            learningStyle: LearningStyle.VISUAL,
            preferredExamples: [],
            pacePreference: 'moderate',
            feedbackStyle: 'detailed'
        };

        // Initialize progress tracking
        this.progressTracking = {
            masteryProgress: new Map(),
            learningStreak: 0,
            lastInteractionDate: new Date(),
            topicsInProgress: []
        };

        // Initialize exercise templates
        this.exerciseTemplates = new Map();
        this.initializeExerciseTemplates();

        // Initialize difficulty metrics
        this.difficultyMetrics = {
            recentPerformance: [],
            consecutiveSuccesses: 0,
            consecutiveFailures: 0,
            averageCompletionTime: 0,
            topicDifficulty: new Map()
        };
    }

    private initializeExerciseTemplates() {
        // Add some basic exercise templates
        this.exerciseTemplates.set('variables', [
            {
                type: 'coding',
                difficulty: 'easy',
                topic: 'variables',
                instructions: 'Create a variable to store your name and print it',
                startingCode: '// Declare your variable here\n\n// Print it here',
                solution: 'const myName = "YourName";\nconsole.log(myName);',
                testCases: [
                    {
                        input: null,
                        expectedOutput: 'any string',
                        explanation: 'Should output any non-empty string'
                    }
                ],
                hints: [
                    'Think about what type of variable you need for text',
                    'Use const or let to declare variables',
                    'console.log() is used for printing'
                ]
            }
        ]);
    }

    // New method to update personalization settings
    public updatePersonalization(context: Partial<PersonalizationContext>) {
        this.personalizationContext = {
            ...this.personalizationContext,
            ...context
        };
    }

    // New method to adapt content based on learning style
    private adaptContentToLearningStyle(content: string): string {
        switch (this.personalizationContext.learningStyle) {
            case LearningStyle.VISUAL:
                return `${content}\n\nI'll include diagrams and visual representations in our discussion. Try visualizing the concept as: [diagram description]`;
            case LearningStyle.AUDITORY:
                return `${content}\n\nThink about this concept as if you're explaining it to someone. The key points to verbalize are: [key points]`;
            case LearningStyle.KINESTHETIC:
                return `${content}\n\nLet's work through this hands-on. Try this interactive example: [interactive example]`;
            case LearningStyle.READ_WRITE:
                return `${content}\n\nHere's a detailed written explanation with key terms defined: [detailed explanation]`;
            default:
                return content;
        }
    }

    async generateResponse(interaction: TutorInteraction) {
        // Validate input
        this.validateInteraction(interaction);

        // Handle code correction requests
        if (this.isCodeCorrectionRequest(interaction.userQuery)) {
            return this.handleCodeCorrection(interaction);
        }

        // Handle hint requests
        if (this.isHintRequest(interaction.userQuery)) {
            return this.handleHintRequest(interaction);
        }

        // Handle learning path queries
        if (this.isLearningPathQuery(interaction.userQuery)) {
            return this.handleLearningPathQuery(interaction);
        }

        // Handle follow-up questions using context
        if (this.isFollowUpQuestion(interaction.userQuery) && interaction.previousInteractions.length > 0) {
            return this.handleFollowUpQuestion(interaction);
        }

        // Handle resource requests
        if (this.isResourceRequest(interaction.userQuery)) {
            return this.handleResourceRequest(interaction);
        }

        // Handle practice requests
        if (this.isPracticeRequest(interaction.userQuery)) {
            return this.handlePracticeRequest(interaction);
        }

        // Generate response based on skill level and context
        return this.generateSkillBasedResponse(interaction);
    }

    private validateInteraction(interaction: TutorInteraction) {
        if (!interaction.userQuery) {
            throw new Error('Query cannot be empty');
        }

        if (!Object.values(SkillLevel).includes(interaction.skillLevel)) {
            throw new Error('Invalid skill level');
        }

        if (!interaction.context) {
            throw new Error('Context data is required');
        }

        if (interaction.previousInteractions?.some(i => !i.query || !i.response || !i.timestamp)) {
            throw new Error('Invalid previous interaction format');
        }
    }

    private isCodeCorrectionRequest(query: string): boolean {
        return /what('s| is) wrong with|fix|error in/.test(query.toLowerCase());
    }

    private isHintRequest(query: string): boolean {
        return /hint|help|stuck|confused|don't understand/.test(query.toLowerCase());
    }

    private isLearningPathQuery(query: string): boolean {
        return /what (should|do) i|next step|learn next|where to go/.test(query.toLowerCase());
    }

    private isFollowUpQuestion(query: string): boolean {
        const followUpPatterns = [
            /can you explain more/i,
            /tell me more/i,
            /what do you mean/i,
            /how does that work/i
        ];
        return followUpPatterns.some(pattern => pattern.test(query));
    }

    private isResourceRequest(query: string): boolean {
        const resourcePatterns = [
            /resources/i,
            /examples/i,
            /documentation/i,
            /where can i learn/i
        ];
        return resourcePatterns.some(pattern => pattern.test(query));
    }

    private isPracticeRequest(query: string): boolean {
        const practicePatterns = [
            /can i practice/i,
            /exercise/i,
            /let me try/i,
            /how do i implement/i
        ];
        return practicePatterns.some(pattern => pattern.test(query));
    }

    private async handleCodeCorrection(interaction: TutorInteraction) {
        const codeMatch = interaction.userQuery.match(/:\s*(.+)$/);
        const code = codeMatch ? codeMatch[1] : '';
        
        return {
            type: ResponseType.ERROR_CORRECTION,
            content: this.analyzeCode(code),
            additionalResources: ["MDN Coding Best Practices"],
            followUpQuestions: [],
            codeSnippets: [this.generateCorrectedCode(code)]
        };
    }

    private analyzeCode(code: string): string {
        const issues: string[] = [];
        if (code.includes('for(i=')) {
            issues.push("missing 'let' or 'const' declaration");
        }
        // Add more code analysis rules
        return `Here's what needs fixing: ${issues.join(', ')}`;
    }

    private generateCorrectedCode(code: string): string {
        // Simple code correction logic
        return code.replace('for(i=', 'for(let i=');
    }

    private async handleHintRequest(interaction: TutorInteraction) {
        const previousHint = interaction.previousInteractions.find(i => 
            i.response.toLowerCase().includes('hint') || 
            i.query.toLowerCase().includes('hint')
        );

        let hint = "Here's a helpful hint...";
        let codeSnippet = "// Example hint code...";

        if (previousHint) {
            // Provide progressive hints
            hint = "Let's try a different approach...";
            codeSnippet = "// More detailed example...";
        }

        return {
            type: ResponseType.HINT,
            content: hint,
            additionalResources: [],
            followUpQuestions: [],
            codeSnippets: [codeSnippet]
        };
    }

    private async handleLearningPathQuery(interaction: TutorInteraction) {
        const { context } = interaction;
        const completedTopics = new Set<string>(context.recentConcepts);
        const nextTopics = this.determineNextTopics(completedTopics, interaction.skillLevel);

        return {
            type: ResponseType.CONCEPT_EXPLANATION,
            content: `Based on your progress, here's your next step: ${nextTopics[0]}`,
            additionalResources: nextTopics.map(topic => `Guide to ${topic}`),
            followUpQuestions: [],
            codeSnippets: undefined
        };
    }

    private determineNextTopics(completed: Set<string>, skillLevel: SkillLevel): string[] {
        const topics = {
            [SkillLevel.BEGINNER]: ['variables', 'functions', 'loops', 'arrays'],
            [SkillLevel.INTERMEDIATE]: ['objects', 'classes', 'promises', 'async/await'],
            [SkillLevel.ADVANCED]: ['optimization', 'design patterns', 'advanced algorithms']
        };

        return topics[skillLevel].filter(topic => !completed.has(topic)).slice(0, 3);
    }

    private async handleFollowUpQuestion(interaction: TutorInteraction) {
        const previousContext = interaction.previousInteractions[interaction.previousInteractions.length - 1];
        return {
            type: ResponseType.CONCEPT_EXPLANATION,
            content: `Building on our previous discussion about ${previousContext.query.toLowerCase()}, let me explain further...`,
            additionalResources: [],
            followUpQuestions: [],
            codeSnippets: interaction.skillLevel !== SkillLevel.BEGINNER ? ["// Example code..."] : undefined
        };
    }

    private async handleResourceRequest(interaction: TutorInteraction) {
        return {
            type: ResponseType.CONCEPT_EXPLANATION,
            content: "Here are some helpful resources...",
            additionalResources: [
                "MDN Documentation",
                "JavaScript.info",
                "Relevant YouTube tutorials"
            ],
            followUpQuestions: [],
            codeSnippets: interaction.skillLevel !== SkillLevel.BEGINNER ? ["// Example implementation..."] : undefined
        };
    }

    private async handlePracticeRequest(interaction: TutorInteraction) {
        const startTime = Date.now();
        
        // Check if this is a submission
        const submissionMatch = interaction.userQuery.match(/submit:\s*(.+)$/s);
        if (submissionMatch) {
            const submission = submissionMatch[1];
            const exercise = await this.generateExercise(interaction.currentTopic, interaction.skillLevel);
            const feedback = await this.evaluateExerciseSubmission(submission, exercise);
            
            // Update difficulty metrics
            const completionTime = (Date.now() - startTime) / 1000; // Convert to seconds
            await this.adjustDifficulty(
                interaction.currentTopic,
                feedback.partialCredit || 0,
                completionTime
            );

            return {
                type: ResponseType.EXERCISE,
                content: feedback.feedback,
                additionalResources: [],
                followUpQuestions: feedback.isCorrect ? 
                    ["Would you like to try a harder exercise?"] : 
                    ["Would you like a hint?", "Should we break this down step by step?"],
                codeSnippets: [submission],
                feedback: feedback
            };
        }

        // If not a submission, provide a new exercise
        const exercise = await this.generateExercise(interaction.currentTopic, interaction.skillLevel);
        this.progressTracking.topicsInProgress.push(interaction.currentTopic);

        return {
            type: ResponseType.EXERCISE,
            content: `Let's practice ${interaction.currentTopic}!\n\n${exercise.instructions}`,
            additionalResources: [],
            followUpQuestions: [
                "Would you like a hint?",
                "Should we try a different difficulty level?",
                "Would you like to see the solution?"
            ],
            codeSnippets: [exercise.startingCode || ''],
            exercise: exercise
        };
    }

    private async generateSkillBasedResponse(interaction: TutorInteraction) {
        const { skillLevel, context } = interaction;
        
        // Consider struggled topics and completed projects
        const hasStruggledTopics = context.struggledTopics.length > 0;
        const isRelatedToStruggle = context.struggledTopics.some(topic => 
            interaction.userQuery.toLowerCase().includes(topic.toLowerCase())
        );
        const hasRelevantProjects = context.completedProjects.some(project =>
            interaction.currentTopic.toLowerCase().includes(project.toLowerCase())
        );
        
        // Update learning streak and last interaction
        const today = new Date();
        const daysSinceLastInteraction = Math.floor(
            (today.getTime() - this.progressTracking.lastInteractionDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceLastInteraction <= 1) {
            this.progressTracking.learningStreak++;
        } else {
            this.progressTracking.learningStreak = 1;
        }
        this.progressTracking.lastInteractionDate = today;

        // Get learning recommendations
        const recommendations = this.getLearningRecommendations();
        
        // Generate base response
        let content = this.generateContent(interaction, hasRelevantProjects);
        let codeSnippets = this.generateCodeSnippets(interaction, hasRelevantProjects);

        // Add mastery-based content
        const currentTopicProgress = this.progressTracking.masteryProgress.get(interaction.currentTopic);
        if (currentTopicProgress) {
            content = `[Mastery Level: ${currentTopicProgress.level}%] ${content}`;
            if (currentTopicProgress.weakAreas.length > 0) {
                content += `\n\nLet's focus on strengthening: ${currentTopicProgress.weakAreas.join(', ')}`;
            }
        }

        // Add recommendations if any
        if (recommendations.length > 0) {
            content = `${recommendations.join('\n')}\n\n${content}`;
        }

        // Adapt content based on learning style and other personalizations...
        content = this.adaptContentToLearningStyle(content);
        
        if (this.personalizationContext.pacePreference === 'slow') {
            content = `Let's break this down into smaller steps:\n\n${content}`;
        }

        if (this.personalizationContext.feedbackStyle === 'concise') {
            content = content.split('\n')[0];
        }

        return {
            type: ResponseType.CONCEPT_EXPLANATION,
            content,
            additionalResources: this.getResources(interaction),
            followUpQuestions: this.generateFollowUpQuestions(interaction),
            codeSnippets,
            masteryProgress: currentTopicProgress
        };
    }

    private generateContent(interaction: TutorInteraction, hasRelevantProjects: boolean): string {
        const { context } = interaction;
        let content = "Here's an explanation...";

        if (hasRelevantProjects) {
            content = "Since you've completed related projects, let's dive deeper...";
        }

        // Adapt to user interests if available
        const interests = context.interests || [];
        if (interests.length > 0) {
            const interest = interests[0];
            content += ` Let's use ${interest} examples to explain this.`;
        }

        return content;
    }

    private generateCodeSnippets(interaction: TutorInteraction, hasRelevantProjects: boolean): string[] | undefined {
        const { skillLevel, context } = interaction;

        if (skillLevel === SkillLevel.BEGINNER && !hasRelevantProjects) {
            return undefined;
        }

        let snippets = ["// Basic example..."];
        
        // Add more complex examples for advanced users or those with project experience
        if (skillLevel === SkillLevel.ADVANCED || hasRelevantProjects) {
            snippets.push("// Advanced implementation...");
        }

        // Adapt examples to user interests
        const interests = context.interests || [];
        if (interests.length > 0) {
            const interest = interests[0];
            snippets = snippets.map(snippet => 
                snippet.replace("example", `${interest}-related example`)
            );
        }

        return snippets;
    }

    private getResources(interaction: TutorInteraction): string[] {
        const { skillLevel, context } = interaction;
        const resources = ["MDN Documentation"];

        if (context.struggledTopics.length > 0) {
            resources.push("MDN Promise Guide");
        }

        if (skillLevel === SkillLevel.BEGINNER) {
            resources.push("Interactive Tutorial");
        }

        return resources;
    }

    // New method to generate contextual follow-up questions
    private generateFollowUpQuestions(interaction: TutorInteraction): string[] {
        const questions = [
            "Would you like to see a practical example of this concept?",
            "Should we explore any related topics?",
            "Would you like to try a hands-on exercise?"
        ];

        // Add learning style specific questions
        switch (this.personalizationContext.learningStyle) {
            case LearningStyle.VISUAL:
                questions.push("Would a diagram help clarify this concept?");
                break;
            case LearningStyle.AUDITORY:
                questions.push("Would you like to hear an explanation from a different perspective?");
                break;
            case LearningStyle.KINESTHETIC:
                questions.push("Ready to build something using this concept?");
                break;
            case LearningStyle.READ_WRITE:
                questions.push("Would you like to see more detailed documentation?");
                break;
        }

        return questions;
    }

    // New method to update mastery progress
    public updateMasteryProgress(topic: string, exerciseCompleted: boolean, performance: number) {
        let progress = this.progressTracking.masteryProgress.get(topic) || {
            topic,
            level: 0,
            lastPracticed: new Date(),
            strengthAreas: [],
            weakAreas: [],
            completedExercises: 0
        };

        if (exerciseCompleted) {
            progress.completedExercises++;
            progress.level = Math.min(100, progress.level + performance);
        }

        progress.lastPracticed = new Date();
        this.progressTracking.masteryProgress.set(topic, progress);
    }

    // New method to get learning recommendations
    private getLearningRecommendations(): string[] {
        const recommendations: string[] = [];
        const today = new Date();

        // Check learning streak
        const daysSinceLastInteraction = Math.floor(
            (today.getTime() - this.progressTracking.lastInteractionDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLastInteraction > 1) {
            recommendations.push("It's been a while! Let's review some previous concepts before moving forward.");
        }

        // Check topics that need review
        this.progressTracking.masteryProgress.forEach((progress, topic) => {
            const daysSinceLastPractice = Math.floor(
                (today.getTime() - progress.lastPracticed.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (daysSinceLastPractice > 7 && progress.level < 90) {
                recommendations.push(`Consider reviewing ${topic} to maintain mastery.`);
            }
        });

        return recommendations;
    }

    private async adjustDifficulty(
        currentTopic: string,
        performance: number,
        completionTime: number
    ): Promise<'easy' | 'medium' | 'hard'> {
        // Update metrics
        this.difficultyMetrics.recentPerformance.push(performance);
        if (this.difficultyMetrics.recentPerformance.length > 5) {
            this.difficultyMetrics.recentPerformance.shift();
        }

        // Update consecutive counts
        if (performance >= 80) {
            this.difficultyMetrics.consecutiveSuccesses++;
            this.difficultyMetrics.consecutiveFailures = 0;
        } else {
            this.difficultyMetrics.consecutiveFailures++;
            this.difficultyMetrics.consecutiveSuccesses = 0;
        }

        // Update completion time
        const alpha = 0.3; // Smoothing factor for exponential moving average
        this.difficultyMetrics.averageCompletionTime = 
            alpha * completionTime + 
            (1 - alpha) * (this.difficultyMetrics.averageCompletionTime || completionTime);

        // Update topic difficulty
        const currentDifficulty = this.difficultyMetrics.topicDifficulty.get(currentTopic) || 0.5;
        const performanceImpact = (performance - 80) / 200; // -0.4 to +0.1 range
        const newDifficulty = Math.max(0, Math.min(1, currentDifficulty + performanceImpact));
        this.difficultyMetrics.topicDifficulty.set(currentTopic, newDifficulty);

        // Calculate adaptive difficulty
        const averagePerformance = this.difficultyMetrics.recentPerformance.reduce((a, b) => a + b, 0) / 
            this.difficultyMetrics.recentPerformance.length;

        // Determine next difficulty level
        if (this.difficultyMetrics.consecutiveSuccesses >= 3 || (averagePerformance > 90 && completionTime < this.difficultyMetrics.averageCompletionTime)) {
            return 'hard';
        } else if (this.difficultyMetrics.consecutiveFailures >= 2 || averagePerformance < 70) {
            return 'easy';
        } else {
            return 'medium';
        }
    }

    private async generateExercise(topic: string, skillLevel: SkillLevel): Promise<ExerciseTemplate> {
        const templates = this.exerciseTemplates.get(topic) || [];
        let difficulty: 'easy' | 'medium' | 'hard';

        // Check if we have performance history
        if (this.difficultyMetrics.recentPerformance.length > 0) {
            const lastPerformance = this.difficultyMetrics.recentPerformance[this.difficultyMetrics.recentPerformance.length - 1];
            const completionTime = this.difficultyMetrics.averageCompletionTime;
            difficulty = await this.adjustDifficulty(topic, lastPerformance, completionTime);
        } else {
            // Default to skill level mapping if no history
            switch (skillLevel) {
                case SkillLevel.BEGINNER:
                    difficulty = 'easy';
                    break;
                case SkillLevel.INTERMEDIATE:
                    difficulty = 'medium';
                    break;
                case SkillLevel.ADVANCED:
                    difficulty = 'hard';
                    break;
                default:
                    difficulty = 'medium';
            }
        }

        // Find appropriate exercise
        const appropriateExercises = templates.filter(t => t.difficulty === difficulty);
        
        if (appropriateExercises.length === 0) {
            // Generate dynamic exercise if no template exists
            return this.generateDynamicExercise(topic, difficulty);
        }

        // Return random exercise from appropriate ones
        return appropriateExercises[Math.floor(Math.random() * appropriateExercises.length)];
    }

    private generateDynamicExercise(topic: string, difficulty: 'easy' | 'medium' | 'hard'): ExerciseTemplate {
        // Generate exercise based on topic and difficulty
        const exercise: ExerciseTemplate = {
            type: 'coding',
            difficulty,
            topic,
            instructions: `Create a function that demonstrates ${topic} concepts`,
            hints: [
                'Start by breaking down the problem',
                'Think about the core concepts of ' + topic,
                'Consider edge cases'
            ]
        };

        switch (difficulty) {
            case 'easy':
                exercise.startingCode = `// Write your code here\nfunction practice${topic}() {\n\n}`;
                break;
            case 'medium':
                exercise.startingCode = `// Implement a more complex ${topic} example\nclass ${topic}Practice {\n\n}`;
                break;
            case 'hard':
                exercise.startingCode = `// Create an advanced implementation\ninterface I${topic} {\n\n}\n\nclass Advanced${topic} implements I${topic} {\n\n}`;
                break;
        }

        return exercise;
    }

    private async evaluateExerciseSubmission(
        submission: string,
        exercise: ExerciseTemplate
    ): Promise<FeedbackResult> {
        const result: FeedbackResult = {
            isCorrect: false,
            feedback: '',
            suggestions: [],
            partialCredit: 0
        };

        // Basic syntax check
        try {
            // Simple syntax validation
            new Function(submission);
            if (typeof result.partialCredit === 'number') {
                result.partialCredit += 20; // 20% for valid syntax
            }
        } catch (e) {
            result.feedback = `Syntax error: ${(e as Error).message}`;
            result.suggestions.push('Check for missing semicolons or brackets');
            return result;
        }

        // Test cases evaluation
        if (exercise.testCases) {
            let passedTests = 0;
            for (const testCase of exercise.testCases) {
                try {
                    const testFunction = new Function(submission + `\nreturn ${exercise.topic}Test();`);
                    const output = testFunction();
                    if (this.compareOutput(output, testCase.expectedOutput)) {
                        passedTests++;
                    }
                } catch (e) {
                    result.suggestions.push(`Test case failed: ${testCase.explanation}`);
                }
            }
            
            const testScore = (passedTests / exercise.testCases.length) * 60; // 60% for test cases
            if (typeof result.partialCredit === 'number') {
                result.partialCredit += testScore;
            }
        }

        // Code quality assessment
        const qualityScore = this.assessCodeQuality(submission);
        if (typeof result.partialCredit === 'number') {
            result.partialCredit += qualityScore * 20; // 20% for code quality
        }

        // Determine overall result
        result.isCorrect = (result.partialCredit || 0) >= 80;
        
        // Generate appropriate feedback
        if (result.isCorrect) {
            result.feedback = "Great job! Your solution works correctly.";
            if ((result.partialCredit || 0) < 100) {
                result.suggestions.push("Consider improving code readability");
            }
        } else {
            result.feedback = "Your solution needs some improvements.";
            if (exercise.hints && exercise.hints.length > 0) {
                result.nextHint = exercise.hints[0];
            }
        }

        return result;
    }

    private compareOutput(actual: any, expected: any): boolean {
        if (expected === 'any string' && typeof actual === 'string' && actual.length > 0) {
            return true;
        }
        return JSON.stringify(actual) === JSON.stringify(expected);
    }

    private assessCodeQuality(code: string): number {
        let score = 1;
        const issues: string[] = [];

        // Check for basic code quality issues
        if (code.includes('var ')) {
            score -= 0.2;
            issues.push('Consider using let or const instead of var');
        }

        const consoleLogMatches = code.match(/console\.log/g);
        if (consoleLogMatches && consoleLogMatches.length > 3) {
            score -= 0.1;
            issues.push('Too many console.log statements');
        }

        if (code.includes('while(true)')) {
            score -= 0.3;
            issues.push('Infinite loops should be avoided');
        }

        return Math.max(0, score);
    }
} 