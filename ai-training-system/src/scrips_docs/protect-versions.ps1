# @ai-protected
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