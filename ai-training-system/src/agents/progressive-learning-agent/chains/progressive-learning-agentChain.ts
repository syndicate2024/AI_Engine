// @ai-protected
import { ChatOpenAI } from 'langchain/chat_models';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { RunnableSequence } from 'langchain/schema/runnable';
import { PromptTemplate } from 'langchain/prompts';

interface Exercise {
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  startingCode: string;
  hints: string[];
  testCases: Array<{
    input: string;
    expectedOutput: string;
  }>;
  solution: string;
}

interface Tutorial {
  topic: string;
  prerequisites: string[];
  concepts: string[];
  examples: Array<{
    description: string;
    code: string;
    explanation: string;
  }>;
  exercises: Exercise[];
  nextSteps: string[];
}

interface AdaptationMetrics {
  currentLevel: string;
  completionRate: number;
  strugglePoints: string[];
  recommendations: string[];
}

export class ProgressiveLearningChain {
  private model: ChatOpenAI;
  private exerciseParser: StructuredOutputParser<Exercise>;
  private tutorialParser: StructuredOutputParser<Tutorial>;

  constructor() {
    this.model = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
    });

    this.exerciseParser = StructuredOutputParser.fromZod({
      title: z.string(),
      difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
      description: z.string(),
      startingCode: z.string(),
      hints: z.array(z.string()),
      testCases: z.array(z.object({
        input: z.string(),
        expectedOutput: z.string(),
      })),
      solution: z.string(),
    });

    this.tutorialParser = StructuredOutputParser.fromZod({
      topic: z.string(),
      prerequisites: z.array(z.string()),
      concepts: z.array(z.string()),
      examples: z.array(z.object({
        description: z.string(),
        code: z.string(),
        explanation: z.string(),
      })),
      exercises: z.array(this.exerciseParser.schema),
      nextSteps: z.array(z.string()),
    });
  }

  async generateExercise(
    topic: string,
    skillLevel: string,
    concepts: string[]
  ): Promise<Exercise> {
    const exercisePrompt = new PromptTemplate({
      template: `Create a coding exercise for {topic} at {skillLevel} level.
      The exercise should cover these concepts: {concepts}
      
      Create an exercise that:
      1. Challenges the appropriate skills
      2. Includes clear instructions
      3. Provides helpful hints
      4. Has comprehensive test cases
      5. Includes a model solution
      
      {format_instructions}`,
      inputVariables: ['topic', 'skillLevel', 'concepts'],
      partialVariables: {
        format_instructions: this.exerciseParser.getFormatInstructions(),
      },
    });

    const chain = RunnableSequence.from([
      exercisePrompt,
      this.model,
      this.exerciseParser,
    ]);

    return await chain.invoke({
      topic,
      skillLevel,
      concepts: concepts.join(', '),
    });
  }

  async createTutorial(
    topic: string,
    skillLevel: string,
    prerequisites: string[]
  ): Promise<Tutorial> {
    const tutorialPrompt = new PromptTemplate({
      template: `Create a comprehensive tutorial for {topic} at {skillLevel} level.
      Prerequisites: {prerequisites}
      
      The tutorial should:
      1. Explain core concepts clearly
      2. Provide practical examples
      3. Include interactive exercises
      4. Suggest next learning steps
      
      {format_instructions}`,
      inputVariables: ['topic', 'skillLevel', 'prerequisites'],
      partialVariables: {
        format_instructions: this.tutorialParser.getFormatInstructions(),
      },
    });

    const chain = RunnableSequence.from([
      tutorialPrompt,
      this.model,
      this.tutorialParser,
    ]);

    return await chain.invoke({
      topic,
      skillLevel,
      prerequisites: prerequisites.join(', '),
    });
  }

  async adaptContent(
    currentContent: Tutorial | Exercise,
    performance: AdaptationMetrics
  ): Promise<Tutorial | Exercise> {
    const adaptationPrompt = new PromptTemplate({
      template: `Adapt the following content based on learner performance:
      
      Current Content:
      {content}
      
      Performance Metrics:
      Level: {level}
      Completion Rate: {completionRate}
      Struggle Points: {strugglePoints}
      
      Adapt the content to:
      1. Match the learner's demonstrated abilities
      2. Address specific struggle points
      3. Maintain engagement and challenge
      
      {format_instructions}`,
      inputVariables: ['content', 'level', 'completionRate', 'strugglePoints'],
      partialVariables: {
        format_instructions: 'content' in currentContent 
          ? this.tutorialParser.getFormatInstructions()
          : this.exerciseParser.getFormatInstructions(),
      },
    });

    const chain = RunnableSequence.from([
      adaptationPrompt,
      this.model,
      'content' in currentContent ? this.tutorialParser : this.exerciseParser,
    ]);

    return await chain.invoke({
      content: JSON.stringify(currentContent, null, 2),
      level: performance.currentLevel,
      completionRate: performance.completionRate.toString(),
      strugglePoints: performance.strugglePoints.join(', '),
    });
  }

  async validateMastery(
    concept: string,
    solution: string
  ): Promise<boolean> {
    const validationPrompt = new PromptTemplate({
      template: `Evaluate if the following solution demonstrates mastery of {concept}:
      
      Solution:
      {solution}
      
      Consider:
      1. Correct implementation
      2. Code quality
      3. Understanding of concepts
      4. Best practices
      
      Respond with true only if the solution demonstrates clear mastery.`,
      inputVariables: ['concept', 'solution'],
    });

    const chain = RunnableSequence.from([
      validationPrompt,
      this.model,
    ]);

    const result = await chain.invoke({ concept, solution });
    return result.toLowerCase().includes('true');
  }

  async generateLearningPath(
    topics: string[],
    skillLevel: string
  ): Promise<string[]> {
    const pathPrompt = new PromptTemplate({
      template: `Create a progressive learning path for these topics: {topics}
      Starting skill level: {skillLevel}
      
      Provide a comma-separated list of topics in optimal learning order.`,
      inputVariables: ['topics', 'skillLevel'],
    });

    const chain = RunnableSequence.from([
      pathPrompt,
      this.model,
    ]);

    const result = await chain.invoke({
      topics: topics.join(', '),
      skillLevel,
    });

    return result.split(',').map(topic => topic.trim());
  }
}

// Example usage:
/*
const progressiveLearning = new ProgressiveLearningChain();

// Generate an exercise
const exercise = await progressiveLearning.generateExercise(
  'React Hooks',
  'intermediate',
  ['useState', 'useEffect', 'custom hooks']
);

// Create a tutorial
const tutorial = await progressiveLearning.createTutorial(
  'React State Management',
  'intermediate',
  ['React basics', 'JavaScript ES6']
);

// Adapt content based on performance
const adaptedContent = await progressiveLearning.adaptContent(
  tutorial,
  {
    currentLevel: 'intermediate',
    completionRate: 0.8,
    strugglePoints: ['async state updates', 'effect cleanup'],
    recommendations: ['practice more cleanup patterns']
  }
);
*/