# User DynamoDB Integration - Complete Guide

## 🎯 Problem

**Issue**: Users are NOT being added to DynamoDB `livekart-users` table after signup, even though products ARE being added to `livekart-products` table.

**Why?**

- ✅ **Products work** because you explicitly call `createProduct` Lambda function via API
- ❌ **Users don't work** because Cognito only creates user accounts in its User Pool (not DynamoDB)
- No Lambda function or trigger exists to add users to DynamoDB automatically

---

## ✅ Solution: Cognito Post-Confirmation Trigger

We'll use a **Cognito Lambda Trigger** that automatically runs AFTER a user confirms their email. This trigger will add the user to DynamoDB.

### How It Works:

```
1. User Signs Up → Cognito creates account
2. User receives verification email
3. User enters confirmation code
4. ✅ Email verified successfully
5. 🔥 Cognito AUTOMATICALLY triggers Lambda function
6. Lambda adds user to DynamoDB livekart-users table
7. Done! User exists in both Cognito AND DynamoDB
```

---

## 📂 Files Created

### 1. Lambda Function

**File**: `backend/lambda/users/postConfirmation.js`

**Purpose**: Automatically add user to DynamoDB after email confirmation

**What it does**:

- Receives Cognito user data (username, email, role, etc.)
- Creates complete user record with:
  - Basic info (user_id, email, name, role)
  - Shopping fields (wishlist, cart)
  - Vendor-specific fields (if role is vendor)
  - Timestamps and metadata
- Saves to DynamoDB `livekart-users` table
- Handles errors gracefully (doesn't break signup if DynamoDB fails)

### 2. Setup Script

**File**: `scripts/setup-cognito-post-confirmation.ps1`

**Purpose**: Automated + manual setup guide

**What it does**:

- Creates `livekart-users` DynamoDB table (if needed)
- Packages Lambda function into ZIP file
- Provides manual steps for AWS Console configuration
- Opens AWS Console pages for easy access

---

## 🚀 Setup Instructions

### Option A: Automated Setup (Recommended)

Run the PowerShell script:

```powershell
cd 'd:\Bhumik\All Projects\College projects\livekart\Live_Kart'
.\scripts\setup-cognito-post-confirmation.ps1
```

The script will:

1. ✅ Create DynamoDB table (automated)
2. ✅ Package Lambda function (automated)
3. ⚠️ Open AWS Console for manual steps

---

### Option B: Manual Setup (Step-by-Step)

#### Step 1: Create DynamoDB Table

1. Go to: [DynamoDB Console](https://console.aws.amazon.com/dynamodbv2/home?region=us-east-1#create-table)
2. **Table name**: `livekart-users`
3. **Partition key**: `user_id` (String)
4. **Global Secondary Index**:
   - Index name: `email-index`
   - Partition key: `email` (String)
5. **Billing mode**: On-demand
6. Click **Create table**

---

#### Step 2: Create IAM Role for Lambda

1. Go to: [IAM Console → Roles](https://console.aws.amazon.com/iam/home#/roles)
2. Click **Create role**
3. **Trusted entity**: AWS service → Lambda
4. **Permissions**:

   - Attach `AWSLambdaBasicExecutionRole` (AWS managed policy)
   - Create inline policy for DynamoDB:

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": ["dynamodb:PutItem", "dynamodb:GetItem"],
         "Resource": "arn:aws:dynamodb:us-east-1:*:table/livekart-users"
       }
     ]
   }
   ```

5. **Role name**: `livekart-cognito-trigger-role`
6. Click **Create role**

---

#### Step 3: Create Lambda Function

1. Go to: [Lambda Console](https://console.aws.amazon.com/lambda/home?region=us-east-1#/create/function)
2. Click **Create function**
3. **Function name**: `livekart-post-confirmation-trigger`
4. **Runtime**: Node.js 18.x
5. **Permissions**: Use existing role → `livekart-cognito-trigger-role`
6. Click **Create function**

7. **Upload code**:

   - Package the Lambda code:

   ```powershell
   cd backend\lambda\users
   # Install dependencies (if needed)
   npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb

   # Create ZIP file
   Compress-Archive -Path postConfirmation.js, node_modules -DestinationPath post-confirmation.zip -Force
   ```

   - In Lambda Console → Code → Upload from → .zip file
   - Upload `post-confirmation.zip`

8. **Environment variables**:

   - Click **Configuration** → **Environment variables**
   - Add:
     - `USERS_TABLE` = `livekart-users`
     - `AWS_REGION` = `us-east-1`

9. **Handler**: Should be `postConfirmation.handler`

---

#### Step 4: Grant Cognito Permission

1. In Lambda Console → **Configuration** → **Permissions**
2. Scroll to **Resource-based policy**
3. Click **Add permissions**
4. **Policy statement**:
   - **Statement ID**: `AllowCognitoInvoke`
   - **Principal**: `cognito-idp.amazonaws.com`
   - **Source ARN**: `arn:aws:cognito-idp:us-east-1:*:userpool/us-east-1_pMr6t5GFA`
   - **Action**: `lambda:InvokeFunction`
5. Click **Save**

---

#### Step 5: Configure Cognito Trigger (MOST IMPORTANT!)

1. Go to: [Cognito User Pool Triggers](https://console.aws.amazon.com/cognito/v2/idp/user-pools/us-east-1_pMr6t5GFA/triggers?region=us-east-1)
2. Scroll to **Post confirmation trigger**
3. Click **Add Lambda trigger**
4. Select: `livekart-post-confirmation-trigger`
5. Click **Save changes**

✅ **Setup complete!**

---

## 🧪 Testing

### Test 1: Create New User

1. Go to your app: http://localhost:5174/login
2. Click **Sign Up**
3. Fill in details:
   - Email: `testuser@example.com`
   - Password: `Test@123`
   - Name: `Test User`
   - Role: `Customer`
4. Click **Create Account**
5. Check email for verification code
6. Enter verification code
7. ✅ Email verified

### Test 2: Verify DynamoDB

1. Go to: [DynamoDB Console](https://console.aws.amazon.com/dynamodbv2/home?region=us-east-1#item-explorer)
2. Select table: `livekart-users`
3. Click **Scan**
4. ✅ You should see the new user!

**Expected record**:

```json
{
  "user_id": "abc123-uuid-from-cognito",
  "username": "testuser",
  "email": "testuser@example.com",
  "name": "Test User",
  "role": "customer",
  "createdAt": "2025-11-01T...",
  "status": "active",
  "emailVerified": true,
  "wishlist": [],
  "cart": [],
  "totalOrders": 0,
  "totalSpent": 0
}
```

### Test 3: Check Lambda Logs

1. Go to: [CloudWatch Logs](https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups)
2. Find log group: `/aws/lambda/livekart-post-confirmation-trigger`
3. Click latest log stream
4. ✅ Look for: "User added to DynamoDB"

---

## 📊 DynamoDB Schema

### Users Table Structure

```typescript
{
  user_id: string;              // Primary Key (Cognito sub UUID)
  username: string;             // Cognito username
  email: string;                // User email (GSI)
  name: string;                 // Full name
  role: "customer" | "vendor" | "admin";

  // Status
  status: "active" | "suspended";
  emailVerified: boolean;
  createdAt: string;            // ISO timestamp
  updatedAt: string;            // ISO timestamp
  lastLoginAt: string | null;

  // Contact
  phoneNumber: string | null;
  address: object | null;
  profileImage: string | null;

  // Shopping (for customers)
  wishlist: string[];           // Array of product IDs
  cart: object[];               // Array of cart items
  totalOrders: number;
  totalSpent: number;

  // Vendor-specific (only if role === "vendor")
  storeName?: string | null;
  storeDescription?: string | null;
  totalProducts?: number;
  totalRevenue?: number;
  rating?: number;
  totalReviews?: number;
}
```

---

## 🔧 Troubleshooting

### Issue: User not added to DynamoDB

**Check 1: Cognito Trigger configured?**

- Go to Cognito → Triggers → Post confirmation
- Should show: `livekart-post-confirmation-trigger`

**Check 2: Lambda has permissions?**

- Lambda → Configuration → Permissions
- Check execution role has DynamoDB PutItem permission
- Check resource-based policy allows Cognito invocation

**Check 3: Lambda logs**

- CloudWatch → Log Groups → Find lambda logs
- Look for errors or "User added to DynamoDB" success message

**Check 4: DynamoDB table exists?**

- DynamoDB → Tables
- Should have `livekart-users` table

---

### Issue: Lambda permission error

**Error**: "Cannot invoke Lambda from Cognito"

**Fix**: Add resource-based policy:

```bash
aws lambda add-permission \
  --function-name livekart-post-confirmation-trigger \
  --statement-id AllowCognitoInvoke \
  --action lambda:InvokeFunction \
  --principal cognito-idp.amazonaws.com \
  --source-arn arn:aws:cognito-idp:us-east-1:*:userpool/us-east-1_pMr6t5GFA \
  --region us-east-1
```

---

### Issue: DynamoDB table not found

**Error**: "Cannot do operations on a non-existent table"

**Fix**: Create the table manually (see Step 1 above) or run:

```bash
aws dynamodb create-table \
  --table-name livekart-users \
  --attribute-definitions \
    AttributeName=user_id,AttributeType=S \
    AttributeName=email,AttributeType=S \
  --key-schema AttributeName=user_id,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=email-index,KeySchema=[{AttributeName=email,KeyType=HASH}],Projection={ProjectionType=ALL} \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

---

## 📝 Important Notes

### Why Post-Confirmation Trigger?

We use **Post-Confirmation** (not Post-Signup) because:

- ✅ User has verified their email
- ✅ We know the account is real (not spam)
- ✅ `emailVerified` is guaranteed to be `true`
- ✅ User won't be added twice (confirmation happens once)

### Role Assignment

The trigger reads role from:

1. **Priority 1**: `custom:role` attribute (if configured in Cognito)
2. **Priority 2**: Defaults to `"customer"`

If you want to support `custom:role`:

- Go to Cognito → User Pool → Sign-up experience → Custom attributes
- Add: `custom:role` (String, mutable)

### Error Handling

The Lambda function:

- ✅ Logs all errors to CloudWatch
- ✅ Returns event object even if DynamoDB fails
- ✅ Doesn't break user signup (user still gets created in Cognito)
- ✅ Uses conditional check to prevent duplicates

---

## ✅ Checklist

After setup, verify:

- [ ] DynamoDB `livekart-users` table exists
- [ ] IAM role `livekart-cognito-trigger-role` created
- [ ] Lambda function `livekart-post-confirmation-trigger` deployed
- [ ] Lambda has environment variables set
- [ ] Lambda has DynamoDB permissions
- [ ] Lambda has resource-based policy for Cognito
- [ ] Cognito User Pool has Post-Confirmation trigger configured
- [ ] Test signup creates user in DynamoDB
- [ ] CloudWatch Logs show successful execution

---

## 🎓 For Future Reference

### Adding More User Fields

Edit `backend/lambda/users/postConfirmation.js`:

```javascript
const userRecord = {
  // ... existing fields ...

  // Add new fields here:
  subscriptionTier: "free",
  preferences: {
    newsletter: true,
    notifications: true,
  },
  socialLinks: {
    facebook: null,
    instagram: null,
  },
};
```

### Querying Users

**Get user by ID**:

```javascript
const params = {
  TableName: "livekart-users",
  Key: { user_id: "some-uuid" },
};
await docClient.send(new GetCommand(params));
```

**Get user by email**:

```javascript
const params = {
  TableName: "livekart-users",
  IndexName: "email-index",
  KeyConditionExpression: "email = :email",
  ExpressionAttributeValues: {
    ":email": "user@example.com",
  },
};
await docClient.send(new QueryCommand(params));
```

---

**Last Updated**: November 1, 2025  
**Status**: ✅ Ready for implementation
