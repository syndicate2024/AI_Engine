# Create a script to handle duplicate files with interactive choices
$excludedDirs = @("node_modules", ".git", "bin", "obj")
$criticalPatterns = @(
    "test",        # Test files
    "\.spec\.",    # Spec files
    "\.test\.",    # Test files
    "config",      # Configuration files
    "types\.ts$",  # Type definitions
    "chain\.ts$",  # Chain files
    "master",      # Master files
    "workflow"     # Workflow files
)
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
Write-Host "`nScanning for duplicates..." -ForegroundColor Cyan

$files = Get-ChildItem -Recurse -File | 
    Where-Object { $_.FullName -notmatch ($excludedDirs -join "|") } |
    ForEach-Object {
        $isCritical = $criticalPatterns | Where-Object { $_.Name -match $_ }
        @{
            Path = $_.FullName
            Hash = (Get-FileHash $_.FullName).Hash
            Name = $_.Name
            LastWriteTime = $_.LastWriteTime
            IsCritical = [bool]$isCritical
        }
    }

# Group files by hash to find duplicates
$duplicates = $files | Group-Object Hash | Where-Object { $_.Count -gt 1 }

Write-Host "`n=== Found $($duplicates.Count) duplicate groups ===`n" -ForegroundColor Cyan

foreach ($group in $duplicates) {
    $originalFile = $group.Group | Sort-Object LastWriteTime | Select-Object -First 1
    $duplicateFiles = $group.Group | Where-Object { $_.Path -ne $originalFile.Path }
    
    # Log the group
    @"
## Duplicate Group (Hash: $($group.Name))
- Original: $($originalFile.Path)
- Last Modified: $($originalFile.LastWriteTime)

Duplicates found:
"@ | Add-Content $logFile

    foreach ($duplicate in $duplicateFiles) {
        $backupPath = Join-Path $backupDir ($duplicate.Path -replace ":", "" -replace "\\", "_")
        
        # Show file info and ask for action
        Write-Host "`nDuplicate found:" -ForegroundColor Cyan
        Write-Host "Original: $($originalFile.Path)" -ForegroundColor Green
        Write-Host "Duplicate: $($duplicate.Path)" -ForegroundColor Yellow
        
        if ($duplicate.IsCritical) {
            Write-Host "⚠️ WARNING: This appears to be a critical file!" -ForegroundColor Red
            Write-Host "Type 'CONFIRM' to proceed with moving this file, or anything else to skip:" -ForegroundColor Red
            $response = Read-Host
            if ($response -ne "CONFIRM") {
                Write-Host "Skipping critical file..." -ForegroundColor Yellow
                "- SKIPPED (CRITICAL): $($duplicate.Path)" | Add-Content $logFile
                continue
            }
        }

        Write-Host "Actions available:" -ForegroundColor Cyan
        Write-Host "1) Move to backup (m)" -ForegroundColor Yellow
        Write-Host "2) Skip (s)" -ForegroundColor Yellow
        Write-Host "3) View file content (v)" -ForegroundColor Yellow
        Write-Host "4) Compare with original (c)" -ForegroundColor Yellow
        Write-Host "5) Open in default editor (o)" -ForegroundColor Yellow
        
        $action = Read-Host "Choose action (m/s/v/c/o)"
        
        switch ($action.ToLower()) {
            "v" {
                Write-Host "`nFile content:" -ForegroundColor Cyan
                Get-Content $duplicate.Path
                Write-Host "`nProceed with move? (y/n)" -ForegroundColor Yellow
                $proceed = Read-Host
                if ($proceed -ne "y") {
                    "- SKIPPED (USER CHOICE): $($duplicate.Path)" | Add-Content $logFile
                    continue
                }
            }
            "c" {
                Write-Host "`nComparing files:" -ForegroundColor Cyan
                Compare-Object (Get-Content $originalFile.Path) (Get-Content $duplicate.Path)
                Write-Host "`nProceed with move? (y/n)" -ForegroundColor Yellow
                $proceed = Read-Host
                if ($proceed -ne "y") {
                    "- SKIPPED (USER CHOICE): $($duplicate.Path)" | Add-Content $logFile
                    continue
                }
            }
            "o" {
                Start-Process $duplicate.Path
                Write-Host "`nProceed with move after viewing? (y/n)" -ForegroundColor Yellow
                $proceed = Read-Host
                if ($proceed -ne "y") {
                    "- SKIPPED (USER CHOICE): $($duplicate.Path)" | Add-Content $logFile
                    continue
                }
            }
            "s" {
                "- SKIPPED (USER CHOICE): $($duplicate.Path)" | Add-Content $logFile
                continue
            }
            default {
                # Continue with move
            }
        }
        
        try {
            # Create directory structure in backup folder
            $backupFolder = Split-Path $backupPath
            if (-not (Test-Path $backupFolder)) {
                New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null
            }

            # Move file to backup
            Move-Item -Path $duplicate.Path -Destination $backupPath -Force
            Write-Host "Moved duplicate: $($duplicate.Path)" -ForegroundColor Green
            
            # Log the removal
            "- MOVED: $($duplicate.Path)" | Add-Content $logFile
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

# Show backup contents
Write-Host "`nBackup folder location:" -ForegroundColor Cyan
Write-Host $backupDir -ForegroundColor Yellow
Write-Host "`nWould you like to open the backup folder? (y/n)" -ForegroundColor Yellow
$response = Read-Host
if ($response -eq "y") {
    Invoke-Item $backupDir
}
