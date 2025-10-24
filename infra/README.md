# LiveKart Infrastructure

## AWS Services Architecture

This directory contains the Infrastructure as Code (IaC) for the LiveKart e-commerce platform, using AWS CloudFormation.

### Services Deployed

```
┌─────────────────────────────────────────────────────────────┐
│                    LiveKart Architecture                     │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐
│   Frontend   │
│  (React +    │
│   Vite)      │
└──────┬───────┘
       │
       ├──────────────────────┐
       │                      │
       ▼                      ▼
┌─────────────┐      ┌──────────────┐
│  AWS Cognito│      │   AWS S3     │
│  (Auth +    │      │  (Product    │
│   JWT)      │      │   Images)    │
└─────────────┘      └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  CloudFront  │
                     │   (CDN for   │
                     │   Images)    │
                     └──────────────┘

┌──────────────┐      ┌──────────────┐
│  AWS Lambda  │      │   DynamoDB   │
│  - Order Val │◄─────┤  - Products  │
│  - Image Proc│      │  - Orders    │
│  - Email Send│      │  - Sessions  │
│  - Cleanup   │      │  - Analytics │
└──────┬───────┘      └──────────────┘
       │
       ▼
┌──────────────┐
│   AWS SES    │
│  (Emails)    │
└──────────────┘
```

### 1. AWS Cognito - Authentication

- **User Pool**: Manages customer, vendor, and admin users
- **User Groups**: Role-based access control (RBAC)
- **JWT Tokens**: Secure API authentication
- **Features**:
  - Email verification
  - Password policies
  - Token expiration (1 hour access, 30 day refresh)
  - Group-based permissions

### 2. AWS S3 - Object Storage

- **Product Images Bucket**: Secure storage for uploaded images
- **Features**:
  - Server-side encryption (AES-256)
  - CORS enabled for web uploads
  - Lifecycle policies:
    - Delete thumbnails after 90 days
    - Transition to Infrequent Access after 30 days
  - Private bucket (CloudFront-only access)

### 3. AWS CloudFront - CDN

- **Distribution**: Global content delivery network
- **Features**:
  - HTTPS redirect
  - Caching optimized for images
  - Gzip/Brotli compression
  - Origin Access Control (OAC) for S3
  - Price Class 100 (North America & Europe)

### 4. AWS SES - Email Service

- **Verified Email Identity**: Sender email address
- **Usage**: Transactional emails
  - Order confirmations
  - Vendor notifications
  - Password resets
- **Mode**: Sandbox (200 emails/day) → Production (62,000/month)

### 5. AWS Lambda - Serverless Functions

Four Lambda functions handle backend logic:

#### a) Order Validation (`order-validation`)

- **Runtime**: Python 3.11
- **Memory**: 256 MB
- **Timeout**: 30 seconds
- **Purpose**: Validate order items, check stock, calculate total

#### b) Image Processing (`image-processing`)

- **Runtime**: Python 3.11
- **Memory**: 512 MB
- **Timeout**: 60 seconds
- **Purpose**: Generate thumbnails for uploaded images
- **Trigger**: S3 ObjectCreated event
- **Libraries**: Pillow (PIL)

#### c) Email Notifications (`email-notifications`)

- **Runtime**: Python 3.11
- **Memory**: 256 MB
- **Timeout**: 30 seconds
- **Purpose**: Send transactional emails via SES

#### d) Cleanup Job (`cleanup-job`)

- **Runtime**: Python 3.11
- **Memory**: 256 MB
- **Timeout**: 300 seconds
- **Purpose**: Delete old analytics data and expired sessions
- **Trigger**: EventBridge (daily schedule)

### 6. AWS DynamoDB - NoSQL Database

Four tables with on-demand billing:

#### a) Products Table

- **Primary Key**: `product_id` (String)
- **GSI**: `vendor-index`, `category-index`
- **Purpose**: Store product listings

#### b) Orders Table

- **Primary Key**: `order_id` (String)
- **GSI**: `user-orders-index`
- **Purpose**: Store customer orders

#### c) Sessions Table

- **Primary Key**: `session_id` (String)
- **GSI**: `user-index`
- **TTL**: Enabled (auto-delete expired sessions)
- **Purpose**: Store active user sessions

#### d) Analytics Table

- **Primary Key**: `product_id` (String), `timestamp` (Number)
- **Purpose**: Track product views and trending data

---

## Deployment

### Quick Deploy

```bash
# Deploy stack
aws cloudformation create-stack \
  --stack-name livekart-production \
  --template-body file://cloudformation-template.yml \
  --parameters \
      ParameterKey=EnvironmentName,ParameterValue=production \
      ParameterKey=SESVerifiedEmail,ParameterValue=your@email.com \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1

# Check status
aws cloudformation describe-stacks \
  --stack-name livekart-production \
  --query 'Stacks[0].StackStatus'
```

### Update Stack

```bash
aws cloudformation update-stack \
  --stack-name livekart-production \
  --template-body file://cloudformation-template.yml \
  --parameters \
      ParameterKey=EnvironmentName,ParameterValue=production \
      ParameterKey=SESVerifiedEmail,ParameterValue=your@email.com \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1
```

### Delete Stack

```bash
# Empty S3 bucket first (required)
aws s3 rm s3://production-livekart-product-images-ACCOUNT_ID --recursive

# Delete stack
aws cloudformation delete-stack \
  --stack-name livekart-production \
  --region us-east-1
```

---

## Environment Variables

After deployment, get these outputs:

```bash
aws cloudformation describe-stacks \
  --stack-name livekart-production \
  --query 'Stacks[0].Outputs'
```

Add to `frontend/.env`:

```env
VITE_AWS_REGION=us-east-1
VITE_COGNITO_USER_POOL_ID=<UserPoolId>
VITE_COGNITO_CLIENT_ID=<UserPoolClientId>
VITE_S3_BUCKET_NAME=<ProductImagesBucketName>
VITE_CLOUDFRONT_DOMAIN=<CloudFrontDomainName>
VITE_CLOUDFRONT_URL=<CloudFrontURL>
VITE_DYNAMODB_PRODUCTS_TABLE=<ProductsTableName>
VITE_DYNAMODB_ORDERS_TABLE=<OrdersTableName>
VITE_DYNAMODB_SESSIONS_TABLE=<SessionsTableName>
VITE_DYNAMODB_ANALYTICS_TABLE=<AnalyticsTableName>
```

---

## Free Tier Optimization

### Resource Limits (Free Tier)

| Service    | Free Tier Limit                   | Cost After                               |
| ---------- | --------------------------------- | ---------------------------------------- |
| Cognito    | 50,000 MAUs                       | $0.0055/MAU                              |
| S3         | 5 GB, 20K GET, 2K PUT/month       | $0.023/GB, $0.0004/request               |
| CloudFront | 1 TB transfer, 10M requests/month | $0.085/GB, $0.0075/10K requests          |
| SES        | 62,000 emails/month               | $0.10/1,000 emails                       |
| Lambda     | 1M requests, 400K GB-sec/month    | $0.20/1M requests, $0.0000166667/GB-sec  |
| DynamoDB   | 25 GB, 25 WCU, 25 RCU             | On-demand: $1.25/M writes, $0.25/M reads |

### Cost Reduction Tips

1. **Enable CloudFront caching** with long TTL (86400s = 24 hours)
2. **Use S3 lifecycle policies** to move old data to cheaper tiers
3. **Set Lambda reserved concurrency to 0** for non-critical functions
4. **Use DynamoDB on-demand** mode for unpredictable traffic
5. **Compress images** before upload to reduce S3 storage costs
6. **Enable CloudWatch Logs expiration** (7 days)

---

## Monitoring

### CloudWatch Alarms

Set up alerts for:

- Lambda error rate > 5%
- DynamoDB throttled requests > 0
- S3 storage > 4 GB
- CloudFront 4xx/5xx errors > 10%

```bash
# Create Lambda error alarm
aws cloudwatch put-metric-alarm \
  --alarm-name livekart-lambda-errors \
  --alarm-description "Alert on Lambda errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=production-livekart-order-validation
```

### View Logs

```bash
# Lambda logs
aws logs tail /aws/lambda/production-livekart-order-validation --follow

# CloudFront logs (if enabled)
aws s3 ls s3://production-livekart-cloudfront-logs/
```

---

## Security

### IAM Roles & Policies

- **Lambda Execution Role**: Minimal permissions
  - DynamoDB: Read/Write to specific tables
  - S3: GetObject/PutObject/DeleteObject on images bucket
  - SES: SendEmail/SendRawEmail
  - CloudWatch Logs: CreateLogGroup/CreateLogStream/PutLogEvents

### S3 Bucket Policy

- Private bucket (no public access)
- CloudFront-only access via OAC
- CORS enabled for web uploads

### Cognito Security

- Password policy: 8+ chars, uppercase, lowercase, numbers
- Token expiration: 1 hour (access), 30 days (refresh)
- MFA recommended for admins

---

## Troubleshooting

### Common Issues

#### 1. Stack Creation Failed

```bash
# View error details
aws cloudformation describe-stack-events \
  --stack-name livekart-production \
  --query 'StackEvents[?ResourceStatus==`CREATE_FAILED`]'
```

#### 2. Lambda Function Timeout

- Increase timeout in template (up to 300 seconds)
- Optimize function code
- Check CloudWatch Logs

#### 3. S3 Upload Failed

- Verify IAM permissions
- Check CORS configuration
- Ensure bucket policy allows uploads

#### 4. CloudFront Not Serving Images

- Wait 5-10 minutes for distribution to deploy
- Verify OAC is configured
- Check S3 bucket policy allows CloudFront

---

## Additional Resources

- [AWS CloudFormation Documentation](https://docs.aws.amazon.com/cloudformation/)
- [AWS Free Tier Details](https://aws.amazon.com/free/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Deployment Guide](../AWS_DEPLOYMENT_GUIDE.md)

---

## Support

For infrastructure issues:

1. Check CloudFormation events
2. Review Lambda CloudWatch Logs
3. Verify IAM permissions
4. Check service quotas

---

## License

MIT License - See LICENSE file for details
