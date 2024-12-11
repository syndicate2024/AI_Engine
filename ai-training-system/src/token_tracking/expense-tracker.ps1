# @ai-protected
# AI Training System Expense Tracker
# Run this script to track and manage API and resource expenses

# Configuration
$CONFIG = @{
    LogPath = "..\docs\expense-log.json"
    AlertThreshold = 0.8  # Alert at 80% of budget
    DefaultBudget = 100   # Default monthly budget
}

# Ensure the expense log directory exists
$logDir = Split-Path $CONFIG.LogPath -Parent
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force
}

# Initialize or load the expense log
function Initialize-ExpenseLog {
    if (-not (Test-Path $CONFIG.LogPath)) {
        @{
            expenses = @()
            totalSpent = 0
            budget = $CONFIG.DefaultBudget
            currentMonth = (Get-Date).ToString("yyyy-MM")
            services = @{
                "OpenAI" = @{
                    spent = 0
                    tokens = 0
                }
                "Claude" = @{
                    spent = 0
                    tokens = 0
                }
                "Database" = @{
                    spent = 0
                    storage = 0
                }
                "Cache" = @{
                    spent = 0
                    commands = 0
                }
            }
        } | ConvertTo-Json -Depth 10 | Set-Content $CONFIG.LogPath
    }
    return Get-Content $CONFIG.LogPath | ConvertFrom-Json
}

# Add a new expense
function Add-Expense {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Service,
        
        [Parameter(Mandatory=$true)]
        [decimal]$Amount,
        
        [Parameter(Mandatory=$true)]
        [string]$Description,
        
        [Parameter(Mandatory=$false)]
        [int]$Tokens = 0
    )
    
    $log = Initialize-ExpenseLog
    
    # Check if we need to reset for new month
    $currentMonth = (Get-Date).ToString("yyyy-MM")
    if ($log.currentMonth -ne $currentMonth) {
        Write-Host "New month detected. Resetting monthly totals..." -ForegroundColor Yellow
        $log.totalSpent = 0
        $log.currentMonth = $currentMonth
        foreach ($svc in $log.services.PSObject.Properties) {
            $log.services.$($svc.Name).spent = 0
            if ($svc.Name -in @("OpenAI", "Claude")) {
                $log.services.$($svc.Name).tokens = 0
            }
        }
    }
    
    # Add new expense
    $expense = @{
        date = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        service = $Service
        amount = $Amount
        description = $Description
        tokens = $Tokens
    }
    
    $log.expenses += $expense
    $log.totalSpent += $Amount
    $log.services.$Service.spent += $Amount
    
    if ($Service -in @("OpenAI", "Claude")) {
        $log.services.$Service.tokens += $Tokens
    }
    
    # Save updated log
    $log | ConvertTo-Json -Depth 10 | Set-Content $CONFIG.LogPath
    
    # Display status
    $remaining = $log.budget - $log.totalSpent
    Write-Host "`nExpense added successfully!" -ForegroundColor Green
    Write-Host "Service: $Service"
    Write-Host "Amount: $`$Amount"
    Write-Host "Description: $Description"
    if ($Tokens -gt 0) {
        Write-Host "Tokens: $Tokens"
    }
    Write-Host "`nBudget Status:"
    Write-Host "Total Spent: $`$($log.totalSpent)"
    Write-Host "Remaining: $`$remaining"
    
    # Budget alerts
    if ($log.totalSpent -gt ($log.budget * $CONFIG.AlertThreshold)) {
        Write-Host "`nWARNING: Over $($CONFIG.AlertThreshold * 100)% of monthly budget used!" -ForegroundColor Red
    }
}

# Get current month's spending report
function Get-SpendingReport {
    $log = Initialize-ExpenseLog
    
    Write-Host "`nSpending Report for $($log.currentMonth)" -ForegroundColor Cyan
    Write-Host "----------------------------------------"
    Write-Host "Budget: $`$($log.budget)"
    Write-Host "Total Spent: $`$($log.totalSpent)"
    Write-Host "Remaining: $`$($log.budget - $log.totalSpent)"
    Write-Host "`nBy Service:"
    
    foreach ($service in $log.services.PSObject.Properties) {
        Write-Host "`n$($service.Name):"
        Write-Host "  Spent: $`$($service.Value.spent)"
        if ($service.Name -in @("OpenAI", "Claude")) {
            Write-Host "  Tokens Used: $($service.Value.tokens)"
        }
    }
    
    Write-Host "`nRecent Expenses:"
    $log.expenses | Select-Object -Last 5 | ForEach-Object {
        Write-Host "  $($_.date) - $($_.service): $`$($_.amount) - $($_.description)"
    }
}

# Set monthly budget
function Set-MonthlyBudget {
    param(
        [Parameter(Mandatory=$true)]
        [decimal]$Amount
    )
    
    $log = Initialize-ExpenseLog
    $log.budget = $Amount
    $log | ConvertTo-Json -Depth 10 | Set-Content $CONFIG.LogPath
    Write-Host "Monthly budget updated to: $`$Amount" -ForegroundColor Green
}

# Export expenses to CSV
function Export-Expenses {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Path
    )
    
    $log = Initialize-ExpenseLog
    $log.expenses | Export-Csv -Path $Path -NoTypeInformation
    Write-Host "Expenses exported to: $Path" -ForegroundColor Green
}

# Display help
function Show-Help {
    Write-Host "`nAI Training System Expense Tracker" -ForegroundColor Cyan
    Write-Host "Available commands:"
    Write-Host "  Add-Expense -Service <name> -Amount <decimal> -Description <string> [-Tokens <int>]"
    Write-Host "  Get-SpendingReport"
    Write-Host "  Set-MonthlyBudget -Amount <decimal>"
    Write-Host "  Export-Expenses -Path <string>"
    Write-Host "`nExample:"
    Write-Host '  Add-Expense -Service "OpenAI" -Amount 5.50 -Description "GPT-4 API usage" -Tokens 1000'
}

# Initialize on script load
Initialize-ExpenseLog

# Show help by default
Show-Help 