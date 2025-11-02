# Fresh Start: Create Orders Lambda Functions from Scratch

## Step 1: Delete Old Functions (AWS Console)

1. Go to AWS Lambda Console: https://console.aws.amazon.com/lambda
2. Find and select `livekart-createOrder`
3. Click **Actions** → **Delete**
4. Confirm deletion
5. Repeat for `livekart-getOrders`

---

## Step 2: Create New createOrder Function

### A. Create Function

1. Click **Create function**
2. Choose **Author from scratch**
3. Function settings:
   - **Function name**: `livekart-createOrder-v2`
   - **Runtime**: Node.js 20.x (or 18.x)
   - **Architecture**: x86_64
4. **Expand "Change default execution role"**
5. Select: **"Use an existing role"**
6. Choose: **`LabRole`** from the dropdown
7. Click **Create function**

### B. Configure Function URL

1. Go to **Configuration** tab → **Function URL**
2. Click **Create function URL**
3. Settings:
   - **Auth type**: NONE
   - **Configure cross-origin resource sharing (CORS)**: ✅ Checked
   - **Allow origin**: `*`
   - **Allow methods**: `*`
   - **Allow headers**: `*`
   - **Max age**: `86400`
4. Click **Save**
5. **Copy the Function URL** (you'll need this later)

### C. Add Code

1. Go to **Code** tab
2. Delete all existing code
3. Copy the entire content from `createOrder-standalone.js` below
4. Paste into the code editor
5. Click **Deploy**

### D. Configure Settings

1. Go to **Configuration** tab → **General configuration**
2. Click **Edit**
3. Set:
   - **Memory**: 256 MB
   - **Timeout**: 30 seconds
4. Click **Save**

### E. Add Environment Variables

1. Go to **Configuration** tab → **Environment variables**
2. Click **Edit** → **Add environment variable**
3. Add:
   - **Key**: `ORDERS_TABLE`
   - **Value**: `livekart-orders`
4. Click **Save**

### F. Verify IAM Role (No Action Needed)

✅ Since you're using **LabRole**, it already has all necessary permissions:

- DynamoDB access
- CloudWatch Logs
- Lambda execution

**Skip this step - no configuration needed!**

---

## Step 3: Create New getOrders Function

### Repeat Step 2 with these changes:

- **Function name**: `livekart-getOrders-v2`
- **Runtime**: Node.js 20.x
- **Execution role**: Use existing role → **`LabRole`**
- Use code from `getOrders-standalone.js`
- Set environment variable: `ORDERS_TABLE = livekart-orders`

---

## Step 4: Test Functions

### Test createOrder:

1. Go to **Test** tab in Lambda console
2. Create new test event:
   ```json
   {
     "requestContext": {
       "http": {
         "method": "POST"
       }
     },
     "body": "{\"userId\":\"test-user-123\",\"userEmail\":\"test@example.com\",\"items\":[{\"productId\":\"prod-1\",\"title\":\"Test Product\",\"price\":29.99,\"quantity\":2}],\"shippingAddress\":{\"street\":\"123 Main St\",\"city\":\"New York\",\"state\":\"NY\",\"zipCode\":\"10001\"},\"paymentMethod\":\"credit_card\",\"totalAmount\":59.98}"
   }
   ```
3. Click **Test**
4. Check response - should return `statusCode: 201` with order details

### Test getOrders:

1. Create test event:
   ```json
   {
     "requestContext": {
       "http": {
         "method": "GET"
       }
     },
     "queryStringParameters": {
       "userId": "test-user-123"
     }
   }
   ```
2. Click **Test**
3. Should return `statusCode: 200` with orders array

---

## Step 5: Update Frontend

Update your `.env` file with the new Function URLs:

```properties
VITE_LAMBDA_GET_ORDERS=https://NEW_GET_ORDERS_URL.lambda-url.us-east-1.on.aws/
VITE_LAMBDA_CREATE_ORDER=https://NEW_CREATE_ORDER_URL.lambda-url.us-east-1.on.aws/
```

Then restart your frontend dev server:

```powershell
cd frontend
npm run dev
```

---

## Step 6: Verify DynamoDB Table

Make sure `livekart-orders` table exists:

1. Go to DynamoDB Console
2. Check if table `livekart-orders` exists
3. Verify Primary Key is: `orderId` (String)

If it doesn't exist, create it:

```powershell
aws dynamodb create-table `
  --table-name livekart-orders `
  --attribute-definitions AttributeName=orderId,AttributeType=S `
  --key-schema AttributeName=orderId,KeyType=HASH `
  --billing-mode PAY_PER_REQUEST `
  --region us-east-1
```

---

## Troubleshooting Checklist

- [ ] Both Lambda functions deployed successfully
- [ ] Both functions use **LabRole** as execution role
- [ ] Function URLs created with CORS enabled
- [ ] Environment variable `ORDERS_TABLE` set to `livekart-orders`
- [ ] DynamoDB table `livekart-orders` exists
- [ ] Frontend `.env` updated with new URLs
- [ ] Frontend dev server restarted
- [ ] Test events run successfully in Lambda console

---

## Quick Test from Browser Console

Once frontend is running, open browser console and test:

```javascript
// Test createOrder
fetch("YOUR_CREATE_ORDER_URL", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    userId: "test-123",
    userEmail: "test@example.com",
    items: [
      {
        productId: "prod-1",
        title: "Test",
        price: 10,
        quantity: 1,
      },
    ],
    shippingAddress: {
      street: "123 Main",
      city: "NYC",
      state: "NY",
      zipCode: "10001",
    },
    totalAmount: 10,
  }),
})
  .then((r) => r.json())
  .then(console.log);

// Test getOrders
fetch("YOUR_GET_ORDERS_URL?userId=test-123")
  .then((r) => r.json())
  .then(console.log);
```

---

## Next Steps After Success

1. ✅ Create orders from your app
2. ✅ View orders in your app
3. 🔄 Add proper authentication with Cognito JWT
4. 🔄 Add order status updates
5. 🔄 Add email notifications
