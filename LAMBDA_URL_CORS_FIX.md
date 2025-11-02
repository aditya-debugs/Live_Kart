# Lambda Function URL CORS - Complete Fix Guide

## The Real Problem

Lambda Function URLs require **TWO levels** of CORS configuration:

1. ✅ **Code-level CORS headers** (Already done ✓)
2. ❌ **Function URL CORS configuration** (Missing - This is the issue!)

## Why Code Changes Weren't Enough

Even though we updated the Lambda code to return CORS headers, **AWS Lambda Function URLs have their own CORS configuration** that must be set separately. If this isn't configured, the preflight OPTIONS request fails BEFORE your Lambda code even runs!

## Quick Fix (Recommended)

### Step 1: Check Current Configuration

```powershell
.\check-lambda-cors.ps1
```

This will show you if CORS is configured at the Function URL level.

### Step 2: Apply CORS Configuration

```powershell
.\fix-lambda-cors.ps1
```

This will configure CORS for both `createOrder` and `getOrders` Function URLs.

### Step 3: Test

Wait 10-15 seconds, then:

```bash
curl -X OPTIONS https://o77olxi6ap3eoee23rmgpa6kfu0zctbs.lambda-url.us-east-1.on.aws/ -v
```

You should see:

```
< HTTP/2 200
< access-control-allow-origin: *
< access-control-allow-methods: GET, POST, PUT, DELETE, OPTIONS
< access-control-allow-headers: Content-Type, Authorization, X-Requested-With, Accept
```

## Manual Fix (AWS Console)

If you prefer using the AWS Console:

1. **Go to Lambda Console:**

   ```
   https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions
   ```

2. **For each function (createOrder, getOrders):**

   - Click on the function name
   - Go to **"Configuration"** tab
   - Click **"Function URL"** in the left menu
   - Click **"Edit"**
   - Scroll down to **"Configure cross-origin resource sharing (CORS)"**
   - Enable CORS
   - Set the following:

   **Allow origins:** `*`  
   **Allow methods:** `GET, POST, PUT, DELETE, OPTIONS`  
   **Allow headers:** `Content-Type, Authorization, X-Requested-With, Accept`  
   **Max age:** `86400`  
   **Allow credentials:** `No` (unchecked)

   - Click **"Save"**

3. **Wait 10-15 seconds** for changes to propagate

4. **Clear browser cache** and try again

## Manual Fix (AWS CLI)

For createOrder:

```bash
aws lambda update-function-url-config \
  --function-name createOrder \
  --region us-east-1 \
  --cors '{
    "AllowOrigins": ["*"],
    "AllowMethods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "AllowHeaders": ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    "MaxAge": 86400,
    "AllowCredentials": false
  }'
```

For getOrders:

```bash
aws lambda update-function-url-config \
  --function-name getOrders \
  --region us-east-1 \
  --cors '{
    "AllowOrigins": ["*"],
    "AllowMethods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "AllowHeaders": ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    "MaxAge": 86400,
    "AllowCredentials": false
  }'
```

## Verification Steps

### 1. Test OPTIONS Request (Preflight)

```bash
curl -X OPTIONS https://o77olxi6ap3eoee23rmgpa6kfu0zctbs.lambda-url.us-east-1.on.aws/ \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v
```

**Expected Output:**

- ✅ Status: `200 OK`
- ✅ Header: `access-control-allow-origin: *`
- ✅ Header: `access-control-allow-methods: GET, POST, PUT, DELETE, OPTIONS`
- ✅ Header: `access-control-allow-headers: Content-Type, Authorization, X-Requested-With, Accept`

### 2. Test from Browser

1. Open: http://localhost:5173/
2. Open DevTools → Network tab
3. Add item to cart
4. Go to checkout
5. Place order
6. Check Network tab:
   - ✅ Should see OPTIONS request with 200 status
   - ✅ Should see POST request with 201 or 200 status
   - ❌ NO CORS errors

### 3. Verify in AWS Console

```bash
aws lambda get-function-url-config --function-name createOrder --region us-east-1
```

Should return:

```json
{
  "FunctionUrl": "https://o77olxi6ap3eoee23rmgpa6kfu0zctbs.lambda-url.us-east-1.on.aws/",
  "FunctionArn": "arn:aws:lambda:us-east-1:...",
  "AuthType": "NONE",
  "Cors": {
    "AllowOrigins": ["*"],
    "AllowMethods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "AllowHeaders": [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept"
    ],
    "MaxAge": 86400,
    "AllowCredentials": false
  },
  "CreationTime": "..."
}
```

## Why This Happens

**Lambda Function URLs vs API Gateway:**

| Feature          | API Gateway       | Lambda Function URLs  |
| ---------------- | ----------------- | --------------------- |
| CORS Config      | In serverless.yml | Separate URL config   |
| OPTIONS Handling | Automatic         | Manual (both levels)  |
| Headers          | In response       | URL config + response |

When you use **Function URLs** (like you are), AWS handles the OPTIONS preflight request at the infrastructure level BEFORE your code runs. That's why code changes alone don't fix the issue.

## Common Mistakes

### ❌ Mistake 1: Only updating Lambda code

```javascript
// This alone is NOT enough!
return {
  statusCode: 200,
  headers: { "Access-Control-Allow-Origin": "*" },
};
```

### ✅ Solution: Configure Function URL CORS

You need BOTH code headers AND Function URL CORS config.

### ❌ Mistake 2: Using AllowCredentials with wildcard origin

```json
{
  "AllowOrigins": ["*"],
  "AllowCredentials": true // ❌ This conflicts!
}
```

### ✅ Solution: Set AllowCredentials to false

```json
{
  "AllowOrigins": ["*"],
  "AllowCredentials": false // ✅ Correct
}
```

## Troubleshooting

### Issue: Still getting CORS error after applying fix

**Solutions:**

1. **Wait 15-30 seconds** - AWS needs time to propagate changes
2. **Clear browser cache** - Old CORS responses are cached
3. **Hard refresh** - Ctrl+F5 or Cmd+Shift+R
4. **Check Function URL** - Make sure you're using the correct URL
5. **Verify configuration** - Run `check-lambda-cors.ps1`

### Issue: "Function URL not found"

**Solution:**
Create a Function URL first:

```bash
aws lambda create-function-url-config \
  --function-name createOrder \
  --region us-east-1 \
  --auth-type NONE \
  --cors '{
    "AllowOrigins": ["*"],
    "AllowMethods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "AllowHeaders": ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    "MaxAge": 86400,
    "AllowCredentials": false
  }'
```

### Issue: 403 Forbidden

**Solution:**
Check the Function URL auth type:

```bash
aws lambda get-function-url-config --function-name createOrder --region us-east-1
```

Should be `"AuthType": "NONE"` for public access.

## Success Checklist

After applying the fix:

- [ ] Ran `check-lambda-cors.ps1` to verify current config
- [ ] Ran `fix-lambda-cors.ps1` to apply CORS config
- [ ] Waited 15 seconds for propagation
- [ ] Cleared browser cache
- [ ] Hard refreshed the page (Ctrl+F5)
- [ ] Tested OPTIONS request with curl - returns 200 OK
- [ ] Tested POST request from frontend - no CORS error
- [ ] Order successfully created in DynamoDB
- [ ] CloudWatch logs show successful execution

## Next Steps

Once CORS is fixed:

1. **Test order placement** from your app
2. **Check DynamoDB** to see if orders are being saved
3. **Monitor CloudWatch Logs** for any other errors
4. **Test other features** (get orders, create product, etc.)

## Alternative: Switch to API Gateway

If Lambda Function URLs continue to cause issues, consider switching to API Gateway:

1. **Deploy via Serverless Framework:**

   ```bash
   cd backend/lambda
   serverless deploy
   ```

2. **Update .env with API Gateway URLs:**

   ```
   VITE_LAMBDA_CREATE_ORDER=https://xxx.execute-api.us-east-1.amazonaws.com/dev/orders
   ```

3. **API Gateway handles CORS automatically** with `cors: true` in serverless.yml

---

**Last Updated:** January 2025  
**Version:** 2.0 (Function URL CORS Fix)
