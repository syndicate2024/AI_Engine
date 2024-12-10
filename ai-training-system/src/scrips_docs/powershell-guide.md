# @ai-protected

# PowerShell Commands and Project Structure Guide

## Project Structure
```
ai-training-system/
├── src/
│   ├── agents/
│   │   ├── tutor/
│   │   │   ├── chains/           # LangChain configurations
│   │   │   ├── prompts/          # Teaching prompts
│   │   │   ├── patterns/         # Teaching patterns
│   │   │   └── handlers/         # Interaction handlers
│   │   ├── assessment/
│   │   └── progress/
│   ├── core/
│   │   ├── orchestration/
│   │   └── utils/
│   └── types/
├── docs/
│   ├── handoffs/                 # Session handoff documents
│   ├── progress/                 # Progress tracking
│   └── decisions/               # Decision records
├── tests/
└── scripts/
    ├── handoff.ps1              # Handoff generation script
    ├── status.ps1               # Project status script
    └── setup.ps1                # Environment setup script
```

## PowerShell Scripts for Project Management

### 1. Generate Session Handoff
```powershell
# handoff.ps1
param(
    [string]$module = "tutor",
    [string]$developer = $env:USERNAME
)

# Create timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd-HH-mm"
$handoffPath = "docs/handoffs/$module-$timestamp.md"

# Get Git status
$gitStatus = git status --porcelain
$gitBranch = git branch --show-current
$lastCommit = git log -1 --pretty=format:"%h - %s"

# Get modified files
$modifiedFiles = git diff --name-only

# Create handoff document
$handoffContent = @"
# Development Session Handoff

## Session Info
- Date: $(Get-Date -Format "yyyy-MM-dd HH:mm")
- Module: $module
- Developer: $developer
- Branch: $gitBranch
- Last Commit: $lastCommit

## Changes Made
$($modifiedFiles | ForEach-Object { "- $_" })

## Current Status
$(git status --short)

## Dependencies
$(Get-Content package.json | ConvertFrom-Json | Select-Object -ExpandProperty dependencies | ConvertTo-Json)

## Next Steps
[Auto-generated list of TODO comments from changed files]
$(Get-Content $modifiedFiles | Select-String "TODO:" | ForEach-Object { "- $_" })
"@

# Save handoff document
New-Item -Path $handoffPath -Value $handoffContent -Force
Write-Host "Handoff document created at: $handoffPath"
```

### 2. Project Status Check
```powershell
# status.ps1
param(
    [string]$module = "all"
)

# Function to check module status
function Get-ModuleStatus {
    param([string]$modulePath)
    
    $stats = @{
        Files = (Get-ChildItem $modulePath -Recurse -File).Count
        TODOs = (Get-ChildItem $modulePath -Recurse -File | Get-Content | Select-String "TODO:").Count
        Tests = (Get-ChildItem "$modulePath/tests" -Recurse -File).Count
        Coverage = "N/A" # Add test coverage check if available
    }
    return $stats
}

# Check specified module or all modules
if ($module -eq "all") {
    Get-ChildItem "src/agents" -Directory | ForEach-Object {
        Write-Host "`nModule: $($_.Name)"
        $stats = Get-ModuleStatus $_.FullName
        $stats | Format-Table
    }
} else {
    $stats = Get-ModuleStatus "src/agents/$module"
    $stats | Format-Table
}
```

### 3. Module Progress Tracking
```powershell
# track-progress.ps1
param(
    [string]$module,
    [string]$task,
    [string]$status
)

$progressPath = "docs/progress/$module-progress.json"

# Load existing progress or create new
if (Test-Path $progressPath) {
    $progress = Get-Content $progressPath | ConvertFrom-Json
} else {
    $progress = @{
        module = $module
        tasks = @()
        lastUpdated = $null
    }
}

# Update task status
$taskObj = @{
    name = $task
    status = $status
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    developer = $env:USERNAME
}

$progress.tasks += $taskObj
$progress.lastUpdated = Get-Date -Format "yyyy-MM-dd HH:mm"

# Save progress
$progress | ConvertTo-Json | Set-Content $progressPath
```

### 4. Development Environment Setup
```powershell
# setup.ps1
# Clone repository and set up development environment
git clone https://github.com/BenGardiner123/langchainjs-typescript.git .
npm install

# Create necessary directories
$dirs = @(
    "src/agents/tutor/chains",
    "src/agents/tutor/prompts",
    "src/agents/tutor/patterns",
    "src/agents/tutor/handlers",
    "src/agents/assessment",
    "src/agents/progress",
    "src/core/orchestration",
    "src/core/utils",
    "src/types",
    "docs/handoffs",
    "docs/progress",
    "docs/decisions",
    "tests",
    "scripts"
)

foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Path $dir -Force
}

# Create .env file
$envContent = @"
OPENAI_API_KEY=your_key_here
NODE_ENV=development
"@
Set-Content .env $envContent
```

## Usage Examples

### Generate Handoff Document
```powershell
.\scripts\handoff.ps1 -module "tutor" -developer "john"
```

### Check Project Status
```powershell
.\scripts\status.ps1 -module "tutor"
```

### Track Progress
```powershell
.\scripts\track-progress.ps1 -module "tutor" -task "Implement Socratic questioning" -status "in-progress"
```

### Set Up New Environment
```powershell
.\scripts\setup.ps1
```

## Best Practices

1. **Regular Handoffs**
   - Generate handoff documents at the end of each session
   - Include all relevant context and next steps
   - Document any pending issues

2. **Progress Tracking**
   - Update progress regularly
   - Include specific task status
   - Document blockers and dependencies

3. **File Organization**
   - Maintain clear module boundaries
   - Keep related files together
   - Use consistent naming conventions

4. **Documentation**
   - Update READMEs with new features
   - Document decisions and rationale
   - Keep handoff documents organized

Would you like me to:
1. Explain any specific script in more detail?
2. Add additional PowerShell commands for specific scenarios?
3. Modify the file structure for your specific needs?
