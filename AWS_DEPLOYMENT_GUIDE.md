# LiveKart AWS Deployment Guide

## Overview

This guide walks you through deploying the LiveKart e-commerce platform using six AWS services, all configured within Free Tier limits to minimize costs.

## Services Used

1. **AWS Cognito** - User authentication & authorization
2. **AWS S3** - Product image storage
3. **AWS CloudFront** - CDN for global image delivery
4. **AWS SES** - Transactional email service
5. **AWS Lambda** - Serverless backend logic
6. **AWS DynamoDB** - Fast NoSQL database

---

## Prerequisites

### 1. AWS Account Setup

- Create an AWS account at https://aws.amazon.com
- Enable Free Tier alerts in AWS Billing
- Set up AWS CLI:
  ```bash
  aws configure
  # Enter your Access Key ID, Secret Access Key, Region (us-east-1), and output format (json)
  ```

### 2. Required Tools

- AWS CLI (v2+)
- Node.js (v18+)
- Python 3.11+
- Git

---

## Deployment Steps

### Step 1: Deploy CloudFormation Stack

1. **Update Parameters**
   Edit `infra/cloudformation-template.yml` parameters:

   ```yaml
   Parameters:
     EnvironmentName:
       Default: production
     SESVerifiedEmail:
       Default: your-email@example.com # Change this to your email
   ```

2. **Validate Template**

   ```bash
   aws cloudformation validate-template \
     --template-body file://infra/cloudformation-template.yml
   ```

3. **Deploy Stack**

   ```bash
   aws cloudformation create-stack \
     --stack-name livekart-production \
     --template-body file://infra/cloudformation-template.yml \
     --parameters ParameterKey=EnvironmentName,ParameterValue=production \
                  ParameterKey=SESVerifiedEmail,ParameterValue=your-email@example.com \
     --capabilities CAPABILITY_NAMED_IAM \
     --region us-east-1
   ```

4. **Monitor Deployment**

   ```bash
   aws cloudformation describe-stacks \
     --stack-name livekart-production \
     --region us-east-1 \
     --query 'Stacks[0].StackStatus'
   ```

   Wait until status is `CREATE_COMPLETE` (5-10 minutes)

5. **Get Stack Outputs**
   ```bash
   aws cloudformation describe-stacks \
     --stack-name livekart-production \
     --region us-east-1 \
     --query 'Stacks[0].Outputs'
   ```

---

### Step 2: Configure AWS SES (Email Service)

1. **Verify Your Email Address**

   ```bash
   # Check verification status
   aws ses get-identity-verification-attributes \
     --identities your-email@example.com \
     --region us-east-1
   ```

2. **Check Your Email**

   - You'll receive a verification email from AWS
   - Click the verification link

3. **Request Production Access** (Optional - for more than 200 emails/day)
   - Go to AWS Console → SES → Account Dashboard
   - Click "Request production access"
   - Fill out the form (takes 24-48 hours)

**Note:** In sandbox mode, you can only send to verified email addresses.

---

### Step 3: Configure Lambda Functions

The CloudFormation template already deployed Lambda functions, but they need the PIL library for image processing.

1. **Create Lambda Layer for PIL (Pillow)**

   ```bash
   mkdir -p lambda-layers/python/lib/python3.11/site-packages
   cd lambda-layers

   # Install Pillow
   pip install Pillow -t python/lib/python3.11/site-packages/

   # Create layer zip
   zip -r pillow-layer.zip python/

   # Upload to AWS
   aws lambda publish-layer-version \
     --layer-name pillow-layer \
     --zip-file fileb://pillow-layer.zip \
     --compatible-runtimes python3.11 python3.12 \
     --region us-east-1
   ```

2. **Update Image Processing Lambda**

   ```bash
   # Get the layer ARN from previous command
   LAYER_ARN="arn:aws:lambda:us-east-1:YOUR_ACCOUNT:layer:pillow-layer:1"

   aws lambda update-function-configuration \
     --function-name production-livekart-image-processing \
     --layers $LAYER_ARN \
     --region us-east-1
   ```

3. **Configure S3 Trigger for Image Processing**

   ```bash
   aws s3api put-bucket-notification-configuration \
     --bucket production-livekart-product-images-YOUR_ACCOUNT_ID \
     --notification-configuration file://s3-notification-config.json \
     --region us-east-1
   ```

   Create `s3-notification-config.json`:

   ```json
   {
     "LambdaFunctionConfigurations": [
       {
         "LambdaFunctionArn": "arn:aws:lambda:us-east-1:YOUR_ACCOUNT:function:production-livekart-image-processing",
         "Events": ["s3:ObjectCreated:*"],
         "Filter": {
           "Key": {
             "FilterRules": [
               {
                 "Name": "prefix",
                 "Value": "products/"
               }
             ]
           }
         }
       }
     ]
   }
   ```

---

### Step 4: Configure Frontend Environment

1. **Create Frontend .env File**

   ```bash
   cd frontend
   cp .env.example .env
   ```

2. **Update .env with CloudFormation Outputs**

   ```env
   # Get these values from CloudFormation outputs
   VITE_AWS_REGION=us-east-1
   VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
   VITE_COGNITO_CLIENT_ID=your-client-id
   VITE_S3_BUCKET_NAME=production-livekart-product-images-123456789
   VITE_CLOUDFRONT_DOMAIN=d1234567890.cloudfront.net
   VITE_CLOUDFRONT_URL=https://d1234567890.cloudfront.net

   # DynamoDB Tables
   VITE_DYNAMODB_PRODUCTS_TABLE=production-livekart-products
   VITE_DYNAMODB_ORDERS_TABLE=production-livekart-orders
   VITE_DYNAMODB_SESSIONS_TABLE=production-livekart-sessions
   VITE_DYNAMODB_ANALYTICS_TABLE=production-livekart-analytics
   ```

3. **Install Dependencies & Build**
   ```bash
   npm install
   npm run build
   ```

---

### Step 5: Create Cognito Users & Groups

1. **Create Test Users**

   ```bash
   # Create admin user
   aws cognito-idp admin-create-user \
     --user-pool-id us-east-1_XXXXXXXXX \
     --username admin@livekart.com \
     --user-attributes Name=email,Value=admin@livekart.com Name=name,Value="Admin User" \
     --temporary-password "TempPass123!" \
     --message-action SUPPRESS \
     --region us-east-1

   # Add to admin group
   aws cognito-idp admin-add-user-to-group \
     --user-pool-id us-east-1_XXXXXXXXX \
     --username admin@livekart.com \
     --group-name admins \
     --region us-east-1

   # Create vendor user
   aws cognito-idp admin-create-user \
     --user-pool-id us-east-1_XXXXXXXXX \
     --username vendor@livekart.com \
     --user-attributes Name=email,Value=vendor@livekart.com Name=name,Value="Vendor User" \
     --temporary-password "TempPass123!" \
     --message-action SUPPRESS \
     --region us-east-1

   # Add to vendor group
   aws cognito-idp admin-add-user-to-group \
     --user-pool-id us-east-1_XXXXXXXXX \
     --username vendor@livekart.com \
     --group-name vendors \
     --region us-east-1
   ```

2. **Set Permanent Password**
   ```bash
   aws cognito-idp admin-set-user-password \
     --user-pool-id us-east-1_XXXXXXXXX \
     --username admin@livekart.com \
     --password "Admin123!" \
     --permanent \
     --region us-east-1
   ```

---

### Step 6: Test the Deployment

1. **Test S3 Upload**

   ```bash
   echo "Test file" > test.txt
   aws s3 cp test.txt s3://production-livekart-product-images-YOUR_ACCOUNT/test.txt
   ```

2. **Test CloudFront**

   ```bash
   curl https://d1234567890.cloudfront.net/test.txt
   ```

3. **Test Lambda Functions**

   ```bash
   # Test Order Validation
   aws lambda invoke \
     --function-name production-livekart-order-validation \
     --payload '{"body": "{\"items\": []}"}' \
     --region us-east-1 \
     response.json

   cat response.json
   ```

4. **Test DynamoDB**

   ```bash
   # List tables
   aws dynamodb list-tables --region us-east-1

   # Describe products table
   aws dynamodb describe-table \
     --table-name production-livekart-products \
     --region us-east-1
   ```

---

## Free Tier Limits & Monitoring

### Current Service Limits

- **Cognito**: 50,000 MAUs (Monthly Active Users) - Free forever
- **S3**: 5 GB storage, 20,000 GET requests, 2,000 PUT requests/month
- **CloudFront**: 1 TB data transfer out, 10 million HTTP/HTTPS requests/month
- **SES**: 200 emails/day (sandbox), 62,000/month (production)
- **Lambda**: 1 million requests/month, 400,000 GB-seconds compute
- **DynamoDB**: 25 GB storage, 25 WCU, 25 RCU (on-demand has no free tier but is cost-effective for low traffic)

### Set Up Billing Alerts

1. Go to AWS Console → Billing → Budgets
2. Create a budget:
   - Budget type: Cost budget
   - Amount: $10/month
   - Alert threshold: 80%

### Monitor Usage

```bash
# Check Lambda invocations
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=production-livekart-order-validation \
  --start-time 2025-01-01T00:00:00Z \
  --end-time 2025-01-31T23:59:59Z \
  --period 86400 \
  --statistics Sum \
  --region us-east-1

# Check S3 storage
aws cloudwatch get-metric-statistics \
  --namespace AWS/S3 \
  --metric-name BucketSizeBytes \
  --dimensions Name=BucketName,Value=production-livekart-product-images-YOUR_ACCOUNT \
               Name=StorageType,Value=StandardStorage \
  --start-time 2025-01-01T00:00:00Z \
  --end-time 2025-01-31T23:59:59Z \
  --period 86400 \
  --statistics Average \
  --region us-east-1
```

---

## Troubleshooting

### Issue: CloudFormation Stack Creation Failed

**Solution:**

1. Check the stack events:
   ```bash
   aws cloudformation describe-stack-events \
     --stack-name livekart-production \
     --region us-east-1
   ```
2. Delete failed stack:
   ```bash
   aws cloudformation delete-stack \
     --stack-name livekart-production \
     --region us-east-1
   ```
3. Fix issues and redeploy

### Issue: Lambda Function Timeout

**Solution:**

- Increase timeout in CloudFormation template (max 300 seconds)
- Optimize function code
- Check CloudWatch Logs:
  ```bash
  aws logs tail /aws/lambda/production-livekart-order-validation \
    --follow \
    --region us-east-1
  ```

### Issue: S3 Upload Permission Denied

**Solution:**

1. Check IAM role permissions
2. Verify bucket policy
3. Check CORS configuration

### Issue: SES Email Not Sending

**Solution:**

1. Verify email address is verified in SES
2. Check SES sandbox restrictions
3. Verify Lambda has SES permissions

---

## Clean Up (Delete All Resources)

**⚠️ WARNING: This will delete all data!**

```bash
# Empty S3 bucket first
aws s3 rm s3://production-livekart-product-images-YOUR_ACCOUNT --recursive --region us-east-1

# Delete CloudFormation stack
aws cloudformation delete-stack \
  --stack-name livekart-production \
  --region us-east-1

# Monitor deletion
aws cloudformation describe-stacks \
  --stack-name livekart-production \
  --region us-east-1 \
  --query 'Stacks[0].StackStatus'
```

---

## Next Steps

1. **Set up CI/CD Pipeline** using AWS CodePipeline
2. **Configure Custom Domain** with Route 53 and ACM
3. **Enable CloudWatch Alarms** for Lambda errors
4. **Implement API Gateway** for RESTful APIs
5. **Add WAF Rules** for CloudFront security
6. **Enable S3 versioning** for image backup

---

## Support

For issues or questions:

- AWS Documentation: https://docs.aws.amazon.com
- AWS Free Tier: https://aws.amazon.com/free/
- Stack Overflow: Use tag `aws`

---

## Cost Optimization Tips

1. **Use CloudFront Caching** aggressively (TTL: 24 hours for product images)
2. **Enable S3 Lifecycle Policies** to transition old data to cheaper storage
3. **Set DynamoDB to On-Demand** mode for unpredictable traffic
4. **Use Lambda Reserved Concurrency** (0) for non-critical functions to prevent runaway costs
5. **Enable CloudWatch Logs expiration** (7 days retention)
6. **Use S3 Intelligent-Tiering** for infrequently accessed images

---

**Deployed Successfully! 🎉**

Your LiveKart e-commerce platform is now running on AWS with minimal costs!
