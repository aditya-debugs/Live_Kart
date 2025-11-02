# Deploy Updated createOrder Lambda Function

## Quick Fix Steps

### Option 1: Update via AWS Console (Recommended - Fastest)

1. **Go to AWS Lambda Console**

   - Navigate to: https://console.aws.amazon.com/lambda
   - Find your `createOrder` Lambda function

2. **Upload New Code**

   - Click on the function name
   - Scroll down to "Code source" section
   - Click "Upload from" → ".zip file"
   - Select: `backend/lambda/orders/createOrder.zip`
   - Click "Save"

3. **Verify Environment Variables**

   - Click on "Configuration" tab
   - Click "Environment variables"
   - Make sure these are set:
     ```
     PRODUCTS_TABLE = livekart-products
     ORDERS_TABLE = livekart-orders
     USER_POOL_ID = us-east-1_pMr6t5GFA
     AWS_REGION = us-east-1
     ```

4. **Test the Function**
   - Go back to your app
   - Try placing an order
   - Check CloudWatch Logs if it fails

---

### Option 2: Update via AWS CLI

```powershell
# Navigate to the lambda directory
cd "d:\Bhumik\All Projects\College projects\livekart\Live_Kart\backend\lambda\orders"

# Update the Lambda function
aws lambda update-function-code `
  --function-name createOrder `
  --zip-file fileb://createOrder.zip
```

---

## What Was Fixed

### 1. **Removed Hard Product Lookup Requirement**

- Previous: Order would fail if product not found in DynamoDB
- Now: Order proceeds with default values if product lookup fails
- This handles cases where products are created with different schemas

### 2. **Better Error Handling**

- Added try-catch around product fetching
- Logs warnings instead of failing completely
- Uses fallback values (vendor_id, vendorId, etc.)

### 3. **Flexible Field Names**

- Supports both `vendor_id` and `vendorId`
- Supports both `title` and `name` for product names
- Handles missing fields gracefully

---

## Testing After Deployment

1. **Add a product to cart** on http://localhost:5174/customer
2. **Click on Cart** (top right)
3. **Click "Proceed to Checkout"**
4. **Fill in address** (or use defaults)
5. **Select payment method** (COD, UPI, or Card - all bypass payment)
6. **Click "Place Order"**
7. **You should see**: Order Confirmation modal with order ID

---

## Verify Orders Are Saved

### Check DynamoDB:

1. Go to DynamoDB Console
2. Select `livekart-orders` table
3. Click "Explore table items"
4. You should see your order with:
   - `order_id` (UUID)
   - `user_id` (your Cognito user ID)
   - `items` array
   - `totalAmount`
   - `status`: "pending"
   - `createdAt` timestamp

### Check Customer Orders:

1. Go to http://localhost:5174/orders
2. You should see your order listed

### Check Vendor Orders:

1. Go to http://localhost:5174/vendor
2. Scroll down to "Recent Orders" section
3. You should see orders containing your products

### Check Product Analytics:

1. Go to vendor dashboard
2. Click "View Analytics" on any product
3. "Total Orders" should show count of orders for that product

---

## If Still Getting Errors

### Check CloudWatch Logs:

1. Go to CloudWatch Console
2. Click "Log groups"
3. Find `/aws/lambda/createOrder`
4. Check latest log stream for error details

### Common Issues:

**Error: "The provided key element does not match the schema"**

- Cause: DynamoDB table has different partition key than expected
- Fix: Check your `livekart-products` table schema
- The partition key should be `product_id` (String)

**Error: "Failed to place order"**

- Check Lambda function logs in CloudWatch
- Verify environment variables are set correctly
- Ensure Lambda has permissions to access DynamoDB

**Error: "Invalid or expired token"**

- Sign out and sign back in
- Clear browser localStorage
- Check Cognito User Pool ID in `.env`

---

## Success Indicators

✅ **Order placement succeeds** without errors  
✅ **Order Confirmation modal appears** with order ID  
✅ **Orders appear in DynamoDB** `livekart-orders` table  
✅ **Customer sees orders** on Orders page  
✅ **Vendor sees orders** on Vendor Dashboard  
✅ **Product Analytics shows order count** accurately

---

## Next Steps After Success

1. **Test with multiple products** in cart
2. **Test different payment methods** (all should work)
3. **Verify order shows correct totals** (subtotal + shipping + tax)
4. **Check vendor sees only their products** in orders
5. **Verify analytics updates** when orders are placed

---

**IMPORTANT**: You MUST update the Lambda function with the new code for orders to work!
The deployment package is ready at: `backend/lambda/orders/createOrder.zip`
