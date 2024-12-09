import { ChatOpenAI } from '@langchain/openai';
import { env } from './env';

// OpenAI model configuration
export const openAIConfig = {
  modelName: env.OPENAI_MODEL,
  temperature: env.OPENAI_TEMPERATURE,
  maxTokens: 2000,
  streaming: true,
};

// Initialize the OpenAI chat model
export const chatModel = new ChatOpenAI({
  ...openAIConfig,
  openAIApiKey: env.OPENAI_API_KEY,
});

// Tutor-specific configurations
export const tutorConfig = {
  maxResponseTokens: 1000,
  maxContextTokens: 4000,
  defaultTemperature: 0.7,
  systemPromptTokens: 500,
};

// Assessment-specific configurations
export const assessmentConfig = {
  maxQuestions: 10,
  minQuestions: 3,
  defaultDifficulty: 'intermediate',
  timeoutSeconds: 300,
};

// Resource management configurations
export const resourceConfig = {
  maxResourcesPerQuery: 5,
  cacheTimeoutMinutes: 60,
  maxContentLength: 10000,
};

// Export all configurations
export const aiConfig = {
  openAI: openAIConfig,
  tutor: tutorConfig,
  assessment: assessmentConfig,
  resources: resourceConfig,
}; 