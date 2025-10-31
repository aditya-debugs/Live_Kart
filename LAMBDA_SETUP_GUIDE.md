# 🚀 ULTRA-FAST AWS LAMBDA SETUP (15 MINUTES)

## Prerequisites

- ✅ AWS Account logged in
- ✅ Region set to us-east-1
- ✅ DynamoDB tables created (run create-dynamodb-tables.ps1)
- ✅ Cognito User Pool ID: us-east-1_pMr6t5GFA
- ✅ S3 Bucket created

---

## STEP 1: Create Lambda Functions in AWS Console

### Function 1: getProducts

1. Go to **AWS Lambda Console**
2. Click **"Create function"**
3. Settings:
   ```
   Function name: livekart-getProducts
   Runtime: Node.js 18.x
   Architecture: x86_64
   Permissions: Use an existing role → [SELECT YOUR EXISTING ROLE]
   ```
4. Click **"Create function"**
5. In **Code** tab:

   - Copy code from: `backend/lambda/MINIMAL_FUNCTIONS/getProducts.js`
   - Paste into Lambda editor
   - Click **"Deploy"**

6. **Configuration** → **Environment variables** → **Edit**:

   ```
   AWS_REGION = us-east-1
   PRODUCTS_TABLE = livekart-products
   ```

7. **Configuration** → **General configuration** → **Edit**:

   ```
   Timeout: 30 seconds
   Memory: 256 MB
   ```

8. **Configuration** → **Function URL** → **Create function URL**:
   ```
   Auth type: NONE
   ☑ Configure CORS
   Allow origin: *
   Allow methods: *
   Allow headers: *
   ```
9. **SAVE THE FUNCTION URL!**

---

### Function 2: createProduct

**Repeat steps 1-8 with these changes:**

```
Function name: livekart-createProduct
Code: backend/lambda/MINIMAL_FUNCTIONS/createProduct.js

Environment Variables:
  AWS_REGION = us-east-1
  PRODUCTS_TABLE = livekart-products
  USER_POOL_ID = us-east-1_pMr6t5GFA
```

**⚠️ IMPORTANT:** This function needs `aws-jwt-verify` package!

**Add Layer (for aws-jwt-verify):**

1. Go to **Code** tab
2. Scroll to **Layers** section
3. Click **"Add a layer"**
4. Select **"Specify an ARN"**
5. Enter: `arn:aws:lambda:us-east-1:094274105915:layer:AWSLambdaPowertoolsTypeScript:25`

   OR create custom layer (if above doesn't work):

   - Download: https://github.com/aws/aws-jwt-verify
   - Package as layer
   - Upload

**ALTERNATIVE (Simpler):**

- Remove JWT verification temporarily
- Add basic auth check later
- For demo: Accept any request

---

### Function 3: createOrder

```
Function name: livekart-createOrder
Code: backend/lambda/MINIMAL_FUNCTIONS/createOrder.js

Environment Variables:
  AWS_REGION = us-east-1
  PRODUCTS_TABLE = livekart-products
  ORDERS_TABLE = livekart-orders
  USER_POOL_ID = us-east-1_pMr6t5GFA
```

Same layer requirement as Function 2.

---

### Function 4: getOrders

```
Function name: livekart-getOrders
Code: backend/lambda/MINIMAL_FUNCTIONS/getOrders.js

Environment Variables:
  AWS_REGION = us-east-1
  ORDERS_TABLE = livekart-orders
  USER_POOL_ID = us-east-1_pMr6t5GFA
```

Same layer requirement as Function 2.

---

## STEP 2: Save All Function URLs

Create a file: `.env.lambda` in your project root:

```env
VITE_LAMBDA_GET_PRODUCTS=https://xxxxx.lambda-url.us-east-1.on.aws/
VITE_LAMBDA_CREATE_PRODUCT=https://yyyyy.lambda-url.us-east-1.on.aws/
VITE_LAMBDA_CREATE_ORDER=https://zzzzz.lambda-url.us-east-1.on.aws/
VITE_LAMBDA_GET_ORDERS=https://aaaaa.lambda-url.us-east-1.on.aws/
```

---

## STEP 3: Test Functions

### Test getProducts:

1. Go to **Test** tab
2. Create test event:
   ```json
   {
     "queryStringParameters": null
   }
   ```
3. Click **"Test"**
4. Expected: `{"success": true, "products": []}`

### Test createProduct:

```json
{
  "headers": {
    "authorization": "Bearer fake-token"
  },
  "body": "{\"name\":\"Test Product\",\"price\":29.99,\"category\":\"electronics\"}"
}
```

If JWT verification fails, that's OK for now. We'll fix in integration.

---

## STEP 4: Verify IAM Permissions

Your existing role should have:

- ✅ `AWSLambdaBasicExecutionRole` (CloudWatch logs)
- ✅ `AmazonDynamoDBFullAccess` (or specific table access)
- ✅ `AmazonCognitoReadOnly` (for JWT verification)

If missing, ask instructor or use inline policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:*:table/livekart-*"
    }
  ]
}
```

---

## ✅ COMPLETE!

All Lambda functions are now deployed and ready for frontend integration.

Next: Update frontend to call these Lambda URLs instead of hardcoded data.
