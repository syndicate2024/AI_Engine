# @ai-protected
# AI Session Management

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

    # Start file watcher in background
    $watcherPath = Join-Path $PSScriptRoot "file-watcher.ps1"
    Start-Process pwsh -ArgumentList "-NoProfile -NonInteractive -File `"$watcherPath`"" -WindowStyle Hidden

    Write-Host "`nNew session started: $sessionId" -ForegroundColor Green
    Write-Host "File watcher started in background"
    Write-Host "Remember to end this session with: .\ai-session.ps1 -action end`n"
}

# Backup function
function BackupSession {
    param(
        [string]$sessionId,
        [string]$backupPath = "D:\AI_Daily_Backup"
    )
    
    # Create backup directory if it doesn't exist
    if (-not (Test-Path $backupPath)) {
        New-Item -ItemType Directory -Force -Path $backupPath | Out-Null
    }
    
    # Create dated backup folder
    $date = Get-Date -Format "yyyy-MM-dd"
    $sessionBackupPath = Join-Path $backupPath $date
    New-Item -ItemType Directory -Force -Path $sessionBackupPath | Out-Null
    
    # Create session-specific folder
    $sessionFolder = Join-Path $sessionBackupPath $sessionId
    New-Item -ItemType Directory -Force -Path $sessionFolder | Out-Null
    
    # Backup entire workspace
    $sourcePath = $PSScriptRoot
    Copy-Item -Path "$sourcePath\*" -Destination $sessionFolder -Recurse -Force
    
    return $sessionFolder
}

# End AI session
function EndSession {
    Write-Host "`n=== Ending AI Session ===`n" -ForegroundColor Yellow
    
    # Stop file watcher
    Get-Process | Where-Object { $_.CommandLine -like "*file-watcher.ps1*" } | Stop-Process -Force
    Write-Host "File watcher stopped" -ForegroundColor Yellow
    
    $state = Get-Content $sessionStatePath | ConvertFrom-Json
    $sessionId = $state.activeSession
    
    if (-not $sessionId) {
        Write-Host "No active session found!" -ForegroundColor Red
        return
    }

    # Create backup before ending session
    Write-Host "`nCreating session backup..." -ForegroundColor Cyan
    $backupFolder = BackupSession -sessionId $sessionId
    Write-Host "Session backed up to: $backupFolder" -ForegroundColor Green

    # Get tracking data
    $trackingPath = Join-Path $PSScriptRoot "session-tracking.json"
    $tracking = if (Test-Path $trackingPath) {
        Get-Content $trackingPath | ConvertFrom-Json
    } else {
        @{
            tasks = @()
            modified_files = @()
            decisions = @()
            next_steps = @()
            setup_requirements = @()
            special_instructions = @()
        }
    }

    # Find and update the active session
    $activeSession = $state.sessionHistory | Where-Object { $_.sessionId -eq $sessionId }
    if ($activeSession) {
        $activeSession.status = "completed"
        $activeSession.endTime = (Get-Date).ToString("o")
        $state.activeSession = $null
        
        # Create new handoff with tracked changes
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
$(if ($tracking.tasks) {
    $tracking.tasks | ForEach-Object { "- $($_.description) ($(([datetime]$_.timestamp).ToString('HH:mm:ss')))" } | Out-String
} else {
    "No tasks completed in this session."
})

### Modified Files
$(if ($tracking.modified_files) {
    $tracking.modified_files | ForEach-Object { "- $_" } | Out-String
} else {
    "No files modified in this session."
})

### Important Decisions
$(if ($tracking.decisions) {
    $tracking.decisions | ForEach-Object { "- $($_.description) ($(([datetime]$_.timestamp).ToString('HH:mm:ss')))" } | Out-String
} else {
    "No major decisions recorded in this session."
})

### Critical Context
- Environment: $($state.systemState.environment)
- Framework Versions:
  * Next.js: $($state.systemState.frameworkVersions.next)
  * React: $($state.systemState.frameworkVersions.react)
  * TypeScript: $($state.systemState.frameworkVersions.typescript)
  * LangChain: $($state.systemState.frameworkVersions.langchain)
- Protected Areas: $($state.protectedFiles.paths -join ', ')

## Next Steps
$(if ($tracking.next_steps) {
    $tracking.next_steps | ForEach-Object { "1. $($_.description)" } | Out-String
} else {
    "No next steps defined for the next session."
})

## System Status
- Protected Files: $(($state.protectedFiles.paths).Count) directories
- Last Backup: $($state.protectedFiles.lastBackup)
- Active Sessions: $(($state.sessionHistory | Where-Object { $_.status -eq 'active' }).Count)

## Notes for Next Session
### Setup Requirements
$(if ($tracking.setup_requirements) {
    $tracking.setup_requirements | ForEach-Object { "- $_" } | Out-String
} else {
    "No special setup required for next session."
})

### Special Instructions
$(if ($tracking.special_instructions) {
    $tracking.special_instructions | ForEach-Object { "- $_" } | Out-String
} else {
    "No special instructions for next session."
})
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

        # Clean up tracking file
        if (Test-Path $trackingPath) {
            Remove-Item $trackingPath
        }

        Write-Host "Session $sessionId completed" -ForegroundColor Green
        Write-Host "Handoff created at: $handoffPath"
        Write-Host "`nSession tracking data has been cleared for next session.`n"
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