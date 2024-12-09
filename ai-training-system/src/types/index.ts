export enum ResponseType {
  CONCEPT_EXPLANATION = 'CONCEPT_EXPLANATION',
  CODE_EXAMPLE = 'CODE_EXAMPLE',
  ERROR_CORRECTION = 'ERROR_CORRECTION',
  PRACTICE_EXERCISE = 'PRACTICE_EXERCISE'
}

export interface TutorResponse {
  type: ResponseType;
  content: string;
  additionalResources?: string[];
  followUpQuestions?: string[];
  codeSnippets?: string[];
}

export interface TutorInteraction {
  userQuery: string;
  skillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  currentTopic: string;
  previousInteractions?: TutorResponse[];
}

// Mock response for testing
export const mockTutorResponse: TutorResponse = {
  type: ResponseType.CONCEPT_EXPLANATION,
  content: "This is a mock response for testing",
  additionalResources: ["https://example.com/resource"],
  followUpQuestions: ["What would you like to learn next?"],
  codeSnippets: ["console.log('Hello World');"]
};