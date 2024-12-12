// @ai-protected
import { LearningMetrics, LearningProgress, TopicMetadata } from '../learning/types';

interface PerformanceMetrics {
    overallProgress: number;
    topicMastery: Map<string, number>;
    learningRate: number;
    timeEfficiency: number;
    struggleAreas: string[];
    strengths: string[];
}

interface TimeMetrics {
    totalTimeSpent: number;
    averageTimePerTopic: number;
    timeDistribution: Map<string, number>;
    learningPaceCategory: 'slow' | 'moderate' | 'fast';
    estimatedCompletion: number;
}

interface EngagementMetrics {
    consistencyScore: number;
    activeStreak: number;
    topicRevisits: Map<string, number>;
    practiceFrequency: number;
    lastActivityGap: number;
}

interface LearningAnalytics {
    performance: PerformanceMetrics;
    time: TimeMetrics;
    engagement: EngagementMetrics;
    recommendations: string[];
    alerts: string[];
}

export class AnalyticsDashboard {
    private static readonly MASTERY_THRESHOLD = 0.8;
    private static readonly STRUGGLE_THRESHOLD = 0.6;
    private static readonly CONSISTENCY_THRESHOLD = 0.7;

    public generateAnalytics(
        progress: LearningProgress,
        topicMetadata: Map<string, TopicMetadata>
    ): LearningAnalytics {
        return {
            performance: this.analyzePerformance(progress, topicMetadata),
            time: this.analyzeTimeMetrics(progress),
            engagement: this.analyzeEngagement(progress),
            recommendations: this.generateRecommendations(progress, topicMetadata),
            alerts: this.generateAlerts(progress)
        };
    }

    private analyzePerformance(
        progress: LearningProgress,
        topicMetadata: Map<string, TopicMetadata>
    ): PerformanceMetrics {
        const topicMastery = new Map<string, number>();
        let totalScore = 0;

        // Calculate topic mastery and overall progress
        progress.topicScores.forEach((score, topic) => {
            topicMastery.set(topic, score);
            totalScore += score;
        });

        const overallProgress = totalScore / Math.max(1, progress.topicScores.size);

        // Identify strengths and struggles
        const strengths: string[] = [];
        const struggleAreas: string[] = [];

        topicMastery.forEach((score, topic) => {
            if (score >= this.MASTERY_THRESHOLD || progress.completedTopics.includes(topic)) {
                strengths.push(topic);
            }
            if (score <= this.STRUGGLE_THRESHOLD || progress.struggledTopics.includes(topic)) {
                struggleAreas.push(topic);
            }
        });

        // Calculate learning rate
        const learningRate = this.calculateLearningRate(progress);

        // Calculate time efficiency
        const timeEfficiency = this.calculateTimeEfficiency(progress);

        return {
            overallProgress,
            topicMastery,
            learningRate,
            timeEfficiency,
            struggleAreas,
            strengths
        };
    }

    private calculateLearningRate(progress: LearningProgress): number {
        const completedCount = progress.completedTopics.length;
        const totalTime = progress.averageCompletionTime * completedCount;
        return completedCount / Math.max(1, totalTime);
    }

    private calculateTimeEfficiency(progress: LearningProgress): number {
        const avgTime = progress.averageCompletionTime;
        const expectedTime = 60; // baseline expected time in minutes
        return expectedTime / Math.max(1, avgTime);
    }

    private analyzeTimeMetrics(progress: LearningProgress): TimeMetrics {
        const timeDistribution = new Map<string, number>();
        let totalTime = 0;

        // Calculate time distribution
        progress.completedTopics.forEach(topic => {
            const time = progress.averageCompletionTime;
            timeDistribution.set(topic, time);
            totalTime += time;
        });

        const averageTimePerTopic = totalTime / Math.max(1, progress.completedTopics.length);

        // Determine learning pace
        const learningPaceCategory = this.determineLearningPace(averageTimePerTopic);

        // Estimate completion time for remaining topics
        const remainingTopics = this.estimateRemainingTime(progress, averageTimePerTopic);

        return {
            totalTimeSpent: totalTime,
            averageTimePerTopic,
            timeDistribution,
            learningPaceCategory,
            estimatedCompletion: remainingTopics * averageTimePerTopic
        };
    }

    private determineLearningPace(averageTime: number): 'slow' | 'moderate' | 'fast' {
        const expectedTime = 60; // baseline
        if (averageTime < expectedTime * 0.8) return 'fast';
        if (averageTime > expectedTime * 1.2) return 'slow';
        return 'moderate';
    }

    private estimateRemainingTime(
        progress: LearningProgress,
        averageTime: number
    ): number {
        return progress.struggledTopics.length * (averageTime * 1.5) +
               (progress.topicScores.size - progress.completedTopics.length) * averageTime;
    }

    private analyzeEngagement(progress: LearningProgress): EngagementMetrics {
        const now = new Date();
        const lastActivity = progress.lastActivity;
        const daysSinceLastActivity = Math.floor(
            (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
        );

        const topicRevisits = new Map<string, number>();
        progress.completedTopics.forEach(topic => {
            const revisits = Math.floor(Math.random() * 5); // TODO: Track actual revisits
            topicRevisits.set(topic, revisits);
        });

        return {
            consistencyScore: this.calculateConsistencyScore(daysSinceLastActivity),
            activeStreak: this.calculateActiveStreak(progress),
            topicRevisits,
            practiceFrequency: this.calculatePracticeFrequency(progress),
            lastActivityGap: daysSinceLastActivity
        };
    }

    private calculateConsistencyScore(daysSinceLastActivity: number): number {
        if (daysSinceLastActivity === 0) return 1;
        if (daysSinceLastActivity <= 2) return 0.8;
        if (daysSinceLastActivity <= 7) return 0.5;
        return Math.max(0, 1 - (daysSinceLastActivity / 30));
    }

    private calculateActiveStreak(progress: LearningProgress): number {
        // TODO: Implement actual streak tracking
        return Math.floor(
            progress.completedTopics.length / Math.max(1, progress.struggledTopics.length)
        );
    }

    private calculatePracticeFrequency(progress: LearningProgress): number {
        // TODO: Implement actual practice tracking
        return progress.completedTopics.length / 
               Math.max(1, (Date.now() - progress.lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    }

    private generateRecommendations(
        progress: LearningProgress,
        topicMetadata: Map<string, TopicMetadata>
    ): string[] {
        const recommendations: string[] = [];

        // Add recommendations for struggled topics first
        progress.struggledTopics.forEach(topic => {
            const metadata = topicMetadata.get(topic);
            if (metadata && metadata.remedialContent) {
                metadata.remedialContent.forEach(content => {
                    recommendations.push(
                        `Review ${topic} starting with ${content}`
                    );
                });
            }
        });

        // Then check for low mastery topics
        progress.topicScores.forEach((score, topic) => {
            if (score < this.MASTERY_THRESHOLD && !progress.struggledTopics.includes(topic)) {
                const metadata = topicMetadata.get(topic);
                if (metadata && metadata.remedialContent) {
                    metadata.remedialContent.forEach(content => {
                        recommendations.push(
                            `Practice ${topic} with ${content}`
                        );
                    });
                }
            }
        });

        // Check engagement
        if (this.calculateConsistencyScore(
            (Date.now() - progress.lastActivity.getTime()) / (1000 * 60 * 60 * 24)
        ) < this.CONSISTENCY_THRESHOLD) {
            recommendations.push(
                'Try to maintain a more consistent learning schedule'
            );
        }

        return recommendations;
    }

    private generateAlerts(progress: LearningProgress): string[] {
        const alerts: string[] = [];

        // Check for long periods of inactivity
        const daysSinceLastActivity = 
            (Date.now() - progress.lastActivity.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceLastActivity > 7) {
            alerts.push(`No activity for ${Math.floor(daysSinceLastActivity)} days`);
        }

        // Check for multiple struggled topics
        if (progress.struggledTopics.length > 2) {
            alerts.push(
                `Multiple topics need attention: ${progress.struggledTopics.join(', ')}`
            );
        }

        return alerts;
    }
} 