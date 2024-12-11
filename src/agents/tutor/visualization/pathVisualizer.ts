// @ai-protected
import { LearningNode, LearningPath, LearningProgress, TopicMetadata } from '../learning/types';

interface VisualNode {
    id: string;
    label: string;
    status: 'completed' | 'current' | 'upcoming' | 'struggled' | 'locked';
    difficulty: number;
    progress: number;
    prerequisites: string[];
    estimatedTime: number;
}

interface VisualEdge {
    from: string;
    to: string;
    type: 'prerequisite' | 'recommended' | 'alternative';
}

interface PathVisualization {
    nodes: VisualNode[];
    edges: VisualEdge[];
    currentPath: string[];
    alternativePaths: string[][];
    metrics: {
        totalTime: number;
        completedTime: number;
        remainingTime: number;
        progressPercentage: number;
    };
}

export class PathVisualizer {
    private static readonly NODE_STATUS_COLORS = {
        completed: '#4CAF50',
        current: '#2196F3',
        upcoming: '#9E9E9E',
        struggled: '#FF5722',
        locked: '#757575'
    };

    public generateVisualization(
        learningPath: LearningPath,
        progress: LearningProgress,
        topicMetadata: Map<string, TopicMetadata>
    ): PathVisualization {
        const visualization: PathVisualization = {
            nodes: [],
            edges: [],
            currentPath: learningPath.recommendedPath,
            alternativePaths: [],
            metrics: {
                totalTime: 0,
                completedTime: 0,
                remainingTime: 0,
                progressPercentage: 0
            }
        };

        // Create nodes
        for (const node of learningPath.nodes) {
            visualization.nodes.push(this.createVisualNode(
                node,
                learningPath,
                progress
            ));
        }

        // Create edges
        visualization.edges = this.createVisualEdges(learningPath);

        // Calculate metrics
        visualization.metrics = this.calculateMetrics(
            learningPath,
            progress
        );

        // Generate alternative paths
        visualization.alternativePaths = this.generateAlternativePaths(
            learningPath,
            progress
        );

        return visualization;
    }

    private createVisualNode(
        node: LearningNode,
        path: LearningPath,
        progress: LearningProgress
    ): VisualNode {
        const status = this.determineNodeStatus(node.id, path, progress);
        const nodeProgress = this.calculateNodeProgress(node.id, progress);

        return {
            id: node.id,
            label: node.topic,
            status,
            difficulty: node.difficulty,
            progress: nodeProgress,
            prerequisites: node.prerequisites,
            estimatedTime: node.estimatedTimeMinutes
        };
    }

    private determineNodeStatus(
        nodeId: string,
        path: LearningPath,
        progress: LearningProgress
    ): VisualNode['status'] {
        if (progress.completedTopics.includes(nodeId)) {
            return 'completed';
        }
        if (nodeId === progress.currentTopic) {
            return 'current';
        }
        if (progress.struggledTopics.includes(nodeId)) {
            return 'struggled';
        }
        if (this.isNodeLocked(nodeId, path, progress)) {
            return 'locked';
        }
        return 'upcoming';
    }

    private isNodeLocked(
        nodeId: string,
        path: LearningPath,
        progress: LearningProgress
    ): boolean {
        const node = path.nodes.find(n => n.id === nodeId);
        if (!node) return true;

        return node.prerequisites.some(prereq => 
            !progress.completedTopics.includes(prereq)
        );
    }

    private calculateNodeProgress(
        nodeId: string,
        progress: LearningProgress
    ): number {
        if (progress.completedTopics.includes(nodeId)) {
            return 100;
        }
        const score = progress.topicScores.get(nodeId);
        return score ? score * 100 : 0;
    }

    private createVisualEdges(path: LearningPath): VisualEdge[] {
        const edges: VisualEdge[] = [];

        // Add prerequisite edges
        for (const node of path.nodes) {
            for (const prereq of node.prerequisites) {
                edges.push({
                    from: prereq,
                    to: node.id,
                    type: 'prerequisite'
                });
            }
        }

        // Add recommended path edges
        for (let i = 0; i < path.recommendedPath.length - 1; i++) {
            edges.push({
                from: path.recommendedPath[i],
                to: path.recommendedPath[i + 1],
                type: 'recommended'
            });
        }

        return edges;
    }

    private calculateMetrics(
        path: LearningPath,
        progress: LearningProgress
    ): PathVisualization['metrics'] {
        const totalTime = path.nodes.reduce(
            (sum, node) => sum + node.estimatedTimeMinutes,
            0
        );

        const completedTime = path.nodes
            .filter(node => progress.completedTopics.includes(node.id))
            .reduce((sum, node) => sum + node.estimatedTimeMinutes, 0);

        const remainingTime = totalTime - completedTime;
        const progressPercentage = (completedTime / totalTime) * 100;

        return {
            totalTime,
            completedTime,
            remainingTime,
            progressPercentage
        };
    }

    private generateAlternativePaths(
        path: LearningPath,
        progress: LearningProgress
    ): string[][] {
        const alternatives: string[][] = [];
        const currentIndex = path.recommendedPath.indexOf(progress.currentTopic);

        if (currentIndex === -1) return alternatives;

        // Generate alternative paths based on different criteria
        const byDifficulty = this.generatePathByDifficulty(
            path,
            progress,
            currentIndex
        );
        const byTime = this.generatePathByTime(
            path,
            progress,
            currentIndex
        );

        if (byDifficulty) alternatives.push(byDifficulty);
        if (byTime) alternatives.push(byTime);

        return alternatives;
    }

    private generatePathByDifficulty(
        path: LearningPath,
        progress: LearningProgress,
        startIndex: number
    ): string[] | null {
        const remaining = path.recommendedPath.slice(startIndex);
        return remaining.sort((a, b) => {
            const nodeA = path.nodes.find(n => n.id === a);
            const nodeB = path.nodes.find(n => n.id === b);
            return (nodeA?.difficulty || 0) - (nodeB?.difficulty || 0);
        });
    }

    private generatePathByTime(
        path: LearningPath,
        progress: LearningProgress,
        startIndex: number
    ): string[] | null {
        const remaining = path.recommendedPath.slice(startIndex);
        return remaining.sort((a, b) => {
            const nodeA = path.nodes.find(n => n.id === a);
            const nodeB = path.nodes.find(n => n.id === b);
            return (nodeA?.estimatedTimeMinutes || 0) - (nodeB?.estimatedTimeMinutes || 0);
        });
    }

    public getNodeStyle(status: VisualNode['status']): string {
        return PathVisualizer.NODE_STATUS_COLORS[status];
    }
} 