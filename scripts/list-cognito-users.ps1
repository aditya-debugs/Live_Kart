# List all users in Cognito User Pool
# This script displays all registered users with their roles and status

$UserPoolId = "us-east-1_pMr6t5GFA"
$Region = "us-east-1"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   COGNITO USER POOL - REGISTERED USERS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

try {
    # Get all users
    $users = aws cognito-idp list-users `
        --user-pool-id $UserPoolId `
        --region $Region `
        --query "Users" `
        --output json | ConvertFrom-Json

    if ($users.Count -eq 0) {
        Write-Host "No users found in the user pool" -ForegroundColor Yellow
        exit
    }

    Write-Host "Found $($users.Count) user(s)" -ForegroundColor Green
    Write-Host ""
    Write-Host "------------------------------------------------------------" -ForegroundColor Gray

    foreach ($user in $users) {
        $username = $user.Username
        $status = $user.UserStatus
        $createdDate = $user.UserCreateDate
        
        # Extract attributes
        $email = ($user.Attributes | Where-Object { $_.Name -eq "email" }).Value
        $emailVerified = ($user.Attributes | Where-Object { $_.Name -eq "email_verified" }).Value
        $customRole = ($user.Attributes | Where-Object { $_.Name -eq "custom:role" }).Value

        # Get user groups
        $groups = aws cognito-idp admin-list-groups-for-user `
            --user-pool-id $UserPoolId `
            --username $username `
            --region $Region `
            --query "Groups[].GroupName" `
            --output json | ConvertFrom-Json

        # Display user info
        Write-Host ""
        Write-Host "Username: $username" -ForegroundColor White
        Write-Host "   Email: $email" -ForegroundColor Gray
        Write-Host "   Email Verified: $emailVerified" -ForegroundColor Gray
        Write-Host "   Created: $createdDate" -ForegroundColor Gray
        Write-Host "   Status: $status" -ForegroundColor $(if ($status -eq "CONFIRMED") { "Green" } else { "Yellow" })
        
        if ($customRole) {
            Write-Host "   Role (custom:role): $customRole" -ForegroundColor Cyan
        } else {
            Write-Host "   Role (custom:role): Not set" -ForegroundColor DarkGray
        }

        if ($groups -and $groups.Count -gt 0) {
            Write-Host "   Groups: $($groups -join ', ')" -ForegroundColor Magenta
        } else {
            Write-Host "   Groups: None" -ForegroundColor DarkGray
        }
        
        Write-Host "   ------------------------------------------------------------" -ForegroundColor DarkGray
    }

    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "Total Users: $($users.Count)" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Cyan

} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure AWS CLI is configured with valid credentials:" -ForegroundColor Yellow
    Write-Host "   Run: aws configure" -ForegroundColor Yellow
}
