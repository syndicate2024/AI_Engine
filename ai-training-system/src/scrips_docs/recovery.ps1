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

    # Check each backup location
    foreach ($location in $backupLocations) {
        $backupPath = Join-Path -Path $location -ChildPath $filename
        
        if (Test-Path $backupPath) {
            Copy-Item -Path $backupPath -Destination $filename -Force
            Write-Host "Recovered $filename from $location"
            return $true
        }
    }

    # If not found in backups, try git
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

# Usage
$recovered = Recover-File -filename $filename
if (-not $recovered) {
    Write-Host "Could not recover $filename from any backup location"
}