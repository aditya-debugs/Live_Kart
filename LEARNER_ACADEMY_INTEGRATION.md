# 🎓 AWS Learner Academy Integration Guide

## ✅ What You've Already Set Up

Based on the guide you followed, you now have:

- ✅ **DynamoDB Tables** (Products, Users, Orders, Sessions)
- ✅ **S3 Bucket** (for product images with public read access)
- ✅ **CloudFront** (CDN - but restricted in Learner Academy)
- ✅ **Cognito User Pool** (with User Pool ID and Client ID)
- ✅ **Lambda Functions** (7 placeholder functions created)
- ✅ **SES** (Email verified - but restricted to sandbox mode)

---

## 🔄 How to Use My Lambda Functions with Your Setup

The Lambda functions I created are **production-ready implementations** that will replace your placeholder functions!

### 📊 Comparison

| What You Have                  | What I Created                              | Action Needed            |
| ------------------------------ | ------------------------------------------- | ------------------------ |
| 7 placeholder Lambda functions | 8 complete Lambda functions with full logic | Replace code             |
| Manual function creation       | Automated deployment with Serverless        | Optional: Use Serverless |
| No DynamoDB integration        | Full DynamoDB CRUD operations               | Update code              |
| No authentication              | JWT Cognito authentication                  | Update code              |
| Basic structure                | Error handling, validation, security        | Update code              |

---

## 🚀 Integration Method (Choose One)

### **Method A: Replace Existing Lambda Functions** ⭐ Recommended for Learner Academy

Since you already created Lambda functions manually, let's update them with my code:

#### 1. **Update getProducts Function**

1. Go to AWS Lambda Console
2. Click on your `getProducts` function
3. Delete the placeholder code
4. Copy the code from my file: `backend/lambda/products/getProducts.js`
5. **Important:** Also copy the utility files:

   - Create new file: `utils/dynamodb.js` (copy from `backend/lambda/utils/dynamodb.js`)
   - Create new file: `utils/auth.js` (copy from `backend/lambda/utils/auth.js`)
   - Create new file: `utils/s3.js` (copy from `backend/lambda/utils/s3.js`)

6. Configure Environment Variables:

   - Go to **Configuration** → **Environment variables**
   - Add these variables:
     ```
     AWS_REGION = us-east-1
     PRODUCTS_TABLE = Products
     ORDERS_TABLE = Orders
     S3_BUCKET = your-bucket-name
     USER_POOL_ID = us-east-1_ABC123 (your actual User Pool ID)
     ```

7. Update **IAM Role** to include these permissions:

   - `dynamodb:GetItem`
   - `dynamodb:Scan`
   - `dynamodb:Query`
   - `s3:GetObject`
   - `s3:PutObject`

8. Click **Deploy**

#### 2. **Update createProduct Function**

1. Click on your `createProduct` function
2. Copy code from: `backend/lambda/products/createProduct.js`
3. Add same environment variables as above
4. Add these IAM permissions:
   - `dynamodb:PutItem`
   - `s3:PutObject`
5. Click **Deploy**

#### 3. **Update Other Functions**

Repeat for:

- `updateProduct` → Use `backend/lambda/products/updateProduct.js`
- `deleteProduct` → Use `backend/lambda/products/deleteProduct.js`
- `createOrder` → Use `backend/lambda/orders/createOrder.js`
- `getOrders` → Use `backend/lambda/orders/getOrders.js`

#### 4. **Create New Function: getUploadUrl**

This one you don't have yet:

1. Create new Lambda function: `getUploadUrl`
2. Copy code from: `backend/lambda/upload/getUploadUrl.js`
3. Add environment variables
4. Add IAM permission: `s3:PutObject`
5. Create Function URL
6. Enable CORS

---

### **Method B: Use Serverless Framework** (Advanced)

If you want to automate everything:

```powershell
# 1. Install dependencies
cd backend/lambda
npm install

# 2. Update serverless.yml with your existing resources
# Edit the file to use:
# - Your existing DynamoDB table names
# - Your existing S3 bucket name
# - Your existing Cognito User Pool ID

# 3. Deploy (will create API Gateway + update Lambda functions)
serverless deploy --stage dev
```

**Note:** This might conflict with your manually created functions, so **Method A is safer** for Learner Academy.

---

## 📝 Step-by-Step: Update Your First Lambda Function

Let me show you exactly how to update your `getProducts` function:

### 1. **Install Dependencies in Lambda**

Since Lambda needs external packages (`@aws-sdk/client-dynamodb`, `uuid`, `jsonwebtoken`), we need to create a Lambda Layer:

#### Create Layer:

```powershell
# On your local machine
cd backend/lambda
mkdir -p layer/nodejs
cd layer/nodejs

# Create package.json
npm init -y

# Install dependencies
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb @aws-sdk/client-s3 @aws-sdk/s3-request-presigner uuid jsonwebtoken jwks-rsa

# Go back to layer directory
cd ..

# Create zip file
Compress-Archive -Path nodejs -DestinationPath lambda-layer.zip
```

#### Upload Layer to AWS:

1. Go to **Lambda Console** → **Layers** → **Create layer**
2. Name: `livekart-dependencies`
3. Upload `lambda-layer.zip`
4. Compatible runtimes: **Node.js 18.x**
5. Click **Create**

#### Add Layer to Your Functions:

1. Go to your `getProducts` function
2. Scroll to **Layers** section
3. Click **Add a layer**
4. Select **Custom layers**
5. Choose `livekart-dependencies`
6. Click **Add**

### 2. **Update Function Code**

Go to your `getProducts` function and replace the code:

```javascript
// Copy ENTIRE content from backend/lambda/products/getProducts.js
// PLUS copy the utility functions at the top of the file

// Inline the utility functions since Lambda Console doesn't support modules
// Here's the complete integrated code:

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const REGION = process.env.AWS_REGION || "us-east-1";
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE || "Products";
const S3_BUCKET = process.env.S3_BUCKET;

// Create clients
const ddbClient = new DynamoDBClient({ region: REGION });
const ddbDoc = DynamoDBDocumentClient.from(ddbClient);
const s3Client = new S3Client({ region: REGION });

exports.handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));

  try {
    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    const category = queryParams.category;
    const limit = parseInt(queryParams.limit) || 50;

    // Scan DynamoDB table
    const command = new ScanCommand({
      TableName: PRODUCTS_TABLE,
    });

    const result = await ddbDoc.send(command);
    let products = result.Items || [];

    // Filter by category if provided
    if (category) {
      products = products.filter((p) => p.category === category);
    }

    // Sort by views (most popular first)
    products.sort((a, b) => (b.views || 0) - (a.views || 0));

    // Limit results
    products = products.slice(0, limit);

    // Generate S3 URLs for images
    for (const product of products) {
      if (product.imageKey) {
        try {
          // If using direct S3 access (no CloudFront)
          product.imageUrl = `https://${S3_BUCKET}.s3.${REGION}.amazonaws.com/${product.imageKey}`;
        } catch (err) {
          console.error("Error with image URL:", err);
          product.imageUrl = null;
        }
      }
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        success: true,
        count: products.length,
        products,
      }),
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: false,
        error: "Failed to fetch products",
        message: error.message,
      }),
    };
  }
};
```

### 3. **Set Environment Variables**

In Lambda Console → **Configuration** → **Environment variables**:

```
AWS_REGION = us-east-1
PRODUCTS_TABLE = Products
S3_BUCKET = your-actual-bucket-name
```

### 4. **Test the Function**

1. Click **Test** tab
2. Create new test event:

```json
{
  "queryStringParameters": {
    "limit": "10"
  },
  "headers": {}
}
```

3. Click **Test**
4. Should return: `{ success: true, count: 0, products: [] }`

---

## 🔗 Connect Lambda to API Gateway

Your Lambda functions already have Function URLs, which is perfect! But let me show you how to set up proper API Gateway with Cognito authorization:

### 1. **Create API Gateway**

1. Go to **API Gateway Console**
2. Click **Create API**
3. Choose **REST API** (not private)
4. Click **Build**
5. Settings:
   - Protocol: **REST**
   - Create new API: **New API**
   - API name: `LiveKart-API`
   - Endpoint: **Regional**
6. Click **Create API**

### 2. **Create Cognito Authorizer**

1. In your API, click **Authorizers**
2. Click **Create New Authorizer**
3. Settings:
   - Name: `CognitoAuthorizer`
   - Type: **Cognito**
   - Cognito User Pool: Select your pool
   - Token Source: `Authorization`
4. Click **Create**

### 3. **Create Resources & Methods**

#### For Products Endpoint:

1. Click **Actions** → **Create Resource**
   - Resource Name: `products`
   - Resource Path: `/products`
   - Enable CORS: ✅
2. Click **Create Resource**

3. Select `/products` → **Actions** → **Create Method** → **GET**

   - Integration type: **Lambda Function**
   - Use Lambda Proxy: ✅
   - Lambda Function: Select `getProducts`
   - Click **Save**

4. Click **Method Request**

   - Authorization: **None** (public endpoint)

5. Repeat for POST method:
   - Select `/products` → **Actions** → **Create Method** → **POST**
   - Lambda Function: `createProduct`
   - Authorization: **CognitoAuthorizer** ⭐

#### For Single Product:

1. Select `/products` → **Actions** → **Create Resource**
   - Resource Name: `{id}`
   - Resource Path: `/{id}`
2. Create methods: GET, PUT, DELETE
   - GET: `getProduct` (no auth)
   - PUT: `updateProduct` (Cognito auth)
   - DELETE: `deleteProduct` (Cognito auth)

### 4. **Deploy API**

1. Click **Actions** → **Deploy API**
2. Deployment stage: **New Stage**
3. Stage name: `prod`
4. Click **Deploy**

5. **Copy the Invoke URL** (looks like: `https://abc123.execute-api.us-east-1.amazonaws.com/prod`)

---

## 🎯 Update Frontend Configuration

Now update your `frontend/.env`:

```env
# Cognito (from your setup)
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=us-east-1_ABC123
VITE_USER_POOL_CLIENT_ID=1234abcd5678

# API Gateway endpoint (from deployment)
VITE_API_ENDPOINT=https://abc123.execute-api.us-east-1.amazonaws.com/prod

# S3 Bucket (from your setup)
VITE_S3_BUCKET=your-bucket-name

# Optional: CloudFront (if you have it)
VITE_CLOUDFRONT_DOMAIN=d1234.cloudfront.net
```

---

## 🧪 Test Your Integration

### 1. **Test Lambda Function Directly**

```powershell
# Test getProducts
aws lambda invoke \
  --function-name getProducts \
  --payload '{}' \
  response.json

# Check response
cat response.json
```

### 2. **Test via API Gateway**

```powershell
# Get products (public)
curl https://YOUR_API_ENDPOINT/prod/products

# Create product (requires auth token)
curl -X POST https://YOUR_API_ENDPOINT/prod/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Product",
    "price": 29.99,
    "category": "Electronics"
  }'
```

### 3. **Test from Frontend**

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 and test:

- ✅ Login with Cognito
- ✅ View products
- ✅ Create product (as vendor)
- ✅ Upload image to S3

---

## 📊 Your Complete Architecture

```
Frontend (React)
      ↓
  API Gateway (with Cognito Authorizer)
      ↓
  Lambda Functions (8 functions)
  ├── getProducts
  ├── getProduct
  ├── createProduct
  ├── updateProduct
  ├── deleteProduct
  ├── getUploadUrl
  ├── createOrder
  └── getOrders
      ↓
  ┌────────────┬────────────┐
  ↓            ↓            ↓
DynamoDB      S3       Cognito
(4 tables)   (Images)   (Auth)
```

**No CloudFront or SES needed!** ✅

---

## 💰 Cost Estimate (Learner Academy)

- Lambda: FREE (1M requests/month)
- API Gateway: FREE (1M requests/month)
- DynamoDB: FREE (25 GB storage)
- S3: FREE (5 GB storage)
- Cognito: FREE (50K MAUs)

**Total: $0.00/month** ✅

---

## 🆘 Troubleshooting

### Lambda functions return empty arrays

- **Check:** DynamoDB table names match environment variables
- **Fix:** Update `PRODUCTS_TABLE` to exactly `Products` (case-sensitive)

### "Access Denied" errors

- **Check:** Lambda IAM role has DynamoDB and S3 permissions
- **Fix:** Add policies in IAM → Roles → LambdaEcommerceRole

### CORS errors in frontend

- **Check:** API Gateway CORS enabled
- **Fix:** Enable CORS for all resources in API Gateway

### Images not loading

- **Check:** S3 bucket policy allows public read
- **Fix:** Add bucket policy from your setup guide

### Can't create products

- **Check:** Cognito authorizer configured correctly
- **Fix:** Ensure JWT token is in Authorization header

---

## 🎉 Next Steps

1. ✅ Update all 7 Lambda functions with my code
2. ✅ Create API Gateway with Cognito authorizer
3. ✅ Test each endpoint with Postman
4. ✅ Update frontend to use API Gateway endpoint
5. ✅ Add some test products
6. ✅ Test complete user flow

---

**Need help with any specific function? Let me know which one you want to tackle first!** 🚀
