# LiveKart — E-Commerce Platform

A modern, serverless e-commerce platform built with React, TypeScript, and AWS services. Features production-ready authentication, image storage, email notifications, and real-time analytics.

---

## 🚀 Quick Start

**New to AWS?** → Start with **[QUICK_START.md](./QUICK_START.md)** (45-minute setup)

**Ready to deploy?** → Run: `powershell -ExecutionPolicy Bypass -File deploy.ps1`

---

## 🏗️ Architecture

### AWS Services (6 Total - Free Tier Optimized)

```
Frontend (React + Vite)
         ↓
    AWS Cognito (Auth + JWT)
         ↓
    AWS Lambda (API)
    ├── Order Validation
    ├── Image Processing
    ├── Email Notifications
    └── Cleanup Jobs
         ↓
    ┌────────────┬────────────┬────────────┐
    ↓            ↓            ↓            ↓
DynamoDB     AWS S3    CloudFront    AWS SES
(Database)  (Images)    (CDN)      (Emails)
```

### Technology Stack

**Frontend:**

- React 18 + TypeScript
- Vite (Build tool)
- Tailwind CSS (Styling)
- AWS Amplify (AWS SDK)
- React Router (Navigation)

**Backend:**

- AWS Lambda (Python 3.11)
- AWS API Gateway
- Serverless architecture

**Database:**

- DynamoDB (NoSQL)
- 4 Tables: Products, Orders, Sessions, Analytics

**Storage & CDN:**

- S3 (Product images)
- CloudFront (Global CDN)

**Authentication:**

- AWS Cognito User Pools
- JWT tokens
- Role-based access (Customer, Vendor, Admin)

**Email:**

- AWS SES (Transactional emails)

## 🌟 Features

### Customer Features

- 🛍️ Browse products with professional UI
- 🔍 Search and filter by category
- 🛒 Shopping cart with real-time updates
- 💳 Secure checkout process
- 📱 Fully responsive design
- 🔐 JWT-based authentication
- 📧 Order confirmation emails

### Vendor Features

- 💼 Add and manage products
- 📸 Upload product images to S3
- 📊 View product analytics
- 🏷️ Categorize products
- 🖼️ Automatic thumbnail generation

### Admin Features

- � Platform analytics dashboard
- 🔥 Trending products tracking
- 📊 Revenue and view statistics
- 👥 User management via Cognito

## 🚀 Quick Start

### Prerequisites

- ✅ Node.js 18+
- ✅ AWS Account (Free Tier eligible)
- ✅ AWS CLI installed and configured
- ✅ PowerShell (Windows) or Bash (Mac/Linux)

### 🎯 Deployment Steps (Choose One)

#### ⚡ Quick Start (Recommended)

Follow the **[QUICK_START.md](./QUICK_START.md)** guide for a complete walkthrough!

#### 🔧 Manual Deployment (Windows PowerShell)

```powershell
# 1. Deploy AWS infrastructure (5-10 minutes)
powershell -ExecutionPolicy Bypass -File deploy.ps1

# 2. Create user groups
powershell -ExecutionPolicy Bypass -File scripts/create-user-groups.ps1

# 3. Create test users
powershell -ExecutionPolicy Bypass -File scripts/create-test-users.ps1

# 4. Install frontend dependencies
cd frontend
npm install

# 5. Start development server
npm run dev
```

#### 🐧 Manual Deployment (Mac/Linux Bash)

```bash
# 1. Deploy AWS infrastructure (5-10 minutes)
chmod +x deploy.sh
./deploy.sh

# 2. Create test users
chmod +x scripts/create-test-users.sh
./scripts/create-test-users.sh

# 3. Install frontend dependencies
cd frontend
npm install

# 4. Start development server
npm run dev
```

### 🔐 Test Credentials

After deployment, login with:

- **Customer:** `customer@livekart.com` / `Customer123!`
- **Vendor:** `vendor@livekart.com` / `Vendor123!`
- **Admin:** `admin@livekart.com` / `Admin123!`

Visit `http://localhost:5173`

### 6. Test Credentials

**Admin:**

- Email: `admin@livekart.com`
- Password: `Admin123!`

**Vendor:**

- Email: `vendor@livekart.com`
- Password: `Vendor123!`

**Customer:**

- Email: `customer@livekart.com`
- Password: `Customer123!`

## 📚 Documentation

## 📚 Documentation

### 📖 Getting Started

- **[🚀 Quick Start Guide](./QUICK_START.md)** - Complete 45-minute setup checklist
- **[🔧 AWS Setup Guide](./AWS_SETUP_GUIDE.md)** - Detailed AWS account setup with screenshots

### 🏗️ Deployment

- **[📋 Deployment Guide](./AWS_DEPLOYMENT_GUIDE.md)** - Technical deployment details
- **[📊 Integration Summary](./AWS_INTEGRATION_SUMMARY.md)** - What's been implemented

### 🛠️ Architecture & Code

- **[🏛️ Infrastructure README](./infra/README.md)** - AWS services architecture
- **[⚙️ Frontend Config](./frontend/src/config/aws-config.ts)** - AWS configuration
- **[📸 S3 Upload Utils](./frontend/src/utils/s3Upload.ts)** - Image upload utilities

---

### Admin Account

- **Email:** admin@livekart.com
- **Password:** admin123

## 📁 Project Structure

```
CC_mini_project/
├── backend/
│   ├── src/
│   │   ├── index.js          # Express server entry
│   │   └── routes/
│   │       └── products.js   # Product API routes (AWS code commented)
│   ├── package.json
│   └── .env                  # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # Main app with routing
│   │   ├── pages/
│   │   │   ├── CustomerHome.tsx     # Product browsing & cart
│   │   │   ├── VendorDashboard.tsx  # Product management
│   │   │   ├── AdminOverview.tsx    # Analytics dashboard
│   │   │   └── LoginPage.tsx        # Authentication
│   │   └── utils/
│   │       ├── api.ts        # Axios API client
│   │       └── AuthContext.tsx  # Mock authentication
│   └── package.json
│
└── infra/
    └── cloudformation-template.yml  # AWS infrastructure (future use)
```

## 🎨 Technology Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls

### Backend

- **Node.js** with Express
- **UUID** for ID generation
- **CORS** enabled
- **Body Parser** for JSON

### Future AWS Integration (Currently Disabled)

- Amazon S3 for image storage
- DynamoDB for product database
- Amazon SES for email notifications
- Cognito for authentication
- CloudFront for CDN

## 🔧 Development Mode

The application currently runs with:

- ✅ **Mock in-memory database** for products
- ✅ **Mock authentication** (localStorage-based)
- ✅ **Pre-loaded sample products**
- ⚠️ **AWS services disabled** (code commented out)

All AWS-related code is preserved and commented in:

- `backend/src/routes/products.js`
- `frontend/src/utils/AuthContext.tsx`

## 📊 API Endpoints

### Products

- `GET /getProducts` - Fetch all products
- `POST /addProduct` - Add new product
- `GET /getTrending` - Get trending products (sorted by views)
- `GET /getAnalytics` - Get platform analytics (admin)

### Orders

- `POST /placeOrder` - Place a customer order

### Upload

- `POST /sign-s3` - Generate signed URL for S3 (mocked)

## 🎯 Next Steps for AWS Integration

When ready to enable AWS features:

1. **Uncomment AWS code** in backend routes
2. **Set up AWS resources:**

   - DynamoDB table: `LiveKartProducts`
   - S3 bucket: `livekart-product-images`
   - SES verified sender email
   - Cognito User Pool

3. **Deploy using CloudFormation:**

```bash
cd infra
aws cloudformation create-stack --stack-name livekart --template-body file://cloudformation-template.yml
```

4. **Update environment variables:**

   - Backend: AWS region, bucket names, table names
   - Frontend: API Gateway URL, CloudFront domain

5. **Deploy backend with Serverless:**

```bash
cd backend
npm install -g serverless
serverless deploy
```

## 💡 Key Features to Note

- **Production-Ready Code:** Clean, well-structured, and commented
- **Type Safety:** Full TypeScript implementation in frontend
- **Error Handling:** Comprehensive error handling throughout
- **Loading States:** User-friendly loading indicators
- **Responsive Design:** Works on mobile, tablet, and desktop
- **Mock Data:** Realistic sample products with images from Unsplash

## 🐛 Troubleshooting

**Backend not connecting?**

- Ensure backend is running on port 3000
- Check `.env` file exists in backend folder

**Frontend not loading data?**

- Verify `VITE_API_BASE_URL` in frontend/.env
- Check browser console for errors

**Port already in use?**

- Backend: Change `PORT` in backend/.env
- Frontend: Use `--port` flag with vite

## 📝 License

This project is part of a Cloud Computing mini-project.

## 👨‍💻 Development Notes

- **Cost-Effective:** Designed for AWS student accounts with limited credits
- **Modular:** Easy to enable/disable AWS features
- **Scalable:** Ready for production deployment
- **Modern:** Latest React and Node.js best practices

---

**Status:** ✅ Development Mode Active | ⚠️ AWS Integration Disabled

For AWS setup, refer to `infra/cloudformation-template.yml` and uncomment AWS code blocks.
