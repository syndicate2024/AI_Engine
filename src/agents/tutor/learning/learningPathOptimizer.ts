// @ai-protected
import { SkillLevel, TutorContext } from '../../../types';

interface LearningNode {
    id: string;
    topic: string;
    prerequisites: string[];
    difficulty: number;
    estimatedTimeMinutes: number;
    dependencies: string[];
    nextTopics: string[];
    concepts: string[];
}

interface LearningPath {
    nodes: LearningNode[];
    currentNode: string;
    completedNodes: string[];
    struggledNodes: string[];
    recommendedPath: string[];
}

interface TopicMetadata {
    requiredFor: string[];
    buildingBlocks: string[];
    commonStruggles: string[];
    remedialContent: string[];
    practiceExercises: string[];
}

interface DifficultyAdjustment {
    currentDifficulty: number;
    recommendedDifficulty: number;
    adjustmentReason: string;
    adaptiveFeedback: string[];
}

export class LearningPathOptimizer {
    private knowledgeGraph: Map<string, LearningNode>;
    private topicMetadata: Map<string, TopicMetadata>;
    private learningPaths: Map<string, LearningPath>;
    private difficultyLevels: Map<string, number> = new Map();
    private performanceHistory: Map<string, number[]> = new Map();
    private adaptationThreshold: number = 0.7;
    private maxDifficulty: number = 10;
    private minDifficulty: number = 1;

    constructor() {
        this.knowledgeGraph = new Map();
        this.topicMetadata = new Map();
        this.learningPaths = new Map();
        this.initializeKnowledgeGraph();
    }

    private initializeKnowledgeGraph(): void {
        // JavaScript/TypeScript Learning Path
        this.addNode({
            id: 'variables',
            topic: 'Variables and Data Types',
            prerequisites: [],
            difficulty: 1,
            estimatedTimeMinutes: 30,
            dependencies: [],
            nextTopics: ['functions', 'control-flow'],
            concepts: ['declaration', 'assignment', 'types']
        });

        this.addNode({
            id: 'functions',
            topic: 'Functions',
            prerequisites: ['variables'],
            difficulty: 2,
            estimatedTimeMinutes: 45,
            dependencies: ['variables'],
            nextTopics: ['objects', 'arrays'],
            concepts: ['parameters', 'return values', 'scope']
        });

        // Add metadata
        this.addTopicMetadata('variables', {
            requiredFor: ['functions', 'loops', 'objects'],
            buildingBlocks: ['declaration', 'assignment', 'types'],
            commonStruggles: ['type confusion', 'scope issues'],
            remedialContent: ['basic-types', 'variable-scope'],
            practiceExercises: ['variable-declaration', 'type-conversion']
        });
    }

    private addNode(node: LearningNode): void {
        this.knowledgeGraph.set(node.id, node);
    }

    private addTopicMetadata(topic: string, metadata: TopicMetadata): void {
        this.topicMetadata.set(topic, metadata);
    }

    public generateLearningPath(
        userId: string,
        context: TutorContext,
        skillLevel: SkillLevel
    ): LearningPath {
        const path: LearningPath = {
            nodes: [],
            currentNode: '',
            completedNodes: [],
            struggledNodes: [],
            recommendedPath: []
        };

        // Initialize from context
        path.completedNodes = context.completedProjects;
        path.struggledNodes = context.struggledTopics;
        path.currentNode = context.currentTopic;

        // Generate recommended path
        path.recommendedPath = this.calculateOptimalPath(
            path.currentNode,
            path.completedNodes,
            path.struggledNodes,
            skillLevel
        );

        // Add nodes to path
        path.nodes = path.recommendedPath.map(id => this.knowledgeGraph.get(id)!)
            .filter(node => node !== undefined);

        this.learningPaths.set(userId, path);
        return path;
    }

    private calculateOptimalPath(
        currentTopic: string,
        completed: string[],
        struggled: string[],
        skillLevel: SkillLevel
    ): string[] {
        const path: string[] = [];
        const visited = new Set<string>();
        const queue: string[] = [];

        // First, get all prerequisites for current topic
        const prerequisites = this.getAllPrerequisites(currentTopic, completed);
        queue.push(...prerequisites, currentTopic);

        while (queue.length > 0) {
            const topic = queue.shift()!;
            if (visited.has(topic)) continue;

            visited.add(topic);
            path.push(topic);

            const node = this.knowledgeGraph.get(topic);
            if (!node) continue;

            // Add next topics based on difficulty and skill level
            const nextTopics = this.filterTopicsByDifficulty(
                node.nextTopics,
                skillLevel
            );

            // Prioritize topics that help with struggled areas
            const prioritizedTopics = this.prioritizeTopics(
                nextTopics,
                struggled
            );

            queue.push(...prioritizedTopics);
        }

        return path;
    }

    private getAllPrerequisites(topic: string, completed: string[]): string[] {
        const prerequisites: string[] = [];
        const visited = new Set<string>();

        const traverse = (currentTopic: string) => {
            const node = this.knowledgeGraph.get(currentTopic);
            if (!node || visited.has(currentTopic)) return;
            visited.add(currentTopic);

            for (const prereq of node.prerequisites) {
                if (!completed.includes(prereq)) {
                    traverse(prereq);
                    prerequisites.push(prereq);
                }
            }
        };

        traverse(topic);
        return prerequisites;
    }

    private filterTopicsByDifficulty(
        topics: string[],
        skillLevel: SkillLevel
    ): string[] {
        return topics.filter(topic => {
            const node = this.knowledgeGraph.get(topic);
            if (!node) return false;

            switch (skillLevel) {
                case SkillLevel.BEGINNER:
                    return node.difficulty <= 2;
                case SkillLevel.INTERMEDIATE:
                    return node.difficulty <= 4;
                case SkillLevel.ADVANCED:
                    return true;
                default:
                    return true;
            }
        });
    }

    private prioritizeTopics(
        topics: string[],
        struggledTopics: string[]
    ): string[] {
        return topics.sort((a, b) => {
            const aHelpsStruggled = this.topicHelpsWithStruggled(a, struggledTopics);
            const bHelpsStruggled = this.topicHelpsWithStruggled(b, struggledTopics);

            if (aHelpsStruggled && !bHelpsStruggled) return -1;
            if (!aHelpsStruggled && bHelpsStruggled) return 1;
            return 0;
        });
    }

    private topicHelpsWithStruggled(
        topic: string,
        struggledTopics: string[]
    ): boolean {
        const metadata = this.topicMetadata.get(topic);
        if (!metadata) return false;

        // Check if this topic helps with any struggled topics
        return struggledTopics.some(struggled => {
            // Check if this topic is required for the struggled topic
            if (metadata.requiredFor.includes(struggled)) return true;

            // Check if this topic contains building blocks for the struggled topic
            if (metadata.buildingBlocks.some(block => 
                block.toLowerCase().includes(struggled.toLowerCase())
            )) return true;

            // Check if this topic has remedial content for the struggled topic
            if (metadata.remedialContent.some(content => 
                content.toLowerCase().includes(struggled.toLowerCase())
            )) return true;

            // Check if this topic helps with common struggles
            if (metadata.commonStruggles.some(struggle => 
                struggle.toLowerCase().includes(struggled.toLowerCase())
            )) return true;

            return false;
        });
    }

    public updateProgress(
        userId: string,
        completedTopic: string,
        performance: number
    ): void {
        const path = this.learningPaths.get(userId);
        if (!path) return;

        // Update completed and struggled nodes
        if (performance >= 0.8) {
            if (!path.completedNodes.includes(completedTopic)) {
                path.completedNodes.push(completedTopic);
            }
            const index = path.struggledNodes.indexOf(completedTopic);
            if (index !== -1) {
                path.struggledNodes.splice(index, 1);
            }
        } else if (performance < 0.6) {
            if (!path.struggledNodes.includes(completedTopic)) {
                path.struggledNodes.push(completedTopic);
            }
            const index = path.completedNodes.indexOf(completedTopic);
            if (index !== -1) {
                path.completedNodes.splice(index, 1);
            }
        }

        // Update current node if needed
        if (performance >= 0.8) {
            const currentNode = this.knowledgeGraph.get(path.currentNode);
            if (currentNode && currentNode.nextTopics.length > 0) {
                path.currentNode = currentNode.nextTopics[0];
            }
        }

        // Recalculate recommended path with updated state
        path.recommendedPath = this.calculateOptimalPath(
            path.currentNode,
            path.completedNodes,
            path.struggledNodes,
            SkillLevel.INTERMEDIATE // TODO: Get from user profile
        );

        // Update the stored path
        this.learningPaths.set(userId, path);
    }

    public getRemedialContent(topic: string): string[] {
        const metadata = this.topicMetadata.get(topic);
        return metadata ? metadata.remedialContent : [];
    }

    public getPrerequisites(topic: string): string[] {
        const node = this.knowledgeGraph.get(topic);
        return node ? node.prerequisites : [];
    }

    public getNextTopics(topic: string): string[] {
        const node = this.knowledgeGraph.get(topic);
        return node ? node.nextTopics : [];
    }

    adjustDifficulty(
        topic: string,
        performance: number,
        timeSpent: number,
        attemptsCount: number
    ): DifficultyAdjustment {
        // Get current difficulty or set default
        const currentDifficulty = this.difficultyLevels.get(topic) || 5;
        
        // Store performance
        const history = this.performanceHistory.get(topic) || [];
        history.push(performance);
        this.performanceHistory.set(topic, history);

        // Calculate performance metrics
        const recentPerformance = this.calculateRecentPerformance(topic);
        const learningRate = this.calculateLearningRate(topic);
        const consistencyScore = this.calculateConsistencyScore(topic);

        // Determine difficulty adjustment
        let adjustment = 0;
        const adjustmentFactors: string[] = [];

        // Adjust based on performance
        if (recentPerformance > this.adaptationThreshold) {
            adjustment += 0.5;
            adjustmentFactors.push("Consistent high performance");
        } else if (recentPerformance < 0.3) {
            adjustment -= 0.5;
            adjustmentFactors.push("Struggling with current difficulty");
        }

        // Adjust based on time spent
        const expectedTime = this.getExpectedTime(currentDifficulty);
        if (timeSpent < expectedTime * 0.7) {
            adjustment += 0.3;
            adjustmentFactors.push("Completing tasks quickly");
        } else if (timeSpent > expectedTime * 1.5) {
            adjustment -= 0.3;
            adjustmentFactors.push("Taking longer than expected");
        }

        // Adjust based on attempts
        if (attemptsCount > 3) {
            adjustment -= 0.2;
            adjustmentFactors.push("Multiple attempts needed");
        }

        // Consider learning rate
        if (learningRate > 0.1) {
            adjustment += 0.2;
            adjustmentFactors.push("Rapid improvement shown");
        }

        // Apply consistency bonus/penalty
        if (consistencyScore > 0.8) {
            adjustment += 0.1;
            adjustmentFactors.push("Showing consistent performance");
        }

        // Calculate new difficulty
        const newDifficulty = Math.min(
            this.maxDifficulty,
            Math.max(
                this.minDifficulty,
                currentDifficulty + adjustment
            )
        );

        // Store new difficulty
        this.difficultyLevels.set(topic, newDifficulty);

        // Generate adaptive feedback
        const adaptiveFeedback = this.generateAdaptiveFeedback(
            currentDifficulty,
            newDifficulty,
            adjustmentFactors
        );

        return {
            currentDifficulty,
            recommendedDifficulty: newDifficulty,
            adjustmentReason: adjustmentFactors.join(", "),
            adaptiveFeedback
        };
    }

    private calculateRecentPerformance(topic: string): number {
        const history = this.performanceHistory.get(topic) || [];
        if (history.length === 0) return 0.5;

        // Consider only recent performances
        const recentHistory = history.slice(-5);
        return recentHistory.reduce((sum, score) => sum + score, 0) / recentHistory.length;
    }

    private calculateLearningRate(topic: string): number {
        const history = this.performanceHistory.get(topic) || [];
        if (history.length < 2) return 0;

        const recentScores = history.slice(-5);
        let totalImprovement = 0;

        for (let i = 1; i < recentScores.length; i++) {
            totalImprovement += recentScores[i] - recentScores[i - 1];
        }

        return totalImprovement / (recentScores.length - 1);
    }

    private calculateConsistencyScore(topic: string): number {
        const history = this.performanceHistory.get(topic) || [];
        if (history.length < 3) return 1;

        const recentScores = history.slice(-5);
        const average = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
        
        const variance = recentScores.reduce(
            (sum, score) => sum + Math.pow(score - average, 2), 
            0
        ) / recentScores.length;

        return 1 / (1 + variance);
    }

    private getExpectedTime(difficulty: number): number {
        // Base time in minutes for difficulty level 1
        const baseTime = 5;
        return baseTime * Math.pow(1.5, difficulty - 1);
    }

    private generateAdaptiveFeedback(
        currentDifficulty: number,
        newDifficulty: number,
        factors: string[]
    ): string[] {
        const feedback: string[] = [];

        if (newDifficulty > currentDifficulty) {
            feedback.push("You're ready for more challenging content!");
            feedback.push(`Increasing difficulty based on: ${factors.join(", ")}`);
            feedback.push("The next exercises will help push your understanding further.");
        } else if (newDifficulty < currentDifficulty) {
            feedback.push("Let's focus on strengthening your foundation.");
            feedback.push(`Adjusting difficulty to help you master the concepts: ${factors.join(", ")}`);
            feedback.push("Take your time with the next exercises to build confidence.");
        } else {
            feedback.push("You're working at a good level for your current skills.");
            feedback.push("Keep practicing to maintain and improve your understanding.");
        }

        return feedback;
    }
} 