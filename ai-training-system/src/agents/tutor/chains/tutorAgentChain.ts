// @ai-protected
// Tutor Agent Chain

import { TutorChain } from './tutorChain';
import { TutorInteraction, TutorResponse, LearningContext } from '../../../types';

export class TutorAgentChain extends TutorChain {
  private agentContext: LearningContext;

  constructor() {
    super();
    this.agentContext = {
      currentModule: '',
      recentConcepts: [],
      struggledTopics: [],
      completedProjects: []
    };
  }

  async generateResponse(interaction: TutorInteraction): Promise<TutorResponse> {
    try {
      // Add agent-specific enhancements
      const enhancedInteraction = {
        ...interaction,
        context: {
          ...interaction.context || this.agentContext,
          recentConcepts: [
            ...(interaction.context?.recentConcepts || []),
            interaction.currentTopic
          ].slice(0, 5)
        },
        previousInteractions: interaction.previousInteractions || []
      };

      const response = await super.generateResponse(enhancedInteraction);
      
      // Update agent context
      this.agentContext = enhancedInteraction.context;
      
      return response;
    } catch (error) {
      console.error('Error in TutorAgentChain:', error);
      throw error;
    }
  }
} 