# AI Training System - Billing & Resource Management

## Required Resources

### 1. Language Models (Paid)

#### OpenAI Options
- **GPT-4 Turbo (gpt-4-1106-preview)**
  - Input: $0.01/1K tokens
  - Output: $0.03/1K tokens
  - Best for: Complex reasoning, advanced coding
  - URL: https://platform.openai.com/api-keys
  - Current Key: `sk-...` (store in password manager)

#### Anthropic Claude Options
- **Claude 3 Sonnet**
  - ~$15/million tokens
  - Better context handling
  - URL: https://console.anthropic.com/
  - Current Key: `sk-ant-...` (store in password manager)

#### Model Comparison
- GPT-4: Better at coding, more precise
- Claude: Better at long-form content, cheaper for large tasks
- Recommendation: Use both based on task type

### 2. Database (Free Options)

#### Local Development
- **PostgreSQL**
  - Cost: Free
  - Download: https://www.postgresql.org/download/
  - Current Config: Local instance

#### Cloud Options (Free Tiers)
- **Supabase**
  - Free Tier: 500MB, 2 databases
  - URL: https://supabase.com/pricing
  - Project ID: (Add when created)

- **Railway**
  - Free Tier: $5 credit
  - URL: https://railway.app/pricing
  - Project ID: (Add when created)

### 3. Caching (Free Options)

#### Local Development
- **Redis**
  - Cost: Free
  - Download: https://redis.io/download
  - Current Config: Local instance

#### Cloud Options
- **Upstash**
  - Free Tier: 10,000 commands/day
  - URL: https://upstash.com/pricing
  - Database ID: (Add when created)

### 4. Monitoring (Free Tiers)

- **Sentry**
  - Free: 5k errors/month
  - URL: https://sentry.io/pricing/
  - Project ID: (Add when created)

## Cost Tracking

### Monthly Budget Template
\`\`\`
Month: [Current Month]

1. API Costs
   - OpenAI: $0.00 / $[Budget]
   - Claude: $0.00 / $[Budget]
   
2. Database
   - Current Tier: Free
   - Usage: 0MB / 500MB
   
3. Caching
   - Current Tier: Free
   - Commands: 0 / 10,000
   
4. Monitoring
   - Current Tier: Free
   - Errors: 0 / 5,000

Total Spent: $0.00
Budget Remaining: $[Total Budget]
\`\`\`

## Cost Control Measures

### 1. API Usage Optimization
- Use GPT-3.5 for simple tasks
- Cache common responses
- Implement rate limiting
- Monitor token usage

### 2. Database Optimization
- Regular cleanup of unused data
- Index optimization
- Compression when possible

### 3. Monitoring
- Set up alerts for:
  - API cost thresholds
  - Database size limits
  - Error rate spikes
  - Cache usage peaks

## Expense Tracker Script

Create a PowerShell script to track expenses:

\`\`\`powershell
# expense-tracker.ps1
$expenseLog = "docs/expense-log.json"

# Create expense log if it doesn't exist
if (-not (Test-Path $expenseLog)) {
    @{
        expenses = @()
        totalSpent = 0
        budget = 100  # Set your monthly budget
        currentMonth = (Get-Date).ToString("yyyy-MM")
    } | ConvertTo-Json | Set-Content $expenseLog
}

function Add-Expense {
    param(
        [string]$service,
        [decimal]$amount,
        [string]$description
    )
    
    $log = Get-Content $expenseLog | ConvertFrom-Json
    
    # Add new expense
    $expense = @{
        date = (Get-Date).ToString("yyyy-MM-dd")
        service = $service
        amount = $amount
        description = $description
    }
    
    $log.expenses += $expense
    $log.totalSpent += $amount
    
    # Save updated log
    $log | ConvertTo-Json | Set-Content $expenseLog
    
    # Check budget
    $remaining = $log.budget - $log.totalSpent
    Write-Host "Expense added. Budget remaining: $$remaining"
    
    # Alert if over 80% of budget
    if ($log.totalSpent -gt ($log.budget * 0.8)) {
        Write-Host "WARNING: Over 80% of monthly budget used!" -ForegroundColor Red
    }
}

# Example usage:
# Add-Expense -service "OpenAI" -amount 5.50 -description "GPT-4 API usage"
\`\`\`

## API Key Management

Create a secure key management script:

\`\`\`powershell
# key-manager.ps1
$keyStore = "config/secure/api-keys.json"

# Initialize secure key store
if (-not (Test-Path $keyStore)) {
    @{
        keys = @{}
        lastUpdated = (Get-Date).ToString("yyyy-MM-dd")
    } | ConvertTo-Json | Set-Content $keyStore
}

function Set-APIKey {
    param(
        [string]$service,
        [string]$key,
        [string]$environment = "development"
    )
    
    $store = Get-Content $keyStore | ConvertFrom-Json
    
    # Store key with environment
    if (-not $store.keys.$service) {
        $store.keys | Add-Member -Name $service -Value @{} -MemberType NoteProperty
    }
    $store.keys.$service.$environment = $key
    $store.lastUpdated = (Get-Date).ToString("yyyy-MM-dd")
    
    # Save updated store
    $store | ConvertTo-Json | Set-Content $keyStore
    Write-Host "API key updated for $service in $environment environment"
}

# Example usage:
# Set-APIKey -service "OpenAI" -key "sk-..." -environment "development"
\`\`\`

## Monthly Maintenance Checklist

1. Review API Usage
   - [ ] Check OpenAI dashboard
   - [ ] Check Claude dashboard
   - [ ] Update expense tracker
   - [ ] Optimize high-cost areas

2. Database Maintenance
   - [ ] Check storage usage
   - [ ] Run cleanup scripts
   - [ ] Verify backups
   - [ ] Update connection strings if needed

3. Security
   - [ ] Rotate API keys
   - [ ] Check access logs
   - [ ] Update environment variables
   - [ ] Verify rate limits

4. Documentation
   - [ ] Update billing doc
   - [ ] Record any price changes
   - [ ] Update budget if needed
   - [ ] Document optimization findings
\`\`\` 