# @ai-protected
# File Watcher Script

$scriptPath = $PSScriptRoot
$parentPath = Split-Path $scriptPath -Parent
$trackingPath = Join-Path $scriptPath "session-tracking.json"

# Initialize or load tracking data
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
        parent_changes = @{
            added = @()
            modified = @()
            deleted = @()
        }
        child_changes = @{
            added = @()
            modified = @()
            deleted = @()
        }
    }
}

function Add-TrackingEntry {
    param (
        [string]$filePath,
        [string]$changeType,  # 'added', 'modified', or 'deleted'
        [string]$directory    # 'parent' or 'child'
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $relativePath = if ($directory -eq 'parent') {
        $filePath -replace [regex]::Escape($parentPath + "\"), ""
    } else {
        $filePath -replace [regex]::Escape($scriptPath + "\"), ""
    }
    
    # Add to specific change type array
    $changeArray = if ($directory -eq 'parent') {
        $tracking.parent_changes.$changeType
    } else {
        $tracking.child_changes.$changeType
    }
    
    $changeEntry = @{
        path = $relativePath
        timestamp = $timestamp
        directory = $directory
    }
    
    $changeArray += $changeEntry
    
    # Also add to modified_files for backward compatibility
    if ($tracking.modified_files -notcontains $filePath) {
        $tracking.modified_files += $filePath
    }
    
    # Save tracking data
    $tracking | ConvertTo-Json -Depth 10 | Set-Content $trackingPath
}

# Create watchers for both directories
$parentWatcher = New-Object System.IO.FileSystemWatcher
$parentWatcher.Path = $parentPath
$parentWatcher.IncludeSubdirectories = $true
$parentWatcher.EnableRaisingEvents = $true

$childWatcher = New-Object System.IO.FileSystemWatcher
$childWatcher.Path = $scriptPath
$childWatcher.IncludeSubdirectories = $true
$childWatcher.EnableRaisingEvents = $true

# Register event handlers for parent directory
Register-ObjectEvent $parentWatcher Created -Action {
    Add-TrackingEntry -filePath $Event.SourceEventArgs.FullPath -changeType 'added' -directory 'parent'
}

Register-ObjectEvent $parentWatcher Changed -Action {
    Add-TrackingEntry -filePath $Event.SourceEventArgs.FullPath -changeType 'modified' -directory 'parent'
}

Register-ObjectEvent $parentWatcher Deleted -Action {
    Add-TrackingEntry -filePath $Event.SourceEventArgs.FullPath -changeType 'deleted' -directory 'parent'
}

# Register event handlers for child directory
Register-ObjectEvent $childWatcher Created -Action {
    Add-TrackingEntry -filePath $Event.SourceEventArgs.FullPath -changeType 'added' -directory 'child'
}

Register-ObjectEvent $childWatcher Changed -Action {
    Add-TrackingEntry -filePath $Event.SourceEventArgs.FullPath -changeType 'modified' -directory 'child'
}

Register-ObjectEvent $childWatcher Deleted -Action {
    Add-TrackingEntry -filePath $Event.SourceEventArgs.FullPath -changeType 'deleted' -directory 'child'
}

# Keep script running
while ($true) { Start-Sleep -Seconds 1 } 