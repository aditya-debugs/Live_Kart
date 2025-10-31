# Script to assign a user to a Cognito group
# This will fix the role detection issue

$UserPoolId = "us-east-1_pMr6t5GFA"
$Region = "us-east-1"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Assign User to Cognito Group" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Get username
Write-Host "Enter the username (email) of the user:" -ForegroundColor Yellow
$Username = Read-Host

# Display available groups
Write-Host "`nAvailable Groups:" -ForegroundColor Green
Write-Host "  1. Customers (for regular shoppers)" -ForegroundColor White
Write-Host "  2. Vendors (for product sellers)" -ForegroundColor White
Write-Host "  3. Admins (for administrators)" -ForegroundColor White
Write-Host ""

# Get group selection
Write-Host "Enter the number of the group (1-3):" -ForegroundColor Yellow
$Selection = Read-Host

# Map selection to group name
$GroupName = switch ($Selection) {
    "1" { "Customers" }
    "2" { "Vendors" }
    "3" { "Admins" }
    default { 
        Write-Host "Invalid selection. Exiting." -ForegroundColor Red
        exit 1
    }
}

Write-Host "`nAttempting to add user '$Username' to group '$GroupName'..." -ForegroundColor Yellow

try {
    # Try using AWS CLI
    $command = "aws cognito-idp admin-add-user-to-group --user-pool-id $UserPoolId --username `"$Username`" --group-name $GroupName --region $Region"
    
    Invoke-Expression $command
    
    Write-Host "`n✅ SUCCESS! User '$Username' has been added to the '$GroupName' group!" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: The user must SIGN OUT and SIGN IN AGAIN for the role change to take effect!" -ForegroundColor Yellow
    Write-Host "The new role will be in their JWT token after signing in again." -ForegroundColor Yellow
    
} catch {
    Write-Host "`n❌ ERROR: AWS CLI not found or command failed." -ForegroundColor Red
    Write-Host ""
    Write-Host "MANUAL STEPS (Use AWS Console):" -ForegroundColor Cyan
    Write-Host "1. Go to: https://us-east-1.console.aws.amazon.com/cognito/v2/idp/user-pools/$UserPoolId/users?region=us-east-1" -ForegroundColor White
    Write-Host "2. Click on the user: $Username" -ForegroundColor White
    Write-Host "3. Scroll to 'Group memberships' section" -ForegroundColor White
    Write-Host "4. Click 'Add user to group'" -ForegroundColor White
    Write-Host "5. Select: $GroupName" -ForegroundColor White
    Write-Host "6. Click 'Add'" -ForegroundColor White
    Write-Host "7. User must sign out and sign in again!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
