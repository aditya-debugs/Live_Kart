# 🚀 LiveKart Lambda Functions - Quick Summary

## ✅ What's Been Created

### 📁 File Structure

```
backend/lambda/
├── package.json                    # Dependencies
├── serverless.yml                  # Deployment configuration
├── utils/
│   ├── dynamodb.js                # DynamoDB helper functions
│   ├── s3.js                      # S3 helper functions
│   └── auth.js                    # Cognito authentication
├── products/
│   ├── getProducts.js             # List all products
│   ├── getProduct.js              # Get single product
│   ├── createProduct.js           # Create product (Vendor/Admin)
│   ├── updateProduct.js           # Update product (Vendor/Admin)
│   └── deleteProduct.js           # Delete product (Vendor/Admin)
├── upload/
│   └── getUploadUrl.js            # Generate S3 pre-signed URL
└── orders/
    ├── createOrder.js             # Create new order
    └── getOrders.js               # Get user orders
```

---

## 🎯 8 Lambda Functions Created

### 1. **Get All Products** (`getProducts.js`)

- **Method:** GET `/products`
- **Auth:** Not required
- **Features:**
  - List all products
  - Filter by category, price range
  - Sort by views, price, date
  - Pagination support
  - Auto-generates image URLs

### 2. **Get Single Product** (`getProduct.js`)

- **Method:** GET `/products/{id}`
- **Auth:** Not required
- **Features:**
  - Get product details
  - Increments view counter
  - Returns product with image URL

### 3. **Create Product** (`createProduct.js`)

- **Method:** POST `/products`
- **Auth:** Vendor or Admin
- **Features:**
  - Create new product
  - Auto-generate product ID
  - Validate required fields
  - Associate with vendor

### 4. **Update Product** (`updateProduct.js`)

- **Method:** PUT `/products/{id}`
- **Auth:** Vendor (own products) or Admin
- **Features:**
  - Update product details
  - Check ownership
  - Partial updates supported

### 5. **Delete Product** (`deleteProduct.js`)

- **Method:** DELETE `/products/{id}`
- **Auth:** Vendor (own products) or Admin
- **Features:**
  - Delete product
  - Also deletes product image from S3
  - Check ownership

### 6. **Get Upload URL** (`getUploadUrl.js`)

- **Method:** POST `/upload-url`
- **Auth:** Vendor or Admin
- **Features:**
  - Generate S3 pre-signed URL
  - Validate image types
  - Secure uploads (5-minute expiry)
  - Returns unique S3 key

### 7. **Create Order** (`createOrder.js`)

- **Method:** POST `/orders`
- **Auth:** Any authenticated user
- **Features:**
  - Create new order
  - Validate products and stock
  - Calculate total amount
  - Store shipping address

### 8. **Get Orders** (`getOrders.js`)

- **Method:** GET `/orders`
- **Auth:** Any authenticated user
- **Features:**
  - Customers see their orders
  - Vendors see orders with their products
  - Admins see all orders
  - Pagination support

---

## 🔐 Security Features

### Authentication

- ✅ JWT token verification via Cognito
- ✅ Role-based access control (RBAC)
- ✅ Vendor ownership checks
- ✅ API Gateway Cognito authorizer

### Authorization Rules

- **Public:** Get products (no auth)
- **Customers:** Create orders, view own orders
- **Vendors:** CRUD own products, upload images, view relevant orders
- **Admins:** Full access to everything

---

## 🗄️ AWS Resources Created by Serverless

### Lambda Functions (8)

- All functions use Node.js 18.x
- 256 MB memory
- 30-second timeout
- Auto-scaling enabled

### API Gateway

- REST API with CORS enabled
- Cognito authorizer configured
- All endpoints mapped

### DynamoDB Tables (2)

- **Products Table:**

  - Primary key: `product_id`
  - GSI: `vendor-index`, `category-index`
  - On-demand billing

- **Orders Table:**
  - Primary key: `order_id`
  - GSI: `user-orders-index`
  - On-demand billing

### S3 Bucket

- Bucket for product images
- CORS configured for uploads
- Pre-signed URLs for secure access

---

## 📋 Quick Deployment

```powershell
# 1. Install dependencies
cd backend/lambda
npm install

# 2. Set environment variables
# Create .env file with USER_POOL_ID

# 3. Deploy to AWS
serverless deploy --stage dev

# 4. Copy API endpoint from output

# 5. Update frontend .env
VITE_API_ENDPOINT=https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/dev
```

---

## 🧪 Testing

### Test with curl:

**Get Products:**

```bash
curl https://YOUR_API_ENDPOINT/dev/products
```

**Create Product (with auth):**

```bash
curl -X POST https://YOUR_API_ENDPOINT/dev/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Wireless Mouse",
    "description": "Ergonomic wireless mouse",
    "price": 29.99,
    "category": "Electronics",
    "stock": 50
  }'
```

---

## 💰 Cost Estimate

**AWS Free Tier (First 12 months):**

- Lambda: 1M requests FREE
- API Gateway: 1M requests FREE
- DynamoDB: 25 GB storage FREE
- S3: 5 GB storage FREE

**Expected monthly cost:** $0.00 - $0.50

---

## 📚 Documentation

1. **[LAMBDA_GUIDE.md](./LAMBDA_GUIDE.md)** - Architecture overview
2. **[LAMBDA_DEPLOYMENT.md](./LAMBDA_DEPLOYMENT.md)** - Complete deployment guide
3. **[serverless.yml](./backend/lambda/serverless.yml)** - Deployment configuration

---

## 🎯 Next Steps

1. ✅ Deploy Lambda functions
2. ✅ Create Cognito users
3. ✅ Test API endpoints
4. ✅ Integrate with React frontend
5. ✅ Add more products
6. ✅ Test order flow

---

## 🔧 Common Commands

```powershell
# Deploy
serverless deploy --stage dev

# View logs
serverless logs -f getProducts --tail

# Test locally
serverless invoke local -f getProducts

# Remove all resources
serverless remove --stage dev

# Update single function
serverless deploy function -f createProduct
```

---

## ✨ Features Included

- ✅ Complete CRUD operations for products
- ✅ Secure image upload to S3
- ✅ Order creation and management
- ✅ Role-based permissions
- ✅ Authentication with Cognito
- ✅ Pre-signed S3 URLs
- ✅ View counters for analytics
- ✅ Category filtering
- ✅ Pagination support
- ✅ Error handling
- ✅ CORS configured

---

**Ready to deploy? Follow [LAMBDA_DEPLOYMENT.md](./LAMBDA_DEPLOYMENT.md)! 🚀**
