// @ai-protected
import * as esprima from 'esprima';
import * as escodegen from 'escodegen';
import * as estraverse from 'estraverse';
import { Node } from 'estree';

interface AnalysisResult {
    hasErrors: boolean;
    syntaxErrors: string[];
    commonMistakes: string[];
    undefinedVariables: string[];
    scopeErrors: string[];
    typeErrors: string[];
}

interface Visualization {
    steps: {
        variables: Record<string, any>;
        line: number;
        description: string;
    }[];
    loops: {
        iterations: number;
        line: number;
    }[];
    branches: {
        condition: string;
        taken: boolean;
        line: number;
    }[];
    callStack: string[];
}

interface Fix {
    suggestion: string;
    example?: string;
    severity: 'critical' | 'warning' | 'info';
    priority: number;
    alternativeApproach?: string;
}

interface GuidedExercise {
    code: string;
    tasks: string[];
    hints: {
        level: 'subtle' | 'moderate' | 'explicit';
        content: string;
    }[];
    difficulty: number;
    learningObjectives: string[];
}

export class CodeDebugger {
    private scopeChain: Set<string>[] = [];
    private currentScope: Set<string> = new Set();

    analyzeCode(code: string): AnalysisResult {
        const result: AnalysisResult = {
            hasErrors: false,
            syntaxErrors: [],
            commonMistakes: [],
            undefinedVariables: [],
            scopeErrors: [],
            typeErrors: []
        };

        try {
            const ast = esprima.parseModule(code, { 
                loc: true, 
                range: true,
                tokens: true,
                comment: true,
                jsx: true,
                tolerant: true
            });

            // Check for syntax errors
            if (ast.errors && ast.errors.length > 0) {
                result.hasErrors = true;
                result.syntaxErrors = ast.errors.map(error => error.message);
            }

            // Analyze scope and variables
            this.scopeChain = [new Set()];
            this.currentScope = this.scopeChain[0];

            estraverse.traverse(ast, {
                enter: (node: Node) => {
                    switch (node.type) {
                        case 'VariableDeclaration':
                            this.checkVariableDeclaration(node, result);
                            break;
                        case 'Identifier':
                            this.checkIdentifierUsage(node, result);
                            break;
                        case 'WhileStatement':
                            this.checkInfiniteLoop(node, result);
                            break;
                        case 'TypeAnnotation':
                            this.checkTypeAnnotation(node, result);
                            break;
                    }
                }
            });

        } catch (error) {
            result.hasErrors = true;
            result.syntaxErrors.push(error.message);
        }

        return result;
    }

    generateDebugSteps(code: string): string[] {
        const steps: string[] = [];
        try {
            const ast = esprima.parseModule(code);
            let stepNumber = 1;

            estraverse.traverse(ast, {
                enter: (node: Node) => {
                    switch (node.type) {
                        case 'FunctionDeclaration':
                            steps.push(`${stepNumber++}. Analyzing function declaration: ${(node as any).id.name}`);
                            if ((node as any).async) {
                                steps.push(`   Hint: This is an async function, remember to handle Promises correctly`);
                            }
                            break;
                        case 'VariableDeclaration':
                            steps.push(`${stepNumber++}. Checking variable declarations`);
                            break;
                        case 'WhileStatement':
                        case 'ForStatement':
                            steps.push(`${stepNumber++}. Examining loop structure for potential issues`);
                            break;
                    }
                }
            });
        } catch (error) {
            steps.push(`Error: ${error.message}`);
        }
        return steps;
    }

    visualizeExecution(code: string): Visualization {
        const visualization: Visualization = {
            steps: [],
            loops: [],
            branches: [],
            callStack: []
        };

        try {
            const ast = esprima.parseModule(code);
            const scope: Record<string, any> = {};
            let currentLine = 1;

            estraverse.traverse(ast, {
                enter: (node: Node) => {
                    switch (node.type) {
                        case 'VariableDeclaration':
                            this.visualizeVariableDeclaration(node, scope, visualization, currentLine);
                            break;
                        case 'IfStatement':
                            this.visualizeConditionalBranch(node, visualization, currentLine);
                            break;
                        case 'FunctionDeclaration':
                            this.visualizeFunctionCall(node, visualization);
                            break;
                        case 'ForStatement':
                        case 'WhileStatement':
                            this.visualizeLoop(node, visualization, currentLine);
                            break;
                    }
                    if ((node as any).loc) {
                        currentLine = (node as any).loc.start.line;
                    }
                }
            });
        } catch (error) {
            visualization.steps.push({
                variables: {},
                line: 0,
                description: `Error: ${error.message}`
            });
        }

        return visualization;
    }

    suggestFixes(code: string): Fix[] {
        const fixes: Fix[] = [];
        try {
            const ast = esprima.parseModule(code);
            
            estraverse.traverse(ast, {
                enter: (node: Node) => {
                    switch (node.type) {
                        case 'ForStatement':
                            if (!(node as any).init || (node as any).init.type === 'Identifier') {
                                fixes.push({
                                    suggestion: 'Initialize loop variable with let/const',
                                    example: 'for(let i = 0; i < 10; i++)',
                                    severity: 'critical',
                                    priority: 1
                                });
                            }
                            break;
                        case 'WhileStatement':
                            if ((node as any).test.type === 'Literal' && (node as any).test.value === true) {
                                fixes.push({
                                    suggestion: 'Avoid infinite loops',
                                    example: 'while(condition) { ... }',
                                    severity: 'critical',
                                    priority: 1,
                                    alternativeApproach: 'Consider using a for loop with a specific condition'
                                });
                            }
                            break;
                    }
                }
            });
        } catch (error) {
            fixes.push({
                suggestion: `Fix syntax error: ${error.message}`,
                severity: 'critical',
                priority: 0
            });
        }
        return fixes;
    }

    generateGuidedExercise(topic: string): GuidedExercise {
        const exercises: Record<string, GuidedExercise> = {
            'variables': {
                code: 'let x; console.log(x);',
                tasks: ['Initialize the variable', 'Add type annotation'],
                hints: [
                    { level: 'subtle', content: 'Think about variable scope' },
                    { level: 'moderate', content: 'Variables should be initialized' }
                ],
                difficulty: 1,
                learningObjectives: ['Understanding variable declaration', 'Variable initialization']
            },
            'async': {
                code: 'async function getData() { }',
                tasks: ['Implement error handling', 'Add proper await usage'],
                hints: [
                    { level: 'subtle', content: 'Consider what might fail' },
                    { level: 'moderate', content: 'Use try/catch blocks' }
                ],
                difficulty: 4,
                learningObjectives: ['Async/await usage', 'Error handling in async code']
            },
            'loops': {
                code: 'for(let i = 0; i < 5; i++) { }',
                tasks: ['Add loop body', 'Implement break condition'],
                hints: [
                    { level: 'subtle', content: 'Think about loop termination' },
                    { level: 'moderate', content: 'Consider edge cases' }
                ],
                difficulty: 2,
                learningObjectives: ['Loop construction', 'Loop control flow']
            }
        };

        return exercises[topic] || exercises['variables'];
    }

    private checkVariableDeclaration(node: Node, result: AnalysisResult): void {
        const declarations = (node as any).declarations;
        declarations.forEach((decl: any) => {
            if (!decl.init) {
                result.commonMistakes.push('Variable declared but not initialized');
            }
            this.currentScope.add(decl.id.name);
        });
    }

    private checkIdentifierUsage(node: Node, result: AnalysisResult): void {
        const name = (node as any).name;
        if (!this.isVariableDefined(name)) {
            result.undefinedVariables.push(name);
        }
    }

    private checkInfiniteLoop(node: Node, result: AnalysisResult): void {
        if ((node as any).test.type === 'Literal' && (node as any).test.value === true) {
            result.commonMistakes.push('Infinite loop detected');
        }
    }

    private checkTypeAnnotation(node: Node, result: AnalysisResult): void {
        // Basic type checking logic
        const typeAnnotation = (node as any).typeAnnotation;
        if (typeAnnotation) {
            // Add type checking logic here
        }
    }

    private isVariableDefined(name: string): boolean {
        for (const scope of this.scopeChain) {
            if (scope.has(name)) return true;
        }
        return false;
    }

    private visualizeVariableDeclaration(node: Node, scope: Record<string, any>, visualization: Visualization, line: number): void {
        (node as any).declarations.forEach((decl: any) => {
            const varName = decl.id.name;
            const value = decl.init ? this.evaluateNode(decl.init) : undefined;
            scope[varName] = value;
            visualization.steps.push({
                variables: { ...scope },
                line,
                description: `Declared ${varName} = ${value}`
            });
        });
    }

    private visualizeConditionalBranch(node: Node, visualization: Visualization, line: number): void {
        const condition = escodegen.generate((node as any).test);
        const value = this.evaluateNode((node as any).test);
        visualization.branches.push({
            condition,
            taken: value,
            line
        });
    }

    private visualizeFunctionCall(node: Node, visualization: Visualization): void {
        const functionName = (node as any).id.name;
        visualization.callStack.push(functionName);
    }

    private visualizeLoop(node: Node, visualization: Visualization, line: number): void {
        visualization.loops.push({
            iterations: this.estimateLoopIterations(node),
            line
        });
    }

    private evaluateNode(node: Node): any {
        try {
            return eval(escodegen.generate(node));
        } catch {
            return undefined;
        }
    }

    private estimateLoopIterations(node: Node): number {
        if (node.type === 'ForStatement') {
            const test = (node as any).test;
            if (test && test.operator === '<' && test.right.type === 'Literal') {
                return test.right.value;
            }
        }
        return 0;
    }
} 