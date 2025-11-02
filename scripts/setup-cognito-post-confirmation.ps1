# PowerShell Script to Configure Cognito Post-Confirmation Trigger
# This script sets up automatic user creation in DynamoDB after signup

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Cognito Post-Confirmation Trigger Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$Region = "us-east-1"
$UserPoolId = "us-east-1_pMr6t5GFA"  # Your Cognito User Pool ID
$LambdaFunctionName = "livekart-post-confirmation-trigger"
$UsersTableName = "livekart-users"

Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "   Region: $Region"
Write-Host "   User Pool ID: $UserPoolId"
Write-Host "   Lambda Function: $LambdaFunctionName"
Write-Host "   DynamoDB Table: $UsersTableName"
Write-Host ""

# Step 1: Create DynamoDB Users Table (if not exists)
Write-Host "Step 1: Creating DynamoDB Users Table..." -ForegroundColor Yellow

try {
    # Check if table exists
    $tableExists = aws dynamodb describe-table --table-name $UsersTableName --region $Region 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Table '$UsersTableName' already exists" -ForegroundColor Green
    } else {
        Write-Host "Creating new table..." -ForegroundColor Yellow
        
        aws dynamodb create-table `
            --table-name $UsersTableName `
            --attribute-definitions `
                AttributeName=user_id,AttributeType=S `
                AttributeName=email,AttributeType=S `
            --key-schema AttributeName=user_id,KeyType=HASH `
            --global-secondary-indexes `
                "IndexName=email-index,KeySchema=[{AttributeName=email,KeyType=HASH}],Projection={ProjectionType=ALL}" `
            --billing-mode PAY_PER_REQUEST `
            --region $Region
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Table created successfully!" -ForegroundColor Green
            Write-Host "⏳ Waiting for table to become active..." -ForegroundColor Yellow
            aws dynamodb wait table-exists --table-name $UsersTableName --region $Region
        }
    }
} catch {
    Write-Host "⚠️ Could not create table via CLI" -ForegroundColor Red
    Write-Host ""
    Write-Host "MANUAL STEP: Create DynamoDB table" -ForegroundColor Yellow
    Write-Host "1. Go to: https://console.aws.amazon.com/dynamodbv2/home?region=$Region#create-table" -ForegroundColor Cyan
    Write-Host "2. Table name: $UsersTableName" -ForegroundColor White
    Write-Host "3. Partition key: user_id (String)" -ForegroundColor White
    Write-Host "4. Add Global Secondary Index:" -ForegroundColor White
    Write-Host "   - Index name: email-index" -ForegroundColor White
    Write-Host "   - Partition key: email (String)" -ForegroundColor White
    Write-Host "5. Click 'Create table'" -ForegroundColor White
    Write-Host ""
}

# Step 2: Package Lambda function
Write-Host ""
Write-Host "Step 2: Packaging Lambda function..." -ForegroundColor Yellow

$LambdaDir = "backend\lambda\users"
$ZipFile = "post-confirmation-trigger.zip"

# Navigate to lambda directory
Push-Location $LambdaDir

# Install dependencies if package.json exists
if (Test-Path "package.json") {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install --production
}

# Create zip file
if (Test-Path $ZipFile) {
    Remove-Item $ZipFile -Force
}

Write-Host "Creating deployment package..." -ForegroundColor Yellow
Compress-Archive -Path *.js, node_modules -DestinationPath $ZipFile -Force

Pop-Location

Write-Host "✅ Lambda package created" -ForegroundColor Green

# Step 3: Create IAM Role for Lambda (if needed)
Write-Host ""
Write-Host "Step 3: Checking IAM Role..." -ForegroundColor Yellow

$RoleName = "livekart-cognito-trigger-role"

try {
    $roleCheck = aws iam get-role --role-name $RoleName 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ IAM Role already exists" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Need to create IAM role manually" -ForegroundColor Red
    Write-Host ""
    Write-Host "MANUAL STEP: Create IAM Role" -ForegroundColor Yellow
    Write-Host "Role name: $RoleName" -ForegroundColor White
    Write-Host "Trusted entity: Lambda" -ForegroundColor White
    Write-Host "Permissions needed:" -ForegroundColor White
    Write-Host "  - AWSLambdaBasicExecutionRole (AWS managed)" -ForegroundColor White
    Write-Host "  - DynamoDB PutItem on $UsersTableName" -ForegroundColor White
    Write-Host ""
}

# Step 4: Create/Update Lambda Function
Write-Host ""
Write-Host "Step 4: Deploying Lambda function..." -ForegroundColor Yellow

try {
    # Try to update existing function first
    aws lambda update-function-code `
        --function-name $LambdaFunctionName `
        --zip-file "fileb://$LambdaDir\$ZipFile" `
        --region $Region 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Lambda function updated" -ForegroundColor Green
        
        # Update environment variables
        aws lambda update-function-configuration `
            --function-name $LambdaFunctionName `
            --environment "Variables={USERS_TABLE=$UsersTableName,AWS_REGION=$Region}" `
            --region $Region
    }
} catch {
    Write-Host "Function doesn't exist, creating new one..." -ForegroundColor Yellow
    
    Write-Host ""
    Write-Host "⚠️ Cannot create Lambda via CLI without proper role" -ForegroundColor Red
    Write-Host ""
    Write-Host "MANUAL STEP: Create Lambda Function" -ForegroundColor Yellow
    Write-Host "1. Go to: https://console.aws.amazon.com/lambda/home?region=$Region#/create/function" -ForegroundColor Cyan
    Write-Host "2. Function name: $LambdaFunctionName" -ForegroundColor White
    Write-Host "3. Runtime: Node.js 18.x" -ForegroundColor White
    Write-Host "4. Role: Use existing role '$RoleName'" -ForegroundColor White
    Write-Host "5. Upload the ZIP file: $LambdaDir\$ZipFile" -ForegroundColor White
    Write-Host "6. Add environment variables:" -ForegroundColor White
    Write-Host "   USERS_TABLE = $UsersTableName" -ForegroundColor White
    Write-Host "   AWS_REGION = $Region" -ForegroundColor White
    Write-Host ""
}

# Step 5: Add Lambda Permission for Cognito
Write-Host ""
Write-Host "Step 5: Granting Cognito permission to invoke Lambda..." -ForegroundColor Yellow

try {
    aws lambda add-permission `
        --function-name $LambdaFunctionName `
        --statement-id "AllowCognitoInvoke" `
        --action "lambda:InvokeFunction" `
        --principal "cognito-idp.amazonaws.com" `
        --source-arn "arn:aws:cognito-idp:${Region}:*:userpool/${UserPoolId}" `
        --region $Region 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Permission granted" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Permission may already exist or needs manual setup" -ForegroundColor Yellow
}

# Step 6: Configure Cognito Trigger
Write-Host ""
Write-Host "Step 6: Configuring Cognito User Pool Trigger..." -ForegroundColor Yellow

Write-Host ""
Write-Host "⚠️ This step MUST be done manually in AWS Console" -ForegroundColor Red
Write-Host ""
Write-Host "MANUAL STEPS:" -ForegroundColor Yellow
Write-Host "1. Open Cognito User Pool:" -ForegroundColor Cyan
Write-Host "   https://console.aws.amazon.com/cognito/v2/idp/user-pools/$UserPoolId/triggers?region=$Region" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Find 'Post confirmation trigger' section" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Click 'Add Lambda trigger'" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Select Lambda function: $LambdaFunctionName" -ForegroundColor Yellow
Write-Host ""
Write-Host "5. Click 'Save changes'" -ForegroundColor Yellow
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Instructions Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ What was automated:" -ForegroundColor Green
Write-Host "   - DynamoDB users table created (if needed)" -ForegroundColor White
Write-Host "   - Lambda function packaged" -ForegroundColor White
Write-Host ""
Write-Host "⚠️ What you need to do manually:" -ForegroundColor Yellow
Write-Host "   1. Create/verify IAM role" -ForegroundColor White
Write-Host "   2. Create/update Lambda function (upload ZIP)" -ForegroundColor White
Write-Host "   3. Configure Cognito trigger (link Lambda to User Pool)" -ForegroundColor White
Write-Host ""
Write-Host "📚 After setup:" -ForegroundColor Cyan
Write-Host "   - New users will automatically be added to DynamoDB" -ForegroundColor White
Write-Host "   - Trigger runs AFTER email verification" -ForegroundColor White
Write-Host "   - Check CloudWatch Logs for trigger execution" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to open AWS Console..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Open relevant AWS Console pages
Start-Process "https://console.aws.amazon.com/cognito/v2/idp/user-pools/$UserPoolId/triggers?region=$Region"
Start-Process "https://console.aws.amazon.com/lambda/home?region=$Region#/functions"
Start-Process "https://console.aws.amazon.com/dynamodbv2/home?region=$Region#tables"
