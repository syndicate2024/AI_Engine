// @ai-protected
import { ChatOpenAI } from 'langchain/chat_models';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { RunnableSequence } from 'langchain/schema/runnable';
import { PromptTemplate } from 'langchain/prompts';

interface CodeEvaluation {
  score: number;
  feedback: Array<{
    category: string;
    points: string[];
    suggestions: string[];
    priority: 'low' | 'medium' | 'high';
  }>;
  conceptMastery: Array<{
    concept: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    evidence: string[];
  }>;
  improvements: Array<{
    area: string;
    suggestion: string;
    example?: string;
  }>;
}

interface UnderstandingMetrics {
  concepts: Array<{
    name: string;
    level: number;
    confidence: number;
    gaps: string[];
  }>;
  skills: Array<{
    name: string;
    proficiency: number;
    lastAssessed: string;
    trend: 'improving' | 'stable' | 'declining';
  }>;
  recommendations: Array<{
    focus: string;
    reason: string;
    resources: string[];
  }>;
}

interface DetailedFeedback {
  strengths: Array<{
    area: string;
    details: string[];
    impact: string;
  }>;
  weaknesses: Array<{
    area: string;
    details: string[];
    improvement: string;
  }>;
  codeExamples: Array<{
    purpose: string;
    currentCode: string;
    improvedCode: string;
    explanation: string;
  }>;
  nextSteps: string[];
}

export class EvaluationChain {
  private model: ChatOpenAI;
  private evaluationParser: StructuredOutputParser<CodeEvaluation>;
  private metricsParser: StructuredOutputParser<UnderstandingMetrics>;
  private feedbackParser: StructuredOutputParser<DetailedFeedback>;

  constructor() {
    this.model = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
    });

    this.evaluationParser = StructuredOutputParser.fromZod({
      score: z.number(),
      feedback: z.array(z.object({
        category: z.string(),
        points: z.array(z.string()),
        suggestions: z.array(z.string()),
        priority: z.enum(['low', 'medium', 'high']),
      })),
      conceptMastery: z.array(z.object({
        concept: z.string(),
        level: z.enum(['beginner', 'intermediate', 'advanced']),
        evidence: z.array(z.string()),
      })),
      improvements: z.array(z.object({
        area: z.string(),
        suggestion: z.string(),
        example: z.string().optional(),
      })),
    });

    this.metricsParser = StructuredOutputParser.fromZod({
      concepts: z.array(z.object({
        name: z.string(),
        level: z.number(),
        confidence: z.number(),
        gaps: z.array(z.string()),
      })),
      skills: z.array(z.object({
        name: z.string(),
        proficiency: z.number(),
        lastAssessed: z.string(),
        trend: z.enum(['improving', 'stable', 'declining']),
      })),
      recommendations: z.array(z.object({
        focus: z.string(),
        reason: z.string(),
        resources: z.array(z.string()),
      })),
    });

    this.feedbackParser = StructuredOutputParser.fromZod({
      strengths: z.array(z.object({
        area: z.string(),
        details: z.array(z.string()),
        impact: z.string(),
      })),
      weaknesses: z.array(z.object({
        area: z.string(),
        details: z.array(z.string()),
        improvement: z.string(),
      })),
      codeExamples: z.array(z.object({
        purpose: z.string(),
        currentCode: z.string(),
        improvedCode: z.string(),
        explanation: z.string(),
      })),
      nextSteps: z.array(z.string()),
    });
  }

  async evaluateCode(
    code: string,
    requirements: string[],
    context: {
      purpose: string;
      skillLevel: string;
      concepts: string[];
    }
  ): Promise<CodeEvaluation> {
    const evaluationPrompt = new PromptTemplate({
      template: `Evaluate the following code:
      
      Code:
      {code}
      
      Requirements:
      {requirements}
      
      Context:
      Purpose: {purpose}
      Skill Level: {skillLevel}
      Key Concepts: {concepts}
      
      Provide a comprehensive evaluation including:
      1. Overall score
      2. Detailed feedback by category
      3. Concept mastery assessment
      4. Specific improvements
      
      {format_instructions}`,
      inputVariables: ['code', 'requirements', 'purpose', 'skillLevel', 'concepts'],
      partialVariables: {
        format_instructions: this.evaluationParser.getFormatInstructions(),
      },
    });

    const chain = RunnableSequence.from([
      evaluationPrompt,
      this.model,
      this.evaluationParser,
    ]);

    return await chain.invoke({
      code,
      requirements: requirements.join('\n'),
      purpose: context.purpose,
      skillLevel: context.skillLevel,
      concepts: context.concepts.join(', '),
    });
  }

  async trackUnderstanding(
    submissions: Array<{
      code: string;
      topic: string;
      score: number;
      date: string;
    }>
  ): Promise<UnderstandingMetrics> {
    const trackingPrompt = new PromptTemplate({
      template: `Analyze learning progress based on these submissions:
      
      Submissions:
      {submissions}
      
      Provide metrics covering:
      1. Concept understanding
      2. Skill proficiency
      3. Learning recommendations
      
      {format_instructions}`,
      inputVariables: ['submissions'],
      partialVariables: {
        format_instructions: this.metricsParser.getFormatInstructions(),
      },
    });

    const chain = RunnableSequence.from([
      trackingPrompt,
      this.model,
      this.metricsParser,
    ]);

    return await chain.invoke({
      submissions: JSON.stringify(submissions, null, 2),
    });
  }

  async generateFeedback(
    evaluation: CodeEvaluation,
    history: Array<{
      topic: string;
      score: number;
    }>
  ): Promise<DetailedFeedback> {
    const feedbackPrompt = new PromptTemplate({
      template: `Generate detailed feedback based on:
      
      Evaluation:
      {evaluation}
      
      Learning History:
      {history}
      
      Provide:
      1. Identified strengths
      2. Areas for improvement
      3. Example solutions
      4. Next learning steps
      
      {format_instructions}`,
      inputVariables: ['evaluation', 'history'],
      partialVariables: {
        format_instructions: this.feedbackParser.getFormatInstructions(),
      },
    });

    const chain = RunnableSequence.from([
      feedbackPrompt,
      this.model,
      this.feedbackParser,
    ]);

    return await chain.invoke({
      evaluation: JSON.stringify(evaluation, null, 2),
      history: JSON.stringify(history, null, 2),
    });
  }

  async validateSolution(
    code: string,
    testCases: Array<{
      input: string;
      expectedOutput: string;
    }>
  ): Promise<boolean> {
    const validationPrompt = new PromptTemplate({
      template: `Validate this solution against test cases:
      
      Code:
      {code}
      
      Test Cases:
      {testCases}
      
      Respond with true only if ALL test cases pass.`,
      inputVariables: ['code', 'testCases'],
    });

    const chain = RunnableSequence.from([
      validationPrompt,
      this.model,
    ]);

    const result = await chain.invoke({
      code,
      testCases: JSON.stringify(testCases, null, 2),
    });

    return result.toLowerCase().includes('true');
  }

  async detectPatterns(code: string): Promise<Array<{ pattern: string; usage: string }>> {
    const patternPrompt = new PromptTemplate({
      template: `Identify design patterns and coding practices in:
      
      Code:
      {code}
      
      List all patterns found and their usage context.`,
      inputVariables: ['code'],
    });

    const chain = RunnableSequence.from([
      patternPrompt,
      this.model,
    ]);

    const result = await chain.invoke({ code });
    
    return result.split('\n\n').map(block => {
      const [pattern, usage] = block.split('\n');
      return {
        pattern: pattern.replace('Pattern:', '').trim(),
        usage: usage.replace('Usage:', '').trim(),
      };
    });
  }

  async suggestImprovements(code: string): Promise<Array<{ 
    category: string; 
    suggestion: string; 
    example: string; 
  }>> {
    const improvementPrompt = new PromptTemplate({
      template: `Suggest improvements for:
      
      Code:
      {code}
      
      Provide specific suggestions with examples for:
      1. Code quality
      2. Performance
      3. Maintainability
      4. Best practices`,
      inputVariables: ['code'],
    });

    const chain = RunnableSequence.from([
      improvementPrompt,
      this.model,
    ]);

    const result = await chain.invoke({ code });
    
    return result.split('\n\n').map(block => {
      const lines = block.split('\n');
      return {
        category: lines[0].split(':')[0].trim(),
        suggestion: lines[0].split(':')[1].trim(),
        example: lines.slice(1).join('\n').trim(),
      };
    });
  }
}

// Example usage:
/*
const evaluator = new EvaluationChain();

// Evaluate code
const evaluation = await evaluator.evaluateCode(
  userCode,
  ['Correct output', 'Efficient implementation', 'Good practices'],
  {
    purpose: 'Data processing function',
    skillLevel: 'intermediate',
    concepts: ['algorithms', 'optimization']
  }
);

// Track understanding
const metrics = await evaluator.trackUnderstanding([
  {
    code: submission1,
    topic: 'React Hooks',
    score: 85,
    date: '2024-01-15'
  },
  {
    code: submission2,
    topic: 'State Management',
    score: 90,
    date: '2024-01-20'
  }
]);

// Generate detailed feedback
const feedback = await evaluator.generateFeedback(
  evaluation,
  [
    { topic: 'React Basics', score: 85 },
    { topic: 'Hooks', score: 90 }
  ]
);

// Validate solution
const isValid = await evaluator.validateSolution(
  userCode,
  [
    { input: 'test1', expectedOutput: 'result1' },
    { input: 'test2', expectedOutput: 'result2' }
  ]
);

// Detect patterns
const patterns = await evaluator.detectPatterns(userCode);

// Get improvement suggestions
const improvements = await evaluator.suggestImprovements(userCode);
*/