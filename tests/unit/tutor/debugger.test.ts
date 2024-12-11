// @ai-protected
import { mockCodeWithErrors, mockSuccessfulSubmission } from '../../__mocks__/shared-mocks';
import { CodeDebugger } from '../../../src/agents/tutor/debugger/codeDebugger';

describe('CodeDebugger', () => {
    let debugger: CodeDebugger;

    beforeEach(() => {
        debugger = new CodeDebugger();
    });

    describe('analyzeCode', () => {
        it('should detect syntax errors', () => {
            const result = debugger.analyzeCode('const x = ;');
            expect(result.hasErrors).toBe(true);
            expect(result.syntaxErrors.length).toBeGreaterThan(0);
        });

        it('should detect common mistakes', () => {
            const result = debugger.analyzeCode(mockCodeWithErrors);
            expect(result.commonMistakes).toContain('Missing variable declaration');
            expect(result.commonMistakes).toContain('Infinite loop detected');
        });

        it('should identify undefined variables', () => {
            const result = debugger.analyzeCode('console.log(x);');
            expect(result.undefinedVariables).toContain('x');
        });

        it('should validate successful code', () => {
            const result = debugger.analyzeCode(mockSuccessfulSubmission);
            expect(result.hasErrors).toBe(false);
            expect(result.syntaxErrors.length).toBe(0);
        });
    });

    describe('generateDebugSteps', () => {
        it('should create step-by-step debugging instructions', () => {
            const steps = debugger.generateDebugSteps(mockCodeWithErrors);
            expect(steps.length).toBeGreaterThan(0);
            expect(steps[0]).toContain('First, let\'s check the variable declarations');
        });

        it('should provide relevant hints for each step', () => {
            const steps = debugger.generateDebugSteps(mockCodeWithErrors);
            expect(steps.some(step => step.includes('hint'))).toBe(true);
        });
    });

    describe('visualizeExecution', () => {
        it('should show variable states at each step', () => {
            const visualization = debugger.visualizeExecution('let x = 1; x += 2;');
            expect(visualization.steps[0].variables).toEqual({ x: 1 });
            expect(visualization.steps[1].variables).toEqual({ x: 3 });
        });

        it('should track loop iterations', () => {
            const visualization = debugger.visualizeExecution('for(let i=0; i<2; i++) { console.log(i); }');
            expect(visualization.steps.length).toBe(2);
            expect(visualization.loops[0].iterations).toBe(2);
        });
    });

    describe('suggestFixes', () => {
        it('should provide specific fix suggestions for common errors', () => {
            const fixes = debugger.suggestFixes(mockCodeWithErrors);
            expect(fixes.length).toBeGreaterThan(0);
            expect(fixes[0].suggestion).toContain('let i = 0');
        });

        it('should include code examples in fix suggestions', () => {
            const fixes = debugger.suggestFixes(mockCodeWithErrors);
            expect(fixes.some(fix => fix.example !== undefined)).toBe(true);
        });
    });

    describe('generateGuidedExercise', () => {
        it('should create debugging exercises based on common mistakes', () => {
            const exercise = debugger.generateGuidedExercise('loops');
            expect(exercise.code).toBeDefined();
            expect(exercise.tasks.length).toBeGreaterThan(0);
        });

        it('should include progressive hints', () => {
            const exercise = debugger.generateGuidedExercise('functions');
            expect(exercise.hints.length).toBeGreaterThan(1);
            expect(exercise.hints[0].level).toBe('subtle');
        });
    });
}); 