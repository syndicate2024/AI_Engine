# @ai-protected
# Complete Protection and Recovery System

## Required Files Structure
```
project-root/
├── .aiprotect.json            # Protection configuration
├── version-protection.json     # Version tracking (protected)
├── versions.json              # Regular version info
├── recovery.ps1               # Recovery script
├── backup-system.ps1          # Backup system
├── protect-versions.ps1       # Protection script
├── .backup/                   # Backup directory
├── version-backups/           # Version backups
└── .gitignore                # Source control ignore
```

## 1. Protection Configuration (.aiprotect.json)
```json
{
  "version": "1.0.0",
  "protected": {
    "files": {
      "package.json": {
        "version": "current",
        "dependencies": "locked"
      },
      "tsconfig.json": {
        "version": "locked"
      }
    },
    "directories": [
      "src/core",
      "config/",
      "scripts/"
    ],
    "patterns": [
      "*.env",
      "*.key",
      "password*"
    ]
  },
  "ignoredPaths": {
    "git": [".gitignore", ".gitattributes"],
    "docker": [".dockerignore"],
    "environment": [
      ".env",
      ".env.local",
      ".env.*.local",
      ".env.development",
      ".env.test",
      ".env.production"
    ],
    "dependencies": [
      "node_modules/",
      "package-lock.json",
      "yarn.lock"
    ],
    "build": [
      "dist/",
      "build/",
      ".next/",
      "out/"
    ]
  }
}
```

## 2. Version Protection (version-protection.json)
```json
{
  "version": "1.0.0",
  "lastUpdated": "2024-12-09",
  "protected": {
    "files": {
      "package.json": {
        "version": "current",
        "dependencies": "locked",
        "scripts": "protected"
      },
      "tsconfig.json": {
        "version": "locked"
      }
    },
    "versions": {
      "node": ">=18.0.0",
      "npm": ">=9.0.0"
    }
  },
  "recovery": {
    "backupLocations": [
      ".backup/",
      "version-backups/",
      ".git/refs/"
    ],
    "criticalFiles": [
      "package.json",
      "tsconfig.json",
      ".env.example"
    ]
  }
}
```

## 3. Recovery Script (recovery.ps1)
```powershell
# recovery.ps1
param(
    [Parameter(Mandatory=$true)]
    [string]$filename
)

# Import protection config
$protectionConfig = Get-Content -Path ".\version-protection.json" | ConvertFrom-Json
$backupLocations = $protectionConfig.recovery.backupLocations

function Recover-File {
    param(
        [string]$filename
    )

    foreach ($location in $backupLocations) {
        $backupPath = Join-Path -Path $location -ChildPath $filename
        
        if (Test-Path $backupPath) {
            Copy-Item -Path $backupPath -Destination $filename -Force
            Write-Host "Recovered $filename from $location"
            return $true
        }
    }

    if (Test-Path ".git") {
        try {
            git checkout HEAD -- $filename
            Write-Host "Recovered $filename from git"
            return $true
        }
        catch {
            Write-Host "Git recovery failed"
        }
    }

    return $false
}

$recovered = Recover-File -filename $filename
if (-not $recovered) {
    Write-Host "Could not recover $filename from any backup location"
}
```

## 4. Backup System (backup-system.ps1)
```powershell
# backup-system.ps1
param(
    [Parameter(Mandatory=$true)]
    [string]$filename
)

$date = Get-Date -Format "yyyy-MM-dd-HH-mm-ss"
$backupDir = ".backup"
$backupPath = Join-Path -Path $backupDir -ChildPath "$filename.$date"

if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir
}

Copy-Item -Path $filename -Destination $backupPath

$protection = Get-Content -Path ".\version-protection.json" | ConvertFrom-Json
$protection.recovery.backupLocations += $backupPath
$protection | ConvertTo-Json -Depth 10 | Set-Content ".\version-protection.json"

Write-Host "Backup created at $backupPath"
```

## 5. Protection Script (protect-versions.ps1)
```powershell
# protect-versions.ps1
param(
    [Parameter(Mandatory=$true)]
    [string]$filename
)

$content = Get-Content -Path $filename -Raw
$protection = Get-Content -Path ".\version-protection.json" | ConvertFrom-Json
$version = $protection.version

$protected = @"
/**
 * @ai-protected
 * @version $version
 * @last-modified $(Get-Date -Format "yyyy-MM-ddTHH:mm:ss")
 */

$content
"@

Set-Content -Path $filename -Value $protected
Write-Host "Protected $filename"
.\backup-system.ps1 -filename $filename
```

## 6. Complete .gitignore
```gitignore
# Environment Variables
.env
.env.local
.env.*.local
.env.development
.env.development.local
.env.test
.env.test.local
.env.production
.env.production.local
.env.staging
.env.staging.local

# Dependencies
node_modules/
package-lock.json
yarn.lock
pnpm-lock.yaml
.pnpm-store/

# Build outputs
dist/
build/
out/
.next/
.nuxt/
.output/

# IDE and Editor
.idea/
.vscode/
*.swp
*.swo
.DS_Store

# Logs and Debug
logs/
*.log
npm-debug.log*
yarn-debug.log*

# Testing
/coverage
/cypress/videos/
/cypress/screenshots/

# Temporary files
tmp/
temp/
.temp/

# Protection system
.backup/
version-backups/
```

## Implementation Instructions for AI

1. Create all required directories:
```powershell
New-Item -ItemType Directory -Path ".backup"
New-Item -ItemType Directory -Path "version-backups"
```

2. Create all configuration files:
- Copy .aiprotect.json content
- Copy version-protection.json content
- Copy versions.json content
- Copy all PowerShell scripts

3. Set up PowerShell execution policy:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

4. Test the recovery system:
```powershell
# Create test file
Set-Content -Path "test.js" -Value "console.log('test');"

# Protect it
.\protect-versions.ps1 -filename "test.js"

# Try recovery
.\recovery.ps1 -filename "test.js"
```

## AI Usage Instructions

1. When marking files as complete:
```javascript
/**
 * @ai-protected
 * @status complete
 * @version ${VERSION}
 * @last-modified ${DATE}
 */
```

2. Before modifying any file:
- Check .aiprotect.json for protection status
- Check file header for @ai-protected marker
- Request permission for protected files
- Document changes in version-protection.json

3. If files are deleted:
```powershell
.\recovery.ps1 -filename "deleted-file.js"
```

4. When creating new files:
- Check if directory is protected
- Add appropriate protection markers
- Update version-protection.json if needed

5. For protected files that need changes:
- Explain why changes are needed
- Show the specific changes
- Get explicit permission
- Update last-modified date
- Create backup before changes

## Recovery Procedures

1. For deleted files:
```powershell
# Try automatic recovery
.\recovery.ps1 -filename "your-file.js"

# If that fails, try git
git checkout HEAD -- your-file.js

# If neither works, check backups manually in .backup/
```

2. For corrupted files:
```powershell
# Create backup first
.\backup-system.ps1 -filename "corrupted-file.js"

# Then recover
.\recovery.ps1 -filename "corrupted-file.js"
```

3. For multiple files:
```powershell
# Recovery script can be run in a loop
Get-Content .\version-protection.json | 
    ConvertFrom-Json | 
    Select-Object -ExpandProperty recovery.criticalFiles | 
    ForEach-Object { .\recovery.ps1 -filename $_ }
```

Remember: Always maintain backups and keep version-protection.json up to date!
