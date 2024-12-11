# @ai-protected
# Automatic File Change Tracking

# Create FileSystemWatcher
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $PSScriptRoot
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

# Define events
$action = {
    $path = $Event.SourceEventArgs.FullPath
    $changeType = $Event.SourceEventArgs.ChangeType
    $timeStamp = (Get-Date).ToString("o")
    
    # Convert to relative path
    $relativePath = $path.Replace($PSScriptRoot, "").TrimStart("\")
    
    # Skip tracking files
    if ($relativePath -like "session-tracking.json") {
        return
    }
    
    # Track the change
    $scriptPath = Join-Path $PSScriptRoot "session-tracker.ps1"
    & $scriptPath -action track -category file -data $relativePath
    
    Write-Host "[$timeStamp] File $changeType`: $relativePath"
}

# Register event handlers
Register-ObjectEvent $watcher "Created" -Action $action
Register-ObjectEvent $watcher "Changed" -Action $action
Register-ObjectEvent $watcher "Deleted" -Action $action
Register-ObjectEvent $watcher "Renamed" -Action $action

Write-Host "File watcher started. Press Ctrl+C to stop."
try {
    while ($true) { Start-Sleep -Seconds 1 }
} finally {
    # Clean up
    $watcher.Dispose()
    Get-EventSubscriber | Unregister-Event
} 