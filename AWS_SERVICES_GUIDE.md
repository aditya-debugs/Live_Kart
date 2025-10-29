# ☁️ LiveKart - AWS Services Setup Guide

**Complete step-by-step guide for setting up all AWS services**

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [AWS Account Setup](#-aws-account-setup)
3. [DynamoDB Setup](#-dynamodb-setup)
4. [S3 Setup](#-s3-setup)
5. [Cognito Setup](#-cognito-setup)
6. [Lambda Functions Setup](#-lambda-functions-setup)
7. [IAM Permissions](#-iam-permissions)
8. [Testing Your Setup](#-testing-your-setup)
9. [AWS Academy / Learner Lab](#-aws-academy--learner-lab-setup)
10. [Monitoring & Maintenance](#-monitoring--maintenance)

---

## 🎯 Overview

### Services We'll Set Up

| Service            | Purpose                              | Free Tier Limit        |
| ------------------ | ------------------------------------ | ---------------------- |
| **AWS Cognito**    | User authentication & management     | 50,000 MAUs free       |
| **AWS DynamoDB**   | NoSQL database for products & orders | 25 GB storage free     |
| **AWS S3**         | Image storage                        | 5 GB storage free      |
| **AWS Lambda**     | Serverless API functions             | 1M requests/month free |
| **AWS CloudWatch** | Logging & monitoring                 | 10 custom metrics free |

### Architecture Diagram

```
┌─────────────────┐
│   React App     │
│  (Frontend)     │
└────────┬────────┘
         │
         ↓ HTTPS
┌─────────────────┐
│  AWS Cognito    │  ← Authentication
│  (User Pool)    │
└────────┬────────┘
         │ JWT Token
         ↓
┌─────────────────────────────────────────┐
│         AWS Lambda Functions             │
│  ┌─────────┬─────────┬─────────────┐   │
│  │Products │ Orders  │   Upload    │   │
│  │  APIs   │  APIs   │    API      │   │
│  └────┬────┴────┬────┴──────┬──────┘   │
└───────┼─────────┼───────────┼──────────┘
        │         │           │
        ↓         ↓           ↓
   ┌─────────┐ ┌──────┐  ┌────────┐
   │DynamoDB │ │Orders│  │   S3   │
   │Products │ │Table │  │ Bucket │
   └─────────┘ └──────┘  └────────┘
```

### Estimated Setup Time

- DynamoDB: 10 minutes
- S3: 10 minutes
- Cognito: 15 minutes
- Lambda Functions: 40-60 minutes (8 functions × 5-8 min each)
- **Total: ~90 minutes**

---

## 🔐 AWS Account Setup

### Step 1: Create AWS Account

1. Go to https://aws.amazon.com/
2. Click **"Create an AWS Account"**
3. Fill in:
   - Email address
   - Password
   - AWS account name
4. Choose **"Personal"** account type
5. Add payment information (for verification only - Free Tier won't charge)
6. Verify phone number
7. Choose **"Basic Support - Free"**

### Step 2: Sign In to AWS Console

1. Go to https://console.aws.amazon.com/
2. Sign in with your root account credentials
3. **Important:** Enable MFA (Multi-Factor Authentication) for security:
   - Click account name → Security Credentials
   - Enable MFA

### Step 3: Set Region

**CRITICAL:** Use **us-east-1 (N. Virginia)** for all services

1. Look at top-right corner of AWS Console
2. Click the region dropdown
3. Select **"US East (N. Virginia) us-east-1"**
4. All services must be in the same region!

### Step 4: Create IAM User (Optional but Recommended)

Instead of using root account:

1. Go to IAM service
2. Click **"Users"** → **"Create user"**
3. Username: `livekart-admin`
4. Enable **"Provide user access to AWS Management Console"**
5. Click **"Next"**
6. Click **"Attach policies directly"**
7. Select **"AdministratorAccess"**
8. Click **"Create user"**
9. **Save the credentials!**

---

## 🗄️ DynamoDB Setup

### Step 1: Create Products Table

1. Go to **DynamoDB** service in AWS Console
2. Click **"Create table"**

**Configuration:**

```
Table name: Products
Partition key: productId (String)
Sort key: (leave empty)

Table settings: Default settings
Capacity mode: On-demand (or Provisioned with 5 RCU / 5 WCU)
Encryption: AWS owned key (free)
```

3. Click **"Create table"** (takes ~30 seconds)

### Step 2: Create Orders Table

1. Click **"Create table"** again

**Configuration:**

```
Table name: Orders
Partition key: orderId (String)
Sort key: (leave empty)

Table settings: Default settings
Capacity mode: On-demand
```

2. Click **"Create table"**

### Step 3: Create Users Table

**Configuration:**

```
Table name: Users
Partition key: userId (String)
Sort key: (leave empty)
```

### Step 4: Create Sessions Table

**Configuration:**

```
Table name: Sessions
Partition key: sessionId (String)
Sort key: (leave empty)
```

### Step 5: Add Global Secondary Index to Products (Optional)

For querying by category:

1. Click **Products** table
2. Go to **"Indexes"** tab
3. Click **"Create index"**

**Configuration:**

```
Partition key: category (String)
Sort key: createdAt (Number)
Index name: category-index
Projection type: All
```

4. Click **"Create index"**

### Verify Setup

You should now have 4 tables:

- ✅ Products
- ✅ Orders
- ✅ Users
- ✅ Sessions

---

## 📦 S3 Setup

### Step 1: Create S3 Bucket

1. Go to **S3** service
2. Click **"Create bucket"**

**Configuration:**

```
Bucket name: livekart-products-<your-unique-id>
  (Example: livekart-products-2024-abc123)
  Note: Must be globally unique!

Region: US East (N. Virginia) us-east-1

Block Public Access: UNCHECK all boxes
  ⚠️ We need public read access for product images

Bucket Versioning: Disabled
Default encryption: Disabled (to stay in free tier)
```

3. Check ✅ **"I acknowledge that the current settings might result in this bucket and the objects within becoming public"**
4. Click **"Create bucket"**

### Step 2: Configure CORS

1. Click on your bucket name
2. Go to **"Permissions"** tab
3. Scroll to **"Cross-origin resource sharing (CORS)"**
4. Click **"Edit"**
5. Paste this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": [
      "ETag",
      "x-amz-server-side-encryption",
      "x-amz-request-id"
    ],
    "MaxAgeSeconds": 3000
  }
]
```

6. Click **"Save changes"**

### Step 3: Set Bucket Policy (Public Read)

1. Stay in **"Permissions"** tab
2. Scroll to **"Bucket policy"**
3. Click **"Edit"**
4. Paste (replace `YOUR-BUCKET-NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

5. Click **"Save changes"**

### Step 4: Test Upload

1. Go to **"Objects"** tab
2. Click **"Upload"**
3. Add a test image
4. Click **"Upload"**
5. Click on the uploaded file
6. Copy the **Object URL**
7. Open in browser - should display the image ✅

### Save Bucket Name

You'll need this for:

- Lambda environment variables
- Frontend configuration

```
S3_BUCKET = livekart-products-<your-unique-id>
```

---

## 👤 Cognito Setup

### Step 1: Create User Pool

1. Go to **AWS Cognito** service
2. Click **"Create user pool"**

### Step 2: Configure Sign-in Experience

**Page 1: Sign-in experience**

```
Authentication providers:
  ✅ Cognito user pool

Cognito user pool sign-in options:
  ✅ Email
  ✅ Username

Username requirements:
  ✅ Allow users to sign in with preferred username
```

Click **"Next"**

### Step 3: Configure Security Requirements

**Page 2: Security requirements**

```
Password policy:
  ○ Cognito defaults (recommended)
  Minimum length: 8 characters
  Password requirements:
    ✅ Contains at least 1 number
    ✅ Contains at least 1 special character
    ✅ Contains at least 1 uppercase letter
    ✅ Contains at least 1 lowercase letter

Multi-factor authentication:
  ○ No MFA (for development)

User account recovery:
  ✅ Enable self-service account recovery
  ✅ Email only
```

Click **"Next"**

### Step 4: Configure Sign-up Experience

**Page 3: Sign-up experience**

```
Self-service sign-up:
  ✅ Enable self-registration

Attribute verification:
  ✅ Allow Cognito to automatically send messages to verify
  ✅ Send email message, verify email address

Required attributes:
  ✅ email
  ✅ name

Custom attributes: (Optional - for role-based access)
  Click "Add custom attribute"
  Name: role
  Type: String
  Mutable: Yes
  Min length: 1
  Max length: 20
```

Click **"Next"**

### Step 5: Configure Message Delivery

**Page 4: Message delivery**

```
Email provider:
  ○ Send email with Amazon SES - Recommended

  If not verified yet:
  ○ Send email with Cognito (300 emails/day limit)

SES Region: US East (N. Virginia)
FROM email address: no-reply@verificationemail.com (default)
```

**If using SES (Recommended):**

1. Go to Amazon SES service
2. Click **"Verified identities"**
3. Click **"Create identity"**
4. Select **"Email address"**
5. Enter your email
6. Check inbox and verify
7. Return to Cognito setup

Click **"Next"**

### Step 6: Integrate Your App

**Page 5: Integrate your app**

```
User pool name: livekart-user-pool

Hosted authentication pages:
  ○ No hosted UI

Initial app client:
  App type: Public client
  App client name: livekart

  Client secret: Don't generate a client secret

  Authentication flows:
    ✅ ALLOW_USER_PASSWORD_AUTH (IMPORTANT!)
    ✅ ALLOW_REFRESH_TOKEN_AUTH
    ✅ ALLOW_CUSTOM_AUTH (optional)
```

**⚠️ CRITICAL:** Must enable **ALLOW_USER_PASSWORD_AUTH**

Click **"Next"**

### Step 7: Review and Create

Review all settings, then click **"Create user pool"**

### Step 8: Save Configuration Details

After creation, you'll see:

```
User Pool ID: us-east-1_xxxxxxxxx
```

Click on your user pool, then **"App integration"** tab:

```
App client ID: xxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Save these values!** You'll need them for:

- `frontend/.env` → `VITE_USER_POOL_ID` and `VITE_USER_POOL_CLIENT_ID`
- Lambda environment variables → `USER_POOL_ID`

### Step 9: Enable Email Alias (If Not Already Enabled)

1. Go to your User Pool
2. Click **"Sign-in experience"** tab
3. Under **"User name requirements"**:
   - Should see ✅ **Email address**
4. If not enabled, this allows users to sign in with email OR username

### Step 10: Create User Groups (Optional - for role management)

**Option A: Using AWS Console**

1. Go to your User Pool → **"Groups"** tab
2. Create 3 groups:

**Customer Group:**

```
Group name: customer
Description: Regular customers who can browse and buy products
Precedence: 3
```

**Vendor Group:**

```
Group name: vendor
Description: Vendors who can manage their products
Precedence: 2
```

**Admin Group:**

```
Group name: admin
Description: Administrators with full access
Precedence: 1
```

**Option B: Using Script (Automated)**

```powershell
# Windows
powershell -ExecutionPolicy Bypass -File scripts/create-user-groups.ps1
```

```bash
# Linux/Mac
bash scripts/create-user-groups.sh
```

### Step 11: Create Test Users

**Option A: Manual Creation**

1. Go to User Pool → **"Users"** tab
2. Click **"Create user"**

**Customer User:**

```
Username: customer_user
Email: customer@livekart.com
Temporary password: TempPass123!
✅ Mark email address as verified
✅ Send an email invitation: No
```

3. Click **"Create user"**
4. After creation, click on user → **"Group memberships"** → Add to `customer` group

**Option B: Using Script (Automated)**

```powershell
# Windows
powershell -ExecutionPolicy Bypass -File scripts/create-test-users.ps1
```

This creates:

- customer@livekart.com / Customer123!
- vendor@livekart.com / Vendor123!
- admin@livekart.com / Admin123!

### Step 12: Test Authentication

1. Open your app: http://localhost:5173
2. Click **"Login"**
3. Try signing in with test credentials
4. Should redirect based on role ✅

### Troubleshooting Cognito Issues

**Issue: "USER_PASSWORD_AUTH flow not enabled"**

Solution:

1. Go to User Pool → **"App integration"** tab
2. Click on your app client
3. Click **"Edit"**
4. Under **"Authentication flows"**:
   - ✅ Enable **ALLOW_USER_PASSWORD_AUTH**
5. Click **"Save changes"**

**Issue: "Username cannot be of email format"**

Solution: This is handled in the code. `AuthContext.tsx` generates non-email usernames automatically from the user's name.

**Issue: "Attributes did not conform to the schema: custom:role"**

Solution:

- Option 1: Add `custom:role` attribute in Cognito (see Step 4 above)
- Option 2: Code handles this by defaulting to "customer" role

---

## ⚡ Lambda Functions Setup

### Overview

We'll create **8 Lambda functions**:

| Function        | Purpose                | Permissions Needed        |
| --------------- | ---------------------- | ------------------------- |
| `getProducts`   | List all products      | DynamoDB Read, S3 Read    |
| `getProduct`    | Get single product     | DynamoDB Read, S3 Read    |
| `createProduct` | Create product         | DynamoDB Write            |
| `updateProduct` | Update product         | DynamoDB Write            |
| `deleteProduct` | Delete product         | DynamoDB Write, S3 Delete |
| `getUploadUrl`  | Generate S3 upload URL | S3 Write                  |
| `createOrder`   | Create order           | DynamoDB Write            |
| `getOrders`     | Get user orders        | DynamoDB Read             |

### Prerequisites

Before starting:

- ✅ DynamoDB tables created
- ✅ S3 bucket created and configured
- ✅ Cognito User Pool created
- ✅ Know your AWS region (us-east-1)

---

### Lambda Function #1: getProducts

#### Step 1: Create Function

1. Go to **AWS Lambda** service
2. Click **"Create function"**

**Configuration:**

```
○ Author from scratch

Function name: getProducts
Runtime: Node.js 18.x

Permissions:
  ○ Create a new role with basic Lambda permissions
```

3. Click **"Create function"**

#### Step 2: Add Code

1. Scroll to **"Code source"** section
2. Delete the default code
3. Copy from `backend/lambda/products/getProducts.js` and paste
4. Click **"Deploy"**

#### Step 3: Add Environment Variables

1. Go to **"Configuration"** tab
2. Click **"Environment variables"** in left sidebar
3. Click **"Edit"**
4. Add these variables:

```
AWS_REGION = us-east-1
PRODUCTS_TABLE = Products
S3_BUCKET = livekart-products-<your-id>
```

5. Click **"Save"**

#### Step 4: Configure IAM Permissions

1. Stay in **"Configuration"** tab
2. Click **"Permissions"** in left sidebar
3. Click the role name (opens in new tab)
4. Click **"Add permissions"** → **"Attach policies"**
5. Search and select:
   - ✅ `AmazonDynamoDBFullAccess`
   - ✅ `AmazonS3FullAccess`
6. Click **"Add permissions"**

#### Step 5: Create Function URL

1. Go to **"Configuration"** tab
2. Click **"Function URL"** in left sidebar
3. Click **"Create function URL"**

**Configuration:**

```
Auth type: NONE

Configure cross-origin resource sharing (CORS):
  ✅ Enable

Allow origin: *
Allow methods: GET, POST, PUT, DELETE, OPTIONS
Allow headers: *
Expose headers: *
Max age: 86400
✅ Allow credentials
```

4. Click **"Save"**
5. **Copy the Function URL!**

```
Example: https://abc123xyz.lambda-url.us-east-1.on.aws/
```

#### Step 6: Test Function

1. Go to **"Test"** tab
2. Click **"Create new test event"**

**Configuration:**

```
Event name: testGetProducts
Event JSON:
{
  "headers": {},
  "queryStringParameters": null
}
```

3. Click **"Save"**
4. Click **"Test"**

**Expected response:**

```json
{
  "statusCode": 200,
  "body": {
    "success": true,
    "count": 0,
    "products": []
  }
}
```

✅ **Function #1 Complete!**

---

### Lambda Function #2: getProduct

**Repeat the same process as Function #1 with these differences:**

**Step 1: Create Function**

```
Function name: getProduct
Runtime: Node.js 18.x
```

**Step 2: Add Code**

- Copy from `backend/lambda/products/getProduct.js`

**Step 3: Environment Variables**

```
AWS_REGION = us-east-1
PRODUCTS_TABLE = Products
S3_BUCKET = livekart-products-<your-id>
```

**Step 4: IAM Permissions**

- Same as Function #1

**Step 5: Function URL**

- Same configuration as Function #1

**Step 6: Test**

```json
{
  "pathParameters": {
    "productId": "test-product-123"
  }
}
```

---

### Lambda Function #3: createProduct

**Step 1-2: Same process**

```
Function name: createProduct
Code: backend/lambda/products/createProduct.js
```

**Step 3: Environment Variables**

```
AWS_REGION = us-east-1
PRODUCTS_TABLE = Products
USER_POOL_ID = us-east-1_xxxxxxxxx
```

**Step 4: IAM Permissions**

- `AmazonDynamoDBFullAccess`
- `AmazonCognitoReadOnly` (for JWT verification)

**Step 5-6: Same as Function #1**

**Test Event:**

```json
{
  "headers": {
    "authorization": "Bearer <your-jwt-token>"
  },
  "body": "{\"name\":\"Test Product\",\"price\":29.99,\"category\":\"electronics\"}"
}
```

---

### Lambda Function #4: updateProduct

```
Function name: updateProduct
Code: backend/lambda/products/updateProduct.js
Environment Variables: AWS_REGION, PRODUCTS_TABLE, USER_POOL_ID
IAM: DynamoDB + Cognito
```

---

### Lambda Function #5: deleteProduct

```
Function name: deleteProduct
Code: backend/lambda/products/deleteProduct.js
Environment Variables: AWS_REGION, PRODUCTS_TABLE, S3_BUCKET, USER_POOL_ID
IAM: DynamoDB + S3 + Cognito
```

---

### Lambda Function #6: getUploadUrl

```
Function name: getUploadUrl
Code: backend/lambda/upload/getUploadUrl.js
Environment Variables: AWS_REGION, S3_BUCKET, USER_POOL_ID
IAM: S3 + Cognito
```

---

### Lambda Function #7: createOrder

```
Function name: createOrder
Code: backend/lambda/orders/createOrder.js
Environment Variables: AWS_REGION, PRODUCTS_TABLE, ORDERS_TABLE, USER_POOL_ID
IAM: DynamoDB + Cognito
```

---

### Lambda Function #8: getOrders

```
Function name: getOrders
Code: backend/lambda/orders/getOrders.js
Environment Variables: AWS_REGION, ORDERS_TABLE, USER_POOL_ID
IAM: DynamoDB + Cognito
```

---

### Save All Function URLs

Create a file `lambda-urls.txt`:

```
getProducts: https://xxxxx.lambda-url.us-east-1.on.aws/
getProduct: https://xxxxx.lambda-url.us-east-1.on.aws/
createProduct: https://xxxxx.lambda-url.us-east-1.on.aws/
updateProduct: https://xxxxx.lambda-url.us-east-1.on.aws/
deleteProduct: https://xxxxx.lambda-url.us-east-1.on.aws/
getUploadUrl: https://xxxxx.lambda-url.us-east-1.on.aws/
createOrder: https://xxxxx.lambda-url.us-east-1.on.aws/
getOrders: https://xxxxx.lambda-url.us-east-1.on.aws/
```

You'll need these for frontend configuration!

---

## 🔑 IAM Permissions

### Lambda Execution Role Permissions

Each Lambda function needs:

**Basic (All Functions):**

- `AWSLambdaBasicExecutionRole` (auto-attached)
- CloudWatch Logs write access

**For Products Functions:**

- `AmazonDynamoDBFullAccess` (or custom policy)
- `AmazonS3ReadOnlyAccess` or `AmazonS3FullAccess`

**For Auth-Protected Functions:**

- `AmazonCognitoReadOnly` (for JWT verification)

### Custom IAM Policy (Optional - More Secure)

Instead of full access policies, create a custom policy:

1. Go to **IAM** → **Policies** → **Create policy**
2. Use JSON editor:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:*:table/Products",
        "arn:aws:dynamodb:us-east-1:*:table/Orders"
      ]
    },
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::livekart-products-*/*"
    },
    {
      "Effect": "Allow",
      "Action": ["cognito-idp:GetUser", "cognito-idp:ListUsers"],
      "Resource": "arn:aws:cognito-idp:us-east-1:*:userpool/*"
    }
  ]
}
```

3. Name it `LiveKartLambdaPolicy`
4. Attach to Lambda execution roles

---

## 🧪 Testing Your Setup

### Test 1: DynamoDB Access

1. Go to DynamoDB console
2. Click **Products** table
3. Click **"Explore table items"**
4. Should see 0 items initially ✅

### Test 2: S3 Upload

1. Go to S3 console
2. Click your bucket
3. Upload a test image
4. Open the Object URL in browser
5. Image should display ✅

### Test 3: Cognito User Creation

1. Go to Cognito console
2. Click your User Pool
3. Go to **"Users"** tab
4. Should see test users ✅

### Test 4: Lambda Function

**Using AWS Console:**

1. Go to Lambda → getProducts
2. Click **"Test"** tab
3. Click **"Test"**
4. Should return `{"success": true, "products": []}` ✅

**Using Browser:**

1. Copy getProducts Function URL
2. Open in browser
3. Should see JSON response ✅

**Using Postman:**

1. Create new GET request
2. URL: Lambda Function URL
3. Send
4. Status: 200 ✅

### Test 5: End-to-End Authentication

1. Start frontend: `npm run dev`
2. Open http://localhost:5173
3. Click **"Login"**
4. Sign in with test account
5. Should redirect to home page ✅

---

## 🎓 AWS Academy / Learner Lab Setup

### Key Differences

If you're using AWS Academy or AWS Educate (Learner Lab):

| Regular AWS          | AWS Academy                          |
| -------------------- | ------------------------------------ |
| Create IAM roles     | ✅ Use existing `LabRole`            |
| Full IAM permissions | ⚠️ Limited - can't edit all policies |
| Resources persist    | ⚠️ Session expires in 4 hours        |
| CloudFront available | ❌ Not available                     |
| SES production mode  | ❌ Sandbox mode only                 |

### Using LabRole for Lambda

**When creating Lambda functions:**

1. Click **"Create function"**
2. Fill in name and runtime
3. Under **"Permissions"**:
   - Click **"Change default execution role"**
   - Select **"Use an existing role"**
   - Choose **"LabRole"** from dropdown
4. Click **"Create function"**

### Check LabRole Permissions

1. Go to Lambda function → **"Configuration"** → **"Permissions"**
2. Click **LabRole** link
3. Check **"Permissions"** tab
4. Should see:
   - ✅ `AWSLambdaBasicExecutionRole` (for CloudWatch)
   - ✅ Possibly `AmazonDynamoDBFullAccess`
   - ✅ Possibly `AmazonS3FullAccess`

**If policies are missing:**

**Option A: Ask your instructor**

```
Subject: Permission request for LiveKart project

Hi! I need the following permissions added to LabRole for my project:
- AmazonDynamoDBFullAccess
- AmazonS3FullAccess

Current LabRole: [paste LabRole ARN]
Lambda functions: getProducts, createProduct, etc.
```

**Option B: Try adding inline policy**

1. In LabRole page, click **"Add inline policy"**
2. If clickable, use JSON:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["dynamodb:*", "s3:*"],
      "Resource": "*"
    }
  ]
}
```

**Option C: Test anyway**

LabRole often has broad permissions already. Just create the functions and test!

### Session Expiration Workaround

AWS Academy sessions expire after 4 hours.

**To save your work:**

1. **Save Function URLs** in a text file locally
2. **Take screenshots** of all configurations
3. **Use CloudFormation** (if allowed) to redeploy quickly

**Restarting after expiration:**

1. Start new lab session
2. Re-create resources using saved configurations
3. Functions should work immediately if tables exist

---

## 📊 Monitoring & Maintenance

### CloudWatch Logs

**View Lambda logs:**

1. Go to Lambda function
2. Click **"Monitor"** tab
3. Click **"View CloudWatch logs"**
4. See all execution logs

**Common log entries:**

```
START RequestId: abc-123
Event: { headers: {...}, body: "..." }
Response: { statusCode: 200, body: {...} }
END RequestId: abc-123
REPORT Duration: 123.45 ms  Memory: 128 MB
```

### Monitor Usage (Stay in Free Tier)

**Lambda:**

- Go to Lambda → Dashboard
- Check **"Invocations"** graph
- Free tier: 1,000,000 requests/month
- 400,000 GB-seconds compute time/month

**DynamoDB:**

- Go to DynamoDB → Dashboard
- Check **"Consumed capacity"**
- Free tier: 25 GB storage, 25 RCU, 25 WCU

**S3:**

- Go to S3 → Bucket → **"Metrics"** tab
- Free tier: 5 GB storage, 20,000 GET requests, 2,000 PUT requests

**Cognito:**

- Go to Cognito → User Pool → **"Monitoring"** tab
- Free tier: 50,000 monthly active users

### Cost Optimization

**Tips to stay free:**

1. **Lambda:**

   - Use 128 MB memory (smallest)
   - Optimize code to run faster
   - Delete unused functions

2. **DynamoDB:**

   - Use on-demand pricing (only pay for what you use)
   - Don't scan entire tables
   - Delete old data

3. **S3:**

   - Compress images before upload
   - Delete unused images
   - Use lifecycle policies

4. **Cognito:**
   - Delete inactive users
   - Don't create fake test users in production

---

## 🎉 Setup Complete!

### What You've Built

✅ **AWS Cognito** - User authentication with email verification  
✅ **DynamoDB** - 4 tables for products, orders, users, sessions  
✅ **S3** - Bucket for product image storage  
✅ **Lambda** - 8 serverless API functions  
✅ **IAM** - Proper permissions and security  
✅ **CloudWatch** - Logging and monitoring

### Next Steps

1. **Update frontend configuration** with Lambda Function URLs
2. **Test all features** (sign up, login, products, orders)
3. **Customize the app** with your own styling
4. **Deploy frontend** to S3 + CloudFront (optional)
5. **Monitor usage** to stay within Free Tier

---

## 📚 Additional Resources

**AWS Documentation:**

- Lambda: https://docs.aws.amazon.com/lambda/
- DynamoDB: https://docs.aws.amazon.com/dynamodb/
- S3: https://docs.aws.amazon.com/s3/
- Cognito: https://docs.aws.amazon.com/cognito/

**Useful AWS CLI Commands:**

```bash
# List Lambda functions
aws lambda list-functions --region us-east-1

# List DynamoDB tables
aws dynamodb list-tables --region us-east-1

# List S3 buckets
aws s3 ls

# Get Cognito User Pool details
aws cognito-idp describe-user-pool --user-pool-id us-east-1_xxxxx
```

---

**Happy Building! ☁️**
