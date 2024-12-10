# @ai-protected
# Scan for files missing protection marker
$excludedDirs = @("node_modules", ".git", "bin", "obj")

Write-Host "`n=== Files Missing Protection Marker ===`n" -ForegroundColor Cyan

Get-ChildItem -Recurse -File | 
    Where-Object { $_.FullName -notmatch ($excludedDirs -join '|') } | 
    ForEach-Object {
        $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
        
        if ($content -and -not ($content -match "^(?:#|//) @ai-protected")) {
            Write-Host "Missing marker: $($_.FullName)" -ForegroundColor Yellow
            Write-Host "File type: $($_.Extension)" -ForegroundColor Gray
        }
    }

Write-Host "`n=== Scan Complete ===`n" -ForegroundColor Cyan