// @ai-protected
// Test Environment Setup

import { vi } from 'vitest';
import dotenv from 'dotenv';
import path from 'path';
import { ResponseType, SkillLevel, LearningStyle } from '../../src/types';

export function setupTestEnv() {
    // Load test environment variables
    dotenv.config({
        path: path.resolve(process.cwd(), '.env.test')
    });

    // Set test environment
    process.env.NODE_ENV = 'test';
    process.env.AI_MODEL = process.env.AI_MODEL || 'test-model';
    
    // Reset all mocks before each test
    vi.resetAllMocks();
    
    // Mock global objects if needed
    global.console = {
        ...console,
        error: vi.fn(),
        warn: vi.fn(),
        log: vi.fn(),
    };

    // Setup test data
    global.testData = {
        responseTypes: Object.values(ResponseType),
        skillLevels: Object.values(SkillLevel),
        learningStyles: Object.values(LearningStyle),
        mockInteractions: {
            basic: {
                userQuery: 'Help me learn JavaScript',
                skillLevel: SkillLevel.BEGINNER,
                context: {
                    culturalContext: 'India',
                    devicePreferences: 'mobile',
                    accessibilityNeeds: ['screen-reader']
                },
                previousInteractions: [
                    {
                        query: 'What is a variable?',
                        response: 'A variable is a container for storing data values',
                        timestamp: new Date()
                    }
                ]
            },
            career: {
                userQuery: 'What career path should I take in web development?',
                skillLevel: SkillLevel.BEGINNER,
                context: {
                    culturalContext: 'India',
                    devicePreferences: 'desktop',
                    accessibilityNeeds: []
                },
                previousInteractions: []
            },
            error: {
                userQuery: 'Fix this code: for(i=0;i<10;i++) console.log(i);',
                skillLevel: SkillLevel.BEGINNER,
                context: {
                    culturalContext: 'US',
                    devicePreferences: 'desktop',
                    accessibilityNeeds: []
                },
                previousInteractions: []
            },
            practice: {
                userQuery: 'Give me an exercise to practice React',
                skillLevel: SkillLevel.INTERMEDIATE,
                context: {
                    culturalContext: 'UK',
                    devicePreferences: 'desktop',
                    accessibilityNeeds: []
                },
                previousInteractions: []
            }
        }
    };
    
    // Return cleanup function
    return () => {
        vi.resetAllMocks();
        delete global.testData;
        process.env.AI_MODEL = 'test-model';
    };
}
