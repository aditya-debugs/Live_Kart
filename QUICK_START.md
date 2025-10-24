# 🚀 LiveKart AWS Quick Start

**Complete this checklist to deploy LiveKart to AWS!**

---

## ✅ Phase 1: AWS Account Setup (20 minutes)

### 1. Create AWS Account

- [ ] Go to [aws.amazon.com](https://aws.amazon.com) and sign up
- [ ] Add payment method (for verification - Free Tier won't charge)
- [ ] Verify phone number
- [ ] Choose "Basic Support - Free"

### 2. Install AWS CLI

- [ ] Download: [https://awscli.amazonaws.com/AWSCLIV2.msi](https://awscli.amazonaws.com/AWSCLIV2.msi)
- [ ] Run installer
- [ ] Verify: `aws --version`

### 3. Create IAM User

- [ ] Sign in to [AWS Console](https://console.aws.amazon.com)
- [ ] Go to IAM → Users → Create user
- [ ] Username: `livekart-deployer`
- [ ] Attach policy: `AdministratorAccess`
- [ ] Create access key (CLI)
- [ ] **Save credentials!**

### 4. Configure AWS CLI

```powershell
aws configure
```

Enter:

- Access Key ID: `AKIA...`
- Secret Access Key: `wJalr...`
- Region: `us-east-1`
- Output: `json`

**Verify:**

```powershell
aws sts get-caller-identity
```

---

## ✅ Phase 2: Email Setup (5 minutes)

### 5. Verify SES Email

- [ ] Go to AWS Console → SES (Simple Email Service)
- [ ] **Make sure region is `us-east-1`** (top-right corner)
- [ ] Click "Identities" → "Create identity"
- [ ] Select "Email address"
- [ ] Enter your email
- [ ] Check inbox and click verification link
- [ ] Status should show "Verified" ✅

---

## ✅ Phase 3: Deploy Infrastructure (15 minutes)

### 6. Deploy CloudFormation Stack

```powershell
# Navigate to project
cd c:\Users\adity\Desktop\Code\Projects\Live_KART_project\Live_Kart

# Run deployment (takes 5-10 minutes)
powershell -ExecutionPolicy Bypass -File deploy.ps1
```

**When prompted, enter your verified email address!**

**What's being created:**

- ✅ Cognito User Pool (authentication)
- ✅ S3 Bucket (image storage)
- ✅ CloudFront Distribution (CDN)
- ✅ Lambda Functions (backend logic)
- ✅ DynamoDB Tables (database)
- ✅ IAM Roles (permissions)

---

## ✅ Phase 4: Create Users (2 minutes)

### 7. Create User Groups

```powershell
powershell -ExecutionPolicy Bypass -File scripts/create-user-groups.ps1
```

### 8. Create Test Users

```powershell
powershell -ExecutionPolicy Bypass -File scripts/create-test-users.ps1
```

**Test accounts created:**

- 👨‍💼 Admin: `admin@livekart.com` / `Admin123!`
- 🏪 Vendor: `vendor@livekart.com` / `Vendor123!`
- 🛒 Customer: `customer@livekart.com` / `Customer123!`

---

## ✅ Phase 5: Run Application (5 minutes)

### 9. Install & Start Frontend

```powershell
# Install dependencies
cd frontend
npm install

# Start dev server
npm run dev
```

### 10. Test Application

- [ ] Open: http://localhost:5173
- [ ] Click "Login"
- [ ] Enter: `customer@livekart.com` / `Customer123!`
- [ ] Should redirect to home page ✅

---

## 🎉 You're Live!

**Your LiveKart platform is now running with:**

- ✅ AWS Cognito authentication
- ✅ S3 image storage
- ✅ CloudFront CDN
- ✅ Lambda serverless functions
- ✅ DynamoDB database
- ✅ SES email service

**All within AWS Free Tier!**

---

## 📊 Monitor Your Usage

### Check Free Tier Usage

```powershell
# Open AWS Console → Billing Dashboard → Free Tier
```

### Set Up Billing Alert

1. Go to AWS Console → Billing → Billing Preferences
2. Enable "Receive Free Tier Usage Alerts"
3. Enter your email
4. Save

---

## 🧪 Test AWS Services

### Test S3 Upload

```powershell
# Get bucket name from .env
$BUCKET = (Get-Content frontend/.env | Select-String "VITE_S3_BUCKET").ToString().Split("=")[1]

# Upload test file
echo "Test" > test.txt
aws s3 cp test.txt s3://$BUCKET/test/test.txt
```

### Test Lambda Function

```powershell
aws lambda invoke `
    --function-name production-livekart-order-validation `
    --payload '{\"body\": \"{\\\"items\\\": []}\"}' `
    response.json

cat response.json
```

### View CloudWatch Logs

```powershell
aws logs tail /aws/lambda/production-livekart-order-validation --follow
```

---

## 🔧 Troubleshooting

### Problem: "aws: command not found"

**Solution:** Restart PowerShell after installing AWS CLI

### Problem: "Stack creation failed"

**Solution:**

```powershell
# Check error details
aws cloudformation describe-stack-events `
    --stack-name livekart-production `
    --query "StackEvents[?ResourceStatus=='CREATE_FAILED']"

# Delete failed stack and retry
aws cloudformation delete-stack --stack-name livekart-production
```

### Problem: "Email not verified"

**Solution:** Check inbox/spam for AWS verification email

### Problem: ".env file missing"

**Solution:** Re-run deployment script - it will recreate .env

### Problem: "Cannot login"

**Solution:** Make sure you ran `create-user-groups.ps1` and `create-test-users.ps1`

---

## 📚 Documentation

- **[Complete Setup Guide](./AWS_SETUP_GUIDE.md)** - Detailed instructions with screenshots
- **[Deployment Guide](./AWS_DEPLOYMENT_GUIDE.md)** - Technical deployment details
- **[Infrastructure Details](./infra/README.md)** - Architecture and services
- **[Integration Summary](./AWS_INTEGRATION_SUMMARY.md)** - What's been implemented

---

## 🗑️ Cleanup (When Done)

To avoid any charges, delete all resources:

```powershell
# Delete everything
aws cloudformation delete-stack --stack-name livekart-production

# Wait for deletion
aws cloudformation wait stack-delete-complete --stack-name livekart-production
```

---

## 💰 Cost Estimate

**Expected monthly cost:** $0.00 - $1.00

All services configured within Free Tier:

- Cognito: 50,000 MAUs free
- S3: 5 GB storage free
- CloudFront: 1 TB transfer free
- SES: 62,000 emails free
- Lambda: 1M requests free
- DynamoDB: 25 GB storage free

---

## 🎯 What's Next?

After deployment, consider:

- [ ] Request SES production access (unlimited emails)
- [ ] Add custom domain with Route 53
- [ ] Set up CloudWatch alarms
- [ ] Enable AWS Backup for DynamoDB
- [ ] Add more products to catalog
- [ ] Customize email templates
- [ ] Set up CI/CD with GitHub Actions

---

## 🆘 Need Help?

**Check these resources:**

1. **AWS Documentation:**

   - [AWS Free Tier](https://aws.amazon.com/free/)
   - [CloudFormation Docs](https://docs.aws.amazon.com/cloudformation/)
   - [Cognito Docs](https://docs.aws.amazon.com/cognito/)

2. **AWS Support:**

   - Free support plan included
   - Community forums
   - AWS Knowledge Center

3. **Project Documentation:**
   - Read `AWS_SETUP_GUIDE.md` for detailed steps
   - Check `AWS_DEPLOYMENT_GUIDE.md` for troubleshooting

---

## ✅ Final Checklist

Before considering deployment complete:

- [ ] CloudFormation stack shows "CREATE_COMPLETE"
- [ ] `.env` file exists in frontend folder
- [ ] SES email verified in AWS Console
- [ ] User groups created (customers, vendors, admins)
- [ ] Test users created
- [ ] Can login at http://localhost:5173
- [ ] Billing alerts configured
- [ ] Saved IAM access keys securely

---

**🎉 Congratulations! Your LiveKart e-commerce platform is live on AWS! 🎉**

**Time to deploy:** ~45 minutes total

**Ready to start? Run:** `powershell -ExecutionPolicy Bypass -File deploy.ps1`
