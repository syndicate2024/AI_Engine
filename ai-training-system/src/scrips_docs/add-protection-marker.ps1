# @ai-protected

//adds protection marker after searching for files that need .\index.html


# First, let's check and add protection markers where needed
$excludedDirs = @("node_modules", ".git", "bin", "obj")

Get-ChildItem -Recurse -File | 
    Where-Object { $_.FullName -notmatch ($excludedDirs -join '|') } | 
    ForEach-Object {
        Write-Host "`nChecking File: $($_.FullName)"
        $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
        
        if ($content -and -not ($content -match "^(?:#|//) @ai-protected")) {
            Write-Host "Missing protection marker: $($_.FullName)" -ForegroundColor Yellow
            
            $extension = [System.IO.Path]::GetExtension($_.FullName)
            $marker = switch ($extension) {
                { $_ -in ".js", ".ts", ".jsx", ".tsx", ".css" } { "// @ai-protected`n" }
                { $_ -in ".py", ".sh", ".yaml", ".yml" } { "# @ai-protected`n" }
                { $_ -in ".md", ".markdown" } { "# @ai-protected`n" }
                default { "# @ai-protected`n" }
            }
            
            $newContent = $marker + $content
            try {
                $newContent | Set-Content $_.FullName -NoNewline
                Write-Host "Added protection marker to: $($_.FullName)" -ForegroundColor Green
            } catch {
                Write-Host "Failed to add marker to: $($_.FullName)" -ForegroundColor Red
            }
        } else {
            Write-Host "Already has protection marker or is empty" -ForegroundColor Green
        }
    }