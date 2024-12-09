import { z } from 'zod';

// Enum Schemas
export const SkillLevelSchema = z.enum(['beginner', 'intermediate', 'advanced']);

export const ResponseTypeSchema = z.enum([
  'CONCEPT_EXPLANATION',
  'CODE_REVIEW',
  'ERROR_HELP',
  'BEST_PRACTICES',
  'RESOURCE_SUGGESTION',
  'PROGRESS_CHECK'
]);

// Project Schema
export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  topics: z.array(z.string()),
  completed: z.boolean(),
  feedback: z.string().optional()
});

// Learning Context Schema
export const LearningContextSchema = z.object({
  currentModule: z.string().min(1),
  recentConcepts: z.array(z.string()),
  struggledTopics: z.array(z.string()),
  completedProjects: z.array(ProjectSchema)
});

// Code Snippet Schema
export const CodeSnippetSchema = z.object({
  code: z.string().min(1),
  language: z.string().min(1),
  explanation: z.string().min(1),
  focus: z.array(z.string()).optional()
});

// Resource Schema
export const ResourceSchema = z.object({
  type: z.enum(['documentation', 'tutorial', 'exercise', 'example']),
  title: z.string().min(1),
  url: z.string().url().optional(),
  content: z.string().optional(),
  relevance: z.number().min(0).max(1)
});

// Interaction Schema
export const InteractionSchema = z.object({
  timestamp: z.string().datetime(),
  query: z.string().min(1),
  response: z.string().min(1),
  type: ResponseTypeSchema
});

// Tutor Response Schema
export const TutorResponseSchema = z.object({
  type: ResponseTypeSchema,
  content: z.string().min(1),
  additionalResources: z.array(ResourceSchema).optional(),
  followUpQuestions: z.array(z.string()).optional(),
  codeSnippets: z.array(CodeSnippetSchema).optional()
});

// Tutor Interaction Schema
export const TutorInteractionSchema = z.object({
  context: LearningContextSchema,
  userQuery: z.string().min(1),
  skillLevel: SkillLevelSchema,
  currentTopic: z.string().min(1),
  previousInteractions: z.array(InteractionSchema)
});

// Type inference helpers
export type ValidatedProject = z.infer<typeof ProjectSchema>;
export type ValidatedLearningContext = z.infer<typeof LearningContextSchema>;
export type ValidatedTutorInteraction = z.infer<typeof TutorInteractionSchema>;
export type ValidatedTutorResponse = z.infer<typeof TutorResponseSchema>; 