# @ai-protected

# Enhanced File Management and Change Tracking System

```powershell
# File: track-changes.ps1

param(
    [Parameter(Mandatory=$false)]
    [string]$action = "menu",
    [string]$errorFile = "",
    [string]$searchTerm = ""
)

# Configuration
$projectRoot = Get-Location
$historyPath = Join-Path $projectRoot ".file-history"
$excludedDirs = @('.git', 'node_modules', 'dist', 'build', '.file-history')
$snapshotInterval = 30 # minutes

# Create history directory if it doesn't exist
if (-not (Test-Path $historyPath)) {
    New-Item -ItemType Directory -Path $historyPath -Force
}

function Show-Menu {
    Clear-Host
    Write-Host "=== Enhanced File Management System ===" -ForegroundColor Cyan
    Write-Host "1. Search files and patterns"
    Write-Host "2. Track file changes"
    Write-Host "3. Investigate error"
    Write-Host "4. Create snapshot"
    Write-Host "5. Compare snapshots"
    Write-Host "6. Restore files"
    Write-Host "7. Exit"
    Write-Host "`nEnter your choice (1-7): " -NoNewline

    $choice = Read-Host
    
    switch ($choice) {
        "1" { Search-FilesAndPatterns }
        "2" { Track-Changes }
        "3" { 
            Write-Host "`nEnter error file path: " -NoNewline
            $errorFile = Read-Host
            Investigate-Error $errorFile 
        }
        "4" { Create-Snapshot }
        "5" { Compare-Snapshots }
        "6" { Restore-Files }
        "7" { return }
        default { Show-Menu }
    }
    
    Write-Host "`nPress any key to return to menu..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Show-Menu
}

function Search-FilesAndPatterns {
    Write-Host "`nEnter search pattern (filename/content): " -NoNewline
    $pattern = Read-Host

    Write-Host "`nSearching..." -ForegroundColor Yellow
    
    # Search in file names
    $fileResults = Get-ChildItem -Path $projectRoot -Recurse -File |
        Where-Object { $_.FullName -notmatch ($excludedDirs -join '|') -and $_.Name -like "*$pattern*" }
    
    # Search in file content
    $contentResults = Get-ChildItem -Path $projectRoot -Recurse -File |
        Where-Object { $_.FullName -notmatch ($excludedDirs -join '|') } |
        Select-String -Pattern $pattern -List

    Write-Host "`nFound in filenames:" -ForegroundColor Green
    $fileResults | ForEach-Object {
        Write-Host $_.FullName.Replace($projectRoot.Path + "\", "")
    }

    Write-Host "`nFound in content:" -ForegroundColor Green
    $contentResults | ForEach-Object {
        Write-Host $_.Path.Replace($projectRoot.Path + "\", "")
    }
}

function Create-Snapshot {
    $timestamp = Get-Date -Format "yyyy-MM-dd-HH-mm"
    $snapshotPath = Join-Path $historyPath $timestamp
    
    Write-Host "`nCreating snapshot..." -ForegroundColor Yellow
    
    # Create snapshot directory
    New-Item -ItemType Directory -Path $snapshotPath -Force | Out-Null
    
    # Copy all files except excluded
    Get-ChildItem -Path $projectRoot -Recurse -File |
        Where-Object { $_.FullName -notmatch ($excludedDirs -join '|') } |
        ForEach-Object {
            $relativePath = $_.FullName.Replace($projectRoot.Path + "\", "")
            $targetPath = Join-Path $snapshotPath $relativePath
            $targetDir = Split-Path $targetPath -Parent
            
            if (-not (Test-Path $targetDir)) {
                New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
            }
            
            Copy-Item $_.FullName -Destination $targetPath -Force
        }
    
    Write-Host "Snapshot created at: $timestamp" -ForegroundColor Green
}

function Compare-Snapshots {
    $snapshots = Get-ChildItem $historyPath -Directory | Sort-Object Name -Descending
    
    if ($snapshots.Count -lt 2) {
        Write-Host "Need at least 2 snapshots to compare." -ForegroundColor Red
        return
    }
    
    Write-Host "`nAvailable snapshots:"
    $snapshots | ForEach-Object { Write-Host $_.Name }
    
    Write-Host "`nEnter first snapshot date: " -NoNewline
    $snap1 = Read-Host
    Write-Host "Enter second snapshot date: " -NoNewline
    $snap2 = Read-Host
    
    $path1 = Join-Path $historyPath $snap1
    $path2 = Join-Path $historyPath $snap2
    
    if (-not (Test-Path $path1) -or -not (Test-Path $path2)) {
        Write-Host "Invalid snapshot dates." -ForegroundColor Red
        return
    }
    
    $files1 = Get-ChildItem $path1 -Recurse -File
    $files2 = Get-ChildItem $path2 -Recurse -File
    
    Write-Host "`nComparing snapshots..." -ForegroundColor Yellow
    
    # Find changed files
    $files1 | ForEach-Object {
        $relativePath = $_.FullName.Replace($path1 + "\", "")
        $otherFile = Join-Path $path2 $relativePath
        
        if (Test-Path $otherFile) {
            $hash1 = Get-FileHash $_.FullName
            $hash2 = Get-FileHash $otherFile
            
            if ($hash1.Hash -ne $hash2.Hash) {
                Write-Host "Changed: $relativePath" -ForegroundColor Yellow
            }
        } else {
            Write-Host "Removed: $relativePath" -ForegroundColor Red
        }
    }
    
    # Find new files
    $files2 | ForEach-Object {
        $relativePath = $_.FullName.Replace($path2 + "\", "")
        $otherFile = Join-Path $path1 $relativePath
        
        if (-not (Test-Path $otherFile)) {
            Write-Host "Added: $relativePath" -ForegroundColor Green
        }
    }
}

function Investigate-Error {
    param([string]$errorFile)
    
    if (-not $errorFile) {
        Write-Host "No error file specified." -ForegroundColor Red
        return
    }
    
    Write-Host "`nInvestigating changes for: $errorFile" -ForegroundColor Yellow
    
    # Get recent snapshots
    $snapshots = Get-ChildItem $historyPath -Directory | Sort-Object Name -Descending
    
    foreach ($snapshot in $snapshots) {
        $filePath = Join-Path $snapshot.FullName $errorFile
        
        if (Test-Path $filePath) {
            Write-Host "`nSnapshot: $($snapshot.Name)" -ForegroundColor Cyan
            
            # Compare with current version if exists
            if (Test-Path (Join-Path $projectRoot $errorFile)) {
                $diff = Compare-Object `
                    (Get-Content $filePath) `
                    (Get-Content (Join-Path $projectRoot $errorFile))
                
                if ($diff) {
                    Write-Host "Changes found:"
                    $diff | ForEach-Object {
                        if ($_.SideIndicator -eq "<=") {
                            Write-Host "- $($_.InputObject)" -ForegroundColor Red
                        } else {
                            Write-Host "+ $($_.InputObject)" -ForegroundColor Green
                        }
                    }
                }
            } else {
                Write-Host "File no longer exists in current version!" -ForegroundColor Red
                Write-Host "Content from snapshot:"
                Get-Content $filePath | ForEach-Object {
                    Write-Host $_ -ForegroundColor Gray
                }
            }
        }
    }
    
    # Check for related changes
    Write-Host "`nChecking for related changes..." -ForegroundColor Yellow
    $content = Get-Content (Join-Path $projectRoot $errorFile) -ErrorAction SilentlyContinue
    if ($content) {
        $imports = $content | Select-String -Pattern "import .+ from '(.+)'" -AllMatches
        
        foreach ($import in $imports.Matches) {
            $importPath = $import.Groups[1].Value
            Write-Host "`nChecking imported module: $importPath" -ForegroundColor Cyan
            
            # Look for changes in imported files
            $snapshots | ForEach-Object {
                $importFile = Join-Path $_.FullName $importPath
                if (Test-Path $importFile) {
                    $currentImport = Join-Path $projectRoot $importPath
                    if (Test-Path $currentImport) {
                        $diff = Compare-Object `
                            (Get-Content $importFile) `
                            (Get-Content $currentImport)
                        
                        if ($diff) {
                            Write-Host "Changes in $importPath (Snapshot: $($_.Name)):"
                            $diff | ForEach-Object {
                                if ($_.SideIndicator -eq "<=") {
                                    Write-Host "- $($_.InputObject)" -ForegroundColor Red
                                } else {
                                    Write-Host "+ $($_.InputObject)" -ForegroundColor Green
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

function Restore-Files {
    Write-Host "`nAvailable snapshots:"
    $snapshots = Get-ChildItem $historyPath -Directory | Sort-Object Name -Descending
    $snapshots | ForEach-Object { Write-Host $_.Name }
    
    Write-Host "`nEnter snapshot date to restore from: " -NoNewline
    $snapshot = Read-Host
    
    $snapshotPath = Join-Path $historyPath $snapshot
    
    if (-not (Test-Path $snapshotPath)) {
        Write-Host "Invalid snapshot date." -ForegroundColor Red
        return
    }
    
    Write-Host "Enter file path to restore (or 'all' for everything): " -NoNewline
    $restorePath = Read-Host
    
    if ($restorePath -eq "all") {
        Get-ChildItem $snapshotPath -Recurse -File | ForEach-Object {
            $relativePath = $_.FullName.Replace($snapshotPath + "\", "")
            $targetPath = Join-Path $projectRoot $relativePath
            $targetDir = Split-Path $targetPath -Parent
            
            if (-not (Test-Path $targetDir)) {
                New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
            }
            
            Copy-Item $_.FullName -Destination $targetPath -Force
            Write-Host "Restored: $relativePath" -ForegroundColor Green
        }
    } else {
        $sourcePath = Join-Path $snapshotPath $restorePath
        $targetPath = Join-Path $projectRoot $restorePath
        
        if (Test-Path $sourcePath) {
            $targetDir = Split-Path $targetPath -Parent
            if (-not (Test-Path $targetDir)) {
                New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
            }
            
            Copy-Item $sourcePath -Destination $targetPath -Force
            Write-Host "Restored: $restorePath" -ForegroundColor Green
        } else {
            Write-Host "File not found in snapshot." -ForegroundColor Red
        }
    }
}

# Auto-snapshot timer
$lastSnapshot = Get-Date
$timer = New-Object System.Timers.Timer
$timer.Interval = 60000 # 1 minute
$timer.Enabled = $true
Register-ObjectEvent -InputObject $timer -EventName Elapsed -Action {
    if ((Get-Date) - $lastSnapshot -gt [TimeSpan]::FromMinutes($snapshotInterval)) {
        Create-Snapshot
        $lastSnapshot = Get-Date
    }
}

# Main execution
if ($errorFile) {
    Investigate-Error $errorFile
} elseif ($searchTerm) {
    Search-FilesAndPatterns $searchTerm
} else {
    Show-Menu
}
```

Let's test this script with a sample project structure. I'll create a test environment and demonstrate its capabilities.

```powershell
# Create test environment
New-Item -ItemType Directory -Path "test-project" -Force
Set-Location test-project

# Create some sample files
$files = @{
    "src/index.js" = @"
import { helper } from './utils/helper';
import { config } from './config';

const main = () => {
    helper();
    console.log('Hello World');
};
"@

    "src/utils/helper.js" = @"
export const helper = () => {
    console.log('Helper function');
};
"@

    "src/config.js" = @"
export const config = {
    name: 'Test Project',
    version: '1.0.0'
};
"@
}

# Create files
foreach ($file in $files.Keys) {
    $dir = Split-Path $file -Parent
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force
    }
    Set-Content $file $files[$file]
}

# Copy track-changes.ps1 to test project
Copy-Item "track-changes.ps1" "test-project/"

Write-Host "Test environment created. Let's try some scenarios:"
Write-Host "1. .\track-changes.ps1                  # Open menu"
Write-Host "2. .\track-changes.ps1 -errorFile 'src/index.js'  # Investigate specific file"
Write-Host "3. .\track-changes.ps1 -searchTerm 'helper'       # Search for pattern"
```

Would you like to:
1. Test the script with this sample environment?
2. Try specific error investigation scenarios?
3. Modify any features of the script?

The script now includes:
- Automatic snapshots every 30 minutes
- Detailed change tracking
- Error investigation with import checking
- File restoration capabilities
- Pattern searching
- Snapshot comparison

Let me know how you'd like to proceed with testing!