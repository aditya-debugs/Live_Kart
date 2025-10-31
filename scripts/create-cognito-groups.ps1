# Create Cognito User Groups for LiveKart
# This script creates Customers, Vendors, and Admins groups

param(
    [Parameter(Mandatory=$false)]
    [string]$UserPoolId = "us-east-1_pMr6t5GFA",
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-east-1"
)

Write-Host "🔐 Creating Cognito User Groups for LiveKart" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if AWS CLI is installed
$awsVersion = aws --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ AWS CLI is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ AWS CLI found: $awsVersion" -ForegroundColor Green
Write-Host ""

# Create Customers Group
Write-Host "📦 Creating 'Customers' group..." -ForegroundColor Yellow
$customersResult = aws cognito-idp create-group `
    --group-name "Customers" `
    --user-pool-id $UserPoolId `
    --description "Customer users who can browse and purchase products" `
    --region $Region 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Customers group created" -ForegroundColor Green
} elseif ($customersResult -like "*GroupExistsException*") {
    Write-Host "  ℹ️  Customers group already exists" -ForegroundColor Yellow
} else {
    Write-Host "  ❌ Failed to create Customers group" -ForegroundColor Red
    Write-Host "  Error: $customersResult" -ForegroundColor Red
}

# Create Vendors Group
Write-Host "📦 Creating 'Vendors' group..." -ForegroundColor Yellow
$vendorsResult = aws cognito-idp create-group `
    --group-name "Vendors" `
    --user-pool-id $UserPoolId `
    --description "Vendor users who can list and manage products" `
    --region $Region 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Vendors group created" -ForegroundColor Green
} elseif ($vendorsResult -like "*GroupExistsException*") {
    Write-Host "  ℹ️  Vendors group already exists" -ForegroundColor Yellow
} else {
    Write-Host "  ❌ Failed to create Vendors group" -ForegroundColor Red
    Write-Host "  Error: $vendorsResult" -ForegroundColor Red
}

# Create Admins Group
Write-Host "📦 Creating 'Admins' group..." -ForegroundColor Yellow
$adminsResult = aws cognito-idp create-group `
    --group-name "Admins" `
    --user-pool-id $UserPoolId `
    --description "Administrator users with full system access" `
    --region $Region 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Admins group created" -ForegroundColor Green
} elseif ($adminsResult -like "*GroupExistsException*") {
    Write-Host "  ℹ️  Admins group already exists" -ForegroundColor Yellow
} else {
    Write-Host "  ❌ Failed to create Admins group" -ForegroundColor Red
    Write-Host "  Error: $adminsResult" -ForegroundColor Red
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "✅ User Groups Setup Complete!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Created Groups:" -ForegroundColor White
Write-Host "  • Customers - For browsing and purchasing" -ForegroundColor Cyan
Write-Host "  • Vendors   - For listing products" -ForegroundColor Cyan
Write-Host "  • Admins    - For system administration" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Run create-test-users-with-groups.ps1 to create test users" -ForegroundColor White
Write-Host "2. Or manually assign users to groups using AWS CLI" -ForegroundColor White
Write-Host ""
