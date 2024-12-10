# @ai-protected
# Quick Handoff Guide

## Starting a New Session

1. Check the state:
```powershell
Get-Content session-state.json
```

2. Review last handoff:
```powershell
Get-Content "handoffs/latest.md"
```

3. Create new session:
```powershell
$sessionId = "$(Get-Date -Format 'yyyy-MM-dd')-$(Get-Random -Maximum 999)"
.\update-session-state.ps1 -sessionId $sessionId
```

## During Session
Track in session-state.json:
- Files changed
- Decisions made
- Tasks completed
- New dependencies

## End of Session
1. Update handoff:
   - Fill handoff template
   - Document decisions
   - List next steps
   - Note critical context

2. Save state:
```powershell
Copy-Item "handoffs/latest.md" "handoffs/$sessionId.md"
```

Remember: Always check protection status before any changes!
