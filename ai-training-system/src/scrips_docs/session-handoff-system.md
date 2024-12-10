# @ai-protected
# AI Session Handoff System

## session-state.json
```json
{
  "project": {
    "name": "your-project-name",
    "lastUpdate": "2024-12-09T12:00:00Z",
    "currentPhase": "development",
    "activeModules": [
      "auth",
      "user-management"
    ]
  },
  "sessionHistory": [
    {
      "sessionId": "2024-12-09-1",
      "timestamp": "2024-12-09T12:00:00Z",
      "mainTasks": [
        "Implemented file protection system",
        "Created recovery scripts"
      ],
      "completedFiles": [
        "src/utils/protection.ts",
        "scripts/recovery.ps1"
      ],
      "modifiedFiles": [
        {
          "path": "src/config/auth.ts",
          "changes": "Updated OAuth configuration",
          "status": "in-progress"
        }
      ],
      "pendingTasks": [
        "Complete user authentication flow",
        "Add error handling to recovery scripts"
      ],
      "decisions": [
        {
          "topic": "Authentication Strategy",
          "decision": "Using NextAuth with custom providers",
          "rationale": "Better integration with existing system"
        }
      ],
      "context": {
        "criticalInfo": "Using PowerShell for system scripts",
        "preferences": "Tailwind for styling, TypeScript for type safety",
        "constraints": "Must work in Windows environment"
      }
    }
  ],
  "protectedFiles": {
    "paths": [
      "src/core/*",
      "config/*"
    ],
    "lastBackup": "2024-12-09T12:00:00Z"
  },
  "systemState": {
    "environment": "development",
    "frameworkVersions": {
      "next": "14.0.0",
      "react": "18.2.0",
      "typescript": "5.0.0"
    },
    "criticalPaths": [
      "src/core",
      "config"
    ]
  }
}
```

## handoff-template.md
```markdown
# @ai-protected
# Session Handoff Report

## Session Information
- Date: ${CURRENT_DATE}
- Session ID: ${SESSION_ID}
- Duration: ${DURATION}
- Primary Focus: ${FOCUS_AREA}

## Project Status
Current Phase: ${PHASE}
Active Modules: ${ACTIVE_MODULES}

## This Session's Work

### Completed Tasks
1. [Task Name]
   - Files Changed: [file paths]
   - Description: [details]
   - Protection Status: [protected/unprotected]

### Modified Files
1. [File Path]
   - Current Status: [complete/in-progress]
   - Changes Made: [description]
   - Protection Level: [protected/restricted/open]
   - Next Steps: [if any]

### Generated Code
1. [Component/Script Name]
   - Purpose: [description]
   - Location: [file path]
   - Dependencies: [list]
   - Status: [complete/needs review]

### Decisions Made
1. [Decision Topic]
   - Context: [background]
   - Decision: [what was decided]
   - Rationale: [why]
   - Impact: [affected areas]

### Critical Context
- Environment: [development/staging/production]
- Key Dependencies: [list]
- Protected Areas: [paths]
- Special Considerations: [notes]

## Pending Items

### Immediate Next Steps
1. [Task]
   - Priority: [high/medium/low]
   - Blocked By: [if any]
   - Required Context: [details]

### Known Issues
1. [Issue]
   - Severity: [critical/moderate/low]
   - Status: [active/investigating]
   - Workaround: [if any]

### Questions for Next Session
1. [Question]
   - Context: [background]
   - Impact: [why it matters]
   - Related Files: [paths]

## System Status

### Protection System
- Protected Files: [count]
- Last Backup: [timestamp]
- Recovery Status: [ready/needs attention]

### Critical Paths
- Core Modules: [paths]
- Config Files: [paths]
- Protected Routes: [paths]

### Environment Details
- Node Version: [version]
- Framework Versions: [list]
- Critical Dependencies: [list]

## Notes for Next Session
- Key Points: [list]
- Required Setup: [steps]
- Special Instructions: [details]
```

## PowerShell Update Script (update-session-state.ps1)
```powershell
# update-session-state.ps1
param(
    [Parameter(Mandatory=$true)]
    [string]$sessionId
)

# Load current state
$stateFile = "session-state.json"
$state = Get-Content -Path $stateFile | ConvertFrom-Json

# Create new session entry
$newSession = @{
    sessionId = $sessionId
    timestamp = (Get-Date).ToString("o")
    mainTasks = @()
    completedFiles = @()
    modifiedFiles = @()
    pendingTasks = @()
    decisions = @()
    context = @{
        criticalInfo = ""
        preferences = ""
        constraints = ""
    }
}

# Add to history
$state.sessionHistory += $newSession

# Update last modified
$state.project.lastUpdate = (Get-Date).ToString("o")

# Save updated state
$state | ConvertTo-Json -Depth 10 | Set-Content $stateFile

Write-Host "Session state updated for session $sessionId"
```

## Implementation Instructions for AI

1. At the start of each session:
   - Load session-state.json
   - Review last session's handoff
   - Create new session entry

2. During the session:
   - Update state as changes are made
   - Track all modifications
   - Document decisions
   - Maintain protection status

3. Before ending the session:
   - Complete handoff report
   - Update session state
   - Backup critical files
   - Document next steps

4. When generating new code:
   - Add to session state
   - Document dependencies
   - Set protection level
   - Update handoff

5. For system changes:
   - Update version information
   - Document environment changes
   - Verify protection status
   - Update critical paths

## AI Handoff Protocol

1. Starting a Session:
```powershell
# Generate new session ID
$sessionId = "$(Get-Date -Format 'yyyy-MM-dd')-$(Get-Random -Maximum 999)"

# Update session state
.\update-session-state.ps1 -sessionId $sessionId
```

2. During Session:
- Monitor file changes
- Update session-state.json
- Track decisions
- Document context

3. Ending Session:
- Complete handoff report
- Update state
- Verify protection
- List next steps

4. Next Session:
- Load state
- Review handoff
- Verify context
- Continue work

Remember: Always maintain strict version control and protection status!
