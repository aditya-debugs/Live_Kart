# LiveKart — E-Commerce Platform

A modern, serverless e-commerce platform built with React, TypeScript, and AWS services. Features production-ready authentication, serverless backend, and real-time product management.

---

## 🚀 Quick Start

**📚 Complete Documentation:**

1. **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** → Project setup, installation, local development, troubleshooting
2. **[AWS_SERVICES_GUIDE.md](./AWS_SERVICES_GUIDE.md)** → Detailed AWS setup for Cognito, DynamoDB, S3, Lambda

**New Users:** Start with SETUP_GUIDE.md, then follow AWS_SERVICES_GUIDE.md for AWS configuration

---

## 📁 Project Structure

```
LiveKart/
├── SETUP_GUIDE.md          # 📚 Complete setup & installation guide
├── AWS_SERVICES_GUIDE.md   # ☁️ AWS services setup (DynamoDB, S3, Cognito, Lambda)
├── README.md               # Project overview (you are here)
├── backend/
│   ├── lambda/             # Lambda function code
│   │   ├── products/       # Product management
│   │   ├── orders/         # Order management
│   │   ├── upload/         # File uploads
│   │   └── utils/          # Utilities (DynamoDB, S3, Auth)
│   └── src/                # Express backend (optional)
├── frontend/               # React + TypeScript frontend
├── infra/                  # CloudFormation templates
└── scripts/                # Setup scripts
```

---

## 🏗️ Architecture

### AWS Services (Serverless + Free Tier Optimized)

```
Frontend (React + Vite)
         ↓
    AWS Cognito (Authentication)
         ↓
    AWS Lambda Functions (8 serverless APIs)
    ├── getProducts        (List products)
    ├── getProduct         (Product details)
    ├── createProduct      (Create product)
    ├── updateProduct      (Update product)
    ├── deleteProduct      (Delete product)
    ├── getUploadUrl       (S3 pre-signed URLs)
    ├── createOrder        (Place order)
    └── getOrders          (Get orders)
         ↓
    ┌────────────┬────────────┐
    ↓            ↓            ↓
DynamoDB     AWS S3    Cognito User Pool
(4 Tables)  (Images)   (Users/Auth)
```

### Technology Stack

**Frontend:**

- React 18 + TypeScript
- Vite (Build tool)
- Tailwind CSS (Styling)
- AWS SDK v3 (AWS integration)
- React Router (Navigation)

**Backend:**

- AWS Lambda (Node.js 18.x)
- AWS SDK v3 (DynamoDB, S3)
- Serverless architecture
- Function URLs (no API Gateway needed)

**Database:**

- DynamoDB (NoSQL, serverless)
- 4 Tables: Products, Orders, Users, Sessions

**Storage:**

- S3 (Product images)
- Pre-signed URLs for secure uploads

**Authentication:**

- AWS Cognito User Pools
- JWT tokens
- Role-based access (Customer, Vendor, Admin)

---

## 🌟 Features

### Customer Features

- 🛍️ Browse products with professional UI
- 🔍 Search and filter by category/price
- 🛒 Shopping cart with real-time updates
- 💳 Secure checkout process
- 📱 Fully responsive design
- 🔐 JWT-based authentication

### Vendor Features

- 💼 Add and manage products
- 📸 Upload product images to S3
- 📊 View product statistics
- 🏷️ Categorize products
- ✏️ Update/delete own products

### Admin Features

- 👔 Manage all products
- 📊 View platform analytics
- 👥 User management via Cognito
- 🔥 Monitor product views

---

## 🚀 Deployment

### Prerequisites

- ✅ AWS Account (Free Tier or AWS Academy)
- ✅ Node.js 18+
- ✅ Basic understanding of AWS services

### 🎯 Setup Options

#### Option 1: AWS Academy/Learner Lab (Recommended for Students)

```bash
# 1. Read the AWS Academy guide
docs/aws-setup/AWS_ACADEMY_SETUP.md

# 2. Create Lambda functions manually
docs/lambda/LAMBDA_QUICK_START.md

# 3. Use the copy-paste code
docs/lambda/LAMBDA_COPYPASTE.md
```

#### Option 2: Regular AWS Account

```bash
# 1. Follow the quick start guide
docs/QUICK_START.md

# 2. Set up Lambda functions
docs/lambda/LAMBDA_QUICK_START.md
```

#### Option 3: Serverless Framework (Advanced)

```bash
# Install dependencies
cd backend/lambda
npm install

# Deploy all functions
npm run deploy

# Note: Requires AWS CLI configured
```

---

## 📖 Documentation

**Complete documentation is in the [docs/](./docs/) folder:**

- **[docs/README.md](./docs/README.md)** - Documentation index
- **[docs/lambda/](./docs/lambda/)** - Lambda function guides
- **[docs/aws-setup/](./docs/aws-setup/)** - AWS infrastructure guides

### Quick Links:

| Guide                                                                 | Description                    |
| --------------------------------------------------------------------- | ------------------------------ |
| [QUICK_START](./docs/QUICK_START.md)                                  | Complete setup checklist       |
| [LAMBDA_QUICK_START](./docs/lambda/LAMBDA_QUICK_START.md)             | Create Lambda functions (fast) |
| [AWS_LAMBDA_CONSOLE_GUIDE](./docs/lambda/AWS_LAMBDA_CONSOLE_GUIDE.md) | Detailed Lambda setup          |
| [AWS_ACADEMY_SETUP](./docs/aws-setup/AWS_ACADEMY_SETUP.md)            | AWS Academy specific guide     |
| [LAMBDA_COPYPASTE](./docs/lambda/LAMBDA_COPYPASTE.md)                 | Ready-to-paste Lambda code     |

---

## 🧪 Development

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Backend Development

```bash
cd backend
npm install
npm start
```

### Lambda Functions

```bash
cd backend/lambda
npm install

# Test locally
npm run invoke:getProducts

# Deploy single function
npm run deploy:getProducts
```

---

## 🔧 Configuration

### Frontend Environment Variables

Create `frontend/.env`:

```env
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=your-user-pool-id
VITE_USER_POOL_CLIENT_ID=your-client-id
VITE_API_GET_PRODUCTS=https://your-lambda-url.lambda-url.us-east-1.on.aws/
VITE_API_GET_PRODUCT=https://your-lambda-url.lambda-url.us-east-1.on.aws/
# ... add all 8 Lambda Function URLs
```

### Backend Environment Variables

Create `backend/lambda/.env`:

```env
AWS_REGION=us-east-1
PRODUCTS_TABLE=Products
ORDERS_TABLE=Orders
USERS_TABLE=Users
S3_BUCKET=your-bucket-name
USER_POOL_ID=your-user-pool-id
```

---

## 🧪 Testing

### Test with Sample Data

After setting up Lambda functions, create a test product:

```bash
# Using PowerShell
curl -X POST https://YOUR_CREATE_PRODUCT_URL/ `
  -H "Content-Type: application/json" `
  -d '{"title":"Test Product","price":29.99,"category":"Electronics","description":"A test product","stock":100}'
```

### Test Credentials

After setting up Cognito, create test users:

- **Customer:** `customer@livekart.com` / `Customer123!`
- **Vendor:** `vendor@livekart.com` / `Vendor123!`
- **Admin:** `admin@livekart.com` / `Admin123!`

See `scripts/create-test-users.ps1` for user creation.

---

---

## 🛠️ Technology Highlights

- ✅ **Serverless Architecture** - No servers to manage
- ✅ **AWS Free Tier** - Stay within free tier limits
- ✅ **Type Safety** - Full TypeScript in frontend
- ✅ **Production Ready** - Clean, well-structured code
- ✅ **Responsive Design** - Works on all devices
- ✅ **Role-Based Access** - Customer, Vendor, Admin roles

---

## 🤝 Contributing

This is a learning project. Feel free to fork and experiment!

---

## 📝 License

This project is part of a Cloud Computing project.

---

## 🆘 Support

- 📚 **Documentation:** [docs/README.md](./docs/README.md)
- 🐛 **Issues:** Check the troubleshooting sections in docs
- 💬 **Questions:** See [AWS_ACADEMY_SETUP.md](./docs/aws-setup/AWS_ACADEMY_SETUP.md) for common issues

---

**Ready to start?** �

1. Read [docs/README.md](./docs/README.md)
2. Follow [docs/lambda/LAMBDA_QUICK_START.md](./docs/lambda/LAMBDA_QUICK_START.md)
3. Build something awesome!
