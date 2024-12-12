// @ai-protected
import { SkillLevel } from '../../../types';
import { LearningProgress, TopicMetadata, LearningNode } from '../learning/types';
import type { LearningPath as ImportedLearningPath } from '../learning/types';

interface ConceptNode extends LearningNode {
    name: string;
    level: SkillLevel;
    mastery?: number;
    status: 'locked' | 'available' | 'in-progress' | 'completed';
    completionTime?: number;
}

interface LearningPath {
    nodes: ConceptNode[];
    currentNode: string;
    recommendedPath: string[];
    alternativePaths: string[][];
    milestones: {
        id: string;
        name: string;
        requiredConcepts: string[];
        achieved: boolean;
    }[];
}

interface VisualizationOptions {
    showMasteryLevels: boolean;
    highlightRecommended: boolean;
    showEstimates: boolean;
    showDependencies: boolean;
    showAlternatives: boolean;
    interactive: boolean;
}

interface VisualizationNode {
    id: string;
    label: string;
    status: 'locked' | 'available' | 'current' | 'completed' | 'struggled';
    progress: number;
    estimatedTime?: number;
    completionTime?: number;
    difficulty: number;
    prerequisites: string[];
}

interface VisualizationEdge {
    from: string;
    to: string;
    type: 'prerequisite' | 'recommended' | 'alternative';
}

interface PathVisualization {
    nodes: VisualizationNode[];
    edges: VisualizationEdge[];
    currentPath: string[];
    alternativePaths: string[][];
    metrics: {
        totalTime: number;
        completedTime: number;
        progressPercentage: number;
        remainingTime: number;
    };
}

export class PathVisualizer {
    private conceptGraph: Map<string, ConceptNode> = new Map();
    private learningPaths: Map<string, LearningPath> = new Map();
    private masteryThresholds: Map<string, number> = new Map();
    private progressHistory: Map<string, number[]> = new Map();

    visualizePath(
        userId: string,
        currentTopic: string,
        options: VisualizationOptions
    ): LearningPath {
        const path = this.learningPaths.get(userId) || this.initializeDefaultPath(userId);
        path.currentNode = currentTopic;

        if (!options.showMasteryLevels) {
            path.nodes.forEach(node => {
                node.mastery = undefined;
            });
        }
        if (!options.showEstimates) {
            path.nodes.forEach(node => {
                node.estimatedTimeMinutes = 0;
            });
        }
        if (!options.showDependencies) {
            path.nodes.forEach(node => {
                node.dependencies = [];
                node.nextTopics = [];
            });
        }
        if (!options.showAlternatives) {
            path.alternativePaths = [];
        }

        return path;
    }

    generateVisualization(
        path: ImportedLearningPath,
        progress: LearningProgress,
        metadata: Map<string, TopicMetadata>
    ): PathVisualization {
        const nodes: VisualizationNode[] = path.nodes.map(node => {
            let status: VisualizationNode['status'] = 'locked';
            
            if (progress.completedTopics.includes(node.id)) {
                status = 'completed';
            } else if (node.id === progress.currentTopic) {
                status = 'current';
            } else if (progress.struggledTopics.includes(node.id)) {
                status = 'struggled';
            } else if (this.isNodeAvailable(node.id, progress.completedTopics, path)) {
                status = 'available';
            }

            const nodeProgress = progress.topicScores.get(node.id) || 0;

            return {
                id: node.id,
                label: node.topic,
                status,
                progress: Math.round(nodeProgress * 100),
                estimatedTime: node.estimatedTimeMinutes,
                completionTime: progress.completedTopics.includes(node.id) ? 
                    progress.averageCompletionTime : undefined,
                difficulty: node.difficulty,
                prerequisites: node.prerequisites
            };
        });

        const edges: VisualizationEdge[] = [];
        
        // Add prerequisite edges
        path.nodes.forEach(node => {
            node.prerequisites.forEach(prereq => {
                edges.push({
                    from: prereq,
                    to: node.id,
                    type: 'prerequisite'
                });
            });
        });

        // Add recommended path edges
        for (let i = 0; i < path.recommendedPath.length - 1; i++) {
            edges.push({
                from: path.recommendedPath[i],
                to: path.recommendedPath[i + 1],
                type: 'recommended'
            });
        }

        // Calculate metrics
        const totalTime = path.nodes.reduce((sum, node) => sum + node.estimatedTimeMinutes, 0);
        const completedTime = path.nodes
            .filter(node => progress.completedTopics.includes(node.id))
            .reduce((sum, node) => sum + node.estimatedTimeMinutes, 0);
        const remainingTime = totalTime - completedTime;
        const progressPercentage = Math.round((progress.completedTopics.length / path.nodes.length) * 100);

        // Generate alternative paths
        const alternativePaths = this.generateAlternativePaths(path, progress);

        return {
            nodes,
            edges,
            currentPath: path.recommendedPath,
            alternativePaths,
            metrics: {
                totalTime,
                completedTime,
                progressPercentage,
                remainingTime
            }
        };
    }

    updateProgress(userId: string, conceptId: string, mastery: number): LearningPath {
        const path = this.learningPaths.get(userId);
        if (!path) {
            throw new Error('User path not found');
        }

        const node = path.nodes.find(n => n.id === conceptId);
        if (!node) {
            throw new Error('Concept not found');
        }

        node.mastery = mastery;
        
        if (!this.progressHistory.has(userId)) {
            this.progressHistory.set(userId, []);
        }
        this.progressHistory.get(userId)?.push(mastery);

        if (mastery >= (this.masteryThresholds.get(conceptId) || 0.8)) {
            node.status = 'completed';
            node.nextTopics.forEach(unlockId => {
                const unlockNode = path.nodes.find(n => n.id === unlockId);
                if (unlockNode && this.canUnlock(unlockNode, path.nodes)) {
                    unlockNode.status = 'available';
                }
            });
        }

        path.milestones.forEach(milestone => {
            milestone.achieved = milestone.requiredConcepts.every(conceptId => {
                const node = path.nodes.find(n => n.id === conceptId);
                return node?.status === 'completed';
            });
        });

        return path;
    }

    private isNodeAvailable(nodeId: string, completedTopics: string[], path: ImportedLearningPath): boolean {
        const node = path.nodes.find(n => n.id === nodeId);
        if (!node) return false;
        
        return node.prerequisites.every(prereq => completedTopics.includes(prereq));
    }

    private generateAlternativePaths(path: ImportedLearningPath, progress: LearningProgress): string[][] {
        const alternatives: string[][] = [];
        const mainPath = path.recommendedPath;
        
        // Generate alternatives by finding parallel paths through completed nodes
        for (let i = 1; i < mainPath.length - 1; i++) {
            const currentNode = path.nodes.find(n => n.id === mainPath[i]);
            if (!currentNode) continue;

            // Find nodes with same difficulty and prerequisites met
            const alternativeNodes = path.nodes.filter(n => 
                n.id !== currentNode.id &&
                n.difficulty === currentNode.difficulty &&
                this.isNodeAvailable(n.id, progress.completedTopics, path) &&
                !mainPath.includes(n.id) // Ensure node isn't already in main path
            );

            // For each alternative node, create a new path
            alternativeNodes.forEach(altNode => {
                // Check if the alternative node's prerequisites are compatible
                const isCompatible = altNode.prerequisites.every(prereq => {
                    const prereqNode = path.nodes.find(n => n.id === prereq);
                    return prereqNode && (
                        progress.completedTopics.includes(prereq) ||
                        mainPath.slice(0, i).includes(prereq)
                    );
                });

                if (isCompatible) {
                    const altPath = [...mainPath];
                    altPath[i] = altNode.id;
                    
                    // Ensure this alternative path doesn't already exist
                    if (!alternatives.some(p => JSON.stringify(p) === JSON.stringify(altPath))) {
                        alternatives.push(altPath);
                    }
                }
            });
        }

        return alternatives;
    }

    private canUnlock(node: ConceptNode, allNodes: ConceptNode[]): boolean {
        return node.dependencies.every(depId => {
            const depNode = allNodes.find(n => n.id === depId);
            return depNode?.status === 'completed';
        });
    }

    private initializeDefaultPath(userId: string): LearningPath {
        const path: LearningPath = {
            nodes: [
                {
                    id: 'intro',
                    name: 'Introduction',
                    level: SkillLevel.BEGINNER,
                    mastery: 0,
                    dependencies: [],
                    nextTopics: ['basics'],
                    status: 'available',
                    topic: 'Introduction',
                    estimatedTimeMinutes: 30,
                    difficulty: 1,
                    prerequisites: [],
                    concepts: ['basics', 'introduction']
                },
                {
                    id: 'basics',
                    name: 'Basic Concepts',
                    level: SkillLevel.BEGINNER,
                    mastery: 0,
                    dependencies: ['intro'],
                    nextTopics: ['advanced'],
                    status: 'locked',
                    topic: 'Basic Concepts',
                    estimatedTimeMinutes: 60,
                    difficulty: 2,
                    prerequisites: ['intro'],
                    concepts: ['variables', 'functions']
                },
                {
                    id: 'advanced',
                    name: 'Advanced Topics',
                    level: SkillLevel.INTERMEDIATE,
                    mastery: 0,
                    dependencies: ['basics'],
                    nextTopics: [],
                    status: 'locked',
                    topic: 'Advanced Topics',
                    estimatedTimeMinutes: 90,
                    difficulty: 3,
                    prerequisites: ['basics'],
                    concepts: ['classes', 'inheritance']
                }
            ],
            currentNode: 'intro',
            recommendedPath: ['intro', 'basics', 'advanced'],
            alternativePaths: [],
            milestones: [
                {
                    id: 'basics-complete',
                    name: 'Complete Basic Training',
                    requiredConcepts: ['intro', 'basics'],
                    achieved: false
                },
                {
                    id: 'full-course',
                    name: 'Course Completion',
                    requiredConcepts: ['intro', 'basics', 'advanced'],
                    achieved: false
                }
            ]
        };

        this.learningPaths.set(userId, path);
        return path;
    }
} 