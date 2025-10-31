# Create Cognito User Groups for LiveKart
param(
    [string]$UserPoolId = "us-east-1_pMr6t5GFA",
    [string]$Region = "us-east-1"
)

Write-Host "Creating Cognito User Groups..." -ForegroundColor Cyan

# Create Customers Group
Write-Host "Creating 'Customers' group..." -ForegroundColor Yellow
aws cognito-idp create-group --group-name "Customers" --user-pool-id $UserPoolId --description "Customer users" --region $Region 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Customers group created" -ForegroundColor Green
} else {
    Write-Host "  Customers group already exists or error occurred" -ForegroundColor Yellow
}

# Create Vendors Group
Write-Host "Creating 'Vendors' group..." -ForegroundColor Yellow
aws cognito-idp create-group --group-name "Vendors" --user-pool-id $UserPoolId --description "Vendor users" --region $Region 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Vendors group created" -ForegroundColor Green
} else {
    Write-Host "  Vendors group already exists or error occurred" -ForegroundColor Yellow
}

# Create Admins Group
Write-Host "Creating 'Admins' group..." -ForegroundColor Yellow
aws cognito-idp create-group --group-name "Admins" --user-pool-id $UserPoolId --description "Admin users" --region $Region 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Admins group created" -ForegroundColor Green
} else {
    Write-Host "  Admins group already exists or error occurred" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "User Groups Setup Complete!" -ForegroundColor Green
Write-Host "Next: Run create-test-users-with-groups.ps1" -ForegroundColor Yellow
