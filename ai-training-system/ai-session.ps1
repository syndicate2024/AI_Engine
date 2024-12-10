param(
    [Parameter(Mandatory=$false)]
    [string]$action = "start",  # 'start', 'end', or 'cleanup'
    [Parameter(Mandatory=$false)]
    [int]$keepLast = 5  # Number of completed sessions to keep
)

# Define paths relative to script location
$scriptPath = $PSScriptRoot
$sessionStatePath = Join-Path $scriptPath "session-state.json"
$handoffsPath = Join-Path $scriptPath "handoffs"
$latestHandoffPath = Join-Path $handoffsPath "latest.md"

# Create directories if they don't exist
function EnsureDirectories {
    New-Item -ItemType Directory -Force -Path $handoffsPath | Out-Null
}

# Create or update session state
function EnsureSessionState {
    $needsUpdate = $false
    
    if (Test-Path $sessionStatePath) {
        $state = Get-Content $sessionStatePath | ConvertFrom-Json
        
        # Close any active sessions except current
        if ($state.activeSession) {
            foreach ($session in $state.sessionHistory) {
                if ($session.status -eq "active" -and $session.sessionId -ne $state.activeSession) {
                    $session.status = "incomplete"
                    $session.endTime = (Get-Date).ToString("o")
                    $needsUpdate = $true
                }
            }
        }
    } else {
        $state = @{
            project = @{
                name = "AI Training System"
                lastUpdate = (Get-Date).ToString("o")
                currentPhase = "development"
                activeModules = @(
                    "file-protection"
                    "version-control"
                    "session-handoff"
                )
            }
            sessionHistory = @()
            activeSession = $null
            protectedFiles = @{
                paths = @(
                    "src/core/*"
                    "config/*"
                )
                lastBackup = (Get-Date).ToString("o")
            }
            systemState = @{
                environment = "development"
                frameworkVersions = @{
                    next = "14.0.0"
                    react = "18.2.0"
                    typescript = "5.0.0"
                    langchain = "latest"
                }
                criticalPaths = @(
                    "src/agents/core"
                    "src/config"
                    "src/types"
                    "scripts"
                )
            }
        }
        $needsUpdate = $true
    }
    
    if ($needsUpdate) {
        $state | ConvertTo-Json -Depth 10 | Set-Content $sessionStatePath
    }
    
    return $state
}

# Start new AI session
function StartSession {
    Write-Host "`n=== Starting New AI Session ===`n" -ForegroundColor Green
    
    # Create new session first
    $sessionId = "$(Get-Date -Format 'yyyy-MM-dd')-$(Get-Random -Maximum 999)"
    
    # Get and update state
    $state = EnsureSessionState
    
    # Show current state before changes
    Write-Host "Current Project State:`n" -ForegroundColor Cyan
    Get-Content $sessionStatePath | Write-Host
    
    if (Test-Path $latestHandoffPath) {
        Write-Host "`nLatest Handoff:`n" -ForegroundColor Cyan
        Get-Content $latestHandoffPath | Write-Host
    }

    # Add new session
    $newSession = @{
        sessionId = $sessionId
        startTime = (Get-Date).ToString("o")
        endTime = $null
        status = "active"
    }
    
    # Update state with new session
    $state.sessionHistory += $newSession
    $state.activeSession = $sessionId
    $state.project.lastUpdate = (Get-Date).ToString("o")
    
    # Save updated state
    $state | ConvertTo-Json -Depth 10 | Set-Content $sessionStatePath

    Write-Host "`nNew session started: $sessionId" -ForegroundColor Green
    Write-Host "Remember to end this session with: .\ai-session.ps1 -action end`n"
}

# End AI session
function EndSession {
    Write-Host "`n=== Ending AI Session ===`n" -ForegroundColor Yellow
    
    $state = Get-Content $sessionStatePath | ConvertFrom-Json
    $sessionId = $state.activeSession
    
    if (-not $sessionId) {
        Write-Host "No active session found!" -ForegroundColor Red
        return
    }

    # Find and update the active session
    $activeSession = $state.sessionHistory | Where-Object { $_.sessionId -eq $sessionId }
    if ($activeSession) {
        $activeSession.status = "completed"
        $activeSession.endTime = (Get-Date).ToString("o")
        $state.activeSession = $null
        
        # Create new handoff
        $date = Get-Date
        $handoffContent = @"
# @ai-protected
# Session Handoff Report

## Session Information
- Date: $($date.ToString('yyyy-MM-dd'))
- Session ID: $sessionId
- Duration: $(New-TimeSpan -Start ([datetime]$activeSession.startTime) -End $date)

## Project Status
Current Phase: $($state.project.currentPhase)
Active Modules: $($state.project.activeModules -join ', ')

## This Session's Work
### Completed Tasks
[Add completed tasks here]

### Modified Files
[List any modified files]

### Critical Context
- Environment: $($state.systemState.environment)
- Framework Versions:
  * Next.js: $($state.systemState.frameworkVersions.next)
  * React: $($state.systemState.frameworkVersions.react)
  * TypeScript: $($state.systemState.frameworkVersions.typescript)
  * LangChain: $($state.systemState.frameworkVersions.langchain)
- Protected Areas: $($state.protectedFiles.paths -join ', ')

## Next Steps
1. [Next priority task]
   - Priority: [priority]
   - Required Context: [context]

## System Status
- Protected Files: $(($state.protectedFiles.paths).Count) directories
- Last Backup: $($state.protectedFiles.lastBackup)
- Active Sessions: $(($state.sessionHistory | Where-Object { $_.status -eq 'active' }).Count)

## Notes for Next Session
- Key Points:
  * [Important points]
- Required Setup: [setup needs]
- Special Instructions: [instructions]
"@

        # Save dated handoff
        $handoffDir = Join-Path $handoffsPath $date.ToString('yyyy-MM')
        New-Item -ItemType Directory -Force -Path $handoffDir | Out-Null
        $handoffPath = Join-Path $handoffDir "$($date.ToString('yyyy-MM-dd-HHmmss'))-handoff.md"
        $handoffContent | Set-Content $handoffPath

        # Update latest handoff
        $handoffContent | Set-Content $latestHandoffPath

        # Save updated state
        $state | ConvertTo-Json -Depth 10 | Set-Content $sessionStatePath

        Write-Host "Session $sessionId completed" -ForegroundColor Green
        Write-Host "Handoff created at: $handoffPath"
        Write-Host "`nPlease update the handoff file with session details!`n"
    } else {
        Write-Host "Could not find active session $sessionId!" -ForegroundColor Red
    }
}

# Cleanup old sessions
function CleanupOldSessions {
    param(
        [int]$keepLast = 5
    )
    
    $state = Get-Content $sessionStatePath | ConvertFrom-Json
    
    # Keep only the last N completed sessions
    $completedSessions = $state.sessionHistory | Where-Object { $_.status -eq 'completed' }
    $sessionsToKeep = $completedSessions | Sort-Object startTime -Descending | Select-Object -First $keepLast
    
    # Keep active and incomplete sessions
    $otherSessions = $state.sessionHistory | Where-Object { $_.status -ne 'completed' }
    
    # Combine sessions
    $state.sessionHistory = @($sessionsToKeep) + @($otherSessions)
    
    # Save updated state
    $state | ConvertTo-Json -Depth 10 | Set-Content $sessionStatePath
    
    Write-Host "Cleaned up session history, keeping last $keepLast completed sessions"
}

# Main execution
EnsureDirectories
$state = EnsureSessionState

switch ($action) {
    "start" { StartSession }
    "end" { EndSession }
    "cleanup" { CleanupOldSessions -keepLast $keepLast }
    default { Write-Host "Unknown action: $action. Use 'start', 'end', or 'cleanup'" }
}