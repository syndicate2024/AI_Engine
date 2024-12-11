# Function to check for @ai-protected marker
function Test-ProtectedFile {
    param([string]$filePath)
    if (Test-Path $filePath) {
        $firstLine = Get-Content $filePath -First 1 -ErrorAction SilentlyContinue
        return $firstLine -match "@ai-protected"
    }
    return $false
}

# Update the critical patterns to their original state
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

# Initialize excluded directories
$excludedDirs = @()

# Function to get relative path
function Get-RelativePath {
    param($fullPath)
    return $fullPath.Replace((Get-Location).Path + "\", "")
}

# Add option to include backup directory
Write-Host "`nWould you like to scan backup directory as well? (y/n)" -ForegroundColor Yellow
$scanBackup = Read-Host
if ($scanBackup -ne "y") {
    $excludedDirs += "deleted_duplicates"
}

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
    Where-Object { 
        $_.FullName -notmatch ($excludedDirs -join "|") -and 
        -not (Test-ProtectedFile $_.FullName)  # Skip protected files
    } |
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

# Group files by hash to find duplicates
foreach ($group in $duplicates) {
    # Prefer files without copy indicators in the name
    $originalFile = $group.Group | 
        Sort-Object {
            # Lower score = more likely to be original
            $score = 0
            if ($_.Name -match "\([2-9]\)|\(copy\)") { $score += 100 }
            $score += ($_.LastWriteTime).Ticks
            $score
        } | 
        Select-Object -First 1
    $duplicateFiles = $group.Group | Where-Object { $_.Path -ne $originalFile.Path }
    
    # Log the group
    @"
## Duplicate Group (Hash: $($group.Name))
- Original: $(Get-RelativePath $originalFile.Path)
- Last Modified: $($originalFile.LastWriteTime)

Duplicates found:
"@ | Add-Content $logFile

    foreach ($duplicate in $duplicateFiles) {
        # Check for protected files
        if (Test-ProtectedFile $duplicate.Path) {
            Write-Host "⚠️ PROTECTED FILE DETECTED - SKIPPING: $(Get-RelativePath $duplicate.Path)" -ForegroundColor Red
            "- SKIPPED (PROTECTED): $(Get-RelativePath $duplicate.Path)" | Add-Content $logFile
            continue
        }

        $backupPath = Join-Path $backupDir ($duplicate.Path -replace ":", "" -replace "\\", "_")
        
        # Show file info and ask for action
        Write-Host "`nDuplicate found:" -ForegroundColor Cyan
        Write-Host "Original: $(Get-RelativePath $originalFile.Path)" -ForegroundColor Green
        Write-Host "Duplicate: $(Get-RelativePath $duplicate.Path)" -ForegroundColor Yellow
        
        if ($duplicate.IsCritical) {
            Write-Host "⚠️ WARNING: This appears to be a critical file!" -ForegroundColor Red
            Write-Host "Type 'CONFIRM' to proceed with moving this file, or anything else to skip:" -ForegroundColor Red
            $response = Read-Host
            if ($response -ne "CONFIRM") {
                Write-Host "Skipping critical file..." -ForegroundColor Yellow
                "- SKIPPED (CRITICAL): $(Get-RelativePath $duplicate.Path)" | Add-Content $logFile
                continue
            }
        }

        Write-Host "Actions available:" -ForegroundColor Cyan
        Write-Host "1) Move to backup (m)" -ForegroundColor Yellow
        Write-Host "2) Skip (s)" -ForegroundColor Yellow
        Write-Host "3) View file content (v)" -ForegroundColor Yellow
        Write-Host "4) Compare with original (c)" -ForegroundColor Yellow
        Write-Host "5) Open in default editor (o)" -ForegroundColor Yellow
        Write-Host "6) Show full path (f)" -ForegroundColor Yellow
        
        $action = Read-Host "Choose action (m/s/v/c/o/f)"
        
        switch ($action.ToLower()) {
            "v" {
                Write-Host "`nFile content:" -ForegroundColor Cyan
                Get-Content $duplicate.Path
                Write-Host "`nProceed with move? (y/n)" -ForegroundColor Yellow
                $proceed = Read-Host
                if ($proceed -ne "y") {
                    "- SKIPPED (USER CHOICE): $(Get-RelativePath $duplicate.Path)" | Add-Content $logFile
                    continue
                }
            }
            "c" {
                Write-Host "`nComparing files:" -ForegroundColor Cyan
                Compare-Object (Get-Content $originalFile.Path) (Get-Content $duplicate.Path)
                Write-Host "`nProceed with move? (y/n)" -ForegroundColor Yellow
                $proceed = Read-Host
                if ($proceed -ne "y") {
                    "- SKIPPED (USER CHOICE): $(Get-RelativePath $duplicate.Path)" | Add-Content $logFile
                    continue
                }
            }
            "o" {
                Start-Process $duplicate.Path
                Write-Host "`nProceed with move after viewing? (y/n)" -ForegroundColor Yellow
                $proceed = Read-Host
                if ($proceed -ne "y") {
                    "- SKIPPED (USER CHOICE): $(Get-RelativePath $duplicate.Path)" | Add-Content $logFile
                    continue
                }
            }
            "f" {
                Write-Host "`nFull paths:" -ForegroundColor Cyan
                Write-Host "Original: $($originalFile.Path)" -ForegroundColor Green
                Write-Host "Duplicate: $($duplicate.Path)" -ForegroundColor Yellow
                continue
            }
            "s" {
                "- SKIPPED (USER CHOICE): $(Get-RelativePath $duplicate.Path)" | Add-Content $logFile
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
            Write-Host "Moved duplicate: $(Get-RelativePath $duplicate.Path)" -ForegroundColor Green
            
            # Log the removal
            "- MOVED: $(Get-RelativePath $duplicate.Path)" | Add-Content $logFile
        }
        catch {
            Write-Host "Error processing: $(Get-RelativePath $duplicate.Path)" -ForegroundColor Red
            "  ERROR: Failed to move $(Get-RelativePath $duplicate.Path)" | Add-Content $logFile
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