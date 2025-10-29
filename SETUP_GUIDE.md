# 🚀 LiveKart - Complete Setup Guide

**Everything you need to set up and run the LiveKart E-Commerce Platform**

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Prerequisites](#-prerequisites)
3. [Project Structure](#-project-structure)
4. [Quick Start](#-quick-start)
5. [Local Development](#-local-development)
6. [Environment Configuration](#-environment-configuration)
7. [Testing](#-testing)
8. [Troubleshooting](#-troubleshooting)

---

## 🎯 Project Overview

LiveKart is a modern, serverless e-commerce platform built with:

**Frontend:**

- React 18 + TypeScript
- Vite (Build tool)
- Tailwind CSS (Styling)
- React Router (Navigation)

**Backend:**

- AWS Lambda (Node.js 18.x serverless functions)
- AWS DynamoDB (NoSQL database)
- AWS S3 (Image storage)
- AWS Cognito (Authentication)

**Key Features:**

- ✅ Role-based access control (Customer, Vendor, Admin)
- ✅ Real-time product management
- ✅ Secure image uploads with S3
- ✅ JWT-based authentication
- ✅ Serverless architecture (AWS Free Tier optimized)

---

## 📦 Prerequisites

### Required Software

1. **Node.js** (v18 or higher)

   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **npm** (comes with Node.js)

   - Verify: `npm --version`

3. **Git**

   - Download: https://git-scm.com/
   - Verify: `git --version`

4. **AWS Account**

   - Sign up: https://aws.amazon.com
   - Free Tier eligible

5. **AWS CLI** (for deployment)
   - Download: https://awscli.amazonaws.com/AWSCLIV2.msi (Windows)
   - Verify: `aws --version`

### Optional Tools

- **VS Code** (recommended editor)
- **Postman** (for API testing)
- **Git Bash** (if on Windows)

---

## 📁 Project Structure

```
LiveKart/
├── backend/
│   ├── lambda/                    # AWS Lambda functions
│   │   ├── products/              # Product CRUD operations
│   │   │   ├── getProducts.js     # List all products
│   │   │   ├── getProduct.js      # Get single product
│   │   │   ├── createProduct.js   # Create product (vendor/admin)
│   │   │   ├── updateProduct.js   # Update product (vendor/admin)
│   │   │   └── deleteProduct.js   # Delete product (vendor/admin)
│   │   ├── orders/                # Order management
│   │   │   ├── createOrder.js     # Place order
│   │   │   └── getOrders.js       # Get user orders
│   │   ├── upload/                # File uploads
│   │   │   └── getUploadUrl.js    # Generate S3 presigned URLs
│   │   └── utils/                 # Shared utilities
│   │       ├── dynamodb.js        # DynamoDB helper functions
│   │       ├── s3.js              # S3 helper functions
│   │       └── auth.js            # JWT verification
│   └── src/                       # Express backend (optional)
│
├── frontend/
│   ├── src/
│   │   ├── pages/                 # Page components
│   │   │   ├── CustomerHome.tsx   # Product browsing
│   │   │   ├── VendorDashboard.tsx # Product management
│   │   │   ├── AdminOverview.tsx  # Admin dashboard
│   │   │   ├── LoginPage.tsx      # Authentication
│   │   │   ├── OrdersPage.tsx     # Order history
│   │   │   ├── ProfilePage.tsx    # User profile
│   │   │   └── WishlistPage.tsx   # Wishlist
│   │   ├── components/            # Reusable components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── CartDrawer.tsx
│   │   │   └── CategoryGrid.tsx
│   │   ├── utils/                 # Utilities
│   │   │   ├── api.ts             # Axios API client
│   │   │   ├── AuthContext.tsx    # Cognito auth provider
│   │   │   └── s3Upload.ts        # S3 upload helper
│   │   └── config/
│   │       └── aws-config.ts      # AWS configuration
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── infra/
│   └── cloudformation-template.yml # Infrastructure as Code
│
├── scripts/
│   ├── create-test-users.ps1      # Create test Cognito users
│   └── create-user-groups.ps1     # Create Cognito user groups
│
├── SETUP_GUIDE.md                 # This file
├── AWS_SERVICES_GUIDE.md          # AWS setup documentation
└── README.md                      # Project overview
```

---

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd LiveKart
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Install Backend Dependencies (Optional - for local testing)

```bash
cd ../backend/lambda
npm install
```

### 4. Configure AWS Services

**Follow the comprehensive AWS setup guide:**

- See [AWS_SERVICES_GUIDE.md](./AWS_SERVICES_GUIDE.md) for detailed step-by-step instructions

**You'll need to set up:**

- ✅ AWS Cognito (Authentication)
- ✅ AWS DynamoDB (Database)
- ✅ AWS S3 (Storage)
- ✅ AWS Lambda (Backend Functions)

### 5. Configure Environment Variables

**Frontend** - Create `frontend/.env`:

```env
# AWS Cognito Configuration
VITE_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxx
VITE_AWS_REGION=us-east-1

# API Base URL (optional, for Express backend)
VITE_API_BASE_URL=http://localhost:3000
```

**Backend** - Create `backend/lambda/.env` (if testing locally):

```env
AWS_REGION=us-east-1
PRODUCTS_TABLE=Products
ORDERS_TABLE=Orders
USERS_TABLE=Users
SESSIONS_TABLE=Sessions
S3_BUCKET=your-bucket-name
USER_POOL_ID=us-east-1_xxxxxxxxx
```

### 6. Start the Development Server

```bash
cd frontend
npm run dev
```

The application will open at: **http://localhost:5173**

---

## 💻 Local Development

### Frontend Development

**Start dev server:**

```bash
cd frontend
npm run dev
```

**Build for production:**

```bash
npm run build
```

**Preview production build:**

```bash
npm run preview
```

### Available Scripts

| Command           | Description                           |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Start Vite dev server with hot reload |
| `npm run build`   | Build production bundle               |
| `npm run preview` | Preview production build locally      |
| `npm run lint`    | Run ESLint                            |

### Code Structure Best Practices

**Pages** (`src/pages/`):

- One file per route/page
- Handle routing logic
- Use components for reusability

**Components** (`src/components/`):

- Small, reusable pieces
- Accept props
- No route logic

**Utils** (`src/utils/`):

- API calls (`api.ts`)
- Authentication (`AuthContext.tsx`)
- Helper functions

---

## 🔧 Environment Configuration

### Frontend Environment Variables

Create `frontend/.env`:

```env
# Required - AWS Cognito
VITE_USER_POOL_ID=us-east-1_pMr6t5GFA
VITE_USER_POOL_CLIENT_ID=2gaplvhum103s6rapucvvbv7pa
VITE_AWS_REGION=us-east-1

# Optional - API Backend
VITE_API_BASE_URL=http://localhost:3000

# Optional - AWS S3 (for direct uploads)
VITE_S3_BUCKET=livekart-products-bucket
VITE_S3_REGION=us-east-1
```

**Important Notes:**

- ✅ All variables must start with `VITE_` to be accessible in the app
- ✅ Never commit `.env` to Git (already in `.gitignore`)
- ✅ Restart dev server after changing environment variables

### Backend Environment Variables

Lambda functions get environment variables from AWS Console:

**Configuration → Environment Variables → Edit**

```
AWS_REGION = us-east-1
PRODUCTS_TABLE = Products
ORDERS_TABLE = Orders
S3_BUCKET = your-bucket-name
USER_POOL_ID = us-east-1_xxxxxxxxx
```

---

## 🧪 Testing

### Test User Accounts

After AWS Cognito setup, create test users:

```powershell
# Windows PowerShell
powershell -ExecutionPolicy Bypass -File scripts/create-test-users.ps1
```

```bash
# Linux/Mac
bash scripts/create-test-users.sh
```

**Default Test Accounts:**

| Role     | Email                 | Password     | Access                        |
| -------- | --------------------- | ------------ | ----------------------------- |
| Customer | customer@livekart.com | Customer123! | Browse products, place orders |
| Vendor   | vendor@livekart.com   | Vendor123!   | Manage products, view orders  |
| Admin    | admin@livekart.com    | Admin123!    | Full access, analytics        |

### Testing Authentication

1. Open app: http://localhost:5173
2. Click "Login"
3. Enter test credentials
4. Should redirect based on role:
   - Customer → Home page (product browsing)
   - Vendor → Vendor Dashboard (product management)
   - Admin → Admin Overview (analytics)

### Testing Lambda Functions

**Test from AWS Console:**

1. Go to Lambda function
2. Click "Test" tab
3. Create test event
4. Click "Test"

**Test from Postman:**

1. Get Function URL from AWS Console
2. Create new request in Postman
3. Add Authorization header: `Bearer <your-jwt-token>`
4. Send request

**Example Test Event (getProducts):**

```json
{
  "headers": {},
  "queryStringParameters": {
    "category": "electronics"
  }
}
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Cannot connect to AWS services"

**Problem:** Frontend can't reach AWS Cognito/Lambda

**Solution:**

```bash
# Check environment variables
cat frontend/.env

# Make sure they start with VITE_
# Restart dev server
cd frontend
npm run dev
```

#### 2. "Invalid authentication token"

**Problem:** JWT token expired or invalid

**Solution:**

- Log out and log back in
- Check Cognito User Pool ID is correct
- Verify USER_PASSWORD_AUTH is enabled in Cognito Console

#### 3. "Module not found" errors

**Problem:** Dependencies not installed

**Solution:**

```bash
# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install

# Backend
cd backend/lambda
rm -rf node_modules package-lock.json
npm install
```

#### 4. "AccessDeniedException" in Lambda

**Problem:** IAM role lacks permissions

**Solution:**

- Go to Lambda → Configuration → Permissions
- Click role name
- Add policies:
  - `AmazonDynamoDBFullAccess`
  - `AmazonS3FullAccess`
  - `CloudWatchLogsFullAccess`

#### 5. Cognito Sign-Up Errors

**Username format error:**

```
"Username cannot be of email format, since user pool is configured for email alias"
```

**Solution:** Code already handles this by generating non-email usernames. Make sure you're using the latest version of `AuthContext.tsx`.

**Password policy error:**

```
"Password did not conform with policy"
```

**Solution:** Password requirements:

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (!@#$%^&\*)

**Custom attribute error:**

```
"Attributes did not conform to the schema: custom:role"
```

**Solution:** This means `custom:role` is not configured in Cognito. The code handles this by defaulting all users to "customer" role. To fix properly, see AWS_SERVICES_GUIDE.md → Cognito Setup → Custom Attributes.

#### 6. CORS Errors

**Problem:** Browser blocks requests to Lambda

**Solution:**

- Enable CORS in Lambda Function URL configuration
- Allow origin: `*` (or your specific domain)
- Allow methods: `GET, POST, PUT, DELETE, OPTIONS`
- Allow headers: `Content-Type, Authorization`

#### 7. Build Errors

**Vite build fails:**

```bash
# Clear cache
cd frontend
rm -rf node_modules/.vite
npm run dev
```

**TypeScript errors:**

```bash
# Check tsconfig.json is present
# Verify all .tsx files have proper imports
```

### Getting Help

**Check logs:**

- Frontend: Browser console (F12)
- Backend: AWS CloudWatch Logs (Lambda → Monitor → View logs)

**Enable verbose logging:**

```typescript
// In AuthContext.tsx or api.ts
console.log("Debug:", variable);
```

**AWS Academy Issues:**

- If IAM permissions are restricted, see AWS_SERVICES_GUIDE.md → AWS Academy Setup
- Use existing `LabRole` instead of creating new roles
- Some features may not be available (CloudFront, SES production mode)

---

## 🚀 Deployment

### Deploy to AWS

**Option 1: Using CloudFormation (Recommended)**

```powershell
# Windows PowerShell
powershell -ExecutionPolicy Bypass -File deploy.ps1
```

```bash
# Linux/Mac
bash deploy.sh
```

**Option 2: Manual Setup**

Follow the complete guide in [AWS_SERVICES_GUIDE.md](./AWS_SERVICES_GUIDE.md)

### Production Checklist

Before deploying to production:

- [ ] All Lambda functions created and tested
- [ ] DynamoDB tables configured with proper indexes
- [ ] S3 bucket has correct CORS configuration
- [ ] Cognito User Pool configured with password policies
- [ ] Environment variables set correctly
- [ ] IAM roles have minimal required permissions
- [ ] CloudWatch logging enabled
- [ ] Test user accounts removed
- [ ] Frontend built: `npm run build`
- [ ] Domain configured (optional)

---

## 📚 Next Steps

1. **Set up AWS Services:** Follow [AWS_SERVICES_GUIDE.md](./AWS_SERVICES_GUIDE.md)
2. **Customize the UI:** Modify Tailwind styles in `frontend/src`
3. **Add features:** Extend Lambda functions and React components
4. **Monitor usage:** Check AWS CloudWatch for logs and metrics
5. **Optimize costs:** Stay within Free Tier limits

---

## 📞 Support

**Documentation:**

- [AWS_SERVICES_GUIDE.md](./AWS_SERVICES_GUIDE.md) - Detailed AWS setup
- [README.md](./README.md) - Project overview

**Useful Links:**

- AWS Lambda Documentation: https://docs.aws.amazon.com/lambda/
- AWS Cognito Documentation: https://docs.aws.amazon.com/cognito/
- React Documentation: https://react.dev/
- Vite Documentation: https://vitejs.dev/

---

**Happy Coding! 🎉**
