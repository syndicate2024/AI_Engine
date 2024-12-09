/**
 * @fileoverview Integration tests for the AI Tutor Chain
 * Tests the interaction between components with real API calls
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { generateTutorResponse } from '../tutorChain';
import { TutorContext, SkillLevel, TutorInteraction, ResponseType, Project } from '../../../../types';

describe('tutorChain Integration', () => {
  let context: TutorContext;

  beforeEach(() => {
    const mockProject: Project = {
      id: '1',
      name: 'JavaScript Basics',
      description: 'Introduction to JavaScript',
      completed: true,
      timestamp: new Date()
    };

    context = {
      skillLevel: SkillLevel.BEGINNER,
      currentTopic: 'JavaScript Variables',
      learningPath: ['Programming Basics', 'JavaScript Intro'],
      previousInteractions: [],
      currentModule: 'JavaScript Basics',
      recentConcepts: ['Programming Fundamentals'],
      struggledTopics: [],
      completedProjects: [mockProject]
    };
  });

  it('should generate valid responses', async () => {
    const response = await generateTutorResponse(context, 'What are variables?');
    expect(response).toBeDefined();
    expect(response.content).toBeTruthy();
    expect(Object.values(ResponseType)).toContain(response.type);
  });

  it('should maintain context across interactions', async () => {
    // First interaction
    const firstQuestion = 'What are variables?';
    const firstResponse = await generateTutorResponse(context, firstQuestion);
    expect(firstResponse).toBeDefined();
    
    // Create a proper TutorInteraction with complete context
    const interaction: TutorInteraction = {
      userQuery: firstQuestion,
      response: firstResponse,
      context: {
        currentModule: context.currentModule,
        recentConcepts: context.recentConcepts,
        struggledTopics: context.struggledTopics,
        completedProjects: context.completedProjects
      },
      skillLevel: context.skillLevel,
      currentTopic: context.currentTopic,
      previousInteractions: [],
      timestamp: new Date()
    };

    // Update context with the interaction
    context.previousInteractions.push(interaction);

    // Second interaction
    const secondResponse = await generateTutorResponse(
      context,
      'How do I declare a variable?'
    );
    expect(secondResponse).toBeDefined();
    expect(secondResponse.relatedConcepts).toContain('variables');
  });

  // ... rest of the test file ...
}); 