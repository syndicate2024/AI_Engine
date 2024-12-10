# @ai-protected

# @ai-protected

# AI Development Prompting Examples

## Scenario 1: Starting AI Tutor Agent Development

### Initial Role Definition
```markdown
You are an AI development assistant working on the AI Tutor Agent module. Your role is to:
1. Focus exclusively on the tutor agent's core interaction logic
2. Maintain code quality and avoid duplication with existing assessment components
3. Document all tutoring logic decisions
4. Ask clarifying questions about teaching approaches
5. Follow established LangChain.js patterns

Current context:
- Module: AI Tutor Agent
- Task: Implement basic interaction handlers
- Dependencies: LangChain.js, OpenAI API
- Progress: Initial setup phase
```

### Sample Interaction

**Human**: "Let's start implementing the AI Tutor Agent's basic interaction handler."

**Assistant**: Before we begin implementation, let's clarify a few key points:

1. Have we reviewed the existing assessment module to avoid duplicating any interaction handling?
2. What specific teaching patterns should this handler support?
3. How should we integrate with the LangChain.js chain system?
4. What's our strategy for maintaining context between interactions?
5. Should we prioritize certain types of learning interactions?

Could you provide clarity on these points to ensure we're aligned with the project's goals?

**Human**: "The tutor should focus on Socratic teaching methods and progressive disclosure."

**Assistant**: Thank you for clarifying. Let's discuss the approach before implementation:

1. **Pattern Analysis**:
   - How will Socratic questioning be structured?
   - What levels of progressive disclosure do we need?
   - How do we track question effectiveness?

2. **Integration Points**:
   - Should we integrate with the assessment module for skill level data?
   - How do we maintain the teaching context between sessions?

Would you like to discuss these points before we start coding?

## Scenario 2: Troubleshooting Integration Issues

### Problem Definition Prompt
```markdown
We're encountering an issue with the AI Tutor Agent:
1. What: LangChain.js chain execution is not maintaining context
2. Last working: Initial question/answer flow
3. Change: Added progressive disclosure logic
4. Tried: Adjusting chain memory settings
5. Relevant: LangChain.js memory documentation

Please help analyze this systematically.
```

### Sample Troubleshooting Interaction

**Human**: "The tutor agent loses context after the second interaction in a teaching sequence."

**Assistant**: Let's troubleshoot this methodically:

1. First, can you confirm if this happens:
   - With all teaching sequences?
   - Only with certain types of questions?
   - After a specific time period?

2. Let's examine the chain configuration:
   - Are we using BufferMemory or ConversationBufferMemory?
   - How are we storing the teaching context?

Could you check these points so we can narrow down the issue?

## Scenario 3: Feature Addition Consideration

### Module Focus Check
```markdown
Current focus: AI Tutor Agent - Core Teaching Logic
Proposed addition: Real-time code analysis

Before proceeding, verify:
1. Is code analysis essential for current teaching functionality?
2. Are we maintaining separation from assessment features?
3. Will this complicate the current module unnecessarily?
4. Does this belong in a separate module?
5. Is this the right time for this feature?
```

### Sample Feature Discussion

**Human**: "Should we add real-time code analysis to the tutor agent?"

**Assistant**: Before we consider this addition, let's validate the requirement:

1. Core Questions:
   - Does this enhance the current teaching capability?
   - Could this functionality belong in the assessment module?
   - How does this align with our Socratic teaching approach?

2. Dependencies:
   - What additional libraries would we need?
   - How would this impact performance?

Should we perhaps document this as a future enhancement and focus on core teaching functionality first?

## Scenario 4: Session Handoff

### End-of-Session Documentation
```markdown
Session Summary:
- Date: [Current Date]
- Module: AI Tutor Agent
- Tasks Completed:
  * Implemented basic Socratic questioning flow
  * Added progressive disclosure logic
  * Created teaching context management
- Current State:
  * Basic teaching interactions working
  * Context management needs optimization
- Next Steps:
  * Optimize chain memory configuration
  * Add error handling for context loss
  * Implement teaching pattern validation
- Pending Issues:
  * Context loss after second interaction
  * Memory optimization needed
- Required Context:
  * Using BufferMemory for chain context
  * Teaching patterns defined in /src/patterns
- Dependencies Updated:
  * Added LangChain.js memory components
  * Updated OpenAI API version
```

### Sample Handoff Interaction

**Human**: "Let's wrap up this session and prepare for the next developer."

**Assistant**: I'll prepare a comprehensive handoff. To ensure completeness:

1. Have we documented:
   - All changes to the teaching logic?
   - Current issues with context management?
   - Next steps for optimization?

2. For the next session:
   - Should we prioritize memory optimization?
   - Are there specific teaching patterns to focus on?

Would you like me to include any additional information in the handoff?

## Best Practices Highlighted in These Examples

1. **Systematic Questioning**
   - Always ask clarifying questions before implementation
   - Verify assumptions
   - Check dependencies and interactions

2. **Focus Maintenance**
   - Stay within module boundaries
   - Resist feature creep
   - Complete current tasks before moving on

3. **Documentation Clarity**
   - Detailed session summaries
   - Clear next steps
   - Comprehensive context sharing

4. **Problem-Solving Approach**
   - Systematic troubleshooting
   - Evidence-based decision making
   - Clear validation steps

Would you like to see examples for any other specific scenarios or aspects of the development process?