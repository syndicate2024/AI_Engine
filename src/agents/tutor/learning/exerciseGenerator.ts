// @ai-protected
import { SkillLevel } from '../../types';

interface ExerciseTemplate {
    type: 'coding' | 'quiz' | 'debugging' | 'project';
    difficulty: number;
    topic: string;
    template: string;
    hints: string[];
    solution: string;
    testCases: TestCase[];
    prerequisites: string[];
    learningObjectives: string[];
    realWorldContext?: string;
    funFactor?: {
        theme?: string;
        storyline?: string;
        achievements?: string[];
        challenges?: string[];
        rewards?: string[];
    };
    interactiveElements?: {
        userInputPrompts?: string[];
        progressMilestones?: string[];
        visualFeedback?: string[];
        collaborationPoints?: string[];
    };
}

interface TestCase {
    input: any;
    expectedOutput: any;
    description: string;
}

interface GeneratedExercise {
    instructions: string;
    startingCode: string;
    hints: string[];
    testCases: TestCase[];
    difficulty: number;
    estimatedTime: number;
    checkpoints: string[];
    resources: string[];
    funFactor?: {
        theme?: string;
        storyline?: string;
        achievements?: string[];
        challenges?: string[];
        rewards?: string[];
    };
    interactiveElements?: {
        userInputPrompts?: string[];
        progressMilestones?: string[];
        visualFeedback?: string[];
        collaborationPoints?: string[];
    };
    realWorldContext?: string;
}

interface Suggestion {
    type: 'approach' | 'improvement' | 'resource' | 'challenge' | 'collaboration';
    content: string;
    reason: string;
    priority: number;
    timing: 'immediate' | 'after-attempt' | 'on-completion';
    relatedConcepts?: string[];
}

export class ExerciseGenerator {
    private templates: Map<string, ExerciseTemplate[]> = new Map();
    private exerciseHistory: Map<string, string[]> = new Map();
    private difficultyWeights: Map<string, number> = new Map();
    private usedThemes: Set<string> = new Set();
    private lastGeneratedType: string = '';
    private suggestionHistory: Map<string, Suggestion[]> = new Map();

    generateExercise(
        topic: string,
        skillLevel: SkillLevel,
        previousExercises: string[] = []
    ): GeneratedExercise {
        // Get suitable templates
        const templates = this.getTemplatesForTopic(topic);
        
        // Filter by difficulty and previous exercises
        const suitableTemplates = templates.filter(template => 
            this.isTemplateSuitable(template, skillLevel, previousExercises)
        );

        // Select template
        const selectedTemplate = this.selectBestTemplate(suitableTemplates, skillLevel);

        // Generate exercise from template
        return this.createExerciseFromTemplate(selectedTemplate, skillLevel);
    }

    private getTemplatesForTopic(topic: string): ExerciseTemplate[] {
        return this.templates.get(topic) || this.generateDefaultTemplates(topic);
    }

    private isTemplateSuitable(
        template: ExerciseTemplate,
        skillLevel: SkillLevel,
        previousExercises: string[]
    ): boolean {
        // Check if exercise was recently used
        const history = this.exerciseHistory.get(template.topic) || [];
        if (history.includes(template.template)) {
            return false;
        }

        // Check difficulty appropriateness
        const difficultyRange = this.getDifficultyRange(skillLevel);
        if (template.difficulty < difficultyRange.min || 
            template.difficulty > difficultyRange.max) {
            return false;
        }

        return true;
    }

    private selectBestTemplate(
        templates: ExerciseTemplate[],
        skillLevel: SkillLevel
    ): ExerciseTemplate {
        if (templates.length === 0) {
            return this.generateFallbackTemplate(skillLevel);
        }

        // Score templates based on various factors
        const scoredTemplates = templates.map(template => ({
            template,
            score: this.calculateTemplateScore(template, skillLevel)
        }));

        // Sort by score and select the best
        scoredTemplates.sort((a, b) => b.score - a.score);
        return scoredTemplates[0].template;
    }

    private createExerciseFromTemplate(
        template: ExerciseTemplate,
        skillLevel: SkillLevel
    ): GeneratedExercise {
        const adapted = this.adaptTemplateToSkillLevel(template, skillLevel);
        const hints = this.generateProgressiveHints(adapted, skillLevel);
        const checkpoints = this.generateCheckpoints(adapted);
        const resources = this.selectResources(adapted.topic, skillLevel);

        // Add engagement elements
        const exercise: GeneratedExercise = {
            instructions: this.generateEngagingInstructions(adapted, skillLevel),
            startingCode: adapted.template,
            hints,
            testCases: adapted.testCases,
            difficulty: adapted.difficulty,
            estimatedTime: this.calculateEstimatedTime(adapted, skillLevel),
            checkpoints,
            resources,
            funFactor: adapted.funFactor,
            interactiveElements: adapted.interactiveElements,
            realWorldContext: adapted.realWorldContext
        };

        this.recordTemplateUsage(template);
        return exercise;
    }

    private generateDefaultTemplates(topic: string): ExerciseTemplate[] {
        const themes = [
            {
                theme: 'Space Exploration',
                context: 'Building systems for a Mars colony',
                storyline: 'You\'re a lead developer for the first Mars settlement'
            },
            {
                theme: 'Game Development',
                context: 'Creating a popular mobile game',
                storyline: 'Your indie game studio is about to launch its first hit'
            },
            {
                theme: 'Environmental Tech',
                context: 'Developing green technology solutions',
                storyline: 'Your team is building software to combat climate change'
            },
            {
                theme: 'Medical Innovation',
                context: 'Healthcare system development',
                storyline: 'You\'re developing software for a breakthrough medical device'
            },
            {
                theme: 'Smart City',
                context: 'Urban infrastructure optimization',
                storyline: 'You\'re designing systems for the city of the future'
            }
        ];

        // Select a theme that hasn't been used recently
        const availableThemes = themes.filter(t => !this.usedThemes.has(t.theme));
        const selectedTheme = availableThemes.length > 0 ? 
            availableThemes[Math.floor(Math.random() * availableThemes.length)] : 
            themes[Math.floor(Math.random() * themes.length)];

        // Update theme history
        this.usedThemes.add(selectedTheme.theme);
        if (this.usedThemes.size > 3) {
            this.usedThemes.clear();
        }

        return [{
            type: this.selectExerciseType(),
            difficulty: 1,
            topic,
            template: this.generateEngagingTemplate(topic, selectedTheme),
            hints: this.generateEngagingHints(topic, selectedTheme),
            solution: '// Solution will be revealed as you progress',
            testCases: this.generateRealWorldTestCases(topic, selectedTheme),
            prerequisites: [],
            learningObjectives: [`Master ${topic} through real-world application`],
            realWorldContext: selectedTheme.context,
            funFactor: {
                theme: selectedTheme.theme,
                storyline: selectedTheme.storyline,
                achievements: [
                    'Code Explorer: Write your first solution',
                    'Bug Hunter: Find and fix an edge case',
                    'Performance Guru: Optimize your solution',
                    'Innovation Star: Create a unique approach'
                ],
                challenges: [
                    'Speed Challenge: Complete within time limit',
                    'Memory Master: Optimize memory usage',
                    'Clean Coder: Write elegant, readable code',
                    'Edge Master: Handle all edge cases'
                ],
                rewards: [
                    'Unlock advanced concepts',
                    'Earn virtual badges',
                    'Access bonus challenges',
                    'Join the leaderboard'
                ]
            },
            interactiveElements: {
                userInputPrompts: [
                    'What approach would you take first?',
                    'How would you handle this edge case?',
                    'Can you think of a more efficient solution?'
                ],
                progressMilestones: [
                    'Basic implementation complete',
                    'Test cases passing',
                    'Optimization achieved',
                    'Real-world application ready'
                ],
                visualFeedback: [
                    'Show progress bar',
                    'Display achievement badges',
                    'Highlight successful test cases',
                    'Animate code execution flow'
                ],
                collaborationPoints: [
                    'Share your solution',
                    'Review peer approaches',
                    'Participate in code review',
                    'Contribute to solution database'
                ]
            }
        }];
    }

    private selectExerciseType(): 'coding' | 'quiz' | 'debugging' | 'project' {
        const types: ('coding' | 'quiz' | 'debugging' | 'project')[] = 
            ['coding', 'quiz', 'debugging', 'project'];
        
        // Avoid repeating the same type
        const availableTypes = types.filter(t => t !== this.lastGeneratedType);
        const selectedType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        this.lastGeneratedType = selectedType;
        return selectedType;
    }

    private generateEngagingTemplate(topic: string, theme: any): string {
        return `// ${theme.theme} Challenge: ${topic}
// ${theme.storyline}
// Your mission:
// 1. Implement a solution that helps ${theme.context}
// 2. Consider real-world constraints and requirements
// 3. Make it efficient and scalable

// Write your innovative solution below:
`;
    }

    private generateEngagingHints(topic: string, theme: any): string[] {
        return [
            `Think about how ${topic} applies in ${theme.context}`,
            'Consider the real-world implications of your solution',
            'How would this scale in a production environment?',
            'What edge cases might occur in real usage?'
        ];
    }

    private generateRealWorldTestCases(topic: string, theme: any): TestCase[] {
        return [
            {
                input: 'realWorldScenario1',
                expectedOutput: 'optimizedSolution1',
                description: `Test with actual ${theme.context} data`
            },
            {
                input: 'edgeCase1',
                expectedOutput: 'robustSolution1',
                description: 'Handle unexpected real-world scenarios'
            }
        ];
    }

    private getDifficultyRange(skillLevel: SkillLevel): { min: number; max: number } {
        switch (skillLevel) {
            case SkillLevel.BEGINNER:
                return { min: 1, max: 3 };
            case SkillLevel.INTERMEDIATE:
                return { min: 3, max: 7 };
            case SkillLevel.ADVANCED:
                return { min: 7, max: 10 };
        }
    }

    private calculateTemplateScore(template: ExerciseTemplate, skillLevel: SkillLevel): number {
        let score = 0;

        // Base score from difficulty match
        const difficultyRange = this.getDifficultyRange(skillLevel);
        const difficultyMatch = 1 - 
            Math.abs(template.difficulty - (difficultyRange.max + difficultyRange.min) / 2) / 10;
        score += difficultyMatch * 5;

        // Bonus for comprehensive test cases
        score += Math.min(template.testCases.length, 5);

        // Bonus for learning objectives
        score += Math.min(template.learningObjectives.length, 3);

        // Penalty for recently used templates
        const usageWeight = this.difficultyWeights.get(template.topic) || 1;
        score *= usageWeight;

        return score;
    }

    private adaptTemplateToSkillLevel(
        template: ExerciseTemplate,
        skillLevel: SkillLevel
    ): ExerciseTemplate {
        const adapted = { ...template };

        switch (skillLevel) {
            case SkillLevel.BEGINNER:
                adapted.template = this.addComments(template.template);
                adapted.testCases = this.simplifyTestCases(template.testCases);
                break;
            case SkillLevel.INTERMEDIATE:
                adapted.template = this.removeBoilerplate(template.template);
                break;
            case SkillLevel.ADVANCED:
                adapted.template = this.addComplexityHooks(template.template);
                adapted.testCases = this.addEdgeCases(template.testCases);
                break;
        }

        return adapted;
    }

    private generateProgressiveHints(template: ExerciseTemplate, skillLevel: SkillLevel): string[] {
        const baseHints = template.hints;
        const adaptedHints: string[] = [];

        switch (skillLevel) {
            case SkillLevel.BEGINNER:
                adaptedHints.push(...baseHints.map(hint => this.expandHint(hint)));
                break;
            case SkillLevel.INTERMEDIATE:
                adaptedHints.push(...baseHints.map(hint => this.generalizeHint(hint)));
                break;
            case SkillLevel.ADVANCED:
                adaptedHints.push(...baseHints.map(hint => this.conceptualHint(hint)));
                break;
        }

        return adaptedHints;
    }

    private generateCheckpoints(template: ExerciseTemplate): string[] {
        return [
            "Initial setup complete",
            "Core functionality implemented",
            "Edge cases handled",
            "Code optimization complete",
            "All tests passing"
        ];
    }

    private selectResources(topic: string, skillLevel: SkillLevel): string[] {
        // Implementation for selecting relevant resources
        return [
            `${topic} documentation`,
            `${topic} best practices`,
            `${topic} examples`
        ];
    }

    private recordTemplateUsage(template: ExerciseTemplate): void {
        const history = this.exerciseHistory.get(template.topic) || [];
        history.push(template.template);
        this.exerciseHistory.set(template.topic, history.slice(-5));

        // Update difficulty weights
        const currentWeight = this.difficultyWeights.get(template.topic) || 1;
        this.difficultyWeights.set(template.topic, currentWeight * 0.8);
    }

    private generateInstructions(template: ExerciseTemplate, skillLevel: SkillLevel): string {
        let instructions = `# ${template.topic} Exercise\n\n`;
        
        switch (skillLevel) {
            case SkillLevel.BEGINNER:
                instructions += "Step by step instructions:\n";
                break;
            case SkillLevel.INTERMEDIATE:
                instructions += "Implementation guidelines:\n";
                break;
            case SkillLevel.ADVANCED:
                instructions += "Challenge requirements:\n";
                break;
        }

        instructions += `\n## Objectives\n${template.learningObjectives.join('\n')}\n`;
        instructions += `\n## Requirements\n- Implement the solution\n- Pass all test cases\n`;
        
        return instructions;
    }

    private calculateEstimatedTime(template: ExerciseTemplate, skillLevel: SkillLevel): number {
        const baseTime = template.difficulty * 5; // 5 minutes per difficulty level
        
        switch (skillLevel) {
            case SkillLevel.BEGINNER:
                return baseTime * 1.5;
            case SkillLevel.INTERMEDIATE:
                return baseTime;
            case SkillLevel.ADVANCED:
                return baseTime * 0.7;
        }
    }

    private generateFallbackTemplate(skillLevel: SkillLevel): ExerciseTemplate {
        return {
            type: 'coding',
            difficulty: this.getDifficultyRange(skillLevel).min,
            topic: 'general',
            template: '// Implement your solution here',
            hints: ['Consider the problem requirements', 'Plan your approach'],
            solution: '// Basic solution',
            testCases: [{
                input: null,
                expectedOutput: null,
                description: 'Basic test'
            }],
            prerequisites: [],
            learningObjectives: ['Problem solving', 'Code implementation']
        };
    }

    private addComments(template: string): string {
        return `// This is a template for your solution
// Follow these steps:
${template}`;
    }

    private simplifyTestCases(testCases: TestCase[]): TestCase[] {
        return testCases.slice(0, Math.min(testCases.length, 3));
    }

    private removeBoilerplate(template: string): string {
        return template.replace(/\/\/ /g, '');
    }

    private addComplexityHooks(template: string): string {
        return `${template}
// Consider: 
// - Time complexity
// - Space complexity
// - Edge cases`;
    }

    private addEdgeCases(testCases: TestCase[]): TestCase[] {
        return [
            ...testCases,
            {
                input: null,
                expectedOutput: null,
                description: 'Edge case: empty input'
            },
            {
                input: null,
                expectedOutput: null,
                description: 'Edge case: maximum value'
            }
        ];
    }

    private expandHint(hint: string): string {
        return `Detailed explanation: ${hint}`;
    }

    private generalizeHint(hint: string): string {
        return `Consider this approach: ${hint}`;
    }

    private conceptualHint(hint: string): string {
        return `Think about: ${hint}`;
    }

    private generateEngagingInstructions(template: ExerciseTemplate, skillLevel: SkillLevel): string {
        const { theme, storyline } = template.funFactor || {};
        let instructions = `# ${theme} Challenge: ${template.topic}\n\n`;
        instructions += `## Mission Briefing\n${storyline}\n\n`;
        
        switch (skillLevel) {
            case SkillLevel.BEGINNER:
                instructions += "Your First Mission:\n";
                break;
            case SkillLevel.INTERMEDIATE:
                instructions += "Special Operation:\n";
                break;
            case SkillLevel.ADVANCED:
                instructions += "Expert Mission:\n";
                break;
        }

        instructions += `\n## Objectives\n${template.learningObjectives.join('\n')}\n`;
        instructions += `\n## Real-World Application\n${template.realWorldContext}\n`;
        instructions += `\n## Achievements to Unlock\n${template.funFactor?.achievements?.join('\n')}\n`;
        
        return instructions;
    }

    generateSuggestions(
        topic: string,
        skillLevel: SkillLevel,
        performance?: {
            timeSpent?: number;
            attempts?: number;
            errorPatterns?: string[];
            completedConcepts?: string[];
        }
    ): Suggestion[] {
        const suggestions: Suggestion[] = [];
        const previousSuggestions = this.suggestionHistory.get(topic) || [];

        // Approach suggestions based on skill level
        if (!performance || performance.attempts === 1) {
            suggestions.push(...this.generateApproachSuggestions(skillLevel, topic));
        }

        // Improvement suggestions based on performance
        if (performance?.errorPatterns?.length) {
            suggestions.push(...this.generateImprovementSuggestions(
                performance.errorPatterns,
                skillLevel
            ));
        }

        // Resource suggestions based on struggle areas
        if (performance?.attempts && performance.attempts > 2) {
            suggestions.push(...this.generateResourceSuggestions(topic, skillLevel));
        }

        // Challenge suggestions for high performers
        if (this.isHighPerformer(performance)) {
            suggestions.push(...this.generateChallengeSuggestions(topic, skillLevel));
        }

        // Collaboration suggestions
        suggestions.push(...this.generateCollaborationSuggestions(topic, skillLevel));

        // Filter out recently used suggestions
        const filteredSuggestions = this.filterRecentSuggestions(
            suggestions,
            previousSuggestions
        );

        // Update suggestion history
        this.updateSuggestionHistory(topic, filteredSuggestions);

        return this.prioritizeSuggestions(filteredSuggestions);
    }

    private generateApproachSuggestions(skillLevel: SkillLevel, topic: string): Suggestion[] {
        const approaches: Suggestion[] = [
            {
                type: 'approach',
                content: 'Try breaking down the problem into smaller steps',
                reason: 'Complex problems become manageable when split into parts',
                priority: 1,
                timing: 'immediate'
            },
            {
                type: 'approach',
                content: 'Start with a simple implementation, then optimize',
                reason: 'Getting the basic logic right first helps understand the problem better',
                priority: 2,
                timing: 'immediate'
            },
            {
                type: 'approach',
                content: 'Draw or diagram your solution before coding',
                reason: 'Visual representation can help identify patterns and edge cases',
                priority: 3,
                timing: 'immediate'
            }
        ];

        // Add skill-level specific suggestions
        switch (skillLevel) {
            case SkillLevel.BEGINNER:
                approaches.push({
                    type: 'approach',
                    content: 'Look for similar patterns in previous exercises',
                    reason: 'Pattern recognition helps build problem-solving skills',
                    priority: 1,
                    timing: 'immediate'
                });
                break;
            case SkillLevel.INTERMEDIATE:
                approaches.push({
                    type: 'approach',
                    content: 'Consider time and space complexity trade-offs',
                    reason: 'Balance between performance and readability is key',
                    priority: 2,
                    timing: 'after-attempt'
                });
                break;
            case SkillLevel.ADVANCED:
                approaches.push({
                    type: 'approach',
                    content: 'Explore multiple solution strategies',
                    reason: 'Different approaches may have different advantages',
                    priority: 2,
                    timing: 'immediate'
                });
                break;
        }

        return approaches;
    }

    private generateImprovementSuggestions(
        errorPatterns: string[],
        skillLevel: SkillLevel
    ): Suggestion[] {
        const improvements: Suggestion[] = [];

        errorPatterns.forEach(pattern => {
            improvements.push({
                type: 'improvement',
                content: this.getImprovementForError(pattern, skillLevel),
                reason: 'Addressing common error patterns improves code quality',
                priority: 1,
                timing: 'immediate',
                relatedConcepts: [pattern]
            });
        });

        return improvements;
    }

    private generateResourceSuggestions(topic: string, skillLevel: SkillLevel): Suggestion[] {
        return [{
            type: 'resource',
            content: `Check out the ${topic} documentation for detailed examples`,
            reason: 'Official documentation provides reliable information',
            priority: 2,
            timing: 'after-attempt'
        },
        {
            type: 'resource',
            content: 'Watch video tutorials on this concept',
            reason: 'Visual learning can provide new perspectives',
            priority: 3,
            timing: 'after-attempt'
        }];
    }

    private generateChallengeSuggestions(topic: string, skillLevel: SkillLevel): Suggestion[] {
        return [{
            type: 'challenge',
            content: 'Try solving this with a different approach',
            reason: 'Exploring alternatives deepens understanding',
            priority: 3,
            timing: 'on-completion'
        },
        {
            type: 'challenge',
            content: 'Optimize your solution for better performance',
            reason: 'Performance optimization is a valuable skill',
            priority: 2,
            timing: 'on-completion'
        }];
    }

    private generateCollaborationSuggestions(topic: string, skillLevel: SkillLevel): Suggestion[] {
        return [{
            type: 'collaboration',
            content: 'Share your solution with peers for feedback',
            reason: 'Peer review helps identify improvements',
            priority: 4,
            timing: 'on-completion'
        },
        {
            type: 'collaboration',
            content: 'Help others who are struggling with this concept',
            reason: 'Teaching others reinforces your understanding',
            priority: 4,
            timing: 'on-completion'
        }];
    }

    private isHighPerformer(performance?: any): boolean {
        if (!performance) return false;
        return (
            (performance.attempts === 1 && performance.errorPatterns?.length === 0) ||
            (performance.timeSpent && performance.timeSpent < this.getExpectedTime(performance))
        );
    }

    private getExpectedTime(performance: any): number {
        // Implementation for calculating expected time
        return 300; // 5 minutes default
    }

    private filterRecentSuggestions(
        newSuggestions: Suggestion[],
        recentSuggestions: Suggestion[]
    ): Suggestion[] {
        return newSuggestions.filter(suggestion =>
            !recentSuggestions.some(recent =>
                recent.type === suggestion.type &&
                recent.content === suggestion.content
            )
        );
    }

    private updateSuggestionHistory(topic: string, suggestions: Suggestion[]): void {
        const history = this.suggestionHistory.get(topic) || [];
        this.suggestionHistory.set(topic, [...history, ...suggestions].slice(-10));
    }

    private prioritizeSuggestions(suggestions: Suggestion[]): Suggestion[] {
        return suggestions.sort((a, b) => a.priority - b.priority);
    }

    private getImprovementForError(pattern: string, skillLevel: SkillLevel): string {
        const improvements: Record<string, string> = {
            'syntax': 'Review the syntax carefully, paying attention to brackets and semicolons',
            'logic': 'Try testing your logic with simple examples first',
            'performance': 'Consider using more efficient data structures',
            'style': 'Follow consistent naming conventions and formatting',
            'security': 'Always validate input and handle edge cases'
        };
        return improvements[pattern] || 'Review your code for potential improvements';
    }
} 