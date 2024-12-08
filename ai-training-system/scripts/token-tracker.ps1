# AI Token Usage Tracker
# Tracks and analyzes token usage across different AI models

# Configuration
$CONFIG = @{
    LogPath = "..\docs\token-log.json"
    CostPerToken = @{
        "GPT4-Input" = 0.01    # Cost per 1K tokens
        "GPT4-Output" = 0.03   # Cost per 1K tokens
        "GPT35-Input" = 0.001  # Cost per 1K tokens
        "GPT35-Output" = 0.002 # Cost per 1K tokens
        "Claude-Input" = 0.008  # Cost per 1K tokens
        "Claude-Output" = 0.024 # Cost per 1K tokens
    }
    AlertThreshold = 100000    # Alert when monthly tokens exceed this
}

# Ensure log directory exists
$logDir = Split-Path $CONFIG.LogPath -Parent
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force
}

# Initialize or load token log
function Initialize-TokenLog {
    if (-not (Test-Path $CONFIG.LogPath)) {
        @{
            totalTokens = @{
                "GPT4" = @{
                    input = 0
                    output = 0
                    cost = 0
                }
                "GPT35" = @{
                    input = 0
                    output = 0
                    cost = 0
                }
                "Claude" = @{
                    input = 0
                    output = 0
                    cost = 0
                }
            }
            currentMonth = (Get-Date).ToString("yyyy-MM")
            usage = @()
            monthlyStats = @()
        } | ConvertTo-Json -Depth 10 | Set-Content $CONFIG.LogPath
    }
    return Get-Content $CONFIG.LogPath | ConvertFrom-Json
}

# Calculate cost for tokens
function Calculate-TokenCost {
    param(
        [string]$Model,
        [int]$InputTokens,
        [int]$OutputTokens
    )
    
    $inputCost = 0
    $outputCost = 0
    
    switch ($Model) {
        "GPT4" {
            $inputCost = ($InputTokens / 1000) * $CONFIG.CostPerToken["GPT4-Input"]
            $outputCost = ($OutputTokens / 1000) * $CONFIG.CostPerToken["GPT4-Output"]
        }
        "GPT35" {
            $inputCost = ($InputTokens / 1000) * $CONFIG.CostPerToken["GPT35-Input"]
            $outputCost = ($OutputTokens / 1000) * $CONFIG.CostPerToken["GPT35-Output"]
        }
        "Claude" {
            $inputCost = ($InputTokens / 1000) * $CONFIG.CostPerToken["Claude-Input"]
            $outputCost = ($OutputTokens / 1000) * $CONFIG.CostPerToken["Claude-Output"]
        }
    }
    
    return $inputCost + $outputCost
}

# Add token usage
function Add-TokenUsage {
    param(
        [Parameter(Mandatory=$true)]
        [ValidateSet("GPT4", "GPT35", "Claude")]
        [string]$Model,
        
        [Parameter(Mandatory=$true)]
        [int]$InputTokens,
        
        [Parameter(Mandatory=$true)]
        [int]$OutputTokens,
        
        [Parameter(Mandatory=$true)]
        [string]$Description
    )
    
    $log = Initialize-TokenLog
    
    # Check for new month
    $currentMonth = (Get-Date).ToString("yyyy-MM")
    if ($log.currentMonth -ne $currentMonth) {
        # Save monthly stats before reset
        $monthlyStats = @{
            month = $log.currentMonth
            totalTokens = $log.totalTokens
        }
        $log.monthlyStats += $monthlyStats
        
        # Reset monthly counters
        $log.currentMonth = $currentMonth
        $log.totalTokens.GPT4.input = 0
        $log.totalTokens.GPT4.output = 0
        $log.totalTokens.GPT4.cost = 0
        $log.totalTokens.GPT35.input = 0
        $log.totalTokens.GPT35.output = 0
        $log.totalTokens.GPT35.cost = 0
        $log.totalTokens.Claude.input = 0
        $log.totalTokens.Claude.output = 0
        $log.totalTokens.Claude.cost = 0
    }
    
    # Calculate cost
    $cost = Calculate-TokenCost -Model $Model -InputTokens $InputTokens -OutputTokens $OutputTokens
    
    # Add usage
    $usage = @{
        date = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        model = $Model
        inputTokens = $InputTokens
        outputTokens = $OutputTokens
        totalTokens = $InputTokens + $OutputTokens
        cost = $cost
        description = $Description
    }
    
    $log.usage += $usage
    
    # Update totals
    $log.totalTokens.$Model.input += $InputTokens
    $log.totalTokens.$Model.output += $OutputTokens
    $log.totalTokens.$Model.cost += $cost
    
    # Save updated log
    $log | ConvertTo-Json -Depth 10 | Set-Content $CONFIG.LogPath
    
    # Display usage
    Write-Host "`nToken Usage Added:" -ForegroundColor Green
    Write-Host "Model: $Model"
    Write-Host "Input Tokens: $InputTokens"
    Write-Host "Output Tokens: $OutputTokens"
    Write-Host "Cost: $`$($cost.ToString('F4'))"
    
    # Check threshold
    $totalMonthlyTokens = $log.totalTokens.$Model.input + $log.totalTokens.$Model.output
    if ($totalMonthlyTokens -gt $CONFIG.AlertThreshold) {
        Write-Host "`nWARNING: Monthly token usage for $Model exceeds threshold!" -ForegroundColor Red
        Write-Host "Current Usage: $totalMonthlyTokens tokens" -ForegroundColor Yellow
    }
}

# Get usage report
function Get-TokenReport {
    param(
        [Parameter(Mandatory=$false)]
        [ValidateSet("GPT4", "GPT35", "Claude", "All")]
        [string]$Model = "All",
        
        [Parameter(Mandatory=$false)]
        [switch]$Detailed
    )
    
    $log = Initialize-TokenLog
    
    Write-Host "`nToken Usage Report for $($log.currentMonth)" -ForegroundColor Cyan
    Write-Host "----------------------------------------"
    
    $models = if ($Model -eq "All") { @("GPT4", "GPT35", "Claude") } else { @($Model) }
    
    foreach ($m in $models) {
        Write-Host "`n$m Usage:"
        Write-Host "  Input Tokens: $($log.totalTokens.$m.input)"
        Write-Host "  Output Tokens: $($log.totalTokens.$m.output)"
        Write-Host "  Total Cost: $`$($($log.totalTokens.$m.cost).ToString('F4'))"
        
        if ($Detailed) {
            Write-Host "`n  Recent Usage:"
            $log.usage | Where-Object { $_.model -eq $m } | Select-Object -Last 5 | ForEach-Object {
                Write-Host "    $($_.date) - $($_.totalTokens) tokens - $`$($($_.cost).ToString('F4')) - $($_.description)"
            }
        }
    }
    
    if ($Model -eq "All") {
        $totalCost = ($models | ForEach-Object { $log.totalTokens.$_.cost } | Measure-Object -Sum).Sum
        Write-Host "`nTotal Cost Across All Models: $`$($totalCost.ToString('F4'))" -ForegroundColor Green
    }
}

# Export usage data to CSV
function Export-TokenUsage {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Path
    )
    
    $log = Initialize-TokenLog
    $log.usage | Export-Csv -Path $Path -NoTypeInformation
    Write-Host "Token usage exported to: $Path" -ForegroundColor Green
}

# Get historical monthly stats
function Get-MonthlyStats {
    $log = Initialize-TokenLog
    
    Write-Host "`nHistorical Monthly Statistics" -ForegroundColor Cyan
    Write-Host "----------------------------------------"
    
    foreach ($month in $log.monthlyStats) {
        Write-Host "`nMonth: $($month.month)"
        foreach ($model in @("GPT4", "GPT35", "Claude")) {
            Write-Host "  $model:"
            Write-Host "    Total Tokens: $($month.totalTokens.$model.input + $month.totalTokens.$model.output)"
            Write-Host "    Total Cost: $`$($($month.totalTokens.$model.cost).ToString('F4'))"
        }
    }
}

# Display help
function Show-TokenHelp {
    Write-Host "`nAI Token Usage Tracker" -ForegroundColor Cyan
    Write-Host "Available commands:"
    Write-Host "  Add-TokenUsage -Model <model> -InputTokens <int> -OutputTokens <int> -Description <string>"
    Write-Host "  Get-TokenReport [-Model <model>] [-Detailed]"
    Write-Host "  Export-TokenUsage -Path <string>"
    Write-Host "  Get-MonthlyStats"
    Write-Host "`nExample:"
    Write-Host '  Add-TokenUsage -Model "GPT4" -InputTokens 100 -OutputTokens 50 -Description "Code generation"'
}

# Initialize on script load
Initialize-TokenLog

# Show help by default
Show-TokenHelp 