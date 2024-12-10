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


# @ai-protected
# Enhanced AI Development Prompting Guide

[Previous sections remain unchanged...]

## File Protection Protocol

### File Status Check Prompt
```markdown
Before modifying any file:
1. Check file header for protection status
2. Verify in .aiprotect.json
3. Determine modification permissions
4. Request authorization if needed
5. Document any approved changes

Please confirm the file's protection status before proceeding.
```

### Protection Marking Prompt
```markdown
When marking a file as complete:
1. What is the file's current status?
2. What protection level is appropriate?
3. What modifications should be allowed?
4. What documentation is needed?
5. Should it be added to .aiprotect.json?

Please provide the protection marker details for review.
```

### Protected File Modification Request
```markdown
When changes to protected files are needed:
1. Current protection status: [status]
2. Reason for modification: [explanation]
3. Proposed changes: [details]
4. Impact assessment: [analysis]
5. Rollback plan: [steps]

Please authorize these changes before proceeding.
```

### File Recovery Prompt
```markdown
When restoring deleted protected files:
1. Check .aiprotect.json for status
2. Verify last known state
3. Confirm protection markers
4. Validate dependencies
5. Update modification dates

Please confirm the restored file matches protected status.
```

## Protection System Rules

### File Markers
```javascript
/**
 * @ai-protected
 * @status [complete|in-progress]
 * @last-modified ${DATE}
 * @description ${BRIEF_DESCRIPTION}
 * @allowed-modifications ${LIST_OF_ALLOWED_CHANGES}
 */
```

### Protection Levels
1. **@ai-protected**
   - No modifications allowed
   - Requires explicit authorization
   - Changes must be documented

2. **@ai-restricted**
   - Limited modifications allowed
   - Must explain changes
   - Must maintain structure

3. **Unmarked**
   - Open for modification
   - Consider protection needs
   - Document significant changes

## Implementation Checklist

Before each development session:
```markdown
1. File Protection Status:
   - [ ] Checked .aiprotect.json
   - [ ] Verified file markers
   - [ ] Confirmed modification permissions

2. Development Context:
   - [ ] Module boundaries clear
   - [ ] Protection requirements understood
   - [ ] Documentation up to date

3. Modification Protocol:
   - [ ] Protected files identified
   - [ ] Change requirements documented
   - [ ] Authorizations received
```

## Handoff Template (Updated)

```markdown
Session Summary:
[Previous fields remain...]
Protection Status:
- Files Protected: [list]
- Pending Protections: [list]
- Authorized Changes: [list]
- Protection Updates: [list]
```

## Quick Reference Commands

### Check File Protection
```markdown
Please check the protection status of [filename] and provide:
1. Current protection level
2. Allowed modifications
3. Last modified date
4. Required authorizations
```

### Mark File Complete
```markdown
Please mark [filename] as complete with:
1. Protection level: [protected|restricted]
2. Status description
3. Modification permissions
4. Update protection registry
```

### Request Changes
```markdown
For protected file [filename], I need to:
1. Modify: [specific changes]
2. Reason: [justification]
3. Impact: [assessment]
Please review and advise.
```

## System Maintenance

Regular checks:
1. Verify .aiprotect.json accuracy
2. Update protection markers
3. Document protection changes
4. Review modification logs
5. Update protection registry

## Remember
- Protection markers are permanent unless explicitly removed
- Always check before modifying
- Document all protection changes
- Maintain protection registry
- Ask when uncertain

This guide should be used alongside the core development principles to ensure both code quality and file protection.

.\recovery.ps1 -filename "your-file.js"


# recovery.ps1
param(
    [Parameter(Mandatory=$true)]
    [string]$filename
)

# Import protection config
$protectionConfig = Get-Content -Path ".\version-protection.json" | ConvertFrom-Json
$backupLocations = $protectionConfig.recovery.backupLocations

function Recover-File {
    param(
        [string]$filename
    )

    # Check each backup location
    foreach ($location in $backupLocations) {
        $backupPath = Join-Path -Path $location -ChildPath $filename
        
        if (Test-Path $backupPath) {
            Copy-Item -Path $backupPath -Destination $filename -Force
            Write-Host "Recovered $filename from $location"
            return $true
        }
    }

    # If not found in backups, try git
    if (Test-Path ".git") {
        try {
            git checkout HEAD -- $filename
            Write-Host "Recovered $filename from git"
            return $true
        }
        catch {
            Write-Host "Git recovery failed"
        }
    }

    return $false
}

# Usage
$recovered = Recover-File -filename $filename
if (-not $recovered) {
    Write-Host "Could not recover $filename from any backup location"
}