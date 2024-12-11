# @ai-protected
# Backup System

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