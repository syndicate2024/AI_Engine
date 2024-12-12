// @ai-protected
import { mockCodeWithErrors, mockSuccessfulSubmission } from '../../__mocks__/shared-mocks';
import { CodeDebugger } from '../../../src/agents/tutor/debugger/codeDebugger';

describe('CodeDebugger', () => {
    let codeDebugger: CodeDebugger;

    beforeEach(() => {
        codeDebugger = new CodeDebugger();
    });

    describe('analyzeCode', () => {
        it('should detect syntax errors', () => {
            const result = codeDebugger.analyzeCode('const x = ;');
            expect(result.hasErrors).toBe(true);
            expect(result.syntaxErrors.length).toBeGreaterThan(0);
        });

        it('should detect multiple syntax errors', () => {
            const result = codeDebugger.analyzeCode('const x = ; let y = }');
            expect(result.syntaxErrors.length).toBe(2);
        });

        it('should detect common mistakes', () => {
            const result = codeDebugger.analyzeCode(mockCodeWithErrors);
            expect(result.commonMistakes).toContain('Missing variable declaration');
            expect(result.commonMistakes).toContain('Infinite loop detected');
        });

        it('should identify undefined variables', () => {
            const result = codeDebugger.analyzeCode('console.log(x);');
            expect(result.undefinedVariables).toContain('x');
        });

        it('should detect scope-related issues', () => {
            const code = `
                if (true) {
                    let x = 5;
                }
                console.log(x);
            `;
            const result = codeDebugger.analyzeCode(code);
            expect(result.scopeErrors).toContain('Variable x is not accessible in this scope');
        });

        it('should validate successful code', () => {
            const result = codeDebugger.analyzeCode(mockSuccessfulSubmission);
            expect(result.hasErrors).toBe(false);
            expect(result.syntaxErrors.length).toBe(0);
        });

        it('should detect type-related errors', () => {
            const code = 'const x: number = "string";';
            const result = codeDebugger.analyzeCode(code);
            expect(result.typeErrors).toContain('Type "string" is not assignable to type "number"');
        });
    });

    describe('generateDebugSteps', () => {
        it('should create step-by-step debugging instructions', () => {
            const steps = codeDebugger.generateDebugSteps(mockCodeWithErrors);
            expect(steps.length).toBeGreaterThan(0);
            expect(steps[0]).toContain('First, let\'s check the variable declarations');
        });

        it('should provide relevant hints for each step', () => {
            const steps = codeDebugger.generateDebugSteps(mockCodeWithErrors);
            expect(steps.some(step => step.includes('hint'))).toBe(true);
        });

        it('should handle nested structures', () => {
            const nestedCode = `
                function outer() {
                    function inner() {
                        return x;
                    }
                    return inner();
                }
            `;
            const steps = codeDebugger.generateDebugSteps(nestedCode);
            expect(steps.some(step => step.includes('nested function'))).toBe(true);
            expect(steps.some(step => step.includes('scope chain'))).toBe(true);
        });

        it('should provide context-aware debugging steps', () => {
            const asyncCode = `
                async function fetchData() {
                    const response = await fetch('api');
                    return response.json;
                }
            `;
            const steps = codeDebugger.generateDebugSteps(asyncCode);
            expect(steps.some(step => step.includes('async/await'))).toBe(true);
            expect(steps.some(step => step.includes('Promise'))).toBe(true);
        });
    });

    describe('visualizeExecution', () => {
        it('should show variable states at each step', () => {
            const visualization = codeDebugger.visualizeExecution('let x = 1; x += 2;');
            expect(visualization.steps[0].variables).toEqual({ x: 1 });
            expect(visualization.steps[1].variables).toEqual({ x: 3 });
        });

        it('should track loop iterations', () => {
            const visualization = codeDebugger.visualizeExecution('for(let i=0; i<2; i++) { console.log(i); }');
            expect(visualization.steps.length).toBe(2);
            expect(visualization.loops[0].iterations).toBe(2);
        });

        it('should visualize conditional branches', () => {
            const code = `
                let x = 5;
                if (x > 3) {
                    x += 1;
                } else {
                    x -= 1;
                }
            `;
            const visualization = codeDebugger.visualizeExecution(code);
            expect(visualization.branches).toBeDefined();
            expect(visualization.branches[0].condition).toBe('x > 3');
            expect(visualization.branches[0].taken).toBe(true);
        });

        it('should track function call stack', () => {
            const code = `
                function a() { return b(); }
                function b() { return 5; }
                a();
            `;
            const visualization = codeDebugger.visualizeExecution(code);
            expect(visualization.callStack).toBeDefined();
            expect(visualization.callStack[0]).toBe('a');
            expect(visualization.callStack[1]).toBe('b');
        });
    });

    describe('suggestFixes', () => {
        it('should provide specific fix suggestions for common errors', () => {
            const fixes = codeDebugger.suggestFixes(mockCodeWithErrors);
            expect(fixes.length).toBeGreaterThan(0);
            expect(fixes[0].suggestion).toContain('let i = 0');
        });

        it('should include code examples in fix suggestions', () => {
            const fixes = codeDebugger.suggestFixes(mockCodeWithErrors);
            expect(fixes.some(fix => fix.example !== undefined)).toBe(true);
        });

        it('should prioritize fixes by severity', () => {
            const code = `
                for(i=0; i<10; i++) {
                    console.log(x);
                    while(true) {}
                }
            `;
            const fixes = codeDebugger.suggestFixes(code);
            expect(fixes[0].severity).toBe('critical');
            expect(fixes[0].priority).toBeGreaterThan(fixes[1].priority);
        });

        it('should suggest alternative approaches', () => {
            const code = 'while(true) { if(x > 10) break; }';
            const fixes = codeDebugger.suggestFixes(code);
            expect(fixes.some(fix => fix.alternativeApproach)).toBe(true);
        });
    });

    describe('generateGuidedExercise', () => {
        it('should create debugging exercises based on common mistakes', () => {
            const exercise = codeDebugger.generateGuidedExercise('loops');
            expect(exercise.code).toBeDefined();
            expect(exercise.tasks.length).toBeGreaterThan(0);
        });

        it('should include progressive hints', () => {
            const exercise = codeDebugger.generateGuidedExercise('functions');
            expect(exercise.hints.length).toBeGreaterThan(1);
            expect(exercise.hints[0].level).toBe('subtle');
        });

        it('should adapt difficulty based on topic', () => {
            const basicExercise = codeDebugger.generateGuidedExercise('variables');
            const advancedExercise = codeDebugger.generateGuidedExercise('async');
            expect(advancedExercise.difficulty).toBeGreaterThan(basicExercise.difficulty);
        });

        it('should provide learning objectives', () => {
            const exercise = codeDebugger.generateGuidedExercise('loops');
            expect(exercise.learningObjectives).toBeDefined();
            expect(exercise.learningObjectives.length).toBeGreaterThan(0);
        });
    });
}); 