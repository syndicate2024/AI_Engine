// @ai-protected
import { LearningContext, TutorInteraction, TutorResponse } from '../../../types';
import { TutorChain } from './tutorChain';

export class TutorAgentChain extends TutorChain {
    protected model: any;
    private agentContext: LearningContext;

    constructor() {
        super();
        this.agentContext = {
            recentConcepts: [],
            struggledTopics: [],
            completedProjects: []
        };
    }

    async generateResponse(interaction: TutorInteraction): Promise<TutorResponse> {
        try {
            // Enhance the interaction with current agent context
            const enhancedInteraction = {
                ...interaction,
                context: {
                    ...this.agentContext,
                    ...interaction.context
                }
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