# Create Test Users for LiveKart
# Creates three test users: admin, vendor, and customer

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "Creating LiveKart Test Users..." -ForegroundColor Cyan
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

# Function to create a user
function Create-CognitoUser {
    param(
        [string]$Email,
        [string]$Password,
        [string]$Name,
        [string]$Group
    )
    
    Write-Host "Creating $Group user: $Email" -ForegroundColor Yellow
    
    # Check if user already exists
    try {
        $existingUser = aws cognito-idp admin-get-user `
            --user-pool-id $USER_POOL_ID `
            --username $Email `
            --region us-east-1 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ⚠️  User '$Email' already exists" -ForegroundColor Yellow
            
            # Update password for existing user
            Write-Host "  → Updating password..." -ForegroundColor Gray
            aws cognito-idp admin-set-user-password `
                --user-pool-id $USER_POOL_ID `
                --username $Email `
                --password $Password `
                --permanent `
                --region us-east-1 | Out-Null
            
            # Make sure user is in correct group
            Write-Host "  → Verifying group membership..." -ForegroundColor Gray
            aws cognito-idp admin-add-user-to-group `
                --user-pool-id $USER_POOL_ID `
                --username $Email `
                --group-name $Group `
                --region us-east-1 2>$null
            
            Write-Host "  ✓ Updated user: $Email" -ForegroundColor Green
            return
        }
        
    } catch {
        # User doesn't exist, continue to create
    }
    
    # Create new user
    try {
        # Create user with verified email
        aws cognito-idp admin-create-user `
            --user-pool-id $USER_POOL_ID `
            --username $Email `
            --user-attributes Name=email,Value=$Email Name=email_verified,Value=true Name=name,Value=$Name `
            --message-action SUPPRESS `
            --region us-east-1 | Out-Null
        
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to create user"
        }
        
        Write-Host "  → User created" -ForegroundColor Gray
        
        # Set permanent password (no need to change on first login)
        aws cognito-idp admin-set-user-password `
            --user-pool-id $USER_POOL_ID `
            --username $Email `
            --password $Password `
            --permanent `
            --region us-east-1 | Out-Null
        
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to set password"
        }
        
        Write-Host "  → Password set" -ForegroundColor Gray
        
        # Add user to group
        aws cognito-idp admin-add-user-to-group `
            --user-pool-id $USER_POOL_ID `
            --username $Email `
            --group-name $Group `
            --region us-east-1 | Out-Null
        
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to add to group"
        }
        
        Write-Host "  → Added to $Group group" -ForegroundColor Gray
        Write-Host "  ✓ Created user: $Email (password: $Password)" -ForegroundColor Green
        
    } catch {
        Write-Host "  ✗ Failed to create user: $Email" -ForegroundColor Red
        Write-Host "  Error: $_" -ForegroundColor Red
    }
}

# Create test users
Write-Host "Creating test users..." -ForegroundColor Cyan
Write-Host ""

Create-CognitoUser -Email "admin@livekart.com" -Password "Admin123!" -Name "Admin User" -Group "admins"
Write-Host ""

Create-CognitoUser -Email "vendor@livekart.com" -Password "Vendor123!" -Name "Vendor User" -Group "vendors"
Write-Host ""

Create-CognitoUser -Email "customer@livekart.com" -Password "Customer123!" -Name "Customer User" -Group "customers"
Write-Host ""

# Display summary
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║       Test Users Created! 🎉              ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "🔐 Login Credentials:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "  👨‍💼 Admin:" -ForegroundColor Yellow
Write-Host "     Email: admin@livekart.com" -ForegroundColor White
Write-Host "     Password: Admin123!" -ForegroundColor White
Write-Host "     Access: Full platform administration" -ForegroundColor Gray
Write-Host ""
Write-Host "  🏪 Vendor:" -ForegroundColor Yellow
Write-Host "     Email: vendor@livekart.com" -ForegroundColor White
Write-Host "     Password: Vendor123!" -ForegroundColor White
Write-Host "     Access: Product management, inventory, orders" -ForegroundColor Gray
Write-Host ""
Write-Host "  🛒 Customer:" -ForegroundColor Yellow
Write-Host "     Email: customer@livekart.com" -ForegroundColor White
Write-Host "     Password: Customer123!" -ForegroundColor White
Write-Host "     Access: Browse products, add to cart, checkout" -ForegroundColor Gray
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# List all users
Write-Host ""
Write-Host "📋 All Users in Pool:" -ForegroundColor Cyan
try {
    $users = aws cognito-idp list-users `
        --user-pool-id $USER_POOL_ID `
        --region us-east-1 `
        --query "Users[*].[Username,Attributes[?Name=='name'].Value|[0],UserStatus]" `
        --output text
    
    if ($users) {
        $users -split "`n" | ForEach-Object {
            $parts = $_ -split "`t"
            if ($parts.Length -eq 3) {
                Write-Host "  • " -NoNewline -ForegroundColor Yellow
                Write-Host "$($parts[0])" -NoNewline -ForegroundColor White
                Write-Host " ($($parts[1])) - " -NoNewline -ForegroundColor Gray
                Write-Host "$($parts[2])" -ForegroundColor Green
            }
        }
    }
} catch {
    Write-Host "  Could not list users" -ForegroundColor Red
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "  1️⃣  Install frontend dependencies:" -ForegroundColor Yellow
Write-Host "     cd frontend" -ForegroundColor White
Write-Host "     npm install" -ForegroundColor White
Write-Host ""
Write-Host "  2️⃣  Start the application:" -ForegroundColor Yellow
Write-Host "     npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "  3️⃣  Open browser:" -ForegroundColor Yellow
Write-Host "     http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "  4️⃣  Login with any test account above!" -ForegroundColor Yellow
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

Write-Host "💡 Tips:" -ForegroundColor Cyan
Write-Host "  • Each user has different permissions based on their group" -ForegroundColor White
Write-Host "  • You can create more users through the application" -ForegroundColor White
Write-Host "  • Check AWS Cognito Console to manage users" -ForegroundColor White
Write-Host ""
