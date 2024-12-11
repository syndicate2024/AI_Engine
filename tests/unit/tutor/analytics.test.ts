// @ai-protected
import { AnalyticsDashboard } from '../../../src/agents/tutor/analytics/learningAnalytics';
import { LearningProgress, TopicMetadata } from '../../../src/agents/tutor/learning/types';

describe('AnalyticsDashboard', () => {
    let dashboard: AnalyticsDashboard;
    let mockProgress: LearningProgress;
    let mockMetadata: Map<string, TopicMetadata>;

    beforeEach(() => {
        dashboard = new AnalyticsDashboard();

        mockProgress = {
            userId: 'test-user',
            currentTopic: 'variables',
            completedTopics: ['variables', 'control-flow'],
            struggledTopics: ['functions'],
            topicScores: new Map([
                ['variables', 0.9],
                ['control-flow', 0.8],
                ['functions', 0.5]
            ]),
            averageCompletionTime: 45,
            lastActivity: new Date()
        };

        mockMetadata = new Map([
            ['variables', {
                requiredFor: ['functions'],
                buildingBlocks: ['declaration', 'types'],
                commonStruggles: ['scope'],
                remedialContent: ['basic-types'],
                practiceExercises: ['variables-practice']
            }]
        ]);
    });

    describe('generateAnalytics', () => {
        it('should generate complete analytics report', () => {
            const analytics = dashboard.generateAnalytics(mockProgress, mockMetadata);
            
            expect(analytics.performance).toBeDefined();
            expect(analytics.time).toBeDefined();
            expect(analytics.engagement).toBeDefined();
            expect(analytics.recommendations).toBeDefined();
            expect(analytics.alerts).toBeDefined();
        });
    });

    describe('performance metrics', () => {
        it('should calculate overall progress', () => {
            const analytics = dashboard.generateAnalytics(mockProgress, mockMetadata);
            expect(analytics.performance.overallProgress).toBeCloseTo(0.73, 2); // (0.9 + 0.8 + 0.5) / 3
        });

        it('should identify strengths and struggles', () => {
            const analytics = dashboard.generateAnalytics(mockProgress, mockMetadata);
            expect(analytics.performance.strengths).toContain('variables');
            expect(analytics.performance.struggleAreas).toContain('functions');
        });

        it('should calculate learning rate', () => {
            const analytics = dashboard.generateAnalytics(mockProgress, mockMetadata);
            expect(analytics.performance.learningRate).toBeGreaterThan(0);
        });
    });

    describe('time metrics', () => {
        it('should calculate time distribution', () => {
            const analytics = dashboard.generateAnalytics(mockProgress, mockMetadata);
            expect(analytics.time.timeDistribution.size).toBe(2); // completed topics
        });

        it('should determine learning pace', () => {
            const analytics = dashboard.generateAnalytics(mockProgress, mockMetadata);
            expect(['slow', 'moderate', 'fast']).toContain(analytics.time.learningPaceCategory);
        });

        it('should estimate completion time', () => {
            const analytics = dashboard.generateAnalytics(mockProgress, mockMetadata);
            expect(analytics.time.estimatedCompletion).toBeGreaterThan(0);
        });
    });

    describe('engagement metrics', () => {
        it('should calculate consistency score', () => {
            const analytics = dashboard.generateAnalytics(mockProgress, mockMetadata);
            expect(analytics.engagement.consistencyScore).toBeGreaterThanOrEqual(0);
            expect(analytics.engagement.consistencyScore).toBeLessThanOrEqual(1);
        });

        it('should track active streak', () => {
            const analytics = dashboard.generateAnalytics(mockProgress, mockMetadata);
            expect(analytics.engagement.activeStreak).toBeGreaterThanOrEqual(0);
        });

        it('should calculate practice frequency', () => {
            const analytics = dashboard.generateAnalytics(mockProgress, mockMetadata);
            expect(analytics.engagement.practiceFrequency).toBeGreaterThan(0);
        });
    });

    describe('recommendations', () => {
        it('should generate recommendations for struggling topics', () => {
            const analytics = dashboard.generateAnalytics(mockProgress, mockMetadata);
            expect(analytics.recommendations.some(r => r.includes('functions'))).toBe(true);
        });

        it('should suggest remedial content', () => {
            mockProgress.struggledTopics = ['variables'];
            const analytics = dashboard.generateAnalytics(mockProgress, mockMetadata);
            expect(analytics.recommendations.some(r => r.includes('basic-types'))).toBe(true);
        });
    });

    describe('alerts', () => {
        it('should generate inactivity alerts', () => {
            mockProgress.lastActivity = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000); // 8 days ago
            const analytics = dashboard.generateAnalytics(mockProgress, mockMetadata);
            expect(analytics.alerts.some(a => a.includes('No activity'))).toBe(true);
        });

        it('should alert multiple struggled topics', () => {
            mockProgress.struggledTopics = ['functions', 'objects', 'arrays'];
            const analytics = dashboard.generateAnalytics(mockProgress, mockMetadata);
            expect(analytics.alerts.some(a => a.includes('Multiple topics'))).toBe(true);
        });
    });
}); 