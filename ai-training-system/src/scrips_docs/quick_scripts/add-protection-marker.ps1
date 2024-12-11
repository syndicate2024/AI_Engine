# @ai-protected
# Script to add protection markers to files that support comments

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

Get-ChildItem -Recurse -File | 
    Where-Object { 
        $_.FullName -notmatch ($excludedDirs -join '|') -and 
        $_.Extension -notin $noCommentFiles 
    } | 
    ForEach-Object {
        $file = $_
        Write-Host "`nChecking File: $($file.FullName)" -ForegroundColor Cyan
        
        # Skip binary files and files that don't support comments
        if ($file.Extension -in $noCommentFiles) {
            Write-Host "Skipping file (doesn't support comments): $($file.Name)" -ForegroundColor Yellow
            return
        }
        
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        if (-not $content) {
            Write-Host "Empty or unreadable file: $($file.Name)" -ForegroundColor Yellow
            return
        }

        # Check if file already has any form of protection marker
        $hasMarker = $content -match "@ai-protected"
        if ($hasMarker) {
            Write-Host "Already has protection marker: $($file.Name)" -ForegroundColor Green
            return
        }

        # Get appropriate comment style
        $marker = $commentStyles[$file.Extension]
        if (-not $marker) {
            Write-Host "Unknown file type (skipping): $($file.Name)" -ForegroundColor Yellow
            return
        }

        try {
            $newContent = "$marker`n$content"
            $newContent | Set-Content $file.FullName -NoNewline
            Write-Host "Added protection marker to: $($file.Name)" -ForegroundColor Green
        } catch {
            Write-Host "Failed to add marker to: $($file.Name)" -ForegroundColor Red
            Write-Host "Error: $_" -ForegroundColor Red
        }
    }

Write-Host "`nProtection marker addition complete!" -ForegroundColor Cyan