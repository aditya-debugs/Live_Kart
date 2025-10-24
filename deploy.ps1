# LiveKart AWS Deployment Script (PowerShell)
# This script automates the deployment of LiveKart infrastructure to AWS

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   LiveKart AWS Deployment Script         ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Configuration
$STACK_NAME = "livekart-production"
$REGION = "us-east-1"
$TEMPLATE_FILE = "infra/cloudformation-template.yml"

# Check if AWS CLI is installed
Write-Host "Checking prerequisites..." -ForegroundColor Cyan
if (!(Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "✗ Error: AWS CLI is not installed" -ForegroundColor Red
    Write-Host "  Install from: https://awscli.amazonaws.com/AWSCLIV2.msi" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ AWS CLI found" -ForegroundColor Green

# Check if AWS credentials are configured
try {
    $null = aws sts get-caller-identity 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "AWS credentials not configured"
    }
} catch {
    Write-Host "✗ Error: AWS credentials not configured" -ForegroundColor Red
    Write-Host "  Run 'aws configure' to set up your credentials" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ AWS credentials configured" -ForegroundColor Green

# Get AWS Account ID
$ACCOUNT_ID = aws sts get-caller-identity --query Account --output text
Write-Host "✓ AWS Account ID: $ACCOUNT_ID" -ForegroundColor Green

# Get SES verified email
Write-Host ""
Write-Host "Enter your verified SES email address:" -ForegroundColor Yellow
Write-Host "(This email must be verified in AWS SES first)" -ForegroundColor Gray
$SES_EMAIL = Read-Host "Email"

if ([string]::IsNullOrWhiteSpace($SES_EMAIL)) {
    Write-Host "✗ Error: Email address is required" -ForegroundColor Red
    exit 1
}

# Validate email format
if ($SES_EMAIL -notmatch "^[^@]+@[^@]+\.[^@]+$") {
    Write-Host "✗ Error: Invalid email format" -ForegroundColor Red
    exit 1
}

# Validate CloudFormation template
Write-Host ""
Write-Host "Validating CloudFormation template..." -ForegroundColor Cyan
try {
    $validation = aws cloudformation validate-template `
        --template-body file://$TEMPLATE_FILE `
        --region $REGION 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        throw "Template validation failed"
    }
    Write-Host "✓ Template is valid" -ForegroundColor Green
} catch {
    Write-Host "✗ Template validation failed:" -ForegroundColor Red
    Write-Host $validation -ForegroundColor Red
    exit 1
}

# Check if stack already exists
Write-Host ""
Write-Host "Checking if stack exists..." -ForegroundColor Cyan
$stackExists = $false
try {
    $stackInfo = aws cloudformation describe-stacks `
        --stack-name $STACK_NAME `
        --region $REGION 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        $stackExists = $true
        Write-Host "✓ Stack exists - will update" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✓ Stack does not exist - will create" -ForegroundColor Green
}

# Deploy or update stack
Write-Host ""
if ($stackExists) {
    Write-Host "Updating existing stack..." -ForegroundColor Yellow
    Write-Host "Stack Name: $STACK_NAME" -ForegroundColor Gray
    Write-Host "Region: $REGION" -ForegroundColor Gray
    Write-Host ""
    
    try {
        aws cloudformation update-stack `
            --stack-name $STACK_NAME `
            --template-body file://$TEMPLATE_FILE `
            --parameters ParameterKey=SESVerifiedEmail,ParameterValue=$SES_EMAIL `
            --capabilities CAPABILITY_IAM `
            --region $REGION
        
        if ($LASTEXITCODE -ne 0) {
            throw "Stack update failed"
        }
        
        Write-Host "Waiting for stack update to complete..." -ForegroundColor Cyan
        Write-Host "(This may take 5-10 minutes - please wait)" -ForegroundColor Gray
        
        aws cloudformation wait stack-update-complete `
            --stack-name $STACK_NAME `
            --region $REGION
        
        Write-Host "✓ Stack updated successfully!" -ForegroundColor Green
        
    } catch {
        if ($_ -match "No updates are to be performed") {
            Write-Host "✓ No changes detected - stack is up to date" -ForegroundColor Green
        } else {
            Write-Host "✗ Stack update failed:" -ForegroundColor Red
            Write-Host $_ -ForegroundColor Red
            exit 1
        }
    }
    
} else {
    Write-Host "Creating new stack..." -ForegroundColor Yellow
    Write-Host "Stack Name: $STACK_NAME" -ForegroundColor Gray
    Write-Host "Region: $REGION" -ForegroundColor Gray
    Write-Host ""
    
    try {
        aws cloudformation create-stack `
            --stack-name $STACK_NAME `
            --template-body file://$TEMPLATE_FILE `
            --parameters ParameterKey=SESVerifiedEmail,ParameterValue=$SES_EMAIL `
            --capabilities CAPABILITY_IAM `
            --region $REGION
        
        if ($LASTEXITCODE -ne 0) {
            throw "Stack creation failed"
        }
        
        Write-Host "Waiting for stack creation to complete..." -ForegroundColor Cyan
        Write-Host "(This may take 5-10 minutes - please wait)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Creating resources:" -ForegroundColor Gray
        Write-Host "  - Cognito User Pool" -ForegroundColor Gray
        Write-Host "  - S3 Bucket" -ForegroundColor Gray
        Write-Host "  - CloudFront Distribution" -ForegroundColor Gray
        Write-Host "  - Lambda Functions" -ForegroundColor Gray
        Write-Host "  - DynamoDB Tables" -ForegroundColor Gray
        Write-Host "  - IAM Roles & Policies" -ForegroundColor Gray
        Write-Host ""
        
        aws cloudformation wait stack-create-complete `
            --stack-name $STACK_NAME `
            --region $REGION
        
        if ($LASTEXITCODE -ne 0) {
            throw "Stack creation failed"
        }
        
        Write-Host "✓ Stack created successfully!" -ForegroundColor Green
        
    } catch {
        Write-Host "✗ Stack creation failed:" -ForegroundColor Red
        Write-Host $_ -ForegroundColor Red
        Write-Host ""
        Write-Host "Check CloudFormation console for details:" -ForegroundColor Yellow
        Write-Host "https://console.aws.amazon.com/cloudformation/home?region=$REGION" -ForegroundColor Cyan
        exit 1
    }
}

# Retrieve stack outputs
Write-Host ""
Write-Host "Retrieving stack outputs..." -ForegroundColor Cyan
try {
    $outputsJson = aws cloudformation describe-stacks `
        --stack-name $STACK_NAME `
        --region $REGION `
        --query "Stacks[0].Outputs" `
        --output json
    
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to retrieve outputs"
    }
    
    $outputs = $outputsJson | ConvertFrom-Json
    Write-Host "✓ Retrieved $($outputs.Count) outputs" -ForegroundColor Green
    
} catch {
    Write-Host "✗ Failed to retrieve stack outputs:" -ForegroundColor Red
    Write-Host $_ -ForegroundColor Red
    exit 1
}

# Create .env file for frontend
Write-Host ""
Write-Host "Creating frontend .env file..." -ForegroundColor Cyan

# Ensure frontend directory exists
if (!(Test-Path "frontend")) {
    Write-Host "✗ Error: frontend directory not found" -ForegroundColor Red
    exit 1
}

# Build .env content
$envContent = @"
# AWS Configuration
# Auto-generated by deploy.ps1 on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# AWS Region
VITE_AWS_REGION=$REGION

# AWS Account ID
VITE_AWS_ACCOUNT_ID=$ACCOUNT_ID

"@

# Add each output to .env
foreach ($output in $outputs) {
    $key = $output.OutputKey
    $value = $output.OutputValue
    $envContent += "VITE_$key=$value`n"
}

# Write to file
try {
    $envContent | Out-File -FilePath "frontend/.env" -Encoding utf8 -NoNewline
    Write-Host "✓ Created frontend/.env file" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to create .env file:" -ForegroundColor Red
    Write-Host $_ -ForegroundColor Red
}

# Display summary
Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║       Deployment Complete! 🎉             ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📊 Stack Outputs:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
foreach ($output in $outputs) {
    $key = $output.OutputKey
    $value = $output.OutputValue
    $description = $output.Description
    
    Write-Host "  $key" -ForegroundColor Yellow -NoNewline
    Write-Host ": $value" -ForegroundColor White
    if ($description) {
        Write-Host "    → $description" -ForegroundColor Gray
    }
}
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Next steps
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "  1️⃣  Create Cognito user groups:" -ForegroundColor Yellow
Write-Host "     powershell -ExecutionPolicy Bypass -File scripts/create-user-groups.ps1" -ForegroundColor White
Write-Host ""
Write-Host "  2️⃣  Create test users:" -ForegroundColor Yellow
Write-Host "     powershell -ExecutionPolicy Bypass -File scripts/create-test-users.ps1" -ForegroundColor White
Write-Host ""
Write-Host "  3️⃣  Install frontend dependencies:" -ForegroundColor Yellow
Write-Host "     cd frontend" -ForegroundColor White
Write-Host "     npm install" -ForegroundColor White
Write-Host ""
Write-Host "  4️⃣  Start the application:" -ForegroundColor Yellow
Write-Host "     npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "  5️⃣  Open in browser:" -ForegroundColor Yellow
Write-Host "     http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "  • Setup Guide: AWS_SETUP_GUIDE.md" -ForegroundColor White
Write-Host "  • Deployment Guide: AWS_DEPLOYMENT_GUIDE.md" -ForegroundColor White
Write-Host "  • Infrastructure Details: infra/README.md" -ForegroundColor White

Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Cyan
Write-Host "  • Verify your email in SES if you haven't already" -ForegroundColor White
Write-Host "  • Check CloudWatch logs for any errors" -ForegroundColor White
Write-Host "  • Set up billing alerts in AWS Console" -ForegroundColor White

Write-Host ""
Write-Host "✨ Happy coding! ✨" -ForegroundColor Green
Write-Host ""
