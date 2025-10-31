# Batch Add Users to Groups
# This script reads pending role assignments and adds users to their respective groups

param(
    [string]$UserPoolId = $env:VITE_USER_POOL_ID,
    [string]$Region = "us-east-1"
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Batch Add Users to Cognito Groups" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if User Pool ID is provided
if ([string]::IsNullOrEmpty($UserPoolId)) {
    Write-Host "Error: User Pool ID not found!" -ForegroundColor Red
    Write-Host "Please set VITE_USER_POOL_ID environment variable" -ForegroundColor Yellow
    Write-Host ""
    
    # Try to read from frontend .env file
    $envFile = Join-Path $PSScriptRoot "..\frontend\.env"
    if (Test-Path $envFile) {
        Write-Host "Reading from frontend/.env..." -ForegroundColor Yellow
        $envContent = Get-Content $envFile
        foreach ($line in $envContent) {
            if ($line -match "VITE_USER_POOL_ID=(.+)") {
                $UserPoolId = $matches[1].Trim()
                Write-Host "Found User Pool ID: $UserPoolId" -ForegroundColor Green
                break
            }
        }
    }
    
    if ([string]::IsNullOrEmpty($UserPoolId)) {
        Write-Host "Could not find User Pool ID. Exiting." -ForegroundColor Red
        exit 1
    }
}

Write-Host "User Pool ID: $UserPoolId" -ForegroundColor Green
Write-Host "Region: $Region" -ForegroundColor Green
Write-Host ""

# Prompt for user details
Write-Host "Enter the usernames and roles you want to assign:" -ForegroundColor Yellow
Write-Host "(Leave username blank to finish)" -ForegroundColor Gray
Write-Host ""

$usersToAdd = @()

while ($true) {
    Write-Host "Username: " -ForegroundColor Cyan -NoNewline
    $username = Read-Host
    
    if ([string]::IsNullOrWhiteSpace($username)) {
        break
    }
    
    Write-Host "Role (customer/vendor/admin): " -ForegroundColor Cyan -NoNewline
    $role = Read-Host
    
    if ($role -notin @("customer", "vendor", "admin")) {
        Write-Host "Invalid role! Please use: customer, vendor, or admin" -ForegroundColor Red
        continue
    }
    
    $usersToAdd += @{
        Username = $username.Trim()
        Role = $role.Trim()
    }
    
    Write-Host "Added: $username -> $role" -ForegroundColor Green
    Write-Host ""
}

if ($usersToAdd.Count -eq 0) {
    Write-Host "No users to add. Exiting." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Yellow
Write-Host "Summary: Adding $($usersToAdd.Count) user(s)" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Yellow
foreach ($user in $usersToAdd) {
    Write-Host "  $($user.Username) -> $($user.Role)" -ForegroundColor Gray
}
Write-Host ""

Write-Host "Continue? (Y/N): " -ForegroundColor Yellow -NoNewline
$confirm = Read-Host

if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "Cancelled." -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "Processing..." -ForegroundColor Yellow
Write-Host ""

$successCount = 0
$failCount = 0

foreach ($user in $usersToAdd) {
    Write-Host "Processing: $($user.Username) -> $($user.Role)..." -ForegroundColor Cyan
    
    # Check if group exists, create if not
    $groupCheck = aws cognito-idp get-group `
        --user-pool-id $UserPoolId `
        --group-name $user.Role `
        --region $Region `
        2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Creating group '$($user.Role)'..." -ForegroundColor Yellow
        $createGroup = aws cognito-idp create-group `
            --user-pool-id $UserPoolId `
            --group-name $user.Role `
            --description "$($user.Role) users group" `
            --region $Region `
            2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Group created!" -ForegroundColor Green
        }
    }
    
    # Add user to group
    $addResult = aws cognito-idp admin-add-user-to-group `
        --user-pool-id $UserPoolId `
        --username $user.Username `
        --group-name $user.Role `
        --region $Region `
        2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  SUCCESS: $($user.Username) added to $($user.Role)" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host "  FAILED: $addResult" -ForegroundColor Red
        $failCount++
    }
    Write-Host ""
}

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Results:" -ForegroundColor Cyan
Write-Host "  Success: $successCount" -ForegroundColor Green
Write-Host "  Failed:  $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Gray" })
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

if ($successCount -gt 0) {
    Write-Host "Users can now sign in and will be redirected to their role-based dashboards!" -ForegroundColor Green
}
