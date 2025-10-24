# 🚀 AWS Setup Guide for LiveKart

This guide will walk you through setting up your AWS account and deploying LiveKart step by step.

---

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- [ ] AWS Account (free tier eligible)
- [ ] Credit/Debit card for AWS verification
- [ ] Email address for verification
- [ ] Command line access (PowerShell/Terminal)
- [ ] Git installed
- [ ] Node.js installed (v18+)

---

## 🎯 Step 1: Create AWS Account (If You Don't Have One)

### 1.1 Sign Up

1. Go to [aws.amazon.com](https://aws.amazon.com)
2. Click **"Create an AWS Account"**
3. Enter your email and choose account name
4. Select **"Personal"** account type
5. Fill in your details:
   - Full name
   - Address
   - Phone number

### 1.2 Payment Information

1. Add credit/debit card (won't be charged for Free Tier usage)
2. AWS will charge $1 for verification (refunded immediately)
3. Complete phone verification

### 1.3 Choose Support Plan

1. Select **"Basic Support - Free"**
2. Click **"Complete sign up"**

✅ **Account created!** You'll receive confirmation email.

---

## 🔐 Step 2: Install & Configure AWS CLI

### 2.1 Install AWS CLI (Windows)

**Option A: Using MSI Installer (Recommended)**

```powershell
# Download AWS CLI installer
# Visit: https://awscli.amazonaws.com/AWSCLIV2.msi
# Run the installer and follow prompts
```

**Option B: Using PowerShell**

```powershell
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi /qn
```

**Verify installation:**

```powershell
aws --version
```

You should see: `aws-cli/2.x.x Python/3.x.x Windows/...`

### 2.2 Create IAM User with Programmatic Access

⚠️ **Important:** Don't use root account credentials!

1. **Sign in to AWS Console:**

   - Go to [console.aws.amazon.com](https://console.aws.amazon.com)
   - Sign in with root account

2. **Go to IAM Service:**

   - Search for "IAM" in top search bar
   - Click **"IAM"** service

3. **Create New User:**

   - Click **"Users"** in left sidebar
   - Click **"Create user"** button
   - User name: `livekart-deployer`
   - Click **"Next"**

4. **Set Permissions:**

   - Select **"Attach policies directly"**
   - Search and check these policies:
     - ✅ `AdministratorAccess` (for deployment)
     - OR for more security, attach these individually:
       - `AWSCloudFormationFullAccess`
       - `IAMFullAccess`
       - `AmazonS3FullAccess`
       - `AmazonCognitoPowerUser`
       - `CloudFrontFullAccess`
       - `AmazonSESFullAccess`
       - `AWSLambda_FullAccess`
       - `AmazonDynamoDBFullAccess`
   - Click **"Next"**
   - Click **"Create user"**

5. **Create Access Keys:**
   - Click on your new user `livekart-deployer`
   - Go to **"Security credentials"** tab
   - Scroll to **"Access keys"**
   - Click **"Create access key"**
   - Select **"Command Line Interface (CLI)"**
   - Check confirmation box
   - Click **"Next"**
   - Description: "LiveKart deployment"
   - Click **"Create access key"**
   - **⚠️ IMPORTANT:** Download the `.csv` file or copy both:
     - Access Key ID: `AKIA...`
     - Secret Access Key: `wJalrXU...` (shown only once!)
   - Click **"Done"**

### 2.3 Configure AWS CLI

```powershell
aws configure
```

Enter your credentials:

```
AWS Access Key ID [None]: AKIA................
AWS Secret Access Key [None]: wJalrXU................
Default region name [None]: us-east-1
Default output format [None]: json
```

**Verify configuration:**

```powershell
aws sts get-caller-identity
```

You should see:

```json
{
  "UserId": "AIDA...",
  "Account": "123456789012",
  "Arn": "arn:aws:iam::123456789012:user/livekart-deployer"
}
```

✅ **AWS CLI configured!**

---

## 📧 Step 3: Set Up SES (Simple Email Service)

### 3.1 Verify Your Email Address

1. **Go to SES Console:**

   - Search for "SES" or "Simple Email Service"
   - **⚠️ Make sure region is `us-east-1`** (top right corner)

2. **Create Identity:**

   - Click **"Identities"** in left sidebar
   - Click **"Create identity"**
   - Select **"Email address"**
   - Enter your email: `your-email@example.com`
   - Click **"Create identity"**

3. **Verify Email:**

   - Check your inbox for "Amazon Web Services – Email Address Verification Request"
   - Click the verification link
   - You should see "Congratulations!" message
   - Go back to SES Console
   - Identity status should show **"Verified"** ✅

4. **Note Your Email:**
   - Copy your verified email address
   - You'll need it during deployment

### 3.2 (Optional) Request Production Access

By default, SES is in **Sandbox Mode** (200 emails/day, can only send to verified addresses).

**To send unlimited emails:**

1. In SES Console, click **"Account dashboard"**
2. Click **"Request production access"**
3. Fill out form:
   - Mail type: **Transactional**
   - Website URL: `https://your-domain.com` (or `https://github.com/your-username/livekart`)
   - Use case description:
     ```
     LiveKart e-commerce platform sending order confirmations
     and vendor notifications to customers.
     ```
4. Click **"Submit request"**
5. Approval takes 24-48 hours

For now, Sandbox mode is fine for testing!

✅ **SES email verified!**

---

## 🏗️ Step 4: Deploy CloudFormation Stack

### 4.1 Validate Your Template

First, let's make sure the CloudFormation template is valid:

```powershell
cd c:\Users\adity\Desktop\Code\Projects\Live_KART_project\Live_Kart

aws cloudformation validate-template --template-body file://infra/cloudformation-template.yml
```

✅ If valid, you'll see template description and parameters.

### 4.2 Deploy the Stack

**Method A: Using PowerShell Script (Recommended)**

Since `deploy.sh` is a bash script, let's create a PowerShell version:

```powershell
# Create deployment script
notepad deploy.ps1
```

Copy this script:

```powershell
# LiveKart AWS Deployment Script (PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   LiveKart AWS Deployment Script         ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Configuration
$STACK_NAME = "livekart-production"
$REGION = "us-east-1"
$TEMPLATE_FILE = "infra/cloudformation-template.yml"

# Check AWS CLI
if (!(Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "Error: AWS CLI is not installed" -ForegroundColor Red
    exit 1
}

Write-Host "✓ AWS CLI configured" -ForegroundColor Green

# Get Account ID
$ACCOUNT_ID = aws sts get-caller-identity --query Account --output text
Write-Host "✓ AWS Account ID: $ACCOUNT_ID" -ForegroundColor Green

# Get SES email
Write-Host ""
Write-Host "Enter your verified SES email address:" -ForegroundColor Yellow
$SES_EMAIL = Read-Host "Email"

if ([string]::IsNullOrWhiteSpace($SES_EMAIL)) {
    Write-Host "Error: Email address is required" -ForegroundColor Red
    exit 1
}

# Validate template
Write-Host ""
Write-Host "Validating CloudFormation template..." -ForegroundColor Cyan
aws cloudformation validate-template --template-body file://$TEMPLATE_FILE --region $REGION | Out-Null
Write-Host "✓ Template is valid" -ForegroundColor Green

# Check if stack exists
Write-Host ""
Write-Host "Checking if stack exists..." -ForegroundColor Cyan
$STACK_EXISTS = aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION 2>$null

if ($STACK_EXISTS) {
    Write-Host "Stack exists. Updating..." -ForegroundColor Yellow

    aws cloudformation update-stack `
        --stack-name $STACK_NAME `
        --template-body file://$TEMPLATE_FILE `
        --parameters ParameterKey=SESVerifiedEmail,ParameterValue=$SES_EMAIL `
        --capabilities CAPABILITY_IAM `
        --region $REGION

    Write-Host "Waiting for stack update to complete..." -ForegroundColor Cyan
    aws cloudformation wait stack-update-complete --stack-name $STACK_NAME --region $REGION

} else {
    Write-Host "Creating new stack..." -ForegroundColor Yellow

    aws cloudformation create-stack `
        --stack-name $STACK_NAME `
        --template-body file://$TEMPLATE_FILE `
        --parameters ParameterKey=SESVerifiedEmail,ParameterValue=$SES_EMAIL `
        --capabilities CAPABILITY_IAM `
        --region $REGION

    Write-Host "Waiting for stack creation to complete (this may take 5-10 minutes)..." -ForegroundColor Cyan
    aws cloudformation wait stack-create-complete --stack-name $STACK_NAME --region $REGION
}

Write-Host ""
Write-Host "✓ Stack deployment complete!" -ForegroundColor Green

# Get stack outputs
Write-Host ""
Write-Host "Retrieving stack outputs..." -ForegroundColor Cyan
$OUTPUTS = aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --query "Stacks[0].Outputs" --output json | ConvertFrom-Json

# Create .env file
Write-Host "Creating .env file..." -ForegroundColor Cyan
$ENV_CONTENT = @"
# AWS Configuration - Generated by deploy.ps1
VITE_AWS_REGION=$REGION
VITE_AWS_ACCOUNT_ID=$ACCOUNT_ID
"@

foreach ($output in $OUTPUTS) {
    $key = $output.OutputKey
    $value = $output.OutputValue
    $ENV_CONTENT += "`nVITE_$key=$value"
}

$ENV_CONTENT | Out-File -FilePath "frontend/.env" -Encoding utf8
Write-Host "✓ Created frontend/.env file" -ForegroundColor Green

# Display outputs
Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║          Deployment Complete! 🎉          ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Stack Outputs:" -ForegroundColor Cyan
foreach ($output in $OUTPUTS) {
    Write-Host "  $($output.OutputKey): $($output.OutputValue)" -ForegroundColor White
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: cd frontend" -ForegroundColor White
Write-Host "2. Run: npm install" -ForegroundColor White
Write-Host "3. Run: npm run dev" -ForegroundColor White
Write-Host "4. Create test users: ./scripts/create-test-users.sh" -ForegroundColor White
```

Save and close the file.

**Run the deployment:**

```powershell
# Make sure you're in the project root
cd c:\Users\adity\Desktop\Code\Projects\Live_KART_project\Live_Kart

# Run deployment
powershell -ExecutionPolicy Bypass -File deploy.ps1
```

**Method B: Manual Deployment (If Script Fails)**

```powershell
# Set your email
$SES_EMAIL = "your-verified-email@example.com"

# Deploy stack
aws cloudformation create-stack `
    --stack-name livekart-production `
    --template-body file://infra/cloudformation-template.yml `
    --parameters ParameterKey=SESVerifiedEmail,ParameterValue=$SES_EMAIL `
    --capabilities CAPABILITY_IAM `
    --region us-east-1

# Wait for completion (5-10 minutes)
aws cloudformation wait stack-create-complete `
    --stack-name livekart-production `
    --region us-east-1

# Check status
aws cloudformation describe-stacks `
    --stack-name livekart-production `
    --region us-east-1 `
    --query "Stacks[0].StackStatus"
```

### 4.3 Monitor Deployment Progress

Open AWS Console → CloudFormation:

- You should see `livekart-production` stack
- Status will be **CREATE_IN_PROGRESS** → **CREATE_COMPLETE**
- Click on "Events" tab to see what's being created
- Takes about 5-10 minutes

### 4.4 Get Stack Outputs

```powershell
aws cloudformation describe-stacks `
    --stack-name livekart-production `
    --region us-east-1 `
    --query "Stacks[0].Outputs" `
    --output table
```

You'll see:

- `UserPoolId` - Cognito User Pool ID
- `UserPoolClientId` - Cognito App Client ID
- `S3BucketName` - Product images bucket
- `CloudFrontDomain` - CDN domain
- `DynamoDBTables` - Table names

✅ **Stack deployed!**

---

## ⚙️ Step 5: Configure Frontend

### 5.1 Create .env File

The deployment script should have created `frontend/.env`. If not, create it manually:

```powershell
# Get outputs
$OUTPUTS = aws cloudformation describe-stacks --stack-name livekart-production --region us-east-1 --query "Stacks[0].Outputs" --output json | ConvertFrom-Json

# Create .env file
@"
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=$($OUTPUTS | Where-Object {$_.OutputKey -eq "UserPoolId"} | Select-Object -ExpandProperty OutputValue)
VITE_USER_POOL_CLIENT_ID=$($OUTPUTS | Where-Object {$_.OutputKey -eq "UserPoolClientId"} | Select-Object -ExpandProperty OutputValue)
VITE_S3_BUCKET=$($OUTPUTS | Where-Object {$_.OutputKey -eq "S3BucketName"} | Select-Object -ExpandProperty OutputValue)
VITE_CLOUDFRONT_DOMAIN=$($OUTPUTS | Where-Object {$_.OutputKey -eq "CloudFrontDomain"} | Select-Object -ExpandProperty OutputValue)
VITE_PRODUCTS_TABLE=$($OUTPUTS | Where-Object {$_.OutputKey -eq "ProductsTableName"} | Select-Object -ExpandProperty OutputValue)
VITE_ORDERS_TABLE=$($OUTPUTS | Where-Object {$_.OutputKey -eq "OrdersTableName"} | Select-Object -ExpandProperty OutputValue)
"@ | Out-File -FilePath frontend/.env -Encoding utf8
```

### 5.2 Verify .env File

```powershell
cat frontend/.env
```

Should look like:

```
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_USER_POOL_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_S3_BUCKET=production-livekart-product-images-123456789012
VITE_CLOUDFRONT_DOMAIN=d1234567890abc.cloudfront.net
VITE_PRODUCTS_TABLE=production-livekart-products
VITE_ORDERS_TABLE=production-livekart-orders
```

✅ **Frontend configured!**

---

## 👥 Step 6: Create Cognito User Groups & Test Users

### 6.1 Create User Groups

```powershell
# Get User Pool ID
$USER_POOL_ID = aws cloudformation describe-stacks --stack-name livekart-production --region us-east-1 --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" --output text

# Create Customers group
aws cognito-idp create-group `
    --group-name customers `
    --user-pool-id $USER_POOL_ID `
    --description "Regular customers" `
    --region us-east-1

# Create Vendors group
aws cognito-idp create-group `
    --group-name vendors `
    --user-pool-id $USER_POOL_ID `
    --description "Product vendors" `
    --region us-east-1

# Create Admins group
aws cognito-idp create-group `
    --group-name admins `
    --user-pool-id $USER_POOL_ID `
    --description "Platform administrators" `
    --region us-east-1
```

### 6.2 Create Test Users (PowerShell Version)

Create `scripts/create-test-users.ps1`:

```powershell
# Create test users for LiveKart
$ErrorActionPreference = "Stop"

Write-Host "Creating LiveKart test users..." -ForegroundColor Cyan

# Get User Pool ID
$USER_POOL_ID = aws cloudformation describe-stacks --stack-name livekart-production --region us-east-1 --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" --output text

if ([string]::IsNullOrWhiteSpace($USER_POOL_ID)) {
    Write-Host "Error: Could not find User Pool ID" -ForegroundColor Red
    exit 1
}

Write-Host "User Pool ID: $USER_POOL_ID" -ForegroundColor Green

# Function to create user
function Create-User {
    param($Email, $Password, $Name, $Group)

    Write-Host ""
    Write-Host "Creating $Group user: $Email" -ForegroundColor Yellow

    # Create user
    aws cognito-idp admin-create-user `
        --user-pool-id $USER_POOL_ID `
        --username $Email `
        --user-attributes Name=email,Value=$Email Name=email_verified,Value=true Name=name,Value=$Name `
        --message-action SUPPRESS `
        --region us-east-1 2>$null

    # Set permanent password
    aws cognito-idp admin-set-user-password `
        --user-pool-id $USER_POOL_ID `
        --username $Email `
        --password $Password `
        --permanent `
        --region us-east-1

    # Add to group
    aws cognito-idp admin-add-user-to-group `
        --user-pool-id $USER_POOL_ID `
        --username $Email `
        --group-name $Group `
        --region us-east-1

    Write-Host "✓ Created $Email (password: $Password)" -ForegroundColor Green
}

# Create users
Create-User -Email "admin@livekart.com" -Password "Admin123!" -Name "Admin User" -Group "admins"
Create-User -Email "vendor@livekart.com" -Password "Vendor123!" -Name "Vendor User" -Group "vendors"
Create-User -Email "customer@livekart.com" -Password "Customer123!" -Name "Customer User" -Group "customers"

Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║        Test Users Created! 🎉             ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Login Credentials:" -ForegroundColor Cyan
Write-Host "  Admin: admin@livekart.com / Admin123!" -ForegroundColor White
Write-Host "  Vendor: vendor@livekart.com / Vendor123!" -ForegroundColor White
Write-Host "  Customer: customer@livekart.com / Customer123!" -ForegroundColor White
```

**Run the script:**

```powershell
powershell -ExecutionPolicy Bypass -File scripts/create-test-users.ps1
```

✅ **Test users created!**

---

## 🚀 Step 7: Run the Application

### 7.1 Install Dependencies

```powershell
cd frontend
npm install
```

### 7.2 Start Development Server

```powershell
npm run dev
```

You should see:

```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 7.3 Test the Application

1. **Open browser:** http://localhost:5173
2. **Test login:**

   - Click "Login"
   - Use: `customer@livekart.com` / `Customer123!`
   - Should redirect to home page with user menu

3. **Test vendor login:**

   - Logout
   - Login as: `vendor@livekart.com` / `Vendor123!`
   - Should see vendor dashboard

4. **Test admin login:**
   - Logout
   - Login as: `admin@livekart.com` / `Admin123!`
   - Should see admin overview

✅ **Application running!**

---

## 🧪 Step 8: Test AWS Services

### 8.1 Test S3 Upload (Manual)

```powershell
# Get bucket name
$BUCKET = aws cloudformation describe-stacks --stack-name livekart-production --region us-east-1 --query "Stacks[0].Outputs[?OutputKey=='S3BucketName'].OutputValue" --output text

# Create test file
echo "Test upload" > test.txt

# Upload to S3
aws s3 cp test.txt s3://$BUCKET/test/test.txt --region us-east-1

# Verify upload
aws s3 ls s3://$BUCKET/test/ --region us-east-1
```

### 8.2 Test CloudFront

```powershell
# Get CloudFront domain
$CF_DOMAIN = aws cloudformation describe-stacks --stack-name livekart-production --region us-east-1 --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDomain'].OutputValue" --output text

# Access file through CloudFront
curl https://$CF_DOMAIN/test/test.txt
```

### 8.3 Test Lambda Functions

```powershell
# Test order validation function
aws lambda invoke `
    --function-name production-livekart-order-validation `
    --payload '{\"body\": \"{\\\"items\\\": []}\"}' `
    --region us-east-1 `
    response.json

# Check response
cat response.json
```

### 8.4 Test DynamoDB

```powershell
# Get table name
$PRODUCTS_TABLE = aws cloudformation describe-stacks --stack-name livekart-production --region us-east-1 --query "Stacks[0].Outputs[?OutputKey=='ProductsTableName'].OutputValue" --output text

# Put test item
aws dynamodb put-item `
    --table-name $PRODUCTS_TABLE `
    --item '{\"product_id\": {\"S\": \"test-123\"}, \"name\": {\"S\": \"Test Product\"}, \"price\": {\"N\": \"29.99\"}}' `
    --region us-east-1

# Get item
aws dynamodb get-item `
    --table-name $PRODUCTS_TABLE `
    --key '{\"product_id\": {\"S\": \"test-123\"}}' `
    --region us-east-1
```

✅ **All services working!**

---

## 📊 Step 9: Set Up Monitoring & Billing Alerts

### 9.1 Enable CloudWatch Logs

Already configured! View logs:

```powershell
# List log groups
aws logs describe-log-groups --region us-east-1 --query "logGroups[?contains(logGroupName, 'livekart')].logGroupName"

# Tail Lambda logs
aws logs tail /aws/lambda/production-livekart-order-validation --follow --region us-east-1
```

### 9.2 Set Up Billing Alerts

1. **Go to AWS Console → Billing Dashboard**
2. **Click "Billing preferences"**
3. **Enable:**
   - ✅ Receive Free Tier Usage Alerts
   - ✅ Receive Billing Alerts
4. **Enter your email**
5. **Save preferences**

### 9.3 Create Cost Budget

```powershell
# Create budget.json
@"
{
  "BudgetName": "livekart-monthly-budget",
  "BudgetLimit": {
    "Amount": "10",
    "Unit": "USD"
  },
  "TimeUnit": "MONTHLY",
  "BudgetType": "COST",
  "CostFilters": {},
  "CostTypes": {
    "IncludeTax": true,
    "IncludeSubscription": true
  }
}
"@ | Out-File budget.json -Encoding utf8

# Create notification
@"
{
  "NotificationType": "ACTUAL",
  "ComparisonOperator": "GREATER_THAN",
  "Threshold": 80,
  "ThresholdType": "PERCENTAGE",
  "NotificationState": "ALARM"
}
"@ | Out-File notification.json -Encoding utf8

# Create budget
aws budgets create-budget `
    --account-id $(aws sts get-caller-identity --query Account --output text) `
    --budget file://budget.json `
    --notifications-with-subscribers Notification=file://notification.json,Subscribers=[{SubscriptionType=EMAIL,Address=your-email@example.com}]
```

✅ **Monitoring configured!**

---

## 🎉 Success Checklist

Go through this final checklist:

- [ ] AWS Account created
- [ ] AWS CLI installed and configured
- [ ] IAM user with access keys created
- [ ] SES email verified
- [ ] CloudFormation stack deployed successfully
- [ ] `.env` file created in frontend
- [ ] Cognito user groups created
- [ ] Test users created
- [ ] Frontend dependencies installed
- [ ] Application running on localhost:5173
- [ ] Tested login with test users
- [ ] S3 upload tested
- [ ] CloudFront delivery tested
- [ ] Billing alerts configured

---

## 🔧 Troubleshooting

### Issue: "aws: command not found"

**Solution:** Restart PowerShell after installing AWS CLI

### Issue: "Stack creation failed"

**Solution:**

```powershell
# Check error
aws cloudformation describe-stack-events --stack-name livekart-production --region us-east-1 --query "StackEvents[?ResourceStatus=='CREATE_FAILED']"

# Delete failed stack
aws cloudformation delete-stack --stack-name livekart-production --region us-east-1

# Try again
```

### Issue: "Invalid credentials"

**Solution:** Run `aws configure` again with correct access keys

### Issue: "Email not verified"

**Solution:** Check inbox/spam for SES verification email

### Issue: ".env file not created"

**Solution:** Manually create it using stack outputs (see Step 5.1)

### Issue: "Cannot sign in to Cognito"

**Solution:** Make sure user groups are created and users are added to groups

### Issue: "CORS error on S3 upload"

**Solution:** Check CloudFormation template has CORS configuration for S3

---

## 📚 Useful Commands

```powershell
# Check stack status
aws cloudformation describe-stacks --stack-name livekart-production --region us-east-1 --query "Stacks[0].StackStatus"

# Get all outputs
aws cloudformation describe-stacks --stack-name livekart-production --region us-east-1 --query "Stacks[0].Outputs"

# List Cognito users
$USER_POOL_ID = aws cloudformation describe-stacks --stack-name livekart-production --region us-east-1 --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" --output text
aws cognito-idp list-users --user-pool-id $USER_POOL_ID --region us-east-1

# View CloudWatch logs
aws logs tail /aws/lambda/production-livekart-order-validation --follow --region us-east-1

# Check S3 bucket size
$BUCKET = aws cloudformation describe-stacks --stack-name livekart-production --region us-east-1 --query "Stacks[0].Outputs[?OutputKey=='S3BucketName'].OutputValue" --output text
aws s3 ls s3://$BUCKET --recursive --human-readable --summarize

# Delete test user
aws cognito-idp admin-delete-user --user-pool-id $USER_POOL_ID --username customer@livekart.com --region us-east-1

# Update stack
aws cloudformation update-stack --stack-name livekart-production --template-body file://infra/cloudformation-template.yml --capabilities CAPABILITY_IAM --region us-east-1
```

---

## 🗑️ Cleanup (When Done Testing)

To avoid any charges, delete all resources:

```powershell
# Delete CloudFormation stack (deletes everything)
aws cloudformation delete-stack --stack-name livekart-production --region us-east-1

# Wait for deletion
aws cloudformation wait stack-delete-complete --stack-name livekart-production --region us-east-1

# Verify deletion
aws cloudformation list-stacks --region us-east-1 --query "StackSummaries[?StackName=='livekart-production']"
```

---

## 🎯 Next Steps After Setup

1. **Integrate Cognito in Frontend:** Update `AuthContext.tsx` to use real Cognito
2. **Create API Gateway:** Add REST API for Lambda functions
3. **Add Products:** Create products in DynamoDB
4. **Test Full Flow:** Signup → Browse → Add to Cart → Checkout → Email
5. **Request SES Production Access:** For unlimited emails
6. **Add Custom Domain:** Use Route 53 + CloudFront
7. **Set Up CI/CD:** GitHub Actions for automatic deployment

---

**Need help? Check:**

- [AWS Free Tier FAQ](https://aws.amazon.com/free/free-tier-faqs/)
- [CloudFormation Documentation](https://docs.aws.amazon.com/cloudformation/)
- [Cognito Documentation](https://docs.aws.amazon.com/cognito/)

**You're all set! 🚀**
