import { PathVisualizer } from '../../../../src/agents/tutor/visualization/pathVisualizer';
import { SkillLevel } from '../../../../src/agents/types';

describe('PathVisualizer', () => {
    let visualizer: PathVisualizer;

    beforeEach(() => {
        visualizer = new PathVisualizer();
    });

    describe('visualizePath', () => {
        it('should initialize a default path for new users', () => {
            const result = visualizer.visualizePath('user1', 'intro', {
                showMasteryLevels: true,
                highlightRecommended: true,
                showEstimates: true,
                showDependencies: true,
                showAlternatives: true,
                interactive: true
            });

            expect(result).toBeDefined();
            expect(result.nodes).toBeInstanceOf(Array);
            expect(result.currentNode).toBe('intro');
            expect(result.recommendedPath).toBeInstanceOf(Array);
        });

        it('should return existing path for known users', () => {
            // First call to create path
            visualizer.visualizePath('user2', 'intro', {
                showMasteryLevels: true,
                highlightRecommended: true,
                showEstimates: true,
                showDependencies: true,
                showAlternatives: true,
                interactive: true
            });

            // Second call should return existing path
            const result = visualizer.visualizePath('user2', 'advanced', {
                showMasteryLevels: true,
                highlightRecommended: true,
                showEstimates: true,
                showDependencies: true,
                showAlternatives: true,
                interactive: true
            });

            expect(result).toBeDefined();
            expect(result.currentNode).toBe('advanced');
        });

        it('should respect visualization options', () => {
            const result = visualizer.visualizePath('user3', 'intro', {
                showMasteryLevels: false,
                highlightRecommended: false,
                showEstimates: false,
                showDependencies: false,
                showAlternatives: false,
                interactive: false
            });

            expect(result.nodes.every(node => !node.mastery)).toBe(true);
            expect(result.alternativePaths).toHaveLength(0);
            expect(result.nodes.every(node => !node.estimatedTime)).toBe(true);
            expect(result.nodes.every(node => node.dependencies.length === 0)).toBe(true);
        });

        it('should track progress history', () => {
            // Initial path
            visualizer.visualizePath('user4', 'intro', {
                showMasteryLevels: true,
                highlightRecommended: true,
                showEstimates: true,
                showDependencies: true,
                showAlternatives: true,
                interactive: true
            });

            // Update progress
            const result = visualizer.updateProgress('user4', 'intro', 0.8);
            expect(result.nodes.find(n => n.id === 'intro')?.mastery).toBe(0.8);
        });

        it('should handle milestones correctly', () => {
            const result = visualizer.visualizePath('user5', 'intro', {
                showMasteryLevels: true,
                highlightRecommended: true,
                showEstimates: true,
                showDependencies: true,
                showAlternatives: true,
                interactive: true
            });

            expect(result.milestones).toBeDefined();
            expect(result.milestones).toBeInstanceOf(Array);
            expect(result.milestones.every(m => typeof m.achieved === 'boolean')).toBe(true);
        });
    });
}); 