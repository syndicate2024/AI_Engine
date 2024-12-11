// @ai-protected
import { LearningNode, TopicMetadata } from './types';

export const topicNodes: LearningNode[] = [
    {
        id: 'variables',
        topic: 'Variables and Data Types',
        prerequisites: [],
        difficulty: 1,
        estimatedTimeMinutes: 30,
        dependencies: [],
        nextTopics: ['functions', 'control-flow'],
        concepts: ['declaration', 'assignment', 'types', 'scope']
    },
    {
        id: 'control-flow',
        topic: 'Control Flow',
        prerequisites: ['variables'],
        difficulty: 1,
        estimatedTimeMinutes: 45,
        dependencies: ['variables'],
        nextTopics: ['loops', 'functions'],
        concepts: ['if-else', 'switch', 'boolean-logic']
    },
    {
        id: 'functions',
        topic: 'Functions',
        prerequisites: ['variables'],
        difficulty: 2,
        estimatedTimeMinutes: 60,
        dependencies: ['variables'],
        nextTopics: ['objects', 'arrays', 'scope'],
        concepts: ['parameters', 'return-values', 'function-types']
    },
    {
        id: 'loops',
        topic: 'Loops and Iteration',
        prerequisites: ['control-flow'],
        difficulty: 2,
        estimatedTimeMinutes: 45,
        dependencies: ['control-flow', 'variables'],
        nextTopics: ['arrays', 'objects'],
        concepts: ['for-loop', 'while-loop', 'iteration']
    },
    {
        id: 'arrays',
        topic: 'Arrays',
        prerequisites: ['loops'],
        difficulty: 2,
        estimatedTimeMinutes: 60,
        dependencies: ['loops', 'variables'],
        nextTopics: ['array-methods', 'objects'],
        concepts: ['indexing', 'array-methods', 'iteration']
    },
    {
        id: 'objects',
        topic: 'Objects',
        prerequisites: ['functions'],
        difficulty: 3,
        estimatedTimeMinutes: 75,
        dependencies: ['functions', 'variables'],
        nextTopics: ['classes', 'error-handling'],
        concepts: ['properties', 'methods', 'this-keyword']
    },
    {
        id: 'scope',
        topic: 'Scope and Closures',
        prerequisites: ['functions'],
        difficulty: 4,
        estimatedTimeMinutes: 90,
        dependencies: ['functions', 'variables'],
        nextTopics: ['advanced-functions', 'modules'],
        concepts: ['lexical-scope', 'closures', 'hoisting']
    },
    {
        id: 'array-methods',
        topic: 'Array Methods',
        prerequisites: ['arrays', 'functions'],
        difficulty: 3,
        estimatedTimeMinutes: 60,
        dependencies: ['arrays', 'functions'],
        nextTopics: ['functional-programming', 'async'],
        concepts: ['map', 'filter', 'reduce', 'callbacks']
    },
    {
        id: 'classes',
        topic: 'Classes and OOP',
        prerequisites: ['objects'],
        difficulty: 4,
        estimatedTimeMinutes: 90,
        dependencies: ['objects', 'functions'],
        nextTopics: ['inheritance', 'design-patterns'],
        concepts: ['constructor', 'methods', 'inheritance']
    },
    {
        id: 'error-handling',
        topic: 'Error Handling',
        prerequisites: ['control-flow'],
        difficulty: 3,
        estimatedTimeMinutes: 45,
        dependencies: ['control-flow'],
        nextTopics: ['async', 'testing'],
        concepts: ['try-catch', 'error-types', 'throwing']
    }
];

export const topicMetadataMap: Record<string, TopicMetadata> = {
    'variables': {
        requiredFor: ['functions', 'loops', 'objects'],
        buildingBlocks: ['declaration', 'assignment', 'types'],
        commonStruggles: ['type-confusion', 'scope-issues', 'hoisting'],
        remedialContent: ['basic-types', 'variable-scope', 'let-const-var'],
        practiceExercises: ['variable-declaration', 'type-conversion', 'scope-practice']
    },
    'control-flow': {
        requiredFor: ['loops', 'error-handling'],
        buildingBlocks: ['conditions', 'boolean-logic', 'branching'],
        commonStruggles: ['boolean-evaluation', 'complex-conditions'],
        remedialContent: ['boolean-operators', 'if-else-basics', 'switch-statements'],
        practiceExercises: ['condition-writing', 'logic-operators', 'switch-cases']
    },
    'functions': {
        requiredFor: ['objects', 'array-methods', 'scope'],
        buildingBlocks: ['parameters', 'return-values', 'function-types'],
        commonStruggles: ['parameter-passing', 'return-understanding', 'arrow-functions'],
        remedialContent: ['function-basics', 'arrow-vs-regular', 'parameter-types'],
        practiceExercises: ['basic-functions', 'arrow-functions', 'function-returns']
    },
    'loops': {
        requiredFor: ['arrays', 'iteration'],
        buildingBlocks: ['for-loop', 'while-loop', 'loop-control'],
        commonStruggles: ['infinite-loops', 'loop-conditions', 'break-continue'],
        remedialContent: ['loop-basics', 'loop-control', 'common-patterns'],
        practiceExercises: ['basic-loops', 'nested-loops', 'loop-control']
    },
    'arrays': {
        requiredFor: ['array-methods', 'data-structures'],
        buildingBlocks: ['indexing', 'array-methods', 'iteration'],
        commonStruggles: ['index-out-of-bounds', 'mutation', 'copying'],
        remedialContent: ['array-basics', 'common-methods', 'array-iteration'],
        practiceExercises: ['array-manipulation', 'array-iteration', 'method-usage']
    },
    'objects': {
        requiredFor: ['classes', 'advanced-objects'],
        buildingBlocks: ['properties', 'methods', 'this-keyword'],
        commonStruggles: ['this-binding', 'property-access', 'method-definition'],
        remedialContent: ['object-basics', 'this-keyword', 'object-methods'],
        practiceExercises: ['object-creation', 'method-writing', 'this-usage']
    },
    'scope': {
        requiredFor: ['closures', 'modules'],
        buildingBlocks: ['lexical-scope', 'closures', 'hoisting'],
        commonStruggles: ['closure-understanding', 'hoisting-issues', 'scope-chain'],
        remedialContent: ['scope-explanation', 'closure-basics', 'hoisting-guide'],
        practiceExercises: ['scope-exercises', 'closure-practice', 'hoisting-examples']
    },
    'array-methods': {
        requiredFor: ['functional-programming', 'advanced-arrays'],
        buildingBlocks: ['map', 'filter', 'reduce', 'callbacks'],
        commonStruggles: ['callback-usage', 'method-chaining', 'reduce-complexity'],
        remedialContent: ['method-overview', 'callback-functions', 'method-examples'],
        practiceExercises: ['map-filter-reduce', 'method-chaining', 'real-world-usage']
    },
    'classes': {
        requiredFor: ['inheritance', 'design-patterns'],
        buildingBlocks: ['constructor', 'methods', 'inheritance'],
        commonStruggles: ['constructor-usage', 'inheritance-concept', 'super-calls'],
        remedialContent: ['class-basics', 'inheritance-guide', 'constructor-pattern'],
        practiceExercises: ['class-creation', 'inheritance-practice', 'method-override']
    },
    'error-handling': {
        requiredFor: ['async', 'robust-applications'],
        buildingBlocks: ['try-catch', 'error-types', 'throwing'],
        commonStruggles: ['error-types', 'catch-handling', 'custom-errors'],
        remedialContent: ['error-basics', 'try-catch-pattern', 'custom-errors'],
        practiceExercises: ['error-handling', 'custom-errors', 'async-errors']
    }
}; 