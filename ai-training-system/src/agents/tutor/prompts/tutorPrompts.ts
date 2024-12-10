import { SkillLevel } from '../../../types';

interface PromptTemplateArgs {
  [key: string]: string | number | boolean | undefined;
}

interface PromptTemplate {
  format: (args: PromptTemplateArgs) => string;
}

class Template implements PromptTemplate {
  constructor(private template: string) {}

  format(args: PromptTemplateArgs): string {
    let result = this.template;
    for (const [key, value] of Object.entries(args)) {
      result = result.replace(new RegExp(`{${key}}`, 'g'), String(value));
    }
    return result;
  }
}

export const TUTOR_PROMPTS = {
  conceptExplanation: new Template(`
    As an AI tutor, explain the concept of {concept} to a {skillLevel} level student.
    Recent concepts covered: {context}
    Areas needing focus: {focusAreas}
    
    For ADVANCED level:
    - Provide detailed technical explanations
    - Include complex scenarios and edge cases
    - Show advanced patterns and best practices
    - Demonstrate integration with other concepts
    
    For INTERMEDIATE level:
    - Balance theory with practical examples
    - Focus on common use cases
    - Show standard patterns
    
    For BEGINNER level:
    - Start with fundamentals
    - Use simple examples
    - Break down complex terms
    
    Provide a clear explanation with examples and practical applications.
    Include multiple code snippets demonstrating:
    1. Basic array operations and syntax
    2. Common patterns and usage
    3. Advanced implementations (for higher skill levels)
    
    End with 2-3 follow-up questions to check understanding.
  `),

  codeReview: new Template(`
    Review the following code for a {skillLevel} level student:
    {code}
    
    Previous interactions context:
    {previousInteractions}
    
    Provide constructive feedback focusing on:
    1. Code quality and best practices
    2. Potential improvements
    3. Common pitfalls to avoid
    Include example improvements where helpful.
  `),

  errorHelp: new Template(`
    Help debug the following error for a {skillLevel} level student:
    Error: {error}
    
    Current module context: {context}
    Previous attempts:
    {previousAttempts}
    
    Provide:
    1. Clear explanation of the error
    2. Likely causes
    3. Step-by-step solution
    4. Prevention tips
  `),

  practiceExercise: new Template(`
    Create a practice exercise for {concept} suitable for a {skillLevel} level student.
    Related concepts covered: {relatedConcepts}
    Previous exercises attempted:
    {previousExercises}
    
    Include:
    1. Problem statement
    2. Learning objectives
    3. Starter code (if applicable)
    4. Hints and tips
    5. Solution walkthrough
  `)
};

export const RESPONSE_TEMPLATES = {
  standardResponse: new Template(`
    Format the following response for a {skillLevel} student learning {topic}:
    {content}
    
    Response type: {responseType}
    
    For ADVANCED level responses:
    - Use technical terminology
    - Include complex examples
    - Show advanced patterns
    - Reference related concepts
    
    Ensure the response includes:
    1. Clear explanation/feedback
    2. Relevant examples
    3. Code snippets with array syntax and operations
    4. Follow-up questions
    5. Additional resources
    
    Always include at least one code snippet showing array syntax:
    \`\`\`javascript
    const array = [];
    array.push(1, 2, 3);
    \`\`\`
  `)
}; 