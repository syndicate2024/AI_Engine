# @ai-protected
# AI Usage Visualization and Integration Script
# Combines token tracking and expense tracking with visualizations

# Configuration
$CONFIG = @{
    TokenLogPath = "..\docs\token-log.json"
    ExpenseLogPath = "..\docs\expense-log.json"
    ChartWidth = 50
    ChartSymbol = "█"
    Colors = @{
        GPT4 = "Cyan"
        GPT35 = "Green"
        Claude = "Magenta"
    }
}

# Helper function to create ASCII bar chart
function New-ASCIIBarChart {
    param(
        [Parameter(Mandatory=$true)]
        [decimal[]]$Values,
        
        [Parameter(Mandatory=$true)]
        [string[]]$Labels,
        
        [Parameter(Mandatory=$true)]
        [string[]]$Colors,
        
        [string]$Title,
        [int]$Width = $CONFIG.ChartWidth
    )
    
    Write-Host "`n$Title" -ForegroundColor Yellow
    Write-Host ("=" * ($Title.Length)) -ForegroundColor Yellow
    
    $maxValue = ($Values | Measure-Object -Maximum).Maximum
    if ($maxValue -eq 0) { $maxValue = 1 }
    
    for ($i = 0; $i -lt $Values.Count; $i++) {
        $barLength = [math]::Round(($Values[$i] / $maxValue) * $Width)
        $bar = $CONFIG.ChartSymbol * $barLength
        $label = $Labels[$i].PadRight(15)
        $value = $Values[$i].ToString("F2").PadLeft(10)
        
        Write-Host $label -NoNewline
        Write-Host $bar -ForegroundColor $Colors[$i] -NoNewline
        Write-Host " $value"
    }
    Write-Host ""
}

# Create combined usage report
function Show-CombinedUsageReport {
    param(
        [Parameter(Mandatory=$false)]
        [switch]$Monthly,
        
        [Parameter(Mandatory=$false)]
        [switch]$Detailed
    )
    
    # Load data
    $tokenLog = Get-Content $CONFIG.TokenLogPath | ConvertFrom-Json
    $expenseLog = Get-Content $CONFIG.ExpenseLogPath | ConvertFrom-Json
    
    # Display header
    Write-Host "`nAI Usage Dashboard" -ForegroundColor Cyan
    Write-Host "=================" -ForegroundColor Cyan
    Write-Host "Current Month: $($tokenLog.currentMonth)`n"
    
    # Token Usage Chart
    $models = @("GPT4", "GPT35", "Claude")
    $tokenValues = $models | ForEach-Object { 
        $tokenLog.totalTokens.$_.input + $tokenLog.totalTokens.$_.output 
    }
    $colors = $models | ForEach-Object { $CONFIG.Colors.$_ }
    
    New-ASCIIBarChart -Values $tokenValues -Labels $models -Colors $colors -Title "Token Usage by Model"
    
    # Cost Distribution Chart
    $costValues = $models | ForEach-Object { $tokenLog.totalTokens.$_.cost }
    New-ASCIIBarChart -Values $costValues -Labels $models -Colors $colors -Title "Cost Distribution by Model"
    
    # Expense Categories Chart
    $expenseCategories = $expenseLog.services.PSObject.Properties.Name
    $expenseValues = $expenseCategories | ForEach-Object { $expenseLog.services.$_.spent }
    $expenseColors = @("Cyan", "Green", "Magenta", "Yellow")
    
    New-ASCIIBarChart -Values $expenseValues -Labels $expenseCategories -Colors $expenseColors -Title "Total Expenses by Category"
    
    if ($Monthly) {
        Write-Host "`nMonthly Trends" -ForegroundColor Yellow
        Write-Host "=============="
        
        # Show monthly stats if available
        if ($tokenLog.monthlyStats.Count -gt 0) {
            foreach ($month in $tokenLog.monthlyStats) {
                Write-Host "`nMonth: $($month.month)" -ForegroundColor Cyan
                $monthlyTokens = $models | ForEach-Object { 
                    $month.totalTokens.$_.input + $month.totalTokens.$_.output 
                }
                New-ASCIIBarChart -Values $monthlyTokens -Labels $models -Colors $colors -Title "Token Usage"
            }
        }
    }
    
    if ($Detailed) {
        # Recent Activity
        Write-Host "`nRecent Token Usage:" -ForegroundColor Yellow
        $tokenLog.usage | Select-Object -Last 5 | ForEach-Object {
            Write-Host "$($_.date) - $($_.model): $($_.totalTokens) tokens - $`$($($_.cost).ToString('F4'))" -ForegroundColor $CONFIG.Colors.$($_.model)
        }
        
        Write-Host "`nRecent Expenses:" -ForegroundColor Yellow
        $expenseLog.expenses | Select-Object -Last 5 | ForEach-Object {
            Write-Host "$($_.date) - $($_.service): $`$($_.amount) - $($_.description)"
        }
    }
    
    # Summary
    Write-Host "`nSummary" -ForegroundColor Green
    Write-Host "======="
    $totalTokens = ($tokenValues | Measure-Object -Sum).Sum
    $totalCost = ($costValues | Measure-Object -Sum).Sum
    $totalExpenses = ($expenseValues | Measure-Object -Sum).Sum
    
    Write-Host "Total Tokens Used: $totalTokens"
    Write-Host "Total API Costs: $`$($totalCost.ToString('F4'))"
    Write-Host "Total Expenses: $`$($totalExpenses.ToString('F4'))"
    Write-Host "Monthly Budget: $`$($expenseLog.budget)"
    $remaining = $expenseLog.budget - $totalExpenses
    Write-Host "Remaining Budget: $`$($remaining.ToString('F4'))" -ForegroundColor $(if ($remaining -lt 0) { "Red" } else { "Green" })
}

# Export combined data to Excel-friendly CSV
function Export-CombinedData {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Path
    )
    
    $tokenLog = Get-Content $CONFIG.TokenLogPath | ConvertFrom-Json
    $expenseLog = Get-Content $CONFIG.ExpenseLogPath | ConvertFrom-Json
    
    $exportData = @()
    
    # Combine token and expense data
    $allDates = @($tokenLog.usage.date) + @($expenseLog.expenses.date) | Sort-Object -Unique
    
    foreach ($date in $allDates) {
        $tokenEntry = $tokenLog.usage | Where-Object { $_.date -eq $date }
        $expenseEntry = $expenseLog.expenses | Where-Object { $_.date -eq $date }
        
        $exportData += [PSCustomObject]@{
            Date = $date
            Model = $tokenEntry.model
            InputTokens = $tokenEntry.inputTokens
            OutputTokens = $tokenEntry.outputTokens
            TokenCost = $tokenEntry.cost
            ExpenseCategory = $expenseEntry.service
            ExpenseAmount = $expenseEntry.amount
            Description = if ($tokenEntry) { $tokenEntry.description } else { $expenseEntry.description }
        }
    }
    
    $exportData | Export-Csv -Path $Path -NoTypeInformation
    Write-Host "Combined data exported to: $Path" -ForegroundColor Green
}

# Add integrated usage
function Add-IntegratedUsage {
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
    
    # Add to token tracker
    Add-TokenUsage -Model $Model -InputTokens $InputTokens -OutputTokens $OutputTokens -Description $Description
    
    # Calculate cost and add to expense tracker
    $tokenLog = Get-Content $CONFIG.TokenLogPath | ConvertFrom-Json
    $latestUsage = $tokenLog.usage[-1]
    
    Add-Expense -Service "AI_$Model" -Amount $latestUsage.cost -Description $Description
    
    # Show updated visualization
    Show-CombinedUsageReport -Detailed
}

# Display help
function Show-UsageVisualizerHelp {
    Write-Host "`nAI Usage Visualizer" -ForegroundColor Cyan
    Write-Host "Available commands:"
    Write-Host "  Show-CombinedUsageReport [-Monthly] [-Detailed]"
    Write-Host "  Export-CombinedData -Path <string>"
    Write-Host "  Add-IntegratedUsage -Model <model> -InputTokens <int> -OutputTokens <int> -Description <string>"
    Write-Host "`nExample:"
    Write-Host '  Add-IntegratedUsage -Model "GPT4" -InputTokens 100 -OutputTokens 50 -Description "Code generation"'
    Write-Host '  Show-CombinedUsageReport -Monthly -Detailed'
}

# Show help by default
Show-UsageVisualizerHelp 