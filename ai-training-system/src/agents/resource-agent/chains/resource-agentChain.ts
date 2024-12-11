// @ai-protected
import { ChatOpenAI } from 'langchain/chat_models';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { RunnableSequence } from 'langchain/schema/runnable';
import { PromptTemplate } from 'langchain/prompts';

interface Resource {
  title: string;
  type: 'tutorial' | 'documentation' | 'exercise' | 'example' | 'reference';
  content: string;
  tags: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  relevanceScore: number;
}

interface ContentUpdate {
  resourceId: string;
  changes: string[];
  reason: string;
  priority: 'low' | 'medium' | 'high';
}

interface SearchResult {
  resources: Resource[];
  totalResults: number;
  relevanceScores: { [key: string]: number };
}

export class ResourceChain {
  private model: ChatOpenAI;
  private resourceParser: StructuredOutputParser<Resource>;
  private searchParser: StructuredOutputParser<SearchResult>;

  constructor() {
    this.model = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
    });

    this.resourceParser = StructuredOutputParser.fromZod({
      title: z.string(),
      type: z.enum(['tutorial', 'documentation', 'exercise', 'example', 'reference']),
      content: z.string(),
      tags: z.array(z.string()),
      skillLevel: z.enum(['beginner', 'intermediate', 'advanced']),
      prerequisites: z.array(z.string()),
      relevanceScore: z.number(),
    });

    this.searchParser = StructuredOutputParser.fromZod({
      resources: z.array(this.resourceParser.schema),
      totalResults: z.number(),
      relevanceScores: z.record(z.number()),
    });
  }

  async curateResources(
    topic: string,
    skillLevel: string,
    context: string[]
  ): Promise<Resource[]> {
    const curationPrompt = new PromptTemplate({
      template: `Curate learning resources for {topic} at {skillLevel} level.
      Context: {context}
      
      Create resources that:
      1. Match the skill level
      2. Cover key concepts
      3. Include practical examples
      4. Follow learning progression
      
      {format_instructions}`,
      inputVariables: ['topic', 'skillLevel', 'context'],
      partialVariables: {
        format_instructions: this.resourceParser.getFormatInstructions(),
      },
    });

    const chain = RunnableSequence.from([
      curationPrompt,
      this.model,
      this.resourceParser,
    ]);

    const resources: Resource[] = [];
    for (let i = 0; i < 3; i++) {  // Generate 3 resources
      const resource = await chain.invoke({
        topic,
        skillLevel,
        context: context.join(', '),
      });
      resources.push(resource);
    }

    return resources;
  }

  async searchResources(
    query: string,
    filters: {
      skillLevel?: string;
      type?: string;
      tags?: string[];
    }
  ): Promise<SearchResult> {
    const searchPrompt = new PromptTemplate({
      template: `Search for learning resources matching:
      Query: {query}
      Filters: {filters}
      
      Return:
      1. Matching resources
      2. Total result count
      3. Relevance scores
      
      {format_instructions}`,
      inputVariables: ['query', 'filters'],
      partialVariables: {
        format_instructions: this.searchParser.getFormatInstructions(),
      },
    });

    const chain = RunnableSequence.from([
      searchPrompt,
      this.model,
      this.searchParser,
    ]);

    return await chain.invoke({
      query,
      filters: JSON.stringify(filters),
    });
  }

  async evaluateResourceQuality(resource: Resource): Promise<number> {
    const evaluationPrompt = new PromptTemplate({
      template: `Evaluate the quality of this learning resource:
      
      Title: {title}
      Type: {type}
      Content: {content}
      Skill Level: {skillLevel}
      
      Consider:
      1. Content accuracy
      2. Clarity of explanation
      3. Practical value
      4. Engagement factor
      
      Return a quality score between 0 and 1.`,
      inputVariables: ['title', 'type', 'content', 'skillLevel'],
    });

    const chain = RunnableSequence.from([
      evaluationPrompt,
      this.model,
    ]);

    const result = await chain.invoke({
      title: resource.title,
      type: resource.type,
      content: resource.content,
      skillLevel: resource.skillLevel,
    });

    return parseFloat(result);
  }

  async suggestUpdates(resource: Resource): Promise<ContentUpdate> {
    const updatePrompt = new PromptTemplate({
      template: `Analyze this resource for potential updates:
      
      Resource:
      {resource}
      
      Suggest updates considering:
      1. Content freshness
      2. Best practices
      3. User feedback
      4. Modern techniques
      
      Provide structured update suggestions.`,
      inputVariables: ['resource'],
    });

    const chain = RunnableSequence.from([
      updatePrompt,
      this.model,
    ]);

    const result = await chain.invoke({
      resource: JSON.stringify(resource, null, 2),
    });

    // Parse the result into ContentUpdate structure
    const lines = result.split('\n');
    return {
      resourceId: resource.title,
      changes: lines.filter(line => line.startsWith('- ')).map(line => line.slice(2)),
      reason: lines.find(line => line.startsWith('Reason:'))?.slice(8) || '',
      priority: result.toLowerCase().includes('high priority') ? 'high' :
               result.toLowerCase().includes('medium priority') ? 'medium' : 'low',
    };
  }

  async recommendNextResources(
    completedResources: string[],
    learningPath: string[]
  ): Promise<Resource[]> {
    const recommendationPrompt = new PromptTemplate({
      template: `Recommend next learning resources based on:
      
      Completed: {completed}
      Learning Path: {path}
      
      Recommend resources that:
      1. Build on completed topics
      2. Prepare for upcoming topics
      3. Fill knowledge gaps
      
      {format_instructions}`,
      inputVariables: ['completed', 'path'],
      partialVariables: {
        format_instructions: this.resourceParser.getFormatInstructions(),
      },
    });

    const chain = RunnableSequence.from([
      recommendationPrompt,
      this.model,
      this.resourceParser,
    ]);

    const resources: Resource[] = [];
    for (let i = 0; i < 2; i++) {  // Generate 2 recommendations
      const resource = await chain.invoke({
        completed: completedResources.join(', '),
        path: learningPath.join(' -> '),
      });
      resources.push(resource);
    }

    return resources;
  }
}

// Example usage:
/*
const resourceAgent = new ResourceChain();

// Curate resources
const resources = await resourceAgent.curateResources(
  'React Hooks',
  'intermediate',
  ['useState', 'useEffect', 'custom hooks']
);

// Search resources
const searchResults = await resourceAgent.searchResources(
  'state management in React',
  {
    skillLevel: 'intermediate',
    type: 'tutorial',
    tags: ['react', 'hooks']
  }
);

// Evaluate resource quality
const quality = await resourceAgent.evaluateResourceQuality(resources[0]);

// Get update suggestions
const updates = await resourceAgent.suggestUpdates(resources[0]);

// Get next recommended resources
const nextResources = await resourceAgent.recommendNextResources(
  ['React Basics', 'Component Lifecycle'],
  ['State Management', 'Side Effects', 'Custom Hooks']
);
*/