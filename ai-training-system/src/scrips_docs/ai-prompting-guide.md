# AI Development Prompting Guide

## Role Definition Prompts

```markdown
You are an AI development assistant working on [specific module]. Your role is to:
1. Focus exclusively on [current task/module]
2. Maintain code quality and avoid duplication
3. Document all decisions and reasoning
4. Ask clarifying questions before making assumptions
5. Follow established patterns and architecture

Current context:
- Module: [module name]
- Task: [specific task]
- Dependencies: [list dependencies]
- Progress: [current stage]
```

## Stay on Track Prompts

```markdown
Before proceeding with any development:
1. Confirm current module: "[module name]"
2. Verify task alignment: "Does this task directly relate to [current objective]?"
3. Check dependencies: "Are all required components in place?"
4. Review existing code: "Has this been implemented elsewhere?"

Please explain your reasoning for each step we're about to take.
```

## Troubleshooting Protocol

```markdown
When encountering issues:
1. What specific error or problem are we facing?
2. What was the last working state?
3. What changed between working and current state?
4. What solutions have we already tried?
5. What documentation is relevant to this issue?

Please walk through each step methodically before suggesting solutions.
```

## Documentation and Handoff

```markdown
Before ending this session, please provide:
1. Summary of changes made
2. Current state of development
3. Next steps to be taken
4. Any pending issues or considerations
5. Context needed for the next session

Format this as a structured handoff document for the next interaction.
```

## Code Quality Checks

```markdown
Before implementing any code:
1. Has this functionality already been implemented?
2. Are we following DRY principles?
3. Does this align with our modular architecture?
4. Have we considered reusability?
5. Are we maintaining consistent patterns?

Please explain how this implementation meets these criteria.
```

## Module Focus Maintenance

```markdown
Our current focus is [module name]. Before proceeding:
1. Is this task essential for current module completion?
2. Are we maintaining separation of concerns?
3. Are we adding unnecessary complexity?
4. Are we staying within module boundaries?
5. Is this the right time for this implementation?
```

## Discussion Before Implementation

```markdown
Before writing any code, let's discuss:
1. What problem are we solving?
2. What approaches have we considered?
3. What are the trade-offs of each approach?
4. How does this fit into our architecture?
5. What dependencies will this create?

Please provide your analysis of each point.
```

## Progress Validation

```markdown
At each development stage, confirm:
1. Are we meeting the module's core requirements?
2. Have we introduced any regression?
3. Are we maintaining clean architecture?
4. Is our documentation up to date?
5. Are we ready for the next step?

Please provide evidence for each confirmation.
```

## Question Prompting

```markdown
When you need clarification:
1. "Can you explain the specific requirement for [feature]?"
2. "How should this interact with [existing component]?"
3. "What are the expected edge cases?"
4. "Should we prioritize [option A] or [option B]?"
5. "Are there existing patterns we should follow?"
```

## Code Review Requests

```markdown
When reviewing code, please:
1. Check for duplication
2. Verify pattern consistency
3. Assess modularity
4. Review error handling
5. Validate documentation

Provide specific examples for any issues found.
```

## Handoff Template

```markdown
Session Summary:
- Date: [date]
- Module: [module]
- Tasks Completed: [list]
- Current State: [description]
- Next Steps: [list]
- Pending Issues: [list]
- Required Context: [details]
- Dependencies Updated: [list]
- Documentation Status: [status]
```

## Development Principles

1. **One Thing at a Time**
   - Focus on single task completion
   - Avoid scope creep
   - Document completion criteria

2. **Verification First**
   - Check existing implementations
   - Verify requirements
   - Validate approach

3. **Documentation Always**
   - Update docs with changes
   - Explain decision reasoning
   - Maintain clear handoffs

4. **Question Everything**
   - Ask before assuming
   - Verify understanding
   - Seek clarification

5. **Maintain Focus**
   - Stay within module boundaries
   - Resist feature creep
   - Complete before moving on

## Using This Guide

1. Start each session by defining role and context
2. Use relevant prompts for current task phase
3. Follow handoff template for session completion
4. Review principles before major decisions
5. Document all deviations and reasoning

Remember: The goal is consistent, maintainable, and focused development. Never proceed without clarity and purpose.
