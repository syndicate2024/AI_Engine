// @ai-protected
import { SkillLevel } from '../../../src/types';
import { mockTutorContext } from '../../__mocks__/shared-mocks';
import { LearningPathOptimizer } from '../../../src/agents/tutor/learning/learningPathOptimizer';

describe('LearningPathOptimizer', () => {
    let optimizer: LearningPathOptimizer;
    const userId = 'test-user-1';

    beforeEach(() => {
        optimizer = new LearningPathOptimizer();
    });

    describe('generateLearningPath', () => {
        it('should generate a valid learning path for a beginner', () => {
            const path = optimizer.generateLearningPath(userId, mockTutorContext, SkillLevel.BEGINNER);
            expect(path.nodes.length).toBeGreaterThan(0);
            expect(path.currentNode).toBe(mockTutorContext.currentTopic);
            expect(path.recommendedPath.length).toBeGreaterThan(0);
        });

        it('should include prerequisites in the path', () => {
            const context = {
                ...mockTutorContext,
                currentTopic: 'functions',
                completedProjects: []
            };
            const path = optimizer.generateLearningPath(userId, context, SkillLevel.BEGINNER);
            expect(path.recommendedPath).toContain('variables');
            expect(path.recommendedPath.indexOf('variables'))
                .toBeLessThan(path.recommendedPath.indexOf('functions'));
        });

        it('should adapt difficulty based on skill level', () => {
            const beginnerPath = optimizer.generateLearningPath(userId, mockTutorContext, SkillLevel.BEGINNER);
            const advancedPath = optimizer.generateLearningPath(userId, mockTutorContext, SkillLevel.ADVANCED);
            expect(advancedPath.nodes.length).toBeGreaterThanOrEqual(beginnerPath.nodes.length);
        });
    });

    describe('updateProgress', () => {
        it('should update completed nodes on good performance', () => {
            const path = optimizer.generateLearningPath(userId, mockTutorContext, SkillLevel.BEGINNER);
            optimizer.updateProgress(userId, 'variables', 0.9);
            const updatedPath = optimizer.generateLearningPath(userId, mockTutorContext, SkillLevel.BEGINNER);
            expect(updatedPath.completedNodes).toContain('variables');
        });

        it('should add to struggled nodes on poor performance', () => {
            const path = optimizer.generateLearningPath(userId, mockTutorContext, SkillLevel.BEGINNER);
            optimizer.updateProgress(userId, 'functions', 0.5);
            const updatedPath = optimizer.generateLearningPath(userId, mockTutorContext, SkillLevel.BEGINNER);
            expect(updatedPath.struggledNodes).toContain('functions');
        });

        it('should recalculate path after updating progress', () => {
            const initialPath = optimizer.generateLearningPath(userId, mockTutorContext, SkillLevel.BEGINNER);
            optimizer.updateProgress(userId, 'variables', 0.5);
            const updatedPath = optimizer.generateLearningPath(userId, mockTutorContext, SkillLevel.BEGINNER);
            expect(updatedPath.recommendedPath).not.toEqual(initialPath.recommendedPath);
        });
    });

    describe('getRemedialContent', () => {
        it('should return remedial content for struggled topics', () => {
            const content = optimizer.getRemedialContent('variables');
            expect(content.length).toBeGreaterThan(0);
            expect(content).toContain('basic-types');
        });

        it('should return empty array for unknown topics', () => {
            const content = optimizer.getRemedialContent('unknown-topic');
            expect(content).toEqual([]);
        });
    });

    describe('getPrerequisites', () => {
        it('should return prerequisites for a topic', () => {
            const prerequisites = optimizer.getPrerequisites('functions');
            expect(prerequisites).toContain('variables');
        });

        it('should return empty array for base topics', () => {
            const prerequisites = optimizer.getPrerequisites('variables');
            expect(prerequisites).toEqual([]);
        });
    });

    describe('getNextTopics', () => {
        it('should return next topics for current topic', () => {
            const nextTopics = optimizer.getNextTopics('variables');
            expect(nextTopics).toContain('functions');
            expect(nextTopics).toContain('control-flow');
        });

        it('should handle unknown topics', () => {
            const nextTopics = optimizer.getNextTopics('unknown-topic');
            expect(nextTopics).toEqual([]);
        });
    });

    describe('path optimization', () => {
        it('should prioritize topics that help with struggled areas', () => {
            const context = {
                ...mockTutorContext,
                struggledTopics: ['types']
            };
            const path = optimizer.generateLearningPath(userId, context, SkillLevel.BEGINNER);
            const typesIndex = path.recommendedPath.findIndex(topic => 
                optimizer.getRemedialContent(topic).some(content => content.includes('types'))
            );
            expect(typesIndex).toBeGreaterThan(-1);
            expect(typesIndex).toBeLessThan(path.recommendedPath.length - 1);
        });

        it('should maintain proper topic ordering despite prioritization', () => {
            const context = {
                ...mockTutorContext,
                currentTopic: 'functions',
                struggledTopics: ['types']
            };
            const path = optimizer.generateLearningPath(userId, context, SkillLevel.BEGINNER);
            const variablesIndex = path.recommendedPath.indexOf('variables');
            const functionsIndex = path.recommendedPath.indexOf('functions');
            expect(variablesIndex).toBeLessThan(functionsIndex);
        });
    });
}); 