# LiveKart — E-Commerce Platform MVP

A modern, full-stack e-commerce platform built with React, TypeScript, Node.js, and Express. Currently running in development mode with mock data, ready for AWS integration.

## 🌟 Features

### Customer Features

- 🛍️ Browse products with beautiful card layouts
- 🔍 Search and filter products by category
- 🛒 Shopping cart with real-time updates
- 💳 Simple checkout process
- 📱 Fully responsive design

### Vendor Features

- 💼 Add and manage products
- 📊 View product analytics (views, revenue)
- 🏷️ Categorize products
- 📸 Product image support (URL-based)

### Admin Features

- 📈 Platform analytics dashboard
- 🔥 Trending products overview
- 📊 Revenue and view statistics
- 🆕 Recent product listings

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation & Running

1. **Install Backend Dependencies:**

```bash
cd backend
npm install
```

2. **Install Frontend Dependencies:**

```bash
cd frontend
npm install
```

3. **Start Backend Server:**

```bash
cd backend
npm start
# Server runs on http://localhost:3000
```

4. **Start Frontend Development Server:**

```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

5. **Access the Application:**

- Open your browser to `http://localhost:5173`
- Use demo credentials to login (see below)

## 🔐 Demo Credentials

### Customer Account

- **Email:** customer@livekart.com
- **Password:** customer123

### Vendor Account

- **Email:** vendor@livekart.com
- **Password:** vendor123

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
