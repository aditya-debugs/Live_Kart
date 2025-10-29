# LiveKart Lambda Functions Guide

## 📦 Lambda Functions for LiveKart E-Commerce

Since **AWS Learner Academy restricts CloudFront and SES**, we'll build a fully functional backend using:

- ✅ **AWS Lambda** (Serverless compute)
- ✅ **API Gateway** (REST API)
- ✅ **DynamoDB** (Database)
- ✅ **S3** (Image storage - direct access)
- ✅ **Cognito** (Authentication)

---

## 🏗️ Architecture (Learner Academy Compatible)

```
Frontend (React)
      ↓
API Gateway (REST API)
      ↓
AWS Lambda Functions
  ├── GET /products (List all products)
  ├── GET /products/{id} (Get product details)
  ├── POST /products (Create product - Vendor only)
  ├── PUT /products/{id} (Update product - Vendor only)
  ├── DELETE /products/{id} (Delete product - Vendor only)
  ├── POST /upload-url (Get S3 pre-signed URL)
  ├── POST /orders (Create order)
  ├── GET /orders (Get user orders)
  └── GET /analytics (View analytics - Admin only)
      ↓
  ┌────────────┬────────────┐
  ↓            ↓            ↓
DynamoDB      S3       Cognito
```

---

## 📁 Project Structure

```
backend/
├── lambda/
│   ├── products/
│   │   ├── getProducts.js       # List all products
│   │   ├── getProduct.js        # Get single product
│   │   ├── createProduct.js     # Create new product
│   │   ├── updateProduct.js     # Update product
│   │   └── deleteProduct.js     # Delete product
│   ├── upload/
│   │   └── getUploadUrl.js      # Generate S3 pre-signed URL
│   ├── orders/
│   │   ├── createOrder.js       # Create new order
│   │   └── getOrders.js         # Get user orders
│   └── utils/
│       ├── dynamodb.js          # DynamoDB helper
│       ├── s3.js                # S3 helper
│       └── auth.js              # Cognito auth helper
└── serverless.yml               # Serverless framework config
```

---

## 🚀 Lambda Functions Overview

### 1. **Products API** (Core E-commerce)

- **GET /products** - List all products with pagination
- **GET /products/{id}** - Get product details + increment views
- **POST /products** - Create product (Vendor/Admin only)
- **PUT /products/{id}** - Update product (Vendor/Admin only)
- **DELETE /products/{id}** - Delete product (Vendor/Admin only)

### 2. **Upload API** (Image Management)

- **POST /upload-url** - Generate pre-signed S3 URL for image upload

### 3. **Orders API** (Order Management)

- **POST /orders** - Create new order
- **GET /orders** - Get user's orders
- **GET /orders/{id}** - Get order details

### 4. **Analytics API** (Admin Dashboard)

- **GET /analytics/products** - Product performance
- **GET /analytics/orders** - Order statistics

---

## 📝 Lambda Function Code

I'll create all the Lambda functions in the next steps!

---

## 🔐 Authentication Flow

All Lambda functions will:

1. Receive JWT token from Cognito (via API Gateway)
2. Verify user identity
3. Check user role (customer/vendor/admin)
4. Allow/deny based on permissions

---

## 💰 AWS Learner Academy Limits

- ✅ Lambda: 1M requests/month (plenty for testing)
- ✅ DynamoDB: On-demand pricing (small cost)
- ✅ S3: Direct access (no CloudFront needed)
- ✅ Cognito: 50,000 MAUs
- ✅ API Gateway: 1M requests/month

**Estimated cost: $0-$2/month for learning**

---

## 📋 Next Steps

1. Install dependencies
2. Deploy Lambda functions
3. Configure API Gateway
4. Test with Postman/Frontend
5. Integrate with React frontend

Let's create the functions!
