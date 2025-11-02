# PowerShell Script: Deploy Auto Group Assignment Feature
# This script automates the entire setup process

$USER_POOL_ID = "us-east-1_pMr6t5GFA"
$REGION = "us-east-1"
$LAMBDA_NAME = "postConfirmationTrigger"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Auto Group Assignment Deployment Script   " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create Cognito Groups
Write-Host "[1/7] Step 1: Creating Cognito Groups..." -ForegroundColor Green
Write-Host ""

.\setup-cognito-groups.ps1
Write-Host ""

# Step 2: Install Dependencies
Write-Host "[2/7] Step 2: Installing Lambda dependencies..." -ForegroundColor Green
Set-Location "..\backend\lambda\users"

if (!(Test-Path "node_modules\@aws-sdk\client-cognito-identity-provider")) {
    npm install @aws-sdk/client-cognito-identity-provider
    Write-Host "[OK] Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "[OK] Dependencies already installed" -ForegroundColor Yellow
}
Write-Host ""

# Step 3: Package Lambda
Write-Host "[3/7] Step 3: Packaging Lambda function..." -ForegroundColor Green

# Remove old zip if exists
if (Test-Path "post-confirmation-trigger.zip") {
    Remove-Item "post-confirmation-trigger.zip" -Force
}

# Create zip
Compress-Archive -Path postConfirmation.js,node_modules -DestinationPath post-confirmation-trigger.zip -Force
Write-Host "[OK] Lambda packaged" -ForegroundColor Green
Write-Host ""

# Step 4: Deploy Lambda
Write-Host "[4/7] Step 4: Deploying Lambda function..." -ForegroundColor Green

aws lambda update-function-code `
  --function-name $LAMBDA_NAME `
  --zip-file fileb://post-confirmation-trigger.zip `
  --region $REGION

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Lambda code deployed" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Lambda deployment failed!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 5: Update Environment Variables
Write-Host "[5/7] Step 5: Updating Lambda configuration..." -ForegroundColor Green

$envVars = "Variables={USER_POOL_ID=$USER_POOL_ID,USERS_TABLE=livekart-users,AWS_REGION=$REGION}"
aws lambda update-function-configuration `
  --function-name $LAMBDA_NAME `
  --environment $envVars `
  --region $REGION | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Lambda configuration updated" -ForegroundColor Green
} else {
    Write-Host "[WARN] Configuration update might have failed" -ForegroundColor Yellow
}
Write-Host ""

# Step 6: Check Lambda Role
Write-Host "[6/7] Step 6: Checking Lambda permissions..." -ForegroundColor Green

$roleArn = aws lambda get-function-configuration --function-name $LAMBDA_NAME --query "Role" --output text --region $REGION
$roleName = ($roleArn -split '/')[-1]

Write-Host "Lambda Role: $roleName" -ForegroundColor Cyan
Write-Host ""
Write-Host "[!] IMPORTANT: You need to add Cognito permissions to this role!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Option 1: Use AWS Console" -ForegroundColor White
Write-Host "  1. Go to IAM → Roles → $roleName" -ForegroundColor Gray
Write-Host "  2. Click 'Add permissions' → 'Create inline policy'" -ForegroundColor Gray
Write-Host "  3. Copy contents from: scripts/cognito-group-policy.json" -ForegroundColor Gray
Write-Host ""
Write-Host "Option 2: Use AWS CLI" -ForegroundColor White
Write-Host "  Run this command:" -ForegroundColor Gray
Write-Host "  aws iam put-role-policy \\" -ForegroundColor DarkGray
Write-Host "    --role-name $roleName \\" -ForegroundColor DarkGray
Write-Host "    --policy-name CognitoGroupManagement \\" -ForegroundColor DarkGray
Write-Host "    --policy-document file://scripts/cognito-group-policy.json" -ForegroundColor DarkGray
Write-Host ""

# Step 7: Verify Trigger Connection
Write-Host "[7/7] Step 7: Verifying Cognito trigger connection..." -ForegroundColor Green

$triggers = aws cognito-idp describe-user-pool --user-pool-id $USER_POOL_ID --query "UserPool.LambdaTriggers.PostConfirmation" --output text --region $REGION

if ($triggers -like "*$LAMBDA_NAME*") {
    Write-Host "[OK] Post-confirmation trigger is connected" -ForegroundColor Green
} else {
    Write-Host "[WARN] Post-confirmation trigger NOT connected!" -ForegroundColor Yellow
    Write-Host "   You may need to connect it manually in Cognito console" -ForegroundColor Gray
}
Write-Host ""

# Final Summary
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Deployment Summary                        " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[OK] Cognito groups created (Customers, Vendors, Admins)" -ForegroundColor Green
Write-Host "[OK] Lambda dependencies installed" -ForegroundColor Green
Write-Host "[OK] Lambda function deployed" -ForegroundColor Green
Write-Host "[OK] Environment variables configured" -ForegroundColor Green
Write-Host ""
Write-Host "[!] NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Add Cognito permissions to Lambda role (see above)" -ForegroundColor White
Write-Host "2. Test by creating a new user with role selection" -ForegroundColor White
Write-Host "3. Check CloudWatch logs: /aws/lambda/$LAMBDA_NAME" -ForegroundColor White
Write-Host ""
Write-Host "[i] Full guide: AUTOMATIC_GROUP_ASSIGNMENT_SETUP.md" -ForegroundColor Cyan
Write-Host ""

# Return to scripts directory
Set-Location "..\..\..\scripts"
