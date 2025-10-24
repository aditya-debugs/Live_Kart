# Create Cognito User Groups for LiveKart
# This script creates three user groups: customers, vendors, and admins

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "Creating LiveKart Cognito User Groups..." -ForegroundColor Cyan
Write-Host ""

# Get User Pool ID from CloudFormation stack
try {
    $USER_POOL_ID = aws cloudformation describe-stacks `
        --stack-name livekart-production `
        --region us-east-1 `
        --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" `
        --output text
    
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($USER_POOL_ID)) {
        throw "Could not retrieve User Pool ID"
    }
    
    Write-Host "✓ Found User Pool: $USER_POOL_ID" -ForegroundColor Green
    Write-Host ""
    
} catch {
    Write-Host "✗ Error: Could not find User Pool ID" -ForegroundColor Red
    Write-Host "  Make sure the CloudFormation stack is deployed" -ForegroundColor Yellow
    Write-Host "  Run: .\deploy.ps1" -ForegroundColor Yellow
    exit 1
}

# Function to create a group
function Create-CognitoGroup {
    param(
        [string]$GroupName,
        [string]$Description
    )
    
    Write-Host "Creating group: $GroupName" -ForegroundColor Yellow
    
    try {
        # Check if group already exists
        $existingGroup = aws cognito-idp get-group `
            --user-pool-id $USER_POOL_ID `
            --group-name $GroupName `
            --region us-east-1 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ⚠️  Group '$GroupName' already exists - skipping" -ForegroundColor Yellow
            return
        }
        
    } catch {
        # Group doesn't exist, continue to create
    }
    
    # Create the group
    try {
        aws cognito-idp create-group `
            --user-pool-id $USER_POOL_ID `
            --group-name $GroupName `
            --description $Description `
            --region us-east-1 | Out-Null
        
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to create group"
        }
        
        Write-Host "  ✓ Created group: $GroupName" -ForegroundColor Green
        
    } catch {
        Write-Host "  ✗ Failed to create group: $GroupName" -ForegroundColor Red
        Write-Host "  Error: $_" -ForegroundColor Red
    }
}

# Create all three groups
Create-CognitoGroup -GroupName "customers" -Description "Regular customers who can browse and purchase products"
Create-CognitoGroup -GroupName "vendors" -Description "Product vendors who can manage their product listings"
Create-CognitoGroup -GroupName "admins" -Description "Platform administrators with full access"

# List all groups
Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║      User Groups Created! 🎉              ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Groups in User Pool:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

try {
    $groups = aws cognito-idp list-groups `
        --user-pool-id $USER_POOL_ID `
        --region us-east-1 `
        --query "Groups[*].[GroupName,Description]" `
        --output text
    
    if ($groups) {
        $groups -split "`n" | ForEach-Object {
            $parts = $_ -split "`t"
            if ($parts.Length -eq 2) {
                Write-Host "  • " -NoNewline -ForegroundColor Yellow
                Write-Host "$($parts[0])" -NoNewline -ForegroundColor White
                Write-Host " - $($parts[1])" -ForegroundColor Gray
            }
        }
    }
} catch {
    Write-Host "  Could not list groups" -ForegroundColor Red
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

Write-Host "📋 Next Step:" -ForegroundColor Cyan
Write-Host "  Create test users with:" -ForegroundColor White
Write-Host "  powershell -ExecutionPolicy Bypass -File scripts/create-test-users.ps1" -ForegroundColor Yellow
Write-Host ""
