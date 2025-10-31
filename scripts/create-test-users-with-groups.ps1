# Create Test Users with Groups for LiveKart
# This script creates test users for Customer, Vendor, and Admin roles

param(
    [Parameter(Mandatory=$false)]
    [string]$UserPoolId = "us-east-1_pMr6t5GFA",
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-east-1"
)

Write-Host "👥 Creating Test Users for LiveKart" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if AWS CLI is installed
$awsVersion = aws --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ AWS CLI is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ AWS CLI found" -ForegroundColor Green
Write-Host ""

# Function to create user
function Create-TestUser {
    param(
        [string]$Username,
        [string]$Email,
        [string]$Password,
        [string]$GroupName,
        [string]$Role
    )
    
    Write-Host "Creating $Role user: $Username..." -ForegroundColor Yellow
    
    # Create user
    $createResult = aws cognito-idp admin-create-user `
        --user-pool-id $UserPoolId `
        --username $Username `
        --user-attributes Name=email,Value=$Email Name=email_verified,Value=true Name=name,Value="$Role User" `
        --temporary-password $Password `
        --message-action SUPPRESS `
        --region $Region 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        if ($createResult -like "*UsernameExistsException*") {
            Write-Host "  ℹ️  User already exists" -ForegroundColor Yellow
        } else {
            Write-Host "  ❌ Failed to create user" -ForegroundColor Red
            Write-Host "  Error: $createResult" -ForegroundColor Red
            return
        }
    } else {
        Write-Host "  ✅ User created" -ForegroundColor Green
    }
    
    # Set permanent password
    aws cognito-idp admin-set-user-password `
        --user-pool-id $UserPoolId `
        --username $Username `
        --password $Password `
        --permanent `
        --region $Region | Out-Null
    
    Write-Host "  ✅ Password set" -ForegroundColor Green
    
    # Add to group
    $groupResult = aws cognito-idp admin-add-user-to-group `
        --user-pool-id $UserPoolId `
        --username $Username `
        --group-name $GroupName `
        --region $Region 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Added to $GroupName group" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Group assignment: $groupResult" -ForegroundColor Yellow
    }
    
    Write-Host ""
}

# Create test users
Create-TestUser -Username "customer1" -Email "customer@livekart.com" -Password "Customer@123" -GroupName "Customers" -Role "Customer"
Create-TestUser -Username "vendor1" -Email "vendor@livekart.com" -Password "Vendor@123" -GroupName "Vendors" -Role "Vendor"
Create-TestUser -Username "admin1" -Email "admin@livekart.com" -Password "Admin@123" -GroupName "Admins" -Role "Admin"

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "✅ Test Users Created Successfully!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test User Credentials:" -ForegroundColor White
Write-Host ""
Write-Host "CUSTOMER:" -ForegroundColor Cyan
Write-Host "  Email: customer@livekart.com" -ForegroundColor White
Write-Host "  Password: Customer@123" -ForegroundColor White
Write-Host "  Access: Browse and purchase products" -ForegroundColor Gray
Write-Host ""
Write-Host "VENDOR:" -ForegroundColor Cyan
Write-Host "  Email: vendor@livekart.com" -ForegroundColor White
Write-Host "  Password: Vendor@123" -ForegroundColor White
Write-Host "  Access: List and manage products" -ForegroundColor Gray
Write-Host ""
Write-Host "ADMIN:" -ForegroundColor Cyan
Write-Host "  Email: admin@livekart.com" -ForegroundColor White
Write-Host "  Password: Admin@123" -ForegroundColor White
Write-Host "  Access: Full system administration" -ForegroundColor Gray
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Start your frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "2. Go to http://localhost:5173/login" -ForegroundColor White
Write-Host "3. Sign in with any of the test credentials above" -ForegroundColor White
Write-Host "4. Test role-based redirection!" -ForegroundColor White
Write-Host ""
