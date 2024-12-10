# Create a script to handle duplicate files
$excludedDirs = @("node_modules", ".git", "bin", "obj")
$backupDir = "deleted_duplicates"
$logFile = "duplicate_removal_log.md"

# Create backup directory if it doesn't exist
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir
}

# Initialize log file with protection marker
@"
# @ai-protected
# Duplicate Files Removal Log
Created: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

"@ | Set-Content $logFile

# Get all files and their hashes
$files = Get-ChildItem -Recurse -File | 
    Where-Object { $_.FullName -notmatch ($excludedDirs -join '|') } |
    ForEach-Object {
        @{
            Path = $_.FullName
            Hash = (Get-FileHash $_.FullName).Hash
            Name = $_.Name
            LastWriteTime = $_.LastWriteTime
        }
    }

# Group files by hash to find duplicates
$duplicates = $files | Group-Object Hash | Where-Object { $_.Count -gt 1 }

Write-Host "`n=== Processing Duplicates ===`n" -ForegroundColor Cyan

foreach ($group in $duplicates) {
    $originalFile = $group.Group | Sort-Object LastWriteTime | Select-Object -First 1
    $duplicateFiles = $group.Group | Where-Object { $_.Path -ne $originalFile.Path }
    
    # Log the group
    @"
## Duplicate Group (Hash: $($group.Name))
- Original: $($originalFile.Path)
- Last Modified: $($originalFile.LastWriteTime)

Duplicates removed:
"@ | Add-Content $logFile

    foreach ($duplicate in $duplicateFiles) {
        $backupPath = Join-Path $backupDir ($duplicate.Path -replace ':', '' -replace '\\', '_')
        
        try {
            # Create directory structure in backup folder
            $backupFolder = Split-Path $backupPath
            if (-not (Test-Path $backupFolder)) {
                New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null
            }

            # Move file to backup
            Move-Item -Path $duplicate.Path -Destination $backupPath -Force
            Write-Host "Moved duplicate: $($duplicate.Path)" -ForegroundColor Yellow
            
            # Log the removal
            "- $($duplicate.Path)" | Add-Content $logFile
        }
        catch {
            Write-Host "Error processing: $($duplicate.Path)" -ForegroundColor Red
            "  ERROR: Failed to move $($duplicate.Path)" | Add-Content $logFile
        }
    }
    "" | Add-Content $logFile
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Backup directory: $backupDir" -ForegroundColor Green
Write-Host "Log file: $logFile" -ForegroundColor Green
Write-Host "Total duplicate groups found: $($duplicates.Count)" -ForegroundColor Yellow

# Add summary to log
@"

## Summary
- Total duplicate groups: $($duplicates.Count)
- Processed on: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
"@ | Add-Content $logFile