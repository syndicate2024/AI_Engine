// @ai-protected
import * as esprima from 'esprima';
import * as estraverse from 'estraverse';
import * as escodegen from 'escodegen';

interface DebugAnalysis {
    hasErrors: boolean;
    syntaxErrors: string[];
    commonMistakes: string[];
    undefinedVariables: string[];
    suggestions: string[];
}

interface ExecutionStep {
    lineNumber: number;
    code: string;
    variables: Record<string, any>;
    output?: string;
    explanation: string;
}

interface LoopInfo {
    lineNumber: number;
    iterations: number;
    variables: Record<string, any>[];
}

interface ExecutionVisualization {
    steps: ExecutionStep[];
    loops: LoopInfo[];
    timeline: string[];
}

interface FixSuggestion {
    error: string;
    suggestion: string;
    example?: string;
    explanation: string;
}

interface GuidedExercise {
    code: string;
    tasks: string[];
    hints: Array<{
        level: 'subtle' | 'moderate' | 'explicit';
        content: string;
    }>;
    solution: string;
}

export class CodeDebugger {
    private variableScope: Map<string, any>;
    private executionSteps: ExecutionStep[];
    private loopInfo: LoopInfo[];

    constructor() {
        this.variableScope = new Map();
        this.executionSteps = [];
        this.loopInfo = [];
    }

    public analyzeCode(code: string): DebugAnalysis {
        const analysis: DebugAnalysis = {
            hasErrors: false,
            syntaxErrors: [],
            commonMistakes: [],
            undefinedVariables: [],
            suggestions: []
        };

        try {
            // Parse code to check syntax
            const ast = esprima.parseScript(code, { tolerant: true, loc: true });
            
            // Check for syntax errors
            if (ast.errors && ast.errors.length > 0) {
                analysis.hasErrors = true;
                analysis.syntaxErrors = ast.errors.map(error => error.message);
            }

            // Analyze AST for common mistakes and undefined variables
            this.analyzeAST(ast, analysis);

        } catch (error) {
            analysis.hasErrors = true;
            analysis.syntaxErrors.push(error.message);
        }

        // Generate suggestions based on findings
        this.generateSuggestions(analysis);

        return analysis;
    }

    private analyzeAST(ast: any, analysis: DebugAnalysis): void {
        const declaredVariables = new Set<string>();
        
        estraverse.traverse(ast, {
            enter: (node: any) => {
                switch (node.type) {
                    case 'VariableDeclarator':
                        declaredVariables.add(node.id.name);
                        break;
                    case 'Identifier':
                        if (!declaredVariables.has(node.name) && 
                            node.parent?.type !== 'VariableDeclarator') {
                            analysis.undefinedVariables.push(node.name);
                        }
                        break;
                    case 'WhileStatement':
                        if (node.test.type === 'Literal' && node.test.value === true) {
                            analysis.commonMistakes.push('Infinite loop detected');
                        }
                        break;
                    case 'ForStatement':
                        if (!node.init || node.init.type === 'AssignmentExpression') {
                            analysis.commonMistakes.push('Missing variable declaration');
                        }
                        break;
                }
            }
        });
    }

    private generateSuggestions(analysis: DebugAnalysis): void {
        if (analysis.undefinedVariables.length > 0) {
            analysis.suggestions.push(
                `Declare variables before using them: ${analysis.undefinedVariables.join(', ')}`
            );
        }

        if (analysis.commonMistakes.includes('Infinite loop detected')) {
            analysis.suggestions.push(
                'Add a condition that will eventually become false to prevent infinite loops'
            );
        }

        if (analysis.commonMistakes.includes('Missing variable declaration')) {
            analysis.suggestions.push(
                'Use let or const to declare loop variables'
            );
        }
    }

    public generateDebugSteps(code: string): string[] {
        const steps: string[] = [];
        const analysis = this.analyzeCode(code);

        // Add initial analysis step
        steps.push("First, let's check the variable declarations");
        
        if (analysis.undefinedVariables.length > 0) {
            steps.push(`Found undefined variables: ${analysis.undefinedVariables.join(', ')}`);
            steps.push('Hint: Declare these variables using let or const');
        }

        // Add loop analysis
        if (analysis.commonMistakes.includes('Infinite loop detected')) {
            steps.push('Check your loop conditions');
            steps.push('Hint: Make sure your loop has a termination condition');
        }

        // Add general code structure analysis
        steps.push('Review the overall code structure');
        analysis.suggestions.forEach(suggestion => {
            steps.push(`Suggestion: ${suggestion}`);
        });

        return steps;
    }

    public visualizeExecution(code: string): ExecutionVisualization {
        this.executionSteps = [];
        this.loopInfo = [];
        this.variableScope.clear();

        try {
            const ast = esprima.parseScript(code, { loc: true });
            this.executeASTNode(ast);

            return {
                steps: this.executionSteps,
                loops: this.loopInfo,
                timeline: this.executionSteps.map(step => step.explanation)
            };
        } catch (error) {
            return {
                steps: [{
                    lineNumber: 1,
                    code: code,
                    variables: {},
                    explanation: `Error: ${error.message}`
                }],
                loops: [],
                timeline: [`Error: ${error.message}`]
            };
        }
    }

    private executeASTNode(node: any, depth: number = 0): any {
        switch (node.type) {
            case 'Program':
                return node.body.map(stmt => this.executeASTNode(stmt, depth));
            case 'VariableDeclaration':
                return node.declarations.map(decl => {
                    const value = this.executeASTNode(decl.init, depth);
                    this.variableScope.set(decl.id.name, value);
                    this.addExecutionStep(node.loc.start.line, escodegen.generate(node), 
                        `Declared ${decl.id.name} = ${value}`);
                    return value;
                });
            case 'Literal':
                return node.value;
            case 'Identifier':
                return this.variableScope.get(node.name);
            case 'BinaryExpression':
                const left = this.executeASTNode(node.left, depth);
                const right = this.executeASTNode(node.right, depth);
                return this.evaluateBinaryExpression(left, node.operator, right);
        }
    }

    private evaluateBinaryExpression(left: any, operator: string, right: any): any {
        switch (operator) {
            case '+': return left + right;
            case '-': return left - right;
            case '*': return left * right;
            case '/': return left / right;
            default: return null;
        }
    }

    private addExecutionStep(lineNumber: number, code: string, explanation: string): void {
        this.executionSteps.push({
            lineNumber,
            code,
            variables: Object.fromEntries(this.variableScope),
            explanation
        });
    }

    public suggestFixes(code: string): FixSuggestion[] {
        const analysis = this.analyzeCode(code);
        const fixes: FixSuggestion[] = [];

        // Handle undefined variables
        analysis.undefinedVariables.forEach(variable => {
            fixes.push({
                error: `Undefined variable: ${variable}`,
                suggestion: `Declare the variable using let or const`,
                example: `let ${variable} = /* initial value */;`,
                explanation: 'Variables must be declared before they can be used'
            });
        });

        // Handle infinite loops
        if (analysis.commonMistakes.includes('Infinite loop detected')) {
            fixes.push({
                error: 'Infinite loop detected',
                suggestion: 'Add a condition that will eventually become false',
                example: 'while (count < maxIterations) { count++; }',
                explanation: 'Loops need a condition that will eventually become false to prevent infinite execution'
            });
        }

        return fixes;
    }

    public generateGuidedExercise(topic: string): GuidedExercise {
        // Generate an exercise based on common debugging scenarios
        const exercises: Record<string, GuidedExercise> = {
            'loops': {
                code: `
                    for(i=0; i<5; i++) {
                        console.log(x);
                    }
                `,
                tasks: [
                    'Find and fix the variable declaration error',
                    'Identify the undefined variable',
                    'Add proper initialization'
                ],
                hints: [
                    { level: 'subtle', content: 'Check how variables are declared' },
                    { level: 'moderate', content: 'Look for missing let/const keywords' },
                    { level: 'explicit', content: 'Add let before i=0 and declare x' }
                ],
                solution: `
                    let x = 0;
                    for(let i=0; i<5; i++) {
                        console.log(x);
                    }
                `
            },
            'functions': {
                code: `
                    function calculate(a, b) {
                        return a + b
                    }
                    console.log(calculate(1, "2"));
                `,
                tasks: [
                    'Identify the type coercion issue',
                    'Add type checking',
                    'Fix the function to handle numbers only'
                ],
                hints: [
                    { level: 'subtle', content: 'What happens when you add different types?' },
                    { level: 'moderate', content: 'Check the parameter types' },
                    { level: 'explicit', content: 'Convert strings to numbers or add type annotations' }
                ],
                solution: `
                    function calculate(a: number, b: number): number {
                        return a + b;
                    }
                    console.log(calculate(1, 2));
                `
            }
        };

        return exercises[topic] || exercises['loops'];
    }
} 