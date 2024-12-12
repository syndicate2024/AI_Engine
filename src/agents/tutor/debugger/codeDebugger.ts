// @ai-protected
import * as esprima from 'esprima';
import * as escodegen from 'escodegen';
import * as estraverse from 'estraverse';
import { Node, Program } from 'estree';

interface ParseResult extends Program {
    errors?: Array<{ message: string }>;
}

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
    private declaredVariables: Set<string> = new Set();

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
            // First try to parse without tolerant mode to catch syntax errors
            try {
                esprima.parseScript(code);
            } catch (error) {
                if (error instanceof SyntaxError) {
                    result.hasErrors = true;
                    result.syntaxErrors.push(error.message);
                }
            }

            // Then parse with tolerant mode to collect all errors
            const ast = esprima.parseScript(code, { tolerant: true }) as ParseResult;
            
            if (ast.errors && ast.errors.length > 0) {
                result.hasErrors = true;
                ast.errors.forEach(error => {
                    if (!result.syntaxErrors.includes(error.message)) {
                        result.syntaxErrors.push(error.message);
                    }
                });
            }

            // Analyze scope and variables
            this.scopeChain = [new Set()];
            this.currentScope = this.scopeChain[0];

            estraverse.traverse(ast, {
                enter: (node: Node) => {
                    switch (node.type) {
                        case 'BlockStatement':
                        case 'FunctionDeclaration':
                        case 'FunctionExpression':
                            this.enterScope();
                            break;
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
                },
                leave: (node: Node) => {
                    switch (node.type) {
                        case 'BlockStatement':
                        case 'FunctionDeclaration':
                        case 'FunctionExpression':
                            this.exitScope();
                            break;
                    }
                }
            });

        } catch (error) {
            result.hasErrors = true;
            if (error instanceof SyntaxError && !result.syntaxErrors.includes(error.message)) {
                result.syntaxErrors.push(error.message);
            }
        }

        return result;
    }

    private checkVariableDeclaration(node: Node, result: AnalysisResult): void {
        const declarations = (node as any).declarations;
        declarations.forEach((decl: any) => {
            if (!decl.init) {
                result.commonMistakes.push('Missing variable initialization');
            }
            if (decl.init && decl.init.type === 'Identifier' && !this.isVariableDefined(decl.init.name)) {
                result.commonMistakes.push('Missing variable declaration');
            }
            this.currentScope.add(decl.id.name);
        });
    }

    private checkIdentifierUsage(node: Node, result: AnalysisResult): void {
        const name = (node as any).name;
        if (!this.isVariableDefined(name)) {
            result.undefinedVariables.push(name);
        } else if (!this.isVariableInScope(name)) {
            result.scopeErrors.push(`Variable ${name} is not accessible in this scope`);
        }
    }

    private isVariableDefined(name: string): boolean {
        return this.scopeChain.some(scope => scope.has(name));
    }

    private isVariableInScope(name: string): boolean {
        // Check current and parent scopes
        for (let i = this.scopeChain.length - 1; i >= 0; i--) {
            if (this.scopeChain[i].has(name)) {
                return true;
            }
        }
        return false;
    }

    private enterScope(): void {
        const newScope = new Set<string>();
        this.scopeChain.push(newScope);
        this.currentScope = newScope;
    }

    private exitScope(): void {
        if (this.scopeChain.length > 1) {
            this.scopeChain.pop();
            this.currentScope = this.scopeChain[this.scopeChain.length - 1];
        }
    }

    private checkInfiniteLoop(node: Node, result: AnalysisResult): void {
        // Check for while(true) pattern
        if ((node as any).test.type === 'Literal' && (node as any).test.value === true) {
            result.commonMistakes.push('Infinite loop detected');
            return;
        }

        // Check for missing update expression in loop body
        let hasUpdateExpression = false;
        estraverse.traverse(node, {
            enter: (child: Node) => {
                if (child.type === 'UpdateExpression' || child.type === 'AssignmentExpression') {
                    hasUpdateExpression = true;
                }
            }
        });
        if (!hasUpdateExpression) {
            result.commonMistakes.push('Infinite loop detected');
        }
    }

    private checkTypeAnnotation(node: Node, result: AnalysisResult): void {
        const typeAnnotation = (node as any).typeAnnotation;
        const init = (node as any).init;

        if (typeAnnotation && init) {
            const declaredType = typeAnnotation.typeAnnotation.name || typeAnnotation.typeAnnotation.type;
            const valueType = this.getNodeType(init);

            if (!this.isTypeCompatible(declaredType.toLowerCase(), valueType)) {
                result.typeErrors.push(`Type "${valueType}" is not assignable to type "${declaredType}"`);
            }
        }
    }

    private getNodeType(node: Node): string {
        switch (node.type) {
            case 'Literal':
                return typeof (node as any).value;
            case 'StringLiteral':
                return 'string';
            case 'NumericLiteral':
                return 'number';
            case 'BooleanLiteral':
                return 'boolean';
            case 'Identifier':
                return 'any';
            case 'ArrayExpression':
                return 'array';
            case 'ObjectExpression':
                return 'object';
            case 'FunctionExpression':
            case 'ArrowFunctionExpression':
                return 'function';
            default:
                return 'unknown';
        }
    }

    private isTypeCompatible(declaredType: string, valueType: string): boolean {
        if (declaredType === valueType) return true;
        if (declaredType === 'any') return true;
        if (declaredType === 'number' && valueType === 'number') return true;
        if (declaredType === 'string' && valueType === 'string') return true;
        if (declaredType === 'boolean' && valueType === 'boolean') return true;
        if (declaredType === 'object' && (valueType === 'object' || valueType === 'array')) return true;
        if (declaredType === 'array' && valueType === 'array') return true;
        return false;
    }

    generateDebugSteps(code: string): string[] {
        const steps: string[] = [];
        try {
            const ast = esprima.parseScript(code);
            steps.push('First, let\'s check the variable declarations');
            
            estraverse.traverse(ast, {
                enter: (node: Node) => {
                    switch (node.type) {
                        case 'VariableDeclaration':
                            steps.push('Hint: Make sure all variables are properly initialized');
                            steps.push('Hint: Check if variable types match their declarations');
                            break;
                        case 'FunctionDeclaration':
                            if ((node as any).async) {
                                steps.push('Hint: This is an async function, remember to handle Promises correctly');
                                steps.push('Hint: Check for proper await usage and error handling');
                            }
                            steps.push('Examining function structure and parameters');
                            steps.push('Hint: Verify parameter types and return value');
                            break;
                        case 'WhileStatement':
                        case 'ForStatement':
                            steps.push('Checking loop termination conditions');
                            steps.push('Hint: Ensure the loop has a proper exit condition');
                            steps.push('Hint: Check for counter updates in the loop body');
                            steps.push('Hint: Verify loop bounds to prevent infinite loops');
                            break;
                        case 'IfStatement':
                            steps.push('Analyzing conditional logic');
                            steps.push('Hint: Check condition complexity and readability');
                            steps.push('Hint: Verify all branches are properly handled');
                            break;
                        case 'CallExpression':
                            if ((node as any).callee.type === 'MemberExpression') {
                                steps.push('Verifying method call and object access');
                                steps.push('Hint: Check if the object exists before method call');
                                steps.push('Hint: Verify method parameters match expected types');
                            }
                            break;
                        case 'TryStatement':
                            steps.push('Reviewing error handling');
                            steps.push('Hint: Make sure to handle all potential errors');
                            steps.push('Hint: Check if catch block handles specific error types');
                            steps.push('Hint: Verify cleanup in finally block if needed');
                            break;
                    }
                }
            });

            // Add nested function and scope chain analysis
            if (code.includes('function')) {
                steps.push('Analyzing nested function scopes');
                steps.push('Hint: Check the scope chain for variable access');
                steps.push('Hint: Verify closure variables are properly accessed');
            }

            // Add async/await analysis
            if (code.includes('async') || code.includes('await')) {
                steps.push('Checking async/await usage');
                steps.push('Hint: Ensure proper Promise handling');
                steps.push('Hint: Verify error handling for async operations');
                steps.push('Hint: Check for proper async function boundaries');
            }

            // Add type checking hints
            if (code.includes(':')) {
                steps.push('Analyzing type annotations');
                steps.push('Hint: Verify type declarations match usage');
                steps.push('Hint: Check for type compatibility in assignments');
            }

        } catch (error) {
            steps.push(`Error: ${error.message}`);
            steps.push('Hint: Check for syntax errors first');
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
            const ast = esprima.parseScript(code);
            const scope: Record<string, any> = {};
            let currentLine = 1;

            estraverse.traverse(ast, {
                enter: (node: Node) => {
                    if ((node as any).loc) {
                        currentLine = (node as any).loc.start.line;
                    }

                    switch (node.type) {
                        case 'VariableDeclaration':
                            this.visualizeVariableDeclaration(node, scope, visualization, currentLine);
                            break;
                        case 'AssignmentExpression':
                            this.visualizeAssignment(node, scope, visualization, currentLine);
                            break;
                        case 'ForStatement':
                        case 'WhileStatement':
                            this.visualizeLoop(node, visualization, currentLine);
                            break;
                        case 'IfStatement':
                            this.visualizeConditional(node, visualization, currentLine);
                            break;
                        case 'FunctionDeclaration':
                        case 'FunctionExpression':
                            this.visualizeFunctionCall(node, visualization);
                            break;
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

    private visualizeAssignment(node: Node, scope: Record<string, any>, visualization: Visualization, line: number): void {
        const left = (node as any).left;
        const right = (node as any).right;
        if (left.type === 'Identifier') {
            const varName = left.name;
            let value;
            if ((node as any).operator === '+=') {
                value = (scope[varName] || 0) + this.evaluateNode(right);
            } else if ((node as any).operator === '-=') {
                value = (scope[varName] || 0) - this.evaluateNode(right);
            } else {
                value = this.evaluateNode(right);
            }
            scope[varName] = value;
            visualization.steps.push({
                variables: { ...scope },
                line,
                description: `Updated ${varName} = ${value}`
            });
        }
    }

    private visualizeLoop(node: Node, visualization: Visualization, line: number): void {
        const iterations = this.estimateLoopIterations(node);
        visualization.loops.push({
            iterations,
            line
        });
    }

    private visualizeConditional(node: Node, visualization: Visualization, line: number): void {
        const condition = escodegen.generate((node as any).test);
        const value = this.evaluateNode((node as any).test);
        visualization.branches.push({
            condition,
            taken: value,
            line
        });
    }

    private visualizeFunctionCall(node: Node, visualization: Visualization): void {
        const functionName = (node as any).id?.name || 'anonymous';
        visualization.callStack.push(functionName);
    }

    private evaluateNode(node: Node): any {
        switch (node.type) {
            case 'Literal':
                return (node as any).value;
            case 'BinaryExpression':
                const left = this.evaluateNode((node as any).left);
                const right = this.evaluateNode((node as any).right);
                if (left !== undefined && right !== undefined) {
                    switch ((node as any).operator) {
                        case '+': return left + right;
                        case '-': return left - right;
                        case '*': return left * right;
                        case '/': return left / right;
                        case '>': return left > right;
                        case '<': return left < right;
                        case '>=': return left >= right;
                        case '<=': return left <= right;
                        case '===': return left === right;
                        case '!==': return left !== right;
                        default: return undefined;
                    }
                }
                return undefined;
            case 'UpdateExpression':
                const arg = this.evaluateNode((node as any).argument);
                if (arg !== undefined) {
                    return (node as any).operator === '++' ? arg + 1 : arg - 1;
                }
                return undefined;
            case 'AssignmentExpression':
                return this.evaluateNode((node as any).right);
            case 'Identifier':
                return undefined; // We handle identifiers in visualizeExecution
            default:
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
        return 2; // Default to 2 iterations for visualization
    }

    suggestFixes(code: string): Fix[] {
        const fixes: Fix[] = [];
        const analysis = this.analyzeCode(code);

        // Add fixes for syntax errors
        analysis.syntaxErrors.forEach(error => {
            fixes.push({
                suggestion: `Fix syntax error: ${error}`,
                severity: 'critical',
                priority: 10
            });
        });

        // Add fixes for common mistakes
        analysis.commonMistakes.forEach(mistake => {
            const fix = this.getFixForMistake(mistake);
            if (fix) {
                fixes.push(fix);
            }
        });

        // Add fixes for undefined variables
        analysis.undefinedVariables.forEach(variable => {
            fixes.push({
                suggestion: `Declare variable '${variable}' before using it`,
                example: `let ${variable};`,
                severity: 'critical',
                priority: 9,
                alternativeApproach: `Consider using const if the value won't change`
            });
        });

        // Add fixes for scope issues
        analysis.scopeErrors.forEach(error => {
            fixes.push({
                suggestion: error,
                example: 'Move variable declaration to outer scope or pass as parameter',
                severity: 'warning',
                priority: 8,
                alternativeApproach: 'Consider restructuring code to avoid scope issues'
            });
        });

        // Add fixes for type errors
        analysis.typeErrors.forEach(error => {
            fixes.push({
                suggestion: error,
                severity: 'critical',
                priority: 9,
                alternativeApproach: 'Use type assertion or fix the type mismatch'
            });
        });

        return fixes;
    }

    private getFixForMistake(mistake: string): Fix | null {
        switch (mistake) {
            case 'Infinite loop detected':
                return {
                    suggestion: 'Add a loop counter or termination condition',
                    example: 'let i = 0;\nwhile (i < maxIterations) {\n    // loop body\n    i++;\n}',
                    severity: 'critical',
                    priority: 9,
                    alternativeApproach: 'Consider using array methods like map/filter/reduce instead of a while loop'
                };
            case 'Missing variable declaration':
                return {
                    suggestion: 'Initialize variable when declaring',
                    example: 'let x = initialValue;\nconst y = computedValue();',
                    severity: 'warning',
                    priority: 7,
                    alternativeApproach: 'Consider using const with immediate initialization'
                };
            case 'Missing variable initialization':
                return {
                    suggestion: 'Provide initial value when declaring variables',
                    example: 'let counter = 0;\nlet name = "";\nlet isValid = false;',
                    severity: 'warning',
                    priority: 6,
                    alternativeApproach: 'Use meaningful default values based on variable type'
                };
            case 'Undefined variable used':
                return {
                    suggestion: 'Declare and initialize variable before use',
                    example: 'let result;\nif (condition) {\n    result = value;\n}',
                    severity: 'critical',
                    priority: 8,
                    alternativeApproach: 'Consider using optional chaining or nullish coalescing'
                };
            default:
                return null;
        }
    }

    generateGuidedExercise(topic: string): GuidedExercise {
        const difficultyMap: Record<string, number> = {
            'variables': 1,
            'loops': 2,
            'functions': 2,
            'objects': 3,
            'async': 4,
            'recursion': 4,
            'algorithms': 5
        };

        const baseDifficulty = difficultyMap[topic] || 2;
        const code = this.generateExerciseCode(topic, baseDifficulty);
        const tasks = this.generateTasks(topic, baseDifficulty);
        const hints = this.generateProgressiveHints(topic, baseDifficulty);
        const objectives = this.generateLearningObjectives(topic, baseDifficulty);

        return {
            code,
            tasks,
            hints,
            difficulty: baseDifficulty,
            learningObjectives: objectives
        };
    }

    private generateExerciseCode(topic: string, difficulty: number): string {
        switch(topic) {
            case 'variables':
                return 'let x;\nlet y = 5;\nconsole.log(x + y);';
            case 'loops':
                return difficulty > 2 ? 
                    'for(let i=0; i<n; i++) {\n    for(let j=0; j<i; j++) {\n        console.log(i*j);\n    }\n}' :
                    'for(let i=0; i<5; i++) {\n    console.log(i);\n}';
            case 'functions':
                return difficulty > 3 ?
                    'function process(arr) {\n    return arr.map(x => x*2).filter(x => x > 5);\n}' :
                    'function greet(name) {\n    return "Hello " + name;\n}';
            case 'async':
                return 'async function fetchData() {\n    const response = await fetch(url);\n    return response.json();\n}';
            default:
                return 'console.log("Hello World");';
        }
    }

    private generateTasks(topic: string, difficulty: number): string[] {
        const tasks: string[] = [];
        
        // Basic tasks for all levels
        tasks.push('Review the code structure');
        tasks.push('Identify potential issues');
        
        // Add difficulty-specific tasks
        if (difficulty >= 2) {
            tasks.push('Optimize the solution');
            tasks.push('Add error handling');
        }
        
        if (difficulty >= 3) {
            tasks.push('Consider edge cases');
            tasks.push('Improve performance');
        }
        
        if (difficulty >= 4) {
            tasks.push('Add type safety');
            tasks.push('Implement advanced features');
        }
        
        return tasks;
    }

    private generateProgressiveHints(topic: string, difficulty: number): { level: 'subtle' | 'moderate' | 'explicit'; content: string; }[] {
        const hints: { level: 'subtle' | 'moderate' | 'explicit'; content: string; }[] = [];
        
        // Add subtle hints
        hints.push({
            level: 'subtle',
            content: 'Think about the basic principles of ' + topic
        });
        
        // Add moderate hints based on difficulty
        if (difficulty >= 2) {
            hints.push({
                level: 'moderate',
                content: 'Consider how to handle invalid inputs'
            });
        }
        
        // Add explicit hints for higher difficulties
        if (difficulty >= 3) {
            hints.push({
                level: 'explicit',
                content: 'Here\'s a similar example: ' + this.getExampleForTopic(topic)
            });
        }
        
        return hints;
    }

    private generateLearningObjectives(topic: string, difficulty: number): string[] {
        const objectives: string[] = [];
        
        // Basic objectives
        objectives.push(`Understanding ${topic} fundamentals`);
        objectives.push(`Implementing basic ${topic} operations`);
        
        // Add objectives based on difficulty
        if (difficulty >= 2) {
            objectives.push(`Handling ${topic} edge cases`);
            objectives.push(`Optimizing ${topic} usage`);
        }
        
        if (difficulty >= 3) {
            objectives.push(`Advanced ${topic} patterns`);
            objectives.push(`${topic} best practices`);
        }
        
        if (difficulty >= 4) {
            objectives.push(`${topic} design patterns`);
            objectives.push(`${topic} performance optimization`);
        }
        
        return objectives;
    }

    private getExampleForTopic(topic: string): string {
        switch(topic) {
            case 'variables':
                return 'const count = items.length;';
            case 'loops':
                return 'for(const item of items) { process(item); }';
            case 'functions':
                return 'const calculate = (a, b) => a + b;';
            case 'async':
                return 'try { await processData(); } catch(e) { handleError(e); }';
            default:
                return 'console.log("Example code");';
        }
    }

    // Rest of the class implementation...
} 