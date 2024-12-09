import { PromptTemplate } from '@langchain/core/prompts';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { chatModel } from '../../../config/ai-config';
import { TutorResponse, TutorContext, ResponseType } from '../../../types';
import { BaseMessage } from '@langchain/core/messages';
import { AIServiceError, ValidationError } from '../../../utils/error-handling';

/**
 * Input type for the tutor chain
 * @interface TutorChainInput
 * @property {TutorContext} context - The learning context of the student
 * @property {string} question - The student's question
 */
interface TutorChainInput {
  context: TutorContext;
  question: string;
}

// Define the output parser for structured responses
const responseParser = new JsonOutputParser<TutorResponse>();

/**
 * System prompt template for generating tutor responses
 * Uses a structured format to ensure consistent and helpful responses
 */
const systemPrompt = PromptTemplate.fromTemplate(`
You are an AI tutor specialized in helping students learn programming concepts.
Your responses should be informative, encouraging, and tailored to the student's skill level.

Current Context:
Skill Level: {skillLevel}
Current Topic: {currentTopic}
Previous Topics: {previousTopics}

Student's Question: {question}

Provide a response that includes:
- Clear explanation
- Relevant examples
- Follow-up questions to check understanding
- Related concepts they might want to explore

Response MUST be in this exact JSON format:
{
  "content": "Your detailed response here",
  "type": "CONCEPT_EXPLANATION",
  "confidence": 0.9,
  "followUpQuestions": ["What are the key concepts?", "How does this work in practice?"],
  "relatedConcepts": ["concept1", "concept2"]
}

Choose the most appropriate type from these exact values:
- "CONCEPT_EXPLANATION"
- "CODE_REVIEW"
- "ERROR_EXPLANATION"
- "HINT"
- "QUESTION"

Make sure to:
1. Keep responses clear and concise
2. Include practical examples
3. Match the explanation to the skill level
4. Suggest related topics to explore
5. Include 2-3 follow-up questions
`);

/**
 * Validates the tutor chain input
 * @param input The input to validate
 * @throws {ValidationError} If the input is invalid
 */
function validateInput(input: TutorChainInput): void {
  if (!input.context || !input.question) {
    throw new ValidationError('Context and question are required');
  }
  if (!input.context.skillLevel || !input.context.currentTopic) {
    throw new ValidationError('Skill level and current topic are required in context');
  }
  if (typeof input.question !== 'string' || input.question.trim().length === 0) {
    throw new ValidationError('Question must be a non-empty string');
  }
}

/**
 * The main tutor chain that processes student questions and generates responses
 * Uses a sequence of steps to format the prompt, get AI response, and parse the result
 */
export const tutorChain = RunnableSequence.from([
  {
    // First step: Format the prompt
    prompt: async (input: TutorChainInput) => {
      validateInput(input);
      try {
        return systemPrompt.format({
          skillLevel: input.context.skillLevel,
          currentTopic: input.context.currentTopic,
          previousTopics: input.context.learningPath.join(', '),
          question: input.question,
        });
      } catch (error) {
        if (error instanceof Error) {
          throw new ValidationError(`Error formatting prompt: ${error.message}`);
        }
        throw new ValidationError('Error formatting prompt');
      }
    },
  },
  // Second step: Get response from the model
  chatModel,
  // Third step: Extract the content from the message
  (response: BaseMessage) => {
    try {
      return response.content;
    } catch (error) {
      if (error instanceof Error) {
        throw new AIServiceError(`Error extracting content from response: ${error.message}`);
      }
      throw new AIServiceError('Error extracting content from response');
    }
  },
  // Fourth step: Parse the response
  responseParser,
]);

/**
 * Helper function to generate a tutor response
 * @param context The learning context of the student
 * @param question The student's question
 * @returns Promise<TutorResponse> The formatted tutor response
 * @throws {ValidationError} If the input is invalid
 * @throws {AIServiceError} If there's an error with the AI service
 */
export async function generateTutorResponse(
  context: TutorContext,
  question: string
): Promise<TutorResponse> {
  try {
    // Additional validation for specific requirements
    if (!context.learningPath || !Array.isArray(context.learningPath)) {
      throw new ValidationError('Learning path must be an array');
    }

    const response = await tutorChain.invoke({
      context,
      question,
    });

    // Validate response structure
    if (!response.content || !response.type || typeof response.confidence !== 'number') {
      throw new ValidationError('Invalid response structure from AI model');
    }

    // Validate response type
    if (!Object.values(ResponseType).includes(response.type)) {
      throw new ValidationError(`Invalid response type: ${response.type}`);
    }

    return response;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    if (error instanceof AIServiceError) {
      throw error;
    }
    if (error instanceof Error) {
      console.error('Error generating tutor response:', error);
      throw new AIServiceError(`Failed to generate tutor response: ${error.message}`);
    }
    console.error('Error generating tutor response:', error);
    throw new AIServiceError('Failed to generate tutor response');
  }
} 