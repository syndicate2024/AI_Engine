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
