At the START of EVERY new AI session, run these commands first to get up to speed:

# 1. Check current project state
Get-Content session-state.json

# 2. Read the latest handoff notes
Get-Content "handoffs/latest.md"


THEN create the new session before starting work:

# 3. Generate new session ID and update state
$sessionId = "$(Get-Date -Format 'yyyy-MM-dd')-$(Get-Random -Maximum 999)"
.\scripts\update-session-state.ps1 -sessionId $sessionId



So in practice, you would:

Start new chat with AI
Run the first two commands to let AI read the current state
Run the session creation commands
Then start your work with AI