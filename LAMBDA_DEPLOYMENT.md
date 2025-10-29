# 🚀 Lambda Deployment Guide for LiveKart

## AWS Learner Academy Compatible Setup

Since **CloudFront and SES are restricted**, we'll use:

- ✅ Lambda + API Gateway (Backend)
- ✅ DynamoDB (Database)
- ✅ S3 (Direct image access)
- ✅ Cognito (Authentication)

---

## 📋 Prerequisites

1. ✅ AWS Learner Academy account
2. ✅ AWS CLI installed and configured
3. ✅ Node.js 18+ installed
4. ✅ Cognito User Pool created

---

## 🎯 Step 1: Create Cognito User Pool (If Not Done)

### Using AWS Console:

1. **Go to AWS Cognito**

   - Search for "Cognito" in AWS Console
   - Click "User pools" → "Create user pool"

2. **Configure Sign-in**

   - Sign-in options: ✅ Email
   - User name requirements: Email address
   - Click "Next"

3. **Security Requirements**

   - Password policy: Cognito defaults
   - MFA: No MFA (for simplicity)
   - Click "Next"

4. **Sign-up Experience**

   - Self-registration: ✅ Enable
   - Required attributes: email, name
   - Click "Next"

5. **Message Delivery**

   - Email: ✅ Send email with Cognito
   - Click "Next"

6. **Integrate Your App**

   - User pool name: `livekart-users`
   - App client name: `livekart-web`
   - Authentication flows: ✅ ALLOW_USER_PASSWORD_AUTH
   - Click "Next"

7. **Review and Create**

   - Click "Create user pool"

8. **Create User Groups**

   ```bash
   # Get User Pool ID from console
   USER_POOL_ID="us-east-1_XXXXXXXXX"

   # Create groups
   aws cognito-idp create-group --group-name customers --user-pool-id $USER_POOL_ID --description "Regular customers"
   aws cognito-idp create-group --group-name vendors --user-pool-id $USER_POOL_ID --description "Product vendors"
   aws cognito-idp create-group --group-name admins --user-pool-id $USER_POOL_ID --description "Platform admins"
   ```

---

## 🎯 Step 2: Install Serverless Framework

```powershell
# Install Serverless globally
npm install -g serverless

# Verify installation
serverless --version
```

---

## 🎯 Step 3: Install Lambda Dependencies

```powershell
# Navigate to Lambda directory
cd backend/lambda

# Install dependencies
npm install
```

---

## 🎯 Step 4: Set Environment Variables

Create `.env` file in `backend/lambda/`:

```env
# AWS Configuration
AWS_REGION=us-east-1
USER_POOL_ID=us-east-1_XXXXXXXXX

# DynamoDB Tables (will be created by serverless)
PRODUCTS_TABLE=dev-livekart-products
ORDERS_TABLE=dev-livekart-orders

# S3 Bucket (will be created by serverless)
S3_BUCKET=dev-livekart-product-images
```

**Get your User Pool ID:**

```powershell
aws cognito-idp list-user-pools --max-results 10
```

---

## 🎯 Step 5: Deploy Lambda Functions

```powershell
# Deploy to AWS (creates API Gateway, Lambda, DynamoDB, S3)
serverless deploy --stage dev --region us-east-1

# This will take 3-5 minutes
```

**Output:**

```
✔ Service deployed to stack livekart-api-dev (120s)

endpoints:
  GET - https://abcd1234.execute-api.us-east-1.amazonaws.com/dev/products
  GET - https://abcd1234.execute-api.us-east-1.amazonaws.com/dev/products/{id}
  POST - https://abcd1234.execute-api.us-east-1.amazonaws.com/dev/products
  PUT - https://abcd1234.execute-api.us-east-1.amazonaws.com/dev/products/{id}
  DELETE - https://abcd1234.execute-api.us-east-1.amazonaws.com/dev/products/{id}
  POST - https://abcd1234.execute-api.us-east-1.amazonaws.com/dev/upload-url
  POST - https://abcd1234.execute-api.us-east-1.amazonaws.com/dev/orders
  GET - https://abcd1234.execute-api.us-east-1.amazonaws.com/dev/orders

functions:
  getProducts: livekart-api-dev-getProducts
  getProduct: livekart-api-dev-getProduct
  createProduct: livekart-api-dev-createProduct
  updateProduct: livekart-api-dev-updateProduct
  deleteProduct: livekart-api-dev-deleteProduct
  getUploadUrl: livekart-api-dev-getUploadUrl
  createOrder: livekart-api-dev-createOrder
  getOrders: livekart-api-dev-getOrders
```

**Copy the API endpoint!** (e.g., `https://abcd1234.execute-api.us-east-1.amazonaws.com/dev`)

---

## 🎯 Step 6: Update Frontend Configuration

Update `frontend/.env`:

```env
# AWS Configuration
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_USER_POOL_CLIENT_ID=abcdefghijklmnopqrstuvwxyz
VITE_API_ENDPOINT=https://abcd1234.execute-api.us-east-1.amazonaws.com/dev
VITE_S3_BUCKET=dev-livekart-product-images
```

**Get Client ID:**

```powershell
aws cognito-idp list-user-pool-clients --user-pool-id us-east-1_XXXXXXXXX
```

---

## 🎯 Step 7: Create Test Users

```powershell
# Set User Pool ID
$USER_POOL_ID = "us-east-1_XXXXXXXXX"

# Create Customer
aws cognito-idp admin-create-user `
  --user-pool-id $USER_POOL_ID `
  --username customer@livekart.com `
  --user-attributes Name=email,Value=customer@livekart.com Name=email_verified,Value=true Name=name,Value="Customer User" `
  --message-action SUPPRESS

aws cognito-idp admin-set-user-password `
  --user-pool-id $USER_POOL_ID `
  --username customer@livekart.com `
  --password Customer123! `
  --permanent

aws cognito-idp admin-add-user-to-group `
  --user-pool-id $USER_POOL_ID `
  --username customer@livekart.com `
  --group-name customers

# Create Vendor
aws cognito-idp admin-create-user `
  --user-pool-id $USER_POOL_ID `
  --username vendor@livekart.com `
  --user-attributes Name=email,Value=vendor@livekart.com Name=email_verified,Value=true Name=name,Value="Vendor User" `
  --message-action SUPPRESS

aws cognito-idp admin-set-user-password `
  --user-pool-id $USER_POOL_ID `
  --username vendor@livekart.com `
  --password Vendor123! `
  --permanent

aws cognito-idp admin-add-user-to-group `
  --user-pool-id $USER_POOL_ID `
  --username vendor@livekart.com `
  --group-name vendors

# Create Admin
aws cognito-idp admin-create-user `
  --user-pool-id $USER_POOL_ID `
  --username admin@livekart.com `
  --user-attributes Name=email,Value=admin@livekart.com Name=email_verified,Value=true Name=name,Value="Admin User" `
  --message-action SUPPRESS

aws cognito-idp admin-set-user-password `
  --user-pool-id $USER_POOL_ID `
  --username admin@livekart.com `
  --password Admin123! `
  --permanent

aws cognito-idp admin-add-user-to-group `
  --user-pool-id $USER_POOL_ID `
  --username admin@livekart.com `
  --group-name admins
```

---

## 🎯 Step 8: Test API with Postman/curl

### 1. **Get Products** (No auth required)

```bash
curl https://YOUR_API_ENDPOINT/dev/products
```

### 2. **Login to get JWT token**

First, login via your frontend or use AWS CLI:

```powershell
$USER_POOL_ID = "us-east-1_XXXXXXXXX"
$CLIENT_ID = "your-client-id"

aws cognito-idp initiate-auth `
  --auth-flow USER_PASSWORD_AUTH `
  --client-id $CLIENT_ID `
  --auth-parameters USERNAME=vendor@livekart.com,PASSWORD=Vendor123!
```

Copy the `IdToken` from response.

### 3. **Create Product** (Requires vendor/admin auth)

```bash
curl -X POST https://YOUR_API_ENDPOINT/dev/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Product",
    "description": "This is a test product",
    "price": 29.99,
    "category": "Electronics",
    "stock": 100
  }'
```

### 4. **Get Upload URL** (Requires vendor/admin auth)

```bash
curl -X POST https://YOUR_API_ENDPOINT/dev/upload-url \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "product-image.jpg",
    "contentType": "image/jpeg"
  }'
```

---

## 🎯 Step 9: Run Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

**Test:**

1. ✅ Login as vendor@livekart.com
2. ✅ Create a product
3. ✅ Upload product image
4. ✅ View products
5. ✅ Place order as customer

---

## 📊 Monitor Lambda Functions

### View Logs

```powershell
# View logs for specific function
serverless logs -f getProducts --tail

# View last 10 minutes
serverless logs -f createProduct --startTime 10m
```

### Invoke Function Locally

```powershell
# Test locally before deploying
serverless invoke local -f getProducts
```

### CloudWatch Logs

```powershell
# Via AWS CLI
aws logs tail /aws/lambda/livekart-api-dev-getProducts --follow
```

---

## 🗑️ Cleanup (Remove All Resources)

```powershell
# Remove all Lambda functions, API Gateway, DynamoDB, S3
serverless remove --stage dev
```

This will delete:

- ✅ All Lambda functions
- ✅ API Gateway
- ✅ DynamoDB tables
- ✅ S3 bucket (must be empty first)
- ✅ IAM roles

---

## 💰 Cost Estimate (Learner Academy)

**AWS Free Tier:**

- Lambda: 1M requests/month FREE
- API Gateway: 1M requests/month FREE
- DynamoDB: 25 GB storage FREE
- S3: 5 GB storage FREE
- Cognito: 50,000 MAUs FREE

**Expected cost: $0.00 - $0.50/month**

---

## 🔧 Troubleshooting

### Issue: "User pool not found"

**Solution:** Make sure USER_POOL_ID is set correctly in `.env`

### Issue: "Access Denied" when creating resources

**Solution:** Check IAM permissions in Learner Academy account

### Issue: "Cannot find module"

**Solution:** Run `npm install` in `backend/lambda/` directory

### Issue: "CORS error in browser"

**Solution:** API Gateway CORS is already configured in `serverless.yml`

### Issue: "Invalid token"

**Solution:** Make sure you're using the `IdToken` from Cognito, not `AccessToken`

---

## 📚 API Endpoints Summary

| Method | Endpoint         | Auth Required     | Description         |
| ------ | ---------------- | ----------------- | ------------------- |
| GET    | `/products`      | No                | List all products   |
| GET    | `/products/{id}` | No                | Get product details |
| POST   | `/products`      | Vendor/Admin      | Create product      |
| PUT    | `/products/{id}` | Vendor/Admin      | Update product      |
| DELETE | `/products/{id}` | Vendor/Admin      | Delete product      |
| POST   | `/upload-url`    | Vendor/Admin      | Get S3 upload URL   |
| POST   | `/orders`        | Any authenticated | Create order        |
| GET    | `/orders`        | Any authenticated | Get user orders     |

---

## 🎉 Success!

Your LiveKart backend is now running on AWS Lambda!

**Next Steps:**

1. Integrate frontend with API
2. Add more products
3. Test order flow
4. Monitor CloudWatch logs
5. Optimize Lambda functions

---

**Need help? Check:**

- [Serverless Framework Docs](https://www.serverless.com/framework/docs)
- [AWS Lambda Docs](https://docs.aws.amazon.com/lambda/)
- [API Gateway Docs](https://docs.aws.amazon.com/apigateway/)
