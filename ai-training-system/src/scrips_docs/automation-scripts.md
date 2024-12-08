# Student-Friendly Automation Scripts Guide

## Overview
This guide contains PowerShell scripts to help automate common development tasks. Each script includes detailed explanations and usage examples.

## 1. Project Setup Script
This script helps set up your project structure and install dependencies.

```powershell
# File: setup-project.ps1

# Get project name from user or use default
param(
    [string]$projectName = "ai-training-system"
)

# Function to show what's happening
function Write-Step {
    param([string]$message)
    Write-Host "`n🚀 $message" -ForegroundColor Cyan
}

# Main setup script
try {
    Write-Step "Setting up project: $projectName"

    # Create project with Vite
    Write-Step "Creating Vite project..."
    npm create vite@latest $projectName -- --template react-ts
    Set-Location $projectName

    # Install dependencies
    Write-Step "Installing dependencies..."
    npm install
    npm install langchain @langchain/openai @langchain/community
    npm install tailwindcss postcss autoprefixer
    npm install @headlessui/react @heroicons/react

    # Create project structure
    Write-Step "Creating folder structure..."
    $folders = @(
        "src/agents/tutor",
        "src/agents/assessment",
        "src/core/utils",
        "src/types",
        "docs/handoffs",
        "tests"
    )

    foreach ($folder in $folders) {
        New-Item -ItemType Directory -Path $folder -Force
        Write-Host "Created: $folder" -ForegroundColor Green
    }

    # Create .env file
    Write-Step "Creating environment file..."
    $envContent = @"
VITE_OPENAI_API_KEY=your_key_here
VITE_ENV=development
"@
    Set-Content .env $envContent

    Write-Step "Setup complete! 🎉"
    Write-Host "`nNext steps:"
    Write-Host "1. Add your OpenAI API key to .env"
    Write-Host "2. Run 'npm run dev' to start development"
    Write-Host "3. Begin implementing your first module"

} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host "Please fix the error and try again."
}
```

### How to Use:
1. Save as `setup-project.ps1`
2. Open PowerShell
3. Run: `.\setup-project.ps1`
4. For custom name: `.\setup-project.ps1 -projectName "my-ai-app"`

## 2. Development Session Manager
This script helps track your development sessions and create handoffs.

```powershell
# File: dev-session.ps1

param(
    [string]$action = "start",  # start or end
    [string]$module = "general" # which module you're working on
)

# Function to get current time in readable format
function Get-TimeStamp {
    return Get-Date -Format "yyyy-MM-dd HH:mm"
}

# Function to create session log
function Write-SessionLog {
    param(
        [string]$action,
        [string]$message
    )
    
    $logPath = "docs/sessions"
    $logFile = Join-Path $logPath "session-log.md"

    # Create log directory if it doesn't exist
    if (-not (Test-Path $logPath)) {
        New-Item -ItemType Directory -Path $logPath -Force
    }

    # Create or append to log file
    $timestamp = Get-TimeStamp
    $logEntry = "`n## $timestamp - $action`n$message"
    
    Add-Content $logFile $logEntry
}

# Start session
if ($action -eq "start") {
    $message = @"
### Session Started
- Module: $module
- Goals:
  1. [Add your goals here]
  2. [Add more goals]
- Notes:
  - [Add session notes here]
"@
    Write-SessionLog "Session Start" $message
    Write-Host "Session started for module: $module" -ForegroundColor Green
    Write-Host "Don't forget to update your goals in: docs/sessions/session-log.md"
}

# End session
if ($action -eq "end") {
    # Get git changes
    $changes = git status --porcelain
    
    $message = @"
### Session Ended
- Module: $module
- Changes Made:
$($changes | ForEach-Object { "  - $_" })
- Next Steps:
  1. [Add next steps here]
- Notes:
  - [Add end of session notes]
"@
    Write-SessionLog "Session End" $message
    Write-Host "Session ended for module: $module" -ForegroundColor Yellow
    Write-Host "Don't forget to update the session log with next steps!"
}
```

### How to Use:
1. Save as `dev-session.ps1`
2. Start session: `.\dev-session.ps1 -action start -module "tutor"`
3. End session: `.\dev-session.ps1 -action end -module "tutor"`

## 3. Quick Module Creator
This script helps create new modules with proper structure.

```powershell
# File: create-module.ps1

param(
    [Parameter(Mandatory=$true)]
    [string]$moduleName,
    [string]$type = "agent" # agent or core
)

# Base path depending on type
$basePath = $type -eq "agent" ? "src/agents" : "src/core"
$modulePath = Join-Path $basePath $moduleName

# Function to create file with template
function New-FileWithTemplate {
    param(
        [string]$path,
        [string]$template
    )
    
    New-Item -ItemType File -Path $path -Force
    Set-Content $path $template
}

try {
    # Create module directory structure
    $folders = @(
        "",
        "/tests",
        "/types",
        "/utils"
    )

    foreach ($folder in $folders) {
        $path = Join-Path $modulePath $folder
        New-Item -ItemType Directory -Path $path -Force
        Write-Host "Created directory: $path" -ForegroundColor Green
    }

    # Create index.ts
    $indexTemplate = @"
// $moduleName module
export * from './types';
"@
    New-FileWithTemplate (Join-Path $modulePath "index.ts") $indexTemplate

    # Create types file
    $typesTemplate = @"
// Types for $moduleName module

export interface ${moduleName}Config {
    // Add configuration options
}

export interface ${moduleName}State {
    // Add state definitions
}
"@
    New-FileWithTemplate (Join-Path $modulePath "types/index.ts") $typesTemplate

    # Create test file
    $testTemplate = @"
import { describe, it, expect } from 'vitest';

describe('$moduleName module', () => {
    it('should be properly configured', () => {
        // Add your tests here
        expect(true).toBe(true);
    });
});
"@
    New-FileWithTemplate (Join-Path $modulePath "tests/$moduleName.test.ts") $testTemplate

    Write-Host "`n✨ Module '$moduleName' created successfully!" -ForegroundColor Cyan
    Write-Host "`nNext steps:"
    Write-Host "1. Add your module's specific logic"
    Write-Host "2. Update the types in types/index.ts"
    Write-Host "3. Add tests in tests/$moduleName.test.ts"

} catch {
    Write-Host "❌ Error creating module: $_" -ForegroundColor Red
}
```

### How to Use:
1. Save as `create-module.ps1`
2. Create agent module: `.\create-module.ps1 -moduleName "assessment" -type "agent"`
3. Create core module: `.\create-module.ps1 -moduleName "utils" -type "core"`

## Tips for Using These Scripts

### Getting Started
1. Create a `scripts` folder in your project
2. Save all scripts there
3. Open PowerShell in your project directory
4. Run scripts as needed

### Common Issues and Solutions
1. **Script Won't Run**
   - Run PowerShell as Administrator
   - Run `Set-ExecutionPolicy RemoteSigned` to allow scripts

2. **Path Issues**
   - Make sure you're in the project directory
   - Use `pwd` to check current directory
   - Use `cd` to change directories

3. **NPM Errors**
   - Make sure Node.js is installed
   - Run `npm --version` to verify
   - Update Node.js if needed

### Best Practices
1. Always start a new session with `dev-session.ps1`
2. Create modules using `create-module.ps1`
3. Document your changes in session logs
4. Review logs before ending session

### Learning Tips
1. Read through scripts before running them
2. Try to understand each section's purpose
3. Modify scripts to fit your needs
4. Keep documentation updated

Would you like me to:
1. Create additional scripts for specific tasks?
2. Add more detailed explanations for any script?
3. Provide examples of customizing these scripts?
