# File Search and Duplicate Prevention System

```powershell
# File: find-file.ps1

param(
    [Parameter(Mandatory=$false)]
    [string]$searchTerm = "",
    [string]$action = "menu"  # menu or search
)

# Configuration
$excludedDirs = @('.git', 'node_modules', 'dist', 'build')
$projectRoot = Get-Location

function Show-Menu {
    Clear-Host
    Write-Host "=== File Search and Duplicate Prevention System ===" -ForegroundColor Cyan
    Write-Host "1. Search by filename"
    Write-Host "2. Search by content"
    Write-Host "3. Search similar filenames"
    Write-Host "4. Show recent files"
    Write-Host "5. Exit"
    Write-Host "`nEnter your choice (1-5): " -NoNewline

    $choice = Read-Host
    
    switch ($choice) {
        "1" { 
            Write-Host "`nEnter filename to search (partial names OK): " -NoNewline
            $searchTerm = Read-Host
            Find-Files -searchTerm $searchTerm -searchType "filename"
        }
        "2" { 
            Write-Host "`nEnter content to search for: " -NoNewline
            $searchTerm = Read-Host
            Find-Files -searchTerm $searchTerm -searchType "content"
        }
        "3" { 
            Write-Host "`nEnter base filename to find similar: " -NoNewline
            $searchTerm = Read-Host
            Find-SimilarFiles -searchTerm $searchTerm
        }
        "4" { Show-RecentFiles }
        "5" { return }
        default { 
            Write-Host "Invalid choice. Press any key to continue..."
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            Show-Menu
        }
    }
    
    Write-Host "`nPress any key to return to menu..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Show-Menu
}

function Find-Files {
    param(
        [string]$searchTerm,
        [string]$searchType
    )
    
    Write-Host "`nSearching for '$searchTerm'..." -ForegroundColor Yellow
    
    $results = @()
    
    if ($searchType -eq "filename") {
        $results = Get-ChildItem -Path $projectRoot -Recurse -File |
            Where-Object { 
                $_.FullName -notmatch ($excludedDirs -join '|') -and 
                $_.Name -like "*$searchTerm*"
            }
    }
    else {
        $results = Get-ChildItem -Path $projectRoot -Recurse -File |
            Where-Object { $_.FullName -notmatch ($excludedDirs -join '|') } |
            Select-String -Pattern $searchTerm -List |
            Select-Object Path -Unique
    }
    
    if ($results.Count -eq 0) {
        Write-Host "No files found." -ForegroundColor Red
        return
    }
    
    Write-Host "`nFound $($results.Count) file(s):" -ForegroundColor Green
    
    $results | ForEach-Object {
        $file = $searchType -eq "filename" ? $_ : Get-Item $_.Path
        $relativePath = $file.FullName.Replace($projectRoot.Path + "\", "")
        $fileInfo = [PSCustomObject]@{
            Name = $file.Name
            Path = $relativePath
            LastModified = $file.LastWriteTime
            SizeKB = [math]::Round($file.Length/1KB, 2)
        }
        
        Write-Host "`nFile: " -NoNewline
        Write-Host $fileInfo.Name -ForegroundColor Cyan
        Write-Host "Path: $($fileInfo.Path)"
        Write-Host "Last Modified: $($fileInfo.LastModified)"
        Write-Host "Size: $($fileInfo.SizeKB) KB"
        
        if ($searchType -eq "content") {
            Write-Host "Content matches:"
            $matches = Select-String -Path $file.FullName -Pattern $searchTerm
            $matches | ForEach-Object {
                Write-Host "  Line $($_.LineNumber): $($_.Line.Trim())" -ForegroundColor Gray
            }
        }
    }
}

function Find-SimilarFiles {
    param([string]$searchTerm)
    
    Write-Host "`nSearching for files similar to '$searchTerm'..." -ForegroundColor Yellow
    
    # Remove extension for comparison
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($searchTerm)
    
    $results = Get-ChildItem -Path $projectRoot -Recurse -File |
        Where-Object { 
            $_.FullName -notmatch ($excludedDirs -join '|') -and
            [System.IO.Path]::GetFileNameWithoutExtension($_.Name) -like "*$baseName*"
        }
    
    if ($results.Count -eq 0) {
        Write-Host "No similar files found." -ForegroundColor Red
        return
    }
    
    Write-Host "`nFound $($results.Count) similar file(s):" -ForegroundColor Green
    
    $results | ForEach-Object {
        $relativePath = $_.FullName.Replace($projectRoot.Path + "\", "")
        Write-Host "`nFile: " -NoNewline
        Write-Host $_.Name -ForegroundColor Cyan
        Write-Host "Path: $relativePath"
        Write-Host "Last Modified: $($_.LastWriteTime)"
    }
}

function Show-RecentFiles {
    $days = 7
    Write-Host "`nShowing files modified in the last $days days:" -ForegroundColor Yellow
    
    $results = Get-ChildItem -Path $projectRoot -Recurse -File |
        Where-Object { 
            $_.FullName -notmatch ($excludedDirs -join '|') -and
            $_.LastWriteTime -gt (Get-Date).AddDays(-$days)
        } |
        Sort-Object LastWriteTime -Descending
    
    if ($results.Count -eq 0) {
        Write-Host "No recent files found." -ForegroundColor Red
        return
    }
    
    Write-Host "`nFound $($results.Count) recent file(s):" -ForegroundColor Green
    
    $results | ForEach-Object {
        $relativePath = $_.FullName.Replace($projectRoot.Path + "\", "")
        Write-Host "`nFile: " -NoNewline
        Write-Host $_.Name -ForegroundColor Cyan
        Write-Host "Path: $relativePath"
        Write-Host "Last Modified: $($_.LastWriteTime)"
    }
}

# Quick search without menu if searchTerm is provided
if ($searchTerm -ne "") {
    Find-Files -searchTerm $searchTerm -searchType "filename"
    return
}

# Show menu by default
Show-Menu
```

## Usage Guide

### 1. Interactive Menu
```powershell
# Run with menu
.\find-file.ps1
```

### 2. Quick Search
```powershell
# Direct file search
.\find-file.ps1 -searchTerm "config"
```

### 3. Search Examples
```powershell
# Find all JavaScript files
.\find-file.ps1 -searchTerm ".js"

# Find files with specific content
# Choose option 2 from menu and enter search term

# Find similar files
# Choose option 3 and enter base filename
```

## Best Practices

1. **Before Creating Files**
   - Always search first
   - Check similar filenames
   - Review recent files

2. **Naming Conventions**
   - Use consistent naming
   - Check for existing patterns
   - Avoid duplicate names

3. **File Organization**
   - Keep related files together
   - Use proper directories
   - Maintain clean structure

4. **Regular Maintenance**
   - Check recent files
   - Clean up duplicates
   - Update documentation

The script helps you:
- Find existing files quickly
- Prevent duplicate creation
- Maintain organized structure
- Track similar files
- Monitor recent changes

Would you like me to:
1. Add more search capabilities?
2. Include additional file information?
3. Modify the output format?