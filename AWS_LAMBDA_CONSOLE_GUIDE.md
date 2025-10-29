# 🎯 Complete AWS Lambda Setup Guide - Step by Step

## 📋 What You Already Have

✅ **DynamoDB Tables** (4 tables):

- Products
- Orders
- Users
- Sessions

✅ **S3 Bucket** (for product images)

⚠️ **AWS Account Type:** AWS Academy/Educate/Learner Lab (restricted permissions)

## 📋 What We're Building Now

You'll create **8 Lambda functions** that I've already coded for you. Each function will connect to your existing DynamoDB tables and S3 bucket.

**Special Note for AWS Academy/Educate:** Your account can't create new IAM roles, but you can use existing ones! I'll show you exactly how.

**Total Time:** 1-2 hours for all 8 functions

---

## 🚀 Part 1: Create Your First Lambda Function (getProducts)

Let's start with the most important one - getting products from your database.

### Step 1: Go to Lambda Console

1. Open AWS Console
2. Search for "Lambda" in the search bar
3. Click **AWS Lambda**
4. Make sure you're in **us-east-1** region (top right corner)

### Step 2: Create Function

1. Click the **orange "Create function"** button
2. Select **"Author from scratch"** (should be selected by default)

### Step 3: Basic Information

Fill in these fields:

```
Function name: getProducts
Runtime: Node.js 18.x (or Node.js 20.x if available)
Architecture: x86_64 (default)
```

### Step 4: Permissions

⚠️ **IMPORTANT: Choose based on your AWS account type!**

#### 🎓 If you're using AWS Academy/Educate/Learner Lab:

Your account might not allow creating new IAM roles. Do this instead:

1. Click **"Change default execution role"** to expand
2. Select **"Use an existing role"**
3. From the dropdown, look for an existing role like:
   - `LabRole`
   - `lambda-basic-execution`
   - `AWSLambdaBasicExecutionRole`
   - Any role starting with `lambda` or `Lab`
4. Select it (if you see multiple, choose `LabRole` or any `lambda-` role)

**Note:** We'll add DynamoDB and S3 permissions to this role in the next steps.

#### 💳 If you have a regular AWS account (personal/company):

1. Keep the default: **"Create a new role with basic Lambda permissions"**
2. Role name will be auto-generated like `getProducts-role-abc123`

**Don't worry!** We'll add DynamoDB and S3 permissions in the next steps.

### Step 5: Advanced Settings (Optional)

You can skip this for now. Click **"Create function"** button at the bottom.

---

## ✅ Part 2: Add the Code

### Step 1: Wait for Function Creation

You'll see a success message and be taken to the function page.

### Step 2: Delete Default Code

1. Scroll down to **"Code source"** section
2. You'll see a file `index.mjs` in the left panel
3. Click on `index.mjs`
4. **Select all the code** (Ctrl+A)
5. **Delete it**

### Step 3: Paste My Code

1. Open **[LAMBDA_COPYPASTE.md](./LAMBDA_COPYPASTE.md)** in this project
2. Find **"1️⃣ getProducts Function"** section
3. Copy the **entire code block** (everything inside the triple backticks)
4. Paste it into the Lambda editor

### Step 4: Deploy

1. Click the **orange "Deploy"** button above the code editor
2. Wait for "Successfully updated the function getProducts" message

---

## ⚙️ Part 3: Configure Environment Variables

### Step 1: Go to Configuration Tab

1. Click the **"Configuration"** tab (next to Code tab)
2. Click **"Environment variables"** in the left menu

### Step 2: Add Variables

1. Click **"Edit"** button
2. Click **"Add environment variable"** button
3. Add these **one by one**:

```
Key: AWS_REGION
Value: us-east-1

Key: PRODUCTS_TABLE
Value: Products

Key: S3_BUCKET
Value: your-actual-bucket-name
```

**⚠️ Important:** Replace `your-actual-bucket-name` with your real S3 bucket name from your setup!

4. Click **"Save"** button

---

## 🔐 Part 4: Add DynamoDB and S3 Permissions

**This is IMPORTANT!** Your Lambda needs permission to access your DynamoDB tables and S3 bucket.

### Step 1: Go to Permissions

1. Stay in **"Configuration"** tab
2. Click **"Permissions"** in the left menu
3. Under **"Execution role"**, you'll see the role name:
   - AWS Academy: `LabRole` or similar
   - Regular AWS: `getProducts-role-abc123` or similar
4. Click the role name link (opens in new tab)

### Step 2: Check If You Can Edit

You're now in the IAM console.

**🎓 AWS Academy/Educate users:** You might see a message saying "You don't have permission to edit this role" or the "Add permissions" button is missing/grayed out.

**If you CAN'T edit (button is grayed/missing):**

- ⚠️ **Your AWS Academy account has restricted IAM permissions**
- **Skip to Part 4.5 below** for the workaround
- Don't worry, the functions will still work for testing!

**If you CAN edit (button is clickable):**

- Continue with Step 3 below ✅

### Step 3: Add DynamoDB Policy (If You Can Edit)

1. Click **"Add permissions"** dropdown button
2. Select **"Attach policies"**
3. In the search box, type: `DynamoDB`
4. Find and check ✅ **"AmazonDynamoDBFullAccess"**
5. Click **"Add permissions"** button at the bottom

You should see a green success message!

### Step 4: Add S3 Policy (If You Can Edit)

1. Click **"Add permissions"** dropdown again
2. Select **"Attach policies"**
3. In search box, type: `S3`
4. Find and check ✅ **"AmazonS3FullAccess"**
5. Click **"Add permissions"** button

**✅ Done!** Your Lambda now has permission to read/write DynamoDB and S3.

---

## 🎓 Part 4.5: AWS Academy Workaround (If You Can't Edit IAM)

**If you couldn't add permissions in Part 4, don't worry!** AWS Academy's `LabRole` usually already has most permissions.

### Option A: Test If It Works Already

1. **Skip the IAM step** and continue to Part 5
2. When you test your function (Part 6), it might just work!
3. AWS Academy's `LabRole` often has DynamoDB and S3 access already

### Option B: Ask Your Instructor

If testing fails with "AccessDenied" errors:

1. Take a screenshot of the error
2. Ask your instructor to add these policies to `LabRole`:
   - `AmazonDynamoDBFullAccess`
   - `AmazonS3FullAccess`
3. Or ask if there's a different role you should use

### Option C: Use Inline Policies (Advanced)

Some Academy accounts allow inline policies:

1. In the IAM role page, look for **"Add inline policy"** button
2. If it's clickable, click it
3. Switch to **JSON** tab
4. Paste this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Scan",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:*:table/*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::*/*"
    }
  ]
}
```

5. Name it: `LambdaDynamoDBandS3Access`
6. Click **"Create policy"**

**Note:** For production, you'd use more restricted policies, but for learning this is perfect.

---

## 🌐 Part 5: Enable Function URL (So Frontend Can Call It)

### Step 1: Create Function URL

1. Go back to your Lambda function page
2. Click **"Configuration"** tab
3. Click **"Function URL"** in left menu
4. Click **"Create function URL"** button

### Step 2: Configure Function URL

```
Auth type: NONE
```

**⚠️ Important:** We're using NONE for now to test easily. Later you can add Cognito authentication.

### Step 3: Configure CORS

Under **"Configure cross-origin resource sharing (CORS)"**, check ✅ the box

Set these values:

```
Allow origin: *
Allow methods: GET, POST, PUT, DELETE, OPTIONS
Allow headers: *
Expose headers: (leave empty)
Max age: 86400
```

### Step 4: Save

Click **"Save"** button

### Step 5: Copy Your Function URL

You'll see a **Function URL** appear like:

```
https://abc123def456.lambda-url.us-east-1.on.aws/
```

**📝 SAVE THIS URL!** You'll need it for your frontend.

---

## 🧪 Part 6: Test Your Function

### Step 1: Create Test Event

1. Click **"Test"** tab
2. Click **"Create new event"** (if first time)

### Step 2: Configure Test

```
Event name: testGetProducts
Event JSON: (paste this)
```

```json
{
  "queryStringParameters": {
    "limit": "10"
  },
  "headers": {}
}
```

### Step 3: Save and Test

1. Click **"Save"** button
2. Click **"Test"** button
3. Wait for execution

### Step 4: Check Results

You should see:

**✅ SUCCESS:**

```json
{
  "statusCode": 200,
  "headers": {...},
  "body": "{\"success\":true,\"count\":0,\"products\":[]}"
}
```

The array is empty because you haven't added products yet. That's OK!

**❌ If you see error:**

- Check environment variables are correct
- Check IAM permissions were added
- Check DynamoDB table name is exactly "Products"

---

## 🎯 Part 7: Test Via Browser

1. Copy your Function URL from Step 5
2. Open in browser: `https://your-function-url.lambda-url.us-east-1.on.aws/`
3. You should see JSON response:

```json
{ "success": true, "count": 0, "products": [] }
```

**🎉 SUCCESS! Your first Lambda function is working!**

---

## 📦 Part 8: Create Remaining Functions

Now repeat the same process for the other 7 functions:

### Function #2: getProduct

```
Function name: getProduct
Code: Copy from LAMBDA_COPYPASTE.md → "2️⃣ getProduct Function"
Environment variables:
  - AWS_REGION = us-east-1
  - PRODUCTS_TABLE = Products
  - S3_BUCKET = your-bucket-name
IAM: Same (DynamoDB + S3)
Function URL: Yes, NONE auth, CORS enabled
```

**Test event:**

```json
{
  "pathParameters": {
    "id": "test-123"
  },
  "headers": {}
}
```

---

### Function #3: createProduct

```
Function name: createProduct
Code: Copy from LAMBDA_COPYPASTE.md → "3️⃣ createProduct Function"
Environment variables:
  - AWS_REGION = us-east-1
  - PRODUCTS_TABLE = Products
IAM: DynamoDB full access
Function URL: Yes, NONE auth, CORS enabled
```

**Test event:**

```json
{
  "body": "{\"title\":\"Wireless Mouse\",\"description\":\"Ergonomic mouse\",\"price\":29.99,\"category\":\"Electronics\",\"stock\":50}",
  "headers": {}
}
```

---

### Function #4: updateProduct

```
Function name: updateProduct
Runtime: Node.js 18.x
Permissions: Create new role (auto)
Code: Copy from backend/lambda/products/updateProduct.js

Environment variables:
  - AWS_REGION = us-east-1
  - PRODUCTS_TABLE = Products

IAM Permissions to Add:
  - AmazonDynamoDBFullAccess

Function URL: Yes, Auth=NONE, CORS enabled
```

---

### Function #5: deleteProduct

```
Function name: deleteProduct
Runtime: Node.js 18.x
Permissions: Create new role (auto)
Code: Copy from backend/lambda/products/deleteProduct.js

Environment variables:
  - AWS_REGION = us-east-1
  - PRODUCTS_TABLE = Products
  - S3_BUCKET = your-actual-bucket-name

IAM Permissions to Add:
  - AmazonDynamoDBFullAccess
  - AmazonS3FullAccess

Function URL: Yes, Auth=NONE, CORS enabled
```

---

### Function #6: getUploadUrl

```
Function name: getUploadUrl
Runtime: Node.js 18.x
Permissions: Create new role (auto)
Code: Copy from LAMBDA_COPYPASTE.md → "4️⃣ getUploadUrl Function"

Environment variables:
  - AWS_REGION = us-east-1
  - S3_BUCKET = your-actual-bucket-name

IAM Permissions to Add:
  - AmazonS3FullAccess

Function URL: Yes, Auth=NONE, CORS enabled
```

**Test event:**

```json
{
  "body": "{\"filename\":\"product.jpg\",\"contentType\":\"image/jpeg\"}",
  "headers": {}
}
```

---

### Function #7: createOrder

```
Function name: createOrder
Runtime: Node.js 18.x
Permissions: Create new role (auto)
Code: Copy from backend/lambda/orders/createOrder.js

Environment variables:
  - AWS_REGION = us-east-1
  - PRODUCTS_TABLE = Products
  - ORDERS_TABLE = Orders

IAM Permissions to Add:
  - AmazonDynamoDBFullAccess

Function URL: Yes, Auth=NONE, CORS enabled
```

---

### Function #8: getOrders

```
Function name: getOrders
Runtime: Node.js 18.x
Permissions: Create new role (auto)
Code: Copy from backend/lambda/orders/getOrders.js

Environment variables:
  - AWS_REGION = us-east-1
  - ORDERS_TABLE = Orders

IAM Permissions to Add:
  - AmazonDynamoDBFullAccess

Function URL: Yes, Auth=NONE, CORS enabled
```

---

## 📝 Part 9: Save All Function URLs

Create a file `lambda-urls.txt` and save all your URLs:

```
getProducts: https://abc123.lambda-url.us-east-1.on.aws/
getProduct: https://def456.lambda-url.us-east-1.on.aws/
createProduct: https://ghi789.lambda-url.us-east-1.on.aws/
updateProduct: https://jkl012.lambda-url.us-east-1.on.aws/
deleteProduct: https://mno345.lambda-url.us-east-1.on.aws/
getUploadUrl: https://pqr678.lambda-url.us-east-1.on.aws/
createOrder: https://stu901.lambda-url.us-east-1.on.aws/
getOrders: https://vwx234.lambda-url.us-east-1.on.aws/
```

---

## 🎨 Part 10: Configure Frontend

Update your `frontend/.env`:

```env
# Cognito (from your setup)
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_USER_POOL_CLIENT_ID=your-client-id

# Lambda Function URLs (paste your actual URLs)
VITE_API_GET_PRODUCTS=https://abc123.lambda-url.us-east-1.on.aws/
VITE_API_GET_PRODUCT=https://def456.lambda-url.us-east-1.on.aws/
VITE_API_CREATE_PRODUCT=https://ghi789.lambda-url.us-east-1.on.aws/
VITE_API_UPDATE_PRODUCT=https://jkl012.lambda-url.us-east-1.on.aws/
VITE_API_DELETE_PRODUCT=https://mno345.lambda-url.us-east-1.on.aws/
VITE_API_GET_UPLOAD_URL=https://pqr678.lambda-url.us-east-1.on.aws/
VITE_API_CREATE_ORDER=https://stu901.lambda-url.us-east-1.on.aws/
VITE_API_GET_ORDERS=https://vwx234.lambda-url.us-east-1.on.aws/

# S3 Bucket
VITE_S3_BUCKET=your-bucket-name
```

---

## ✅ Checklist: Have You Done All These?

For EACH of the 8 functions:

- [ ] Created function with correct name
- [ ] Selected Node.js 18.x runtime
- [ ] Attached LambdaEcommerceRole (or created new role)
- [ ] Pasted the code from LAMBDA_COPYPASTE.md
- [ ] Clicked Deploy
- [ ] Added environment variables
- [ ] Added IAM permissions (DynamoDB + S3)
- [ ] Created Function URL
- [ ] Enabled CORS on Function URL
- [ ] Tested with test event
- [ ] Tested in browser
- [ ] Saved Function URL

---

## 🧪 Part 11: Test Complete Flow

### Test 1: Create a Product

```bash
# Use PowerShell or browser REST client
curl -X POST https://YOUR_CREATE_PRODUCT_URL/ `
  -H "Content-Type: application/json" `
  -d '{"title":"Test Product","price":29.99,"category":"Electronics","description":"A test product","stock":100}'
```

**Expected response:**

```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "productId": "...",
    "title": "Test Product",
    "price": 29.99,
    ...
  }
}
```

### Test 2: Get All Products

Open in browser:

```
https://YOUR_GET_PRODUCTS_URL/
```

You should see your test product!

### Test 3: Get Upload URL

```bash
curl -X POST https://YOUR_GET_UPLOAD_URL/ `
  -H "Content-Type: application/json" `
  -d '{"filename":"product.jpg","contentType":"image/jpeg"}'
```

You'll get a pre-signed S3 URL to upload an image!

---

## 🎉 You're Done!

You now have:

- ✅ 8 working Lambda functions
- ✅ Connected to your DynamoDB tables
- ✅ Connected to your S3 bucket
- ✅ Function URLs ready for frontend
- ✅ CORS enabled
- ✅ Tested and working

---

## 🆘 Common Issues & Solutions

### Issue: "Cannot find module @aws-sdk/client-dynamodb"

**Solution:** The AWS SDK v3 is built into Node.js 18+ Lambda runtime. If you still get this error:

1. Make sure runtime is **Node.js 18.x** (not older versions)
2. The code I provided uses built-in AWS SDK

### Issue: "AccessDeniedException" or "User is not authorized"

**Solution:** Add IAM permissions:

1. Go to Configuration → Permissions
2. Click on the role name
3. Add these policies:
   - AmazonDynamoDBFullAccess
   - AmazonS3FullAccess

### Issue: "CORS error" in frontend

**Solution:** Enable CORS on Function URL:

1. Configuration → Function URL
2. Edit the Function URL
3. Check "Configure CORS"
4. Set Allow origin: `*`
5. Set Allow methods: All methods
6. Save

### Issue: "ResourceNotFoundException: Requested resource not found"

**Solution:** Check DynamoDB table names:

1. Go to DynamoDB console
2. Verify table name is exactly `Products` (capital P)
3. Check environment variable matches exactly

### Issue: Function returns empty array

**Solution:** This is normal if you haven't added products yet!

- Test with `createProduct` first
- Then check `getProducts` again

---

## 📚 Next Steps

1. **Update frontend** to use your Lambda Function URLs
2. **Add some products** using createProduct
3. **Test image upload** with getUploadUrl
4. **Create orders** with createOrder
5. **Deploy frontend** and test end-to-end

---

## 💡 Pro Tips

### Tip 1: Use CloudWatch Logs for Debugging

1. Go to Lambda function
2. Click "Monitor" tab
3. Click "View CloudWatch logs"
4. See all console.log outputs and errors

### Tip 2: Increase Timeout for Slow Functions

1. Configuration → General configuration → Edit
2. Timeout: Change from 3 seconds to 30 seconds
3. Memory: 256 MB is usually enough

### Tip 3: Test Locally First

Before deploying to AWS, you can test the logic:

```javascript
// Add at bottom of your code for local testing
if (require.main === module) {
  exports
    .handler({
      queryStringParameters: { limit: "10" },
      headers: {},
    })
    .then(console.log);
}
```

---

**Need help with a specific function? Let me know which one and I'll guide you through it!** 🚀
