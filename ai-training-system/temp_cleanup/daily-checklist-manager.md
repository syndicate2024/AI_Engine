# Daily Checklist Management System

## PowerShell Script for Daily Checklist Management
```powershell
# File: daily-checklist.ps1

param(
    [string]$action = "create", # create, archive, or summary
    [string]$module = "current" # current module being worked on
)

# Configuration
$docsPath = "docs"
$checklistPath = Join-Path $docsPath "checklists"
$archivePath = Join-Path $checklistPath "archive"
$currentPath = Join-Path $checklistPath "current"
$handoffPath = Join-Path $docsPath "handoffs"

# Ensure directories exist
$paths = @($checklistPath, $archivePath, $currentPath, $handoffPath)
foreach ($path in $paths) {
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force
    }
}

# Get formatted dates
$currentDate = Get-Date
$dateStamp = $currentDate.ToString("yyyy-MM-dd")
$timeStamp = $currentDate.ToString("HH:mm")

# Function to create daily checklist
function New-DailyChecklist {
    $checklistFile = Join-Path $currentPath "$dateStamp-checklist.md"
    
    # Read previous day's checklist if exists
    $previousTasks = @()
    $previousFile = Join-Path $currentPath "$((Get-Date).AddDays(-1).ToString('yyyy-MM-dd'))-checklist.md"
    if (Test-Path $previousFile) {
        $previousContent = Get-Content $previousFile
        $previousTasks = $previousContent | Where-Object { $_ -match '- \[ \]' -and $_ -notmatch '(Session Start|Development Tasks|Progress Tracking|Session End)' }
    }

    # Get current module's status
    $progressFile = Join-Path $docsPath "progress/development-progress.json"
    $moduleStatus = "Unknown"
    if (Test-Path $progressFile) {
        $progress = Get-Content $progressFile | ConvertFrom-Json
        if ($progress.modules.$module) {
            $moduleStatus = $progress.modules.$module.status
        }
    }

    # Create checklist content
    $content = @"
# Daily Development Checklist - $dateStamp

## Module Status
- Current Module: $module
- Status: $moduleStatus
- Time Started: $timeStamp

## 🌅 Session Start
- [ ] Run: `.\scripts\dev-session.ps1 -action start -module "$module"`
- [ ] Review previous session's notes
- [ ] Check module status: `.\scripts\status.ps1 -module "$module"`
- [ ] Set today's goals

## 💻 Development Tasks
$(if ($previousTasks) {
    $previousTasks | ForEach-Object { $_ }
} else {
"- [ ] Task 1
- [ ] Task 2
- [ ] Task 3"
})

## 🎯 Progress Tracking
- [ ] Update progress: `.\scripts\track-progress.ps1`
- [ ] Document any blockers
- [ ] Note completed features
- [ ] Record time spent

## 🌆 Session End
- [ ] Run: `.\scripts\dev-session.ps1 -action end -module "$module"`
- [ ] Review code changes
- [ ] Update documentation
- [ ] Plan next session

## Notes
### Completed Today:
- 

### Blockers:
- 

### Next Session Goals:
- 

## Time Tracking
- Start Time: $timeStamp
- End Time: [To be filled]
- Total Hours: [To be calculated]
"@

    Set-Content $checklistFile $content
    Write-Host "Created daily checklist: $checklistFile" -ForegroundColor Green
    return $checklistFile
}

# Function to archive old checklists
function Submit-ChecklistArchive {
    $cutoffDate = $currentDate.AddDays(-7)
    $oldChecklists = Get-ChildItem $currentPath -Filter "*-checklist.md" | 
        Where-Object { $_.CreationTime -lt $cutoffDate }
    
    foreach ($checklist in $oldChecklists) {
        $archiveFile = Join-Path $archivePath $checklist.Name
        Move-Item $checklist.FullName $archiveFile -Force
        Write-Host "Archived: $($checklist.Name)" -ForegroundColor Yellow
    }
}

# Function to generate summary
function Get-ChecklistSummary {
    $summaryFile = Join-Path $handoffPath "$dateStamp-summary.md"
    
    # Get recent checklists
    $recentChecklists = Get-ChildItem $currentPath -Filter "*-checklist.md" | 
        Sort-Object CreationTime -Descending | 
        Select-Object -First 5

    $summaryContent = @"
# Development Summary - $dateStamp

## Recent Progress
"@

    foreach ($checklist in $recentChecklists) {
        $content = Get-Content $checklist.FullName
        $completed = $content | Where-Object { $_ -match '- \[x\]' }
        $blockers = $content | Select-String -Pattern "### Blockers:" -Context 0,3
        
        $summaryContent += @"

### $($checklist.BaseName)
#### Completed:
$($completed | ForEach-Object { $_ })

#### Blockers:
$($blockers | ForEach-Object { $_.Context.PostContext })

"@
    }

    $summaryContent += @"

## Current Status
- Module: $module
- Active Tasks: $((Get-Content (Get-ChildItem $currentPath -Filter "$dateStamp-checklist.md").FullName | Where-Object { $_ -match '- \[ \]' }).Count)
- Last Updated: $timeStamp

## Next Steps
[To be filled based on current progress]
"@

    Set-Content $summaryFile $summaryContent
    Write-Host "Created summary: $summaryFile" -ForegroundColor Green
    return $summaryFile
}

# Main script execution
switch ($action) {
    "create" {
        $checklistFile = New-DailyChecklist
        Write-Host "Opening checklist..."
        Start-Process notepad $checklistFile
    }
    "archive" {
        Submit-ChecklistArchive
    }
    "summary" {
        $summaryFile = Get-ChecklistSummary
        Write-Host "Opening summary..."
        Start-Process notepad $summaryFile
    }
}
```

## Usage Guide

### 1. Create Today's Checklist
```powershell
# Create new checklist for current module
.\daily-checklist.ps1 -action create -module "tutor"
```

### 2. Archive Old Checklists
```powershell
# Archive checklists older than 7 days
.\daily-checklist.ps1 -action archive
```

### 3. Generate Summary
```powershell
# Create summary of recent progress
.\daily-checklist.ps1 -action summary
```

## File Structure
```
docs/
├── checklists/
│   ├── current/
│   │   └── YYYY-MM-DD-checklist.md
│   └── archive/
│       └── YYYY-MM-DD-checklist.md
├── handoffs/
│   └── YYYY-MM-DD-summary.md
└── progress/
    └── development-progress.json
```

## Best Practices

1. **Daily Routine**
   - Create new checklist each morning
   - Update throughout the day
   - Generate summary before ending day

2. **Organization**
   - Keep current checklists in current/
   - Review archived checklists when needed
   - Use summaries for weekly reviews

3. **Documentation**
   - Be specific in task descriptions
   - Note all blockers
   - Document time spent
   - Plan next steps

4. **Maintenance**
   - Run archive weekly
   - Review old summaries monthly
   - Clean up unnecessary files

Would you like me to:
1. Add more features to the script?
2. Create additional automation for specific tasks?
3. Modify the checklist format?
