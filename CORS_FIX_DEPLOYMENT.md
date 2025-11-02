# Fix CORS for Order Placement - Deployment Guide

## Problem

Getting CORS error when placing orders:

```
Access to XMLHttpRequest at 'https://o77olxi6ap3eoee23rmgpa6kfu0zctbs.lambda-url.us-east-1.on.aws/'
from origin 'http://localhost:5173' has been blocked by CORS policy:
Response to preflight request doesn't pass access control check:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Root Cause

Lambda Function URLs require CORS headers to be explicitly returned in ALL responses, including OPTIONS preflight requests. The issue was:

1. OPTIONS request handler was checking the wrong event path (`event.requestContext.http.method`)
2. Missing proper CORS headers in some responses

## Changes Made

### 1. Fixed createOrder.js

**File:** `backend/lambda/orders/createOrder.js`

**Changes:**

- ✅ Fixed OPTIONS request detection to work with Lambda Function URLs
- ✅ Removed conflicting `Access-Control-Allow-Credentials` header
- ✅ Added `Access-Control-Max-Age` for better caching
- ✅ Ensured all responses include proper CORS headers

**Key Fix:**

```javascript
// OLD (didn't work with Function URLs):
if (event.requestContext.http.method === "OPTIONS") { ... }

// NEW (works with all Lambda invocation types):
const method = event.requestContext?.http?.method || event.httpMethod || event.requestContext?.httpMethod;
if (method === "OPTIONS") { ... }
```

### 2. Fixed getOrders.js

**File:** `backend/lambda/orders/getOrders.js`

**Changes:**

- ✅ Added OPTIONS request handling
- ✅ Uses the same method detection as createOrder

### 3. Updated auth.js utility

**File:** `backend/lambda/utils/auth.js`

**Changes:**

- ✅ Removed conflicting `Access-Control-Allow-Credentials: true` header
- ✅ Added `Access-Control-Max-Age: 86400` (24 hours cache)
- ✅ Consistent CORS headers across all responses

## Deployment Instructions

### Option 1: Deploy via AWS Console (Recommended for quick fix)

1. **Open AWS Lambda Console**

   ```
   https://console.aws.amazon.com/lambda/home?region=us-east-1
   ```

2. **Update createOrder Function:**

   - Find function: `createOrder`
   - Click "Code" tab
   - Replace the entire `createOrder.js` code with the updated version
   - Click "Deploy"

3. **Update getOrders Function:**

   - Find function: `getOrders`
   - Click "Code" tab
   - Replace the entire `getOrders.js` code with the updated version
   - Click "Deploy"

4. **Update auth.js utility (if shared):**
   - This depends on your Lambda layer setup
   - If using layers, update the layer
   - If code is bundled, update each function that uses it

### Option 2: Deploy via PowerShell Script

**Run the deployment script:**

```powershell
.\deploy-createOrder.ps1
```

This script will:

1. Create a deployment package with all dependencies
2. Upload to AWS Lambda
3. Show deployment status

### Option 3: Deploy via AWS CLI

```bash
# 1. Create deployment package
cd backend/lambda
zip -r deployment.zip orders/createOrder.js orders/getOrders.js utils/ node_modules/

# 2. Update createOrder function
aws lambda update-function-code \
  --function-name createOrder \
  --zip-file fileb://deployment.zip \
  --region us-east-1

# 3. Update getOrders function
aws lambda update-function-code \
  --function-name getOrders \
  --zip-file fileb://deployment.zip \
  --region us-east-1

# 4. Clean up
rm deployment.zip
```

## Testing After Deployment

### 1. Test OPTIONS Request (Preflight)

```bash
curl -X OPTIONS https://o77olxi6ap3eoee23rmgpa6kfu0zctbs.lambda-url.us-east-1.on.aws/ \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v
```

**Expected Response Headers:**

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Access-Control-Max-Age: 86400
```

### 2. Test from Frontend

1. Open your app: http://localhost:5173/
2. Add items to cart (make sure you're signed in)
3. Go to checkout
4. Fill in shipping address
5. Click "Place Order"
6. Check browser console for success message

### 3. Check CloudWatch Logs

```bash
aws logs tail /aws/lambda/createOrder --follow --region us-east-1
```

Look for:

- ✅ Event logs showing the request
- ✅ No authentication errors
- ✅ Order created successfully

## Verification Checklist

- [ ] Deployed updated `createOrder.js`
- [ ] Deployed updated `getOrders.js`
- [ ] Deployed updated `auth.js` (if applicable)
- [ ] OPTIONS request returns 200 with CORS headers
- [ ] POST request returns CORS headers in response
- [ ] Can place order from frontend without CORS error
- [ ] Order appears in DynamoDB Orders table
- [ ] CloudWatch logs show successful execution

## CORS Headers Reference

All Lambda responses should include these headers:

```javascript
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400"
}
```

**Note:** Do NOT use `Access-Control-Allow-Credentials: true` with `Access-Control-Allow-Origin: *` - they conflict!

## Common Issues

### Issue 1: Still getting CORS error after deployment

**Solution:**

- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+F5)
- Wait 30 seconds for Lambda deployment to propagate

### Issue 2: Authentication fails

**Solution:**

- Make sure you're signed in (check localStorage for tokens)
- Verify USER_POOL_ID environment variable is set in Lambda
- Check token hasn't expired (tokens expire after 1 hour)

### Issue 3: Order not appearing in DynamoDB

**Solution:**

- Check CloudWatch logs for errors
- Verify Lambda has DynamoDB permissions
- Check table name matches: `dev-livekart-orders`

## Rollback Plan

If deployment causes issues:

1. **AWS Console:** Use "Previous versions" tab to rollback
2. **Backup files:** Located in `backend/lambda/orders/*.backup.js`
3. **Git:** `git checkout HEAD~1 backend/lambda/orders/`

## Support

If issues persist:

1. Check CloudWatch Logs for detailed error messages
2. Test with curl to isolate frontend vs backend issues
3. Verify all environment variables are set correctly
4. Check IAM permissions for Lambda execution role

## Success Indicators

✅ Browser console shows: "Order created successfully"  
✅ No CORS errors in Network tab  
✅ Response includes order_id  
✅ Order appears in DynamoDB table  
✅ CloudWatch logs show successful execution

---

**Deployment Date:** January 2025  
**Version:** 1.1 (CORS Fix)
