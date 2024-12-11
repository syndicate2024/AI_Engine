// @ai-protected
import { PathVisualizer } from '../../../src/agents/tutor/visualization/pathVisualizer';
import { LearningPath, LearningProgress, TopicMetadata } from '../../../src/agents/tutor/learning/types';
import { mockTutorContext } from '../../__mocks__/shared-mocks';

describe('PathVisualizer', () => {
    let visualizer: PathVisualizer;
    let mockPath: LearningPath;
    let mockProgress: LearningProgress;
    let mockMetadata: Map<string, TopicMetadata>;

    beforeEach(() => {
        visualizer = new PathVisualizer();
        
        mockPath = {
            nodes: [
                {
                    id: 'variables',
                    topic: 'Variables',
                    prerequisites: [],
                    difficulty: 1,
                    estimatedTimeMinutes: 30,
                    dependencies: [],
                    nextTopics: ['functions'],
                    concepts: ['declaration', 'assignment']
                },
                {
                    id: 'functions',
                    topic: 'Functions',
                    prerequisites: ['variables'],
                    difficulty: 2,
                    estimatedTimeMinutes: 45,
                    dependencies: ['variables'],
                    nextTopics: ['objects'],
                    concepts: ['parameters', 'return']
                }
            ],
            currentNode: 'variables',
            completedNodes: [],
            struggledNodes: [],
            recommendedPath: ['variables', 'functions']
        };

        mockProgress = {
            userId: 'test-user',
            currentTopic: 'variables',
            completedTopics: [],
            struggledTopics: [],
            topicScores: new Map([['variables', 0.5]]),
            averageCompletionTime: 30,
            lastActivity: new Date()
        };

        mockMetadata = new Map();
    });

    describe('generateVisualization', () => {
        it('should generate a valid visualization', () => {
            const visualization = visualizer.generateVisualization(
                mockPath,
                mockProgress,
                mockMetadata
            );

            expect(visualization.nodes.length).toBe(2);
            expect(visualization.edges.length).toBeGreaterThan(0);
            expect(visualization.currentPath).toEqual(['variables', 'functions']);
        });

        it('should mark current node correctly', () => {
            const visualization = visualizer.generateVisualization(
                mockPath,
                mockProgress,
                mockMetadata
            );

            const currentNode = visualization.nodes.find(n => n.id === 'variables');
            expect(currentNode?.status).toBe('current');
        });

        it('should calculate correct progress', () => {
            mockProgress.topicScores.set('variables', 0.7);
            const visualization = visualizer.generateVisualization(
                mockPath,
                mockProgress,
                mockMetadata
            );

            const node = visualization.nodes.find(n => n.id === 'variables');
            expect(node?.progress).toBe(70);
        });
    });

    describe('node status', () => {
        it('should mark completed nodes', () => {
            mockProgress.completedTopics = ['variables'];
            const visualization = visualizer.generateVisualization(
                mockPath,
                mockProgress,
                mockMetadata
            );

            const node = visualization.nodes.find(n => n.id === 'variables');
            expect(node?.status).toBe('completed');
        });

        it('should mark struggled nodes', () => {
            mockProgress.struggledTopics = ['functions'];
            const visualization = visualizer.generateVisualization(
                mockPath,
                mockProgress,
                mockMetadata
            );

            const node = visualization.nodes.find(n => n.id === 'functions');
            expect(node?.status).toBe('struggled');
        });

        it('should mark locked nodes', () => {
            const visualization = visualizer.generateVisualization(
                mockPath,
                mockProgress,
                mockMetadata
            );

            const node = visualization.nodes.find(n => n.id === 'functions');
            expect(node?.status).toBe('locked');
        });
    });

    describe('path metrics', () => {
        it('should calculate correct time metrics', () => {
            mockProgress.completedTopics = ['variables'];
            const visualization = visualizer.generateVisualization(
                mockPath,
                mockProgress,
                mockMetadata
            );

            expect(visualization.metrics.totalTime).toBe(75); // 30 + 45 minutes
            expect(visualization.metrics.completedTime).toBe(30);
            expect(visualization.metrics.remainingTime).toBe(45);
        });

        it('should calculate progress percentage', () => {
            mockProgress.completedTopics = ['variables'];
            const visualization = visualizer.generateVisualization(
                mockPath,
                mockProgress,
                mockMetadata
            );

            expect(visualization.metrics.progressPercentage).toBe(40); // 30/75 * 100
        });
    });

    describe('alternative paths', () => {
        it('should generate alternative paths', () => {
            const visualization = visualizer.generateVisualization(
                mockPath,
                mockProgress,
                mockMetadata
            );

            expect(visualization.alternativePaths.length).toBeGreaterThan(0);
        });

        it('should maintain prerequisites in alternative paths', () => {
            const visualization = visualizer.generateVisualization(
                mockPath,
                mockProgress,
                mockMetadata
            );

            visualization.alternativePaths.forEach(path => {
                const functionsIndex = path.indexOf('functions');
                const variablesIndex = path.indexOf('variables');
                expect(variablesIndex).toBeLessThan(functionsIndex);
            });
        });
    });
}); 