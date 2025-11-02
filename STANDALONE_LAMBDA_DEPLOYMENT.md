# Standalone Lambda Functions - Deployment Guide

## Overview

These are completely self-contained Lambda functions that can be copied directly into AWS Lambda console without any external dependencies or npm packages.

## Files Created

1. `createOrder-standalone.js` - Creates new orders
2. `getOrders-standalone.js` - Retrieves orders with filtering

## Quick Deployment Steps

### 1. Deploy createOrder Function

#### A. In AWS Lambda Console:

1. Go to AWS Lambda Console: https://console.aws.amazon.com/lambda
2. Click on your function: **livekart-createOrder**
3. In the "Code" tab, delete all existing code
4. Copy the entire contents of `createOrder-standalone.js`
5. Paste it into the Lambda code editor
6. Click **Deploy** button

#### B. Configure Environment Variables:

1. Go to "Configuration" tab → "Environment variables"
2. Add/Edit:
   - Key: `ORDERS_TABLE`
   - Value: `livekart-orders` (your table name)

#### C. Verify IAM Permissions:

1. Go to "Configuration" tab → "Permissions"
2. Click on the execution role
3. Ensure it has these permissions:
   ```json
   {
     "Effect": "Allow",
     "Action": ["dynamodb:PutItem"],
     "Resource": "arn:aws:dynamodb:*:*:table/Orders"
   }
   ```

#### D. Enable Function URL (if not already enabled):

1. Go to "Configuration" tab → "Function URL"
2. Click "Create function URL"
3. Auth type: **NONE** (for public access)
4. Configure CORS:
   - Allow origin: `*`
   - Allow methods: `POST, GET, OPTIONS`
   - Allow headers: `*`
   - Max age: `86400`
5. Save and copy the Function URL

### 2. Deploy getOrders Function

Follow the same steps as above for the **livekart-getOrders** function:

1. Paste contents of `getOrders-standalone.js`
2. Set `ORDERS_TABLE` environment variable
3. Verify IAM permissions include:
   ```json
   {
     "Effect": "Allow",
     "Action": ["dynamodb:Scan", "dynamodb:Query"],
     "Resource": "arn:aws:dynamodb:*:*:table/livekart-orders"
   }
   ```
4. Enable Function URL with CORS

## Testing

### Test createOrder:

```bash
# PowerShell
$body = @{
    userId = "test-user-123"
    userEmail = "test@example.com"
    items = @(
        @{
            productId = "prod-1"
            title = "Test Product"
            price = 29.99
            quantity = 2
        }
    )
    shippingAddress = @{
        street = "123 Main St"
        city = "New York"
        state = "NY"
        zipCode = "10001"
    }
    paymentMethod = "credit_card"
    totalAmount = 59.98
} | ConvertTo-Json

Invoke-WebRequest -Uri "YOUR_CREATE_ORDER_FUNCTION_URL" -Method POST -Body $body -ContentType "application/json"
```

### Test getOrders:

```bash
# PowerShell
Invoke-WebRequest -Uri "YOUR_GET_ORDERS_FUNCTION_URL?userId=test-user-123"
```

## Key Features

### ✅ No External Dependencies

- Uses only `@aws-sdk/client-dynamodb` and `@aws-sdk/lib-dynamodb` (built into Lambda)
- Uses `crypto.randomUUID()` instead of uuid package
- No local file imports

### ✅ Proper CORS Handling

- OPTIONS preflight requests return 200
- All responses include CORS headers
- Works with any frontend origin

### ✅ Comprehensive Error Handling

- Try-catch blocks around all operations
- Specific error messages for different failure types
- Detailed CloudWatch logging

### ✅ Simplified Authentication

- No JWT verification (to avoid external packages)
- Accepts userId and userEmail from request
- Ready for proper auth layer later

## Request/Response Examples

### createOrder Request:

```json
{
  "userId": "user-123",
  "userEmail": "user@example.com",
  "items": [
    {
      "productId": "prod-1",
      "title": "Smartphone",
      "price": 599.99,
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94102"
  },
  "paymentMethod": "credit_card",
  "totalAmount": 599.99
}
```

### createOrder Response:

```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "orderId": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "user-123",
    "totalAmount": 599.99,
    "status": "pending",
    "createdAt": 1699000000000,
    "items": [...],
    "shippingAddress": {...}
  }
}
```

### getOrders Request:

```
GET /orders?userId=user-123
GET /orders?status=pending
GET /orders?userId=user-123&status=pending&limit=50
GET /orders (get all orders)
```

### getOrders Response:

```json
{
  "success": true,
  "count": 5,
  "orders": [
    {
      "orderId": "...",
      "userId": "user-123",
      "totalAmount": 599.99,
      "status": "pending",
      "createdAt": 1699000000000,
      "items": [...],
      "shippingAddress": {...}
    }
  ],
  "filters": {
    "userId": "user-123",
    "status": null
  }
}
```

## DynamoDB Table Schema

Make sure your `livekart-orders` table has this structure:

- **Primary Key**: `orderId` (String)
- **Attributes**: All other fields are stored as nested JSON

For better performance with userId queries, consider adding a GSI:

- **GSI Name**: `userId-index`
- **Partition Key**: `userId` (String)
- **Sort Key**: `createdAt` (Number)

## Troubleshooting

### Issue: Still getting CORS errors

**Solution**:

1. Check Function URL CORS settings
2. Verify all responses include CORS headers
3. Check browser console for specific CORS error

### Issue: "Cannot find module" error

**Solution**:

- Make sure you copied the ENTIRE file content
- Verify Node.js runtime is 18.x or higher
- AWS SDK v3 is built into Lambda runtime 18.x+

### Issue: DynamoDB table not found

**Solution**:

1. Verify table name in environment variables
2. Check table exists in same region as Lambda
3. Verify IAM permissions

### Issue: Function timing out

**Solution**:

1. Go to Configuration → General configuration
2. Increase timeout to 30 seconds
3. Increase memory to 256 MB

## Next Steps

1. ✅ Deploy both functions
2. ✅ Test with curl or Postman
3. ✅ Update frontend with new Function URLs
4. 🔄 Monitor CloudWatch logs for any errors
5. 🔄 Add proper authentication (API Gateway + Cognito) later

## CloudWatch Logs

To view logs:

```bash
aws logs tail /aws/lambda/livekart-createOrder --follow
aws logs tail /aws/lambda/livekart-getOrders --follow
```

Or in AWS Console:

1. Go to Lambda function
2. Click "Monitor" tab
3. Click "View CloudWatch logs"

## Production Recommendations

Once working, consider:

1. Add API Gateway for better request management
2. Implement proper JWT authentication with Cognito
3. Add rate limiting and request validation
4. Create GSI on Orders table for userId queries
5. Add order status update endpoint
6. Implement order notifications (SNS/SES)
7. Add request/response validation with JSON schemas
