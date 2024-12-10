# @ai-protected
# Daily AI Session Instructions

Please help me continue working on this project. First, check our current state and history:

1. Check current state and protected files:
```powershell
Get-Content session-state.json
```

2. Review our latest handoff:
```powershell
Get-Content "handoffs/latest.md"
```

## Protection Rules
Before modifying any files:
- Check for @ai-protected markers in file headers
- Never modify files marked as @ai-protected without permission
- Ask before modifying protected paths listed in session-state.json
- Document all changes to protected files

## Protected Paths
The following are protected:
- src/core/* - Core system files
- config/* - Configuration files
- Any file with @ai-protected header
- Any .env files
- package.json and similar config files

## File Recovery
If we need to recover deleted files:
1. Check the file's status in session-state.json
2. For git-tracked files: `git checkout HEAD -- filename`
3. Request recovery assistance if needed

## Handoff Protocol
As we work, please:
1. Document all changes in the handoff
2. Track modified files
3. Note any decisions made
4. List next steps
5. Update critical context

The handoff should track:
- Completed tasks
- Modified files
- Important decisions
- Next steps
- Setup requirements
- Special instructions

## Session Management
Our session is tracked automatically:
- Started with: `.\ai-session.ps1 -action start`
- Will end with: `.\ai-session.ps1 -action end`
- All changes and work should be documented

Can you please:
1. Confirm you've reviewed our current state
2. Note any active tasks or pending work
3. Acknowledge protection rules
4. Let me know you're ready to continue where we left off

Please respond by summarizing our current state and next steps.