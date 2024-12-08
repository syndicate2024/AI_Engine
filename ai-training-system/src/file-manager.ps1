
param(
    [string]$action = "menu",
    [string]$errorFile = "",
    [string]$searchTerm = ""
)

# Configuration
$projectRoot = Get-Location
$historyPath = Join-Path $projectRoot ".file-history"
$excludedDirs = @('.git', 'node_modules', 'dist', 'build', '.file-history')
$snapshotInterval = 30 # minutes

# Ensure history directory exists
if (-not (Test-Path $historyPath)) {
    New-Item -ItemType Directory -Path $historyPath -Force | Out-Null
}

# Main menu function
function Show-MainMenu {
    while ($true) {
        Clear-Host
        Write-Host "=== Unified File Management System ===" -ForegroundColor Cyan
        Write-Host "=== File Search and Duplicate Prevention ===" -ForegroundColor Yellow
        Write-Host "1. Search for duplicate files"
        Write-Host "2. Search by content"
        Write-Host "3. Find similar filenames"
        Write-Host "4. Show recent changes"
        Write-Host
        Write-Host "=== Change Tracking and Recovery ===" -ForegroundColor Yellow
        Write-Host "5. Create system snapshot"
        Write-Host "6. Compare snapshots"
        Write-Host "7. Investigate file error"
        Write-Host "8. Restore from snapshot"
        Write-Host
        Write-Host "=== Bulk Operations ===" -ForegroundColor Yellow
        Write-Host "9. Run all checks"
        Write-Host "10. Exit"
        Write-Host
        Write-Host "Enter your choice (1-10): " -NoNewline

        $choice = Read-Host

        switch ($choice) {
            "1" { Find-DuplicateFiles }
            "2" { Search-FileContent }
            "3" { Find-SimilarFiles }
            "4" { Show-RecentChanges }
            "5" { Create-Snapshot }
            "6" { Compare-Snapshots }
            "7" { Investigate-FileError }
            "8" { Restore-FromSnapshot }
            "9" { Run-AllChecks }
            "10" { return }
            default { 
                Write-Host "Invalid choice. Press any key to continue..."
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            }
        }

        if ($choice -ne "10") {
            Write-Host "`nPress any key to return to menu..."
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
    }
}

# Duplicate Prevention Functions
function Find-DuplicateFiles {
    Write-Host "`n=== Searching for Duplicate Files ===" -ForegroundColor Cyan
    Write-Host "Enter filename pattern (or press Enter for all): " -NoNewline
    $pattern = Read-Host

    $files = Get-ChildItem -Path $projectRoot -Recurse -File |
        Where-Object { $_.FullName -notmatch ($excludedDirs -join '|') }
    
    if ($pattern) {
        $files = $files | Where-Object { $_.Name -like "*$pattern*" }
    }

    $duplicates = $files | Group-Object Name | Where-Object { $_.Count -gt 1 }

    if ($duplicates) {
        Write-Host "`nFound duplicate files:" -ForegroundColor Yellow
        foreach ($group in $duplicates) {
            Write-Host "`nFilename: $($group.Name)" -ForegroundColor Cyan
            $group.Group | ForEach-Object {
                Write-Host "  Path: $($_.FullName.Replace($projectRoot.Path + '\', ''))"
                Write-Host "  Last Modified: $($_.LastWriteTime)"
                Write-Host "  Size: $([math]::Round($_.Length/1KB, 2)) KB"
            }
        }
    } else {
        Write-Host "No duplicates found." -ForegroundColor Green
    }
}

function Search-FileContent {
    Write-Host "`n=== Search File Contents ===" -ForegroundColor Cyan
    Write-Host "Enter search term: " -NoNewline
    $term = Read-Host

    Write-Host "`nSearching..." -ForegroundColor Yellow

    $results = Get-ChildItem -Path $projectRoot -Recurse -File |
        Where-Object { $_.FullName -notmatch ($excludedDirs -join '|') } |
        Select-String -Pattern $term -List

    if ($results) {
        Write-Host "`nFound matches in:" -ForegroundColor Green
        foreach ($result in $results) {
            Write-Host "`nFile: $($result.Path.Replace($projectRoot.Path + '\', ''))" -ForegroundColor Cyan
            $lineMatches = Select-String -Path $result.Path -Pattern $term
            $lineMatches | ForEach-Object {
                Write-Host "  Line $($_.LineNumber): $($_.Line.Trim())"
            }
        }
    } else {
        Write-Host "No matches found." -ForegroundColor Yellow
    }
}

function Find-SimilarFiles {
    Write-Host "`n=== Find Similar Filenames ===" -ForegroundColor Cyan
    Write-Host "Enter base filename: " -NoNewline
    $baseName = Read-Host

    $similarFiles = Get-ChildItem -Path $projectRoot -Recurse -File |
        Where-Object { 
            $_.FullName -notmatch ($excludedDirs -join '|') -and
            $_.Name -like "*$baseName*"
        }

    if ($similarFiles) {
        Write-Host "`nFound similar files:" -ForegroundColor Green
        $similarFiles | ForEach-Object {
            Write-Host "`nFile: $($_.Name)" -ForegroundColor Cyan
            Write-Host "  Path: $($_.FullName.Replace($projectRoot.Path + '\', ''))"
            Write-Host "  Last Modified: $($_.LastWriteTime)"
            Write-Host "  Size: $([math]::Round($_.Length/1KB, 2)) KB"
        }
    } else {
        Write-Host "No similar files found." -ForegroundColor Yellow
    }
}

function Show-RecentChanges {
    Write-Host "`n=== Recent File Changes ===" -ForegroundColor Cyan
    Write-Host "Enter number of days to look back (default 7): " -NoNewline
    $days = Read-Host
    if (-not $days) { $days = 7 }

    $recentFiles = Get-ChildItem -Path $projectRoot -Recurse -File |
        Where-Object { 
            $_.FullName -notmatch ($excludedDirs -join '|') -and
            $_.LastWriteTime -gt (Get-Date).AddDays(-[int]$days)
        } |
        Sort-Object LastWriteTime -Descending

    if ($recentFiles) {
        Write-Host "`nFiles changed in last $days days:" -ForegroundColor Green
        $recentFiles | ForEach-Object {
            Write-Host "`nFile: $($_.Name)" -ForegroundColor Cyan
            Write-Host "  Path: $($_.FullName.Replace($projectRoot.Path + '\', ''))"
            Write-Host "  Modified: $($_.LastWriteTime)"
            Write-Host "  Size: $([math]::Round($_.Length/1KB, 2)) KB"
        }
    } else {
        Write-Host "No recent changes found." -ForegroundColor Yellow
    }
}

# Previous Change Tracking Functions (from track-changes.ps1)
function Create-Snapshot {
    $timestamp = Get-Date -Format "yyyy-MM-dd-HH-mm"
    $snapshotPath = Join-Path $historyPath $timestamp
    
    Write-Host "`nCreating snapshot..." -ForegroundColor Yellow
    Write-Host "Snapshot path: $snapshotPath" -ForegroundColor Cyan
    
    # Create snapshot directory
    try {
        New-Item -ItemType Directory -Path $snapshotPath -Force | Out-Null
        Write-Host "Created snapshot directory" -ForegroundColor Green
        
        # Get all files to copy
        $files = Get-ChildItem -Path $projectRoot -Recurse -File |
            Where-Object { $_.FullName -notmatch ($excludedDirs -join '|') }
        
        Write-Host "Found $($files.Count) files to snapshot" -ForegroundColor Yellow
        
        # Copy files
        foreach ($file in $files) {
            $relativePath = $file.FullName.Replace($projectRoot.Path + "\", "")
            $targetPath = Join-Path $snapshotPath $relativePath
            $targetDir = Split-Path $targetPath -Parent
            
            Write-Host "Processing: $relativePath" -ForegroundColor Gray
            
            if (-not (Test-Path $targetDir)) {
                New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
            }
            
            Copy-Item $file.FullName -Destination $targetPath -Force
        }
        
        Write-Host "Snapshot created successfully at: $timestamp" -ForegroundColor Green
    }
    catch {
        Write-Host "Error creating snapshot: $_" -ForegroundColor Red
    }
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
    
    Write-Host "`nComparing snapshots..." -ForegroundColor Yellow
    
    # Find changed files
    $files1 = Get-ChildItem $path1 -Recurse -File
    $files2 = Get-ChildItem $path2 -Recurse -File
    
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
function Investigate-FileError {
    Write-Host "`n=== Investigate File Error ===" -ForegroundColor Cyan
    Write-Host "Enter error file path: " -NoNewline
    $errorFile = Read-Host

    if (-not $errorFile) {
        Write-Host "No file specified." -ForegroundColor Red
        return
    }

    # [Previous implementation]
}

function Restore-FromSnapshot {
    # [Previous implementation]
}

function Run-AllChecks {
    Write-Host "`n=== Running All System Checks ===" -ForegroundColor Cyan
    
    Write-Host "`n1. Checking for duplicates..." -ForegroundColor Yellow
    Find-DuplicateFiles
    
    Write-Host "`n2. Creating system snapshot..." -ForegroundColor Yellow
    Create-Snapshot
    
    Write-Host "`n3. Checking recent changes..." -ForegroundColor Yellow
    Show-RecentChanges
    
    Write-Host "`n4. Analyzing file patterns..." -ForegroundColor Yellow
    Get-ChildItem -Path $projectRoot -Recurse -File |
        Where-Object { $_.FullName -notmatch ($excludedDirs -join '|') } |
        Group-Object Extension |
        Sort-Object Count -Descending |
        Select-Object Name, Count |
        Format-Table -AutoSize
    
    Write-Host "`nAll checks completed!" -ForegroundColor Green
}

# Start auto-snapshot timer
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
    Investigate-FileError
} elseif ($searchTerm) {
    Search-FileContent
} else {
    Show-MainMenu
}