# @ai-protected
# Script to scan for files missing protection markers

# Define excluded directories
$excludedDirs = @("node_modules", ".git", "bin", "obj")

# Define files that don't support comments
$noCommentFiles = @(
    ".json",
    ".min.js",
    ".min.css",
    ".svg",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".ico",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot"
)

# Define comment styles for different file types
$commentStyles = @{
    # JavaScript family
    ".js"    = "// @ai-protected"
    ".ts"    = "// @ai-protected"
    ".jsx"   = "// @ai-protected"
    ".tsx"   = "// @ai-protected"
    ".mjs"   = "// @ai-protected"
    
    # Web files
    ".css"   = "/* @ai-protected */"
    ".scss"  = "/* @ai-protected */"
    ".less"  = "/* @ai-protected */"
    ".html"  = "<!-- @ai-protected -->"
    ".xml"   = "<!-- @ai-protected -->"
    
    # Script files
    ".py"    = "# @ai-protected"
    ".sh"    = "# @ai-protected"
    ".bash"  = "# @ai-protected"
    ".ps1"   = "# @ai-protected"
    
    # Config files
    ".yaml"  = "# @ai-protected"
    ".yml"   = "# @ai-protected"
    ".conf"  = "# @ai-protected"
    ".ini"   = "; @ai-protected"
    
    # Documentation
    ".md"    = "# @ai-protected"
    ".markdown" = "# @ai-protected"
}

Write-Host "`n=== Protection Marker Scan Report ===`n" -ForegroundColor Cyan

# Create arrays to store different categories of files
$missingMarkers = @()
$unsupportedFiles = @()
$protectedFiles = @()
$unrecognizedTypes = @()

Get-ChildItem -Recurse -File | 
    Where-Object { $_.FullName -notmatch ($excludedDirs -join '|') } | 
    ForEach-Object {
        $file = $_
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        
        if ($file.Extension -in $noCommentFiles) {
            $unsupportedFiles += $file
        }
        elseif (-not $commentStyles[$file.Extension]) {
            $unrecognizedTypes += $file
        }
        elseif ($content -and -not ($content -match "@ai-protected")) {
            $missingMarkers += $file
        }
        elseif ($content -match "@ai-protected") {
            $protectedFiles += $file
        }
    }

# Report Missing Markers
if ($missingMarkers.Count -gt 0) {
    Write-Host "`nFiles Missing Protection Markers:" -ForegroundColor Yellow
    foreach ($file in $missingMarkers) {
        Write-Host "  - $($file.FullName)" -ForegroundColor Yellow
        Write-Host "    Type: $($file.Extension)" -ForegroundColor Gray
    }
}

# Report Unsupported Files
if ($unsupportedFiles.Count -gt 0) {
    Write-Host "`nFiles That Cannot Have Protection Markers:" -ForegroundColor Magenta
    foreach ($file in $unsupportedFiles) {
        Write-Host "  - $($file.FullName)" -ForegroundColor Magenta
        Write-Host "    Type: $($file.Extension) (doesn't support comments)" -ForegroundColor Gray
    }
}

# Report Unrecognized Types
if ($unrecognizedTypes.Count -gt 0) {
    Write-Host "`nFiles with Unrecognized Types:" -ForegroundColor DarkYellow
    foreach ($file in $unrecognizedTypes) {
        Write-Host "  - $($file.FullName)" -ForegroundColor DarkYellow
        Write-Host "    Type: $($file.Extension) (comment style unknown)" -ForegroundColor Gray
    }
}

# Report Protected Files
if ($protectedFiles.Count -gt 0) {
    Write-Host "`nProtected Files:" -ForegroundColor Green
    Write-Host "  Total: $($protectedFiles.Count) files" -ForegroundColor Green
}

# Summary
Write-Host "`n=== Scan Summary ===`n" -ForegroundColor Cyan
Write-Host "Total files scanned: $($missingMarkers.Count + $unsupportedFiles.Count + $protectedFiles.Count + $unrecognizedTypes.Count)" -ForegroundColor White
Write-Host "Missing markers: $($missingMarkers.Count)" -ForegroundColor Yellow
Write-Host "Unsupported files: $($unsupportedFiles.Count)" -ForegroundColor Magenta
Write-Host "Unrecognized types: $($unrecognizedTypes.Count)" -ForegroundColor DarkYellow
Write-Host "Protected files: $($protectedFiles.Count)" -ForegroundColor Green

Write-Host "`n=== Scan Complete ===`n" -ForegroundColor Cyan