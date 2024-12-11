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

export class LearningPathOptimizer {
    private knowledgeGraph: Map<string, LearningNode>;
    private topicMetadata: Map<string, TopicMetadata>;
    private learningPaths: Map<string, LearningPath>;

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
        const queue: string[] = [currentTopic];

        while (queue.length > 0) {
            const topic = queue.shift()!;
            if (visited.has(topic)) continue;

            visited.add(topic);
            path.push(topic);

            const node = this.knowledgeGraph.get(topic);
            if (!node) continue;

            // Add prerequisites if not completed
            for (const prereq of node.prerequisites) {
                if (!completed.includes(prereq)) {
                    queue.unshift(prereq); // Add to front to maintain prerequisites
                }
            }

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

        return struggledTopics.some(struggled =>
            metadata.buildingBlocks.includes(struggled) ||
            metadata.remedialContent.some(content => content.includes(struggled))
        );
    }

    public updateProgress(
        userId: string,
        completedTopic: string,
        performance: number
    ): void {
        const path = this.learningPaths.get(userId);
        if (!path) return;

        if (performance >= 0.8) {
            path.completedNodes.push(completedTopic);
            const index = path.struggledNodes.indexOf(completedTopic);
            if (index !== -1) {
                path.struggledNodes.splice(index, 1);
            }
        } else if (performance < 0.6) {
            if (!path.struggledNodes.includes(completedTopic)) {
                path.struggledNodes.push(completedTopic);
            }
        }

        // Recalculate recommended path
        path.recommendedPath = this.calculateOptimalPath(
            path.currentNode,
            path.completedNodes,
            path.struggledNodes,
            SkillLevel.INTERMEDIATE // TODO: Get from user profile
        );
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
} 