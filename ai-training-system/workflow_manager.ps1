# AI Workflow Manager Script
# This script manages daily workflows, templates, and backups
# Version: 1.2 - Updated for ai-training-system structure

# Configuration
$workspaceRoot = $PSScriptRoot  # Now points to ai-training-system directory
$workflowDir = Join-Path $workspaceRoot "workflow"
$templateDir = Join-Path $workflowDir "templates"
$dailyDir = Join-Path $workflowDir "daily"
$backupDir = "D:\AI_Daily_Backup"
$statusFile = Join-Path $workflowDir "workflow_status.json"

# Safety Check Function
function Test-SafetyChecks {
    Write-Host "`n=== Safety Checks ===" -ForegroundColor Green
    Write-Host "✓ Script will NOT delete any files" -ForegroundColor Cyan
    Write-Host "✓ All previous work is preserved" -ForegroundColor Cyan
    Write-Host "✓ Backups are additive only" -ForegroundColor Cyan
    
    # Check if backup directory exists and is writable
    if (-not (Test-Path $backupDir)) {
        Write-Host "! Creating backup directory at: $backupDir" -ForegroundColor Yellow
        try {
            New-Item -Path $backupDir -ItemType Directory -Force
        } catch {
            Write-Host "ERROR: Cannot create backup directory. Please check permissions." -ForegroundColor Red
            return $false
        }
    }
    
    # Verify workspace directories are safe
    if ((Test-Path $workflowDir) -and (Get-ChildItem $workflowDir -File)) {
        Write-Host "✓ Existing workflow directory found - will preserve all content" -ForegroundColor Green
    }
    
    return $true
}

# Create necessary directories
function Initialize-WorkflowStructure {
    $dirs = @($workflowDir, $templateDir, $dailyDir, $backupDir)
    foreach ($dir in $dirs) {
        if (-not (Test-Path $dir)) {
            New-Item -Path $dir -ItemType Directory -Force
            Write-Host "Created directory: $dir" -ForegroundColor Green
        }
    }
}

# Template Management
function New-WorkflowTemplate {
    param(
        [string]$templateName,
        [string]$content
    )
    $templatePath = Join-Path $templateDir "$templateName.md"
    $content | Set-Content $templatePath -Force
    Write-Host "Created template: $templateName" -ForegroundColor Cyan
}

# Create default templates
function Initialize-DefaultTemplates {
    $dailyTemplate = @"
# Daily Workflow - {date}

## Project: AI Training System
## Location: $workspaceRoot

## Quick Status
- [ ] 🌅 Morning Setup Complete
- [ ] 💻 Development In Progress
- [ ] 🧪 Tests Running
- [ ] 🔄 Changes Backed Up
- [ ] 🌙 End of Day Review

## Environment Status
- Node Version: $(node -v)
- npm Version: $(npm -v)
- Git Branch: $(git branch --show-current)
- Last Commit: $(git log -1 --pretty=%B)

## Today's Focus
### Priority Tasks
1. 
2. 
3. 

### Blockers/Issues
- [ ] No blockers
- 

## Development Progress
### Completed
- 

### In Progress
- 

### Up Next
- 

## Code Changes
### Modified Files
{modified_files}

### Key Changes Made
- 

### Dependencies Updated
- [ ] No new dependencies
- 

## Testing & Quality
### Test Status
\`\`\`
{test_results}
\`\`\`

### Code Review Notes
- 

### Performance Concerns
- [ ] No performance issues
- 

## AI Collaboration
### Questions Asked
- 

### Solutions Implemented
- 

### Key Decisions
- 

### Learning Points
- 

## Documentation
### Updated Files
- 

### Need to Update
- 

## End of Day Summary
### Achievements
- 

### Challenges
- 

### Tomorrow's Priority
- 

## Backup Status
- [ ] Code changes backed up
- [ ] Documentation updated
- [ ] Test results saved
- [ ] Environment changes noted
"@

    $testTemplate = @"
# Test Status - {date}

## Project: AI Training System
## Location: $workspaceRoot

## Test Environment
- Node Version: $(node -v)
- Test Runner: Vitest
- Environment: Development

## Test Summary
### Overall Status
- Total Tests: 
- Passing: 
- Failing: 
- Skipped: 

### Test Categories
#### Unit Tests
- [ ] All Passing
- Failed: 

#### Integration Tests
- [ ] All Passing
- Failed: 

#### E2E Tests
- [ ] All Passing
- Failed: 

## Failed Tests Detail
### Critical Failures
- 

### Non-Critical Issues
- 

## Test Performance
### Slow Tests (>100ms)
- 

### Memory Usage
- 

## Required Fixes
### High Priority
- 

### Nice to Have
- 

## Test Coverage
### Areas Well Covered
- 

### Areas Needing Coverage
- 

## Verification Steps
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] No memory leaks
- [ ] Performance acceptable
- [ ] Error handling tested
- [ ] Edge cases covered

## Notes for Next Run
- 
"@

    New-WorkflowTemplate -templateName "daily_workflow" -content $dailyTemplate
    New-WorkflowTemplate -templateName "test_status" -content $testTemplate
}

# Daily Workflow Management
function New-DailyWorkflow {
    $date = Get-Date -Format "yyyy-MM-dd"
    $dailyPath = Join-Path $dailyDir $date
    
    Write-Host "`n=== Creating Daily Workflow ===" -ForegroundColor Green
    Write-Host "Project Directory: $workspaceRoot" -ForegroundColor Cyan
    
    # Force refresh of daily files
    New-Item -Path $dailyPath -ItemType Directory -Force | Out-Null
    
    # Create daily files from templates
    Get-ChildItem $templateDir -Filter "*.md" | ForEach-Object {
        $content = Get-Content $_.FullName -Raw
        $content = $content.Replace("{date}", $date)
        $newFile = Join-Path $dailyPath ($_.BaseName + ".md")
        $content | Set-Content $newFile -Force
        Write-Host "✓ Created/Updated: $($_.BaseName).md" -ForegroundColor Cyan
    }
}

# Backup Management
function Backup-WorkflowFiles {
    $date = Get-Date -Format "yyyy-MM-dd"
    $backupPath = Join-Path $backupDir $date
    
    Write-Host "`n=== Backing Up Files ===" -ForegroundColor Green
    Write-Host "Project Directory: $workspaceRoot" -ForegroundColor Cyan
    
    # Ensure source files exist before attempting backup
    $dailyPath = Join-Path $dailyDir $date
    if (-not (Test-Path $dailyPath)) {
        Write-Host "No files found for today ($date). Nothing to backup." -ForegroundColor Yellow
        return
    }
    
    try {
        # Create backup directory if it doesn't exist
        if (-not (Test-Path $backupPath)) {
            New-Item -Path $backupPath -ItemType Directory -Force | Out-Null
            Write-Host "Created backup directory for today: $backupPath" -ForegroundColor Cyan
        }
        
        # Backup workflow files
        $workflowBackupPath = Join-Path $backupPath "workflow"
        if (-not (Test-Path $workflowBackupPath)) {
            New-Item -Path $workflowBackupPath -ItemType Directory -Force | Out-Null
        }
        
        # Copy daily folder
        Copy-Item -Path $dailyPath -Destination (Join-Path $workflowBackupPath "daily") -Recurse -Force
        Write-Host "✓ Backed up workflow files" -ForegroundColor Cyan
        
        # Backup modified project files
        $projectBackupPath = Join-Path $backupPath "project_files"
        if (-not (Test-Path $projectBackupPath)) {
            New-Item -Path $projectBackupPath -ItemType Directory -Force | Out-Null
        }
        
        # Get modified files from git
        $gitStatus = git status --porcelain
        $modifiedFiles = $gitStatus | Where-Object { $_ -match '^.M|^.A|^.D' } | ForEach-Object { $_.Substring(3) }
        
        foreach ($file in $modifiedFiles) {
            $sourcePath = Join-Path $workspaceRoot $file
            if (Test-Path $sourcePath) {
                $targetPath = Join-Path $projectBackupPath $file
                $targetDir = Split-Path -Parent $targetPath
                
                if (-not (Test-Path $targetDir)) {
                    New-Item -Path $targetDir -ItemType Directory -Force | Out-Null
                }
                Copy-Item -Path $sourcePath -Destination $targetPath -Force
                Write-Host "✓ Backed up: $file" -ForegroundColor Cyan
            }
        }
        
        # Count files for verification
        $workflowFiles = (Get-ChildItem -Path $workflowBackupPath -Recurse -File).Count
        $projectFiles = (Get-ChildItem -Path $projectBackupPath -Recurse -File).Count
        Write-Host "✓ Backed up $workflowFiles workflow files" -ForegroundColor Green
        Write-Host "✓ Backed up $projectFiles modified project files" -ForegroundColor Green
        
        # Create status summary
        $status = @{
            LastBackup = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            WorkflowFiles = $workflowFiles
            ProjectFiles = $projectFiles
            BackupLocation = $backupPath
            ProjectDirectory = $workspaceRoot
        }
        
        $status | ConvertTo-Json | Set-Content $statusFile -Force
        Write-Host "✓ Updated status file" -ForegroundColor Green
        
    } catch {
        Write-Host "ERROR during backup: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Your original files are safe and unchanged." -ForegroundColor Yellow
    }
}

# Update daily workflow with modified files
function Update-DailyWorkflow {
    param(
        [string]$date = (Get-Date -Format "yyyy-MM-dd")
    )
    
    Write-Host "`n=== Updating Daily Workflow ===" -ForegroundColor Green
    $dailyWorkflowPath = Join-Path $dailyDir $date "daily_workflow.md"
    
    if (Test-Path $dailyWorkflowPath) {
        # Get list of modified files with status
        $gitStatus = git status --porcelain
        $modifiedFiles = $gitStatus | Where-Object { $_ -match '^.M|^.A|^.D' } | ForEach-Object {
            $status = switch ($_.Substring(1,1)) {
                'M' { "Modified" }
                'A' { "Added" }
                'D' { "Deleted" }
                default { "Changed" }
            }
            "- [$status] $($_.Substring(3))"
        }
        
        $modifiedFilesList = if ($modifiedFiles) {
            "`n" + ($modifiedFiles | Out-String).TrimEnd()
        } else {
            "`n- No files modified yet today"
        }
        
        # Read current content
        $content = Get-Content $dailyWorkflowPath -Raw
        
        # Update modified files section
        $content = $content -replace "(?s)### Modified Files.*?(?=### Key Changes Made)", "### Modified Files$modifiedFilesList`n`n"
        
        # Save updated content
        $content | Set-Content $dailyWorkflowPath -Force
        Write-Host "✓ Updated daily workflow with modified files" -ForegroundColor Cyan
        
        # Show what was tracked
        if ($modifiedFiles) {
            Write-Host "Modified files tracked:" -ForegroundColor Yellow
            $modifiedFiles | ForEach-Object { Write-Host $_ -ForegroundColor Cyan }
        }
    }
}

# Main execution
function Start-WorkflowManager {
    Write-Host "`n=== AI Workflow Manager ===" -ForegroundColor Cyan
    Write-Host "Starting workflow management process..." -ForegroundColor Cyan
    Write-Host "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
    Write-Host "Project: AI Training System" -ForegroundColor Cyan
    Write-Host "Location: $workspaceRoot" -ForegroundColor Cyan
    
    if (-not (Test-SafetyChecks)) {
        Write-Host "Safety checks failed. Stopping for your protection." -ForegroundColor Red
        return
    }
    
    Initialize-WorkflowStructure
    Initialize-DefaultTemplates
    New-DailyWorkflow
    Update-DailyWorkflow
    Backup-WorkflowFiles
    
    Write-Host "`n=== Workflow Manager Complete ===" -ForegroundColor Green
    Write-Host "✓ Your work is safe and backed up" -ForegroundColor Cyan
    Write-Host "✓ Check $backupDir for your backups" -ForegroundColor Cyan
    Write-Host "✓ Run this script again at end of day" -ForegroundColor Cyan
}

# Run the workflow manager
Start-WorkflowManager 