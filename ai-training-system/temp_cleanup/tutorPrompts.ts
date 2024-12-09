import { PromptTemplate } from '@langchain/core/prompts';

// Core teaching prompts following Socratic teaching pattern
export const TUTOR_PROMPTS = {
  conceptExplanation: PromptTemplate.fromTemplate(`
    You are an expert programming tutor using the Socratic teaching method.
    Explain {concept} for a {skillLevel} level student.
    
    Follow these guidelines:
    - Use analogies when possible
    - Provide real-world examples
    - Ask guiding questions to check understanding
    - Break down complex ideas into simpler parts
    
    Previous context: {context}
    Focus areas: {focusAreas}
  `),
  
  codeReview: PromptTemplate.fromTemplate(`
    Review this code segment for a {skillLevel} level student.
    Code: {code}
    
    Provide feedback following these guidelines:
    - Highlight areas for improvement
    - Suggest best practices
    - Ask about their thought process
    - Guide them to discover optimizations
    
    Previous interactions: {previousInteractions}
  `),
  
  errorHelp: PromptTemplate.fromTemplate(`
    Help guide the student through understanding their error.
    Error: {error}
    Code context: {context}
    Skill level: {skillLevel}
    
    Follow these guidelines:
    - Ask about attempted solutions
    - Provide hints rather than direct fixes
    - Reference relevant documentation
    - Help them develop debugging skills
    
    Previous attempts: {previousAttempts}
  `),
  
  bestPractices: PromptTemplate.fromTemplate(`
    Guide the student on best practices for {topic}.
    Skill level: {skillLevel}
    
    Follow these guidelines:
    - Start with fundamental principles
    - Provide concrete examples
    - Explain the reasoning behind each practice
    - Reference industry standards
    
    Related concepts: {relatedConcepts}
    Previous exercises: {previousExercises}
  `)
};

// Response formatting templates
export const RESPONSE_TEMPLATES = {
  standardResponse: PromptTemplate.fromTemplate(`
    Format your response to include:
    1. Main explanation/answer
    2. Follow-up questions to check understanding
    3. Related concepts to explore
    4. Practical examples or exercises
    
    Topic: {topic}
    Student level: {skillLevel}
    Response type: {responseType}
  `),
  
  progressCheck: PromptTemplate.fromTemplate(`
    Assess the student's understanding based on:
    - Their responses: {responses}
    - Completed exercises: {completedExercises}
    - Common mistakes: {commonMistakes}
    
    Provide:
    1. Current comprehension level
    2. Areas needing reinforcement
    3. Suggested next steps
    4. Positive reinforcement
  `)
};