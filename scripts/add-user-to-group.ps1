# Add User to Cognito Group Script
# Usage: .\add-user-to-group.ps1 -Username "john_doe" -GroupName "vendor"

param(
    [Parameter(Mandatory=$true)]
    [string]$Username,
    
    [Parameter(Mandatory=$true)]
    [ValidateSet("customer", "vendor", "admin")]
    [string]$GroupName,
    
    [string]$UserPoolId = $env:VITE_USER_POOL_ID,
    [string]$Region = "us-east-1"
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Add User to Cognito Group" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if User Pool ID is provided
if ([string]::IsNullOrEmpty($UserPoolId)) {
    Write-Host "Error: User Pool ID not found!" -ForegroundColor Red
    Write-Host "Please set VITE_USER_POOL_ID environment variable or provide -UserPoolId parameter" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Example:" -ForegroundColor Yellow
    Write-Host "  .\add-user-to-group.ps1 -Username 'john_doe' -GroupName 'vendor' -UserPoolId 'us-east-1_xxxxxxxxx'" -ForegroundColor Gray
    exit 1
}

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  User Pool ID: $UserPoolId" -ForegroundColor Gray
Write-Host "  Username:     $Username" -ForegroundColor Gray
Write-Host "  Group:        $GroupName" -ForegroundColor Gray
Write-Host "  Region:       $Region" -ForegroundColor Gray
Write-Host ""

# Check if AWS CLI is installed
$awsVersion = aws --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: AWS CLI is not installed!" -ForegroundColor Red
    Write-Host "Please install AWS CLI: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}

Write-Host "AWS CLI Version: $awsVersion" -ForegroundColor Green
Write-Host ""

# Check if user exists
Write-Host "Checking if user exists..." -ForegroundColor Yellow
$userCheck = aws cognito-idp admin-get-user `
    --user-pool-id $UserPoolId `
    --username $Username `
    --region $Region `
    2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: User '$Username' not found in User Pool!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  1. Username might be incorrect (check exact spelling)" -ForegroundColor Gray
    Write-Host "  2. User hasn't confirmed their email yet" -ForegroundColor Gray
    Write-Host "  3. User Pool ID is incorrect" -ForegroundColor Gray
    exit 1
}

Write-Host "User found!" -ForegroundColor Green
Write-Host ""

# Check if group exists
Write-Host "Checking if group '$GroupName' exists..." -ForegroundColor Yellow
$groupCheck = aws cognito-idp get-group `
    --user-pool-id $UserPoolId `
    --group-name $GroupName `
    --region $Region `
    2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: Group '$GroupName' does not exist. Creating it now..." -ForegroundColor Yellow
    
    # Create the group
    $createGroup = aws cognito-idp create-group `
        --user-pool-id $UserPoolId `
        --group-name $GroupName `
        --description "$GroupName users group" `
        --region $Region `
        2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to create group!" -ForegroundColor Red
        Write-Host $createGroup -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Group created successfully!" -ForegroundColor Green
} else {
    Write-Host "Group exists!" -ForegroundColor Green
}
Write-Host ""

# Add user to group
Write-Host "Adding user '$Username' to group '$GroupName'..." -ForegroundColor Yellow
$addToGroup = aws cognito-idp admin-add-user-to-group `
    --user-pool-id $UserPoolId `
    --username $Username `
    --group-name $GroupName `
    --region $Region `
    2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to add user to group!" -ForegroundColor Red
    Write-Host $addToGroup -ForegroundColor Red
    
    # Check if user is already in the group
    if ($addToGroup -like "*already exists*") {
        Write-Host "Note: User is already in this group." -ForegroundColor Yellow
    }
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "   SUCCESS!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "User '$Username' has been added to the '$GroupName' group!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. User can now sign in with their credentials" -ForegroundColor Gray
Write-Host "  2. They will be redirected to the correct dashboard:" -ForegroundColor Gray
Write-Host "     - customer -> /customer (CustomerHome)" -ForegroundColor Gray
Write-Host "     - vendor   -> /vendor (VendorDashboard)" -ForegroundColor Gray
Write-Host "     - admin    -> /admin (AdminOverview)" -ForegroundColor Gray
Write-Host ""
