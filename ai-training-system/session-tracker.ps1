# @ai-protected
# Session Tracking System

param(
    [Parameter(Mandatory=$true)]
    [string]$action,  # 'track', 'update', 'get'
    
    [Parameter(Mandatory=$false)]
    [string]$category = "",  # 'task', 'file', 'decision', 'next_step'
    
    [Parameter(Mandatory=$false)]
    [string]$data = ""
)

# Define paths
$scriptPath = $PSScriptRoot
$trackingPath = Join-Path $scriptPath "session-tracking.json"
$sessionStatePath = Join-Path $scriptPath "session-state.json"

# Initialize or get tracking data
function GetTrackingData {
    if (Test-Path $trackingPath) {
        return Get-Content $trackingPath | ConvertFrom-Json
    }
    
    return @{
        tasks = @()
        modified_files = @()
        decisions = @()
        next_steps = @()
        setup_requirements = @()
        special_instructions = @()
        timestamp = (Get-Date).ToString("o")
    }
}

# Track a new item
function TrackItem {
    param($category, $data)
    
    $tracking = GetTrackingData
    
    switch ($category) {
        "task" { 
            $tracking.tasks += @{
                description = $data
                timestamp = (Get-Date).ToString("o")
            }
        }
        "file" { 
            if ($tracking.modified_files -notcontains $data) {
                $tracking.modified_files += $data
            }
        }
        "decision" { 
            $tracking.decisions += @{
                description = $data
                timestamp = (Get-Date).ToString("o")
            }
        }
        "next_step" { 
            $tracking.next_steps += @{
                description = $data
                timestamp = (Get-Date).ToString("o")
            }
        }
        "setup" { 
            $tracking.setup_requirements += $data
        }
        "instruction" { 
            $tracking.special_instructions += $data
        }
    }
    
    # Save updated tracking data
    $tracking | ConvertTo-Json -Depth 10 | Set-Content $trackingPath
}

# Get current tracking data
function GetCurrentTracking {
    if (Test-Path $trackingPath) {
        Get-Content $trackingPath | Write-Host
    } else {
        Write-Host "No tracking data found for current session."
    }
}

# Update tracking data
function UpdateTracking {
    param($data)
    
    if ($data) {
        $tracking = $data | ConvertFrom-Json
        $tracking | ConvertTo-Json -Depth 10 | Set-Content $trackingPath
        Write-Host "Tracking data updated successfully."
    } else {
        Write-Host "No data provided for update."
    }
}

# Main execution
switch ($action) {
    "track" { 
        if ($category -and $data) {
            TrackItem -category $category -data $data
            Write-Host "Tracked new $category item."
        } else {
            Write-Host "Both category and data are required for tracking."
        }
    }
    "update" { UpdateTracking -data $data }
    "get" { GetCurrentTracking }
    default { Write-Host "Unknown action: $action. Use 'track', 'update', or 'get'" }
} 