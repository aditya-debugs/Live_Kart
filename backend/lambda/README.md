# LiveKart Lambda Functions

AWS Serverless backend for LiveKart E-commerce Platform (AWS Learner Academy Compatible)

## 🚀 Quick Start

```powershell
# Install dependencies
npm install

# Deploy to AWS
serverless deploy --stage dev

# View API endpoint in output
```

## 📖 Documentation

- **[LAMBDA_SUMMARY.md](../../LAMBDA_SUMMARY.md)** - Quick overview of all functions
- **[LAMBDA_DEPLOYMENT.md](../../LAMBDA_DEPLOYMENT.md)** - Complete deployment guide
- **[LAMBDA_GUIDE.md](../../LAMBDA_GUIDE.md)** - Architecture and design

## 🎯 API Endpoints

| Endpoint         | Method | Auth         | Description       |
| ---------------- | ------ | ------------ | ----------------- |
| `/products`      | GET    | No           | List products     |
| `/products/{id}` | GET    | No           | Get product       |
| `/products`      | POST   | Vendor/Admin | Create product    |
| `/products/{id}` | PUT    | Vendor/Admin | Update product    |
| `/products/{id}` | DELETE | Vendor/Admin | Delete product    |
| `/upload-url`    | POST   | Vendor/Admin | Get S3 upload URL |
| `/orders`        | POST   | Auth         | Create order      |
| `/orders`        | GET    | Auth         | Get orders        |

## 🔐 Authentication

All protected endpoints require JWT token from Cognito:

```
Authorization: Bearer <JWT_TOKEN>
```

## 💻 Local Development

```powershell
# Install serverless-offline
npm install -D serverless-offline

# Run locally
serverless offline
```

## 📊 Monitoring

```powershell
# View logs
serverless logs -f getProducts --tail

# CloudWatch
aws logs tail /aws/lambda/livekart-api-dev-getProducts --follow
```

## 🗑️ Cleanup

```powershell
serverless remove --stage dev
```

## 📝 Environment Variables

Create `.env` file:

```env
USER_POOL_ID=us-east-1_XXXXXXXXX
AWS_REGION=us-east-1
```

## 🎉 Features

- ✅ 8 Lambda functions
- ✅ API Gateway integration
- ✅ Cognito authentication
- ✅ DynamoDB tables
- ✅ S3 image storage
- ✅ Role-based permissions
- ✅ Pre-signed S3 URLs

---

**For full deployment instructions, see [LAMBDA_DEPLOYMENT.md](../../LAMBDA_DEPLOYMENT.md)**
