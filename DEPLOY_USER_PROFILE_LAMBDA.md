# 🚀 Deploy User Profile Lambda Functions

## ✅ What Your Friend Already Set Up

✅ **DynamoDB Table**: `livekart-users` (ACTIVE)  
✅ **Post-Confirmation Trigger**: Auto-creates user in DB when they sign up  
✅ **Table Structure**: Includes all necessary fields (name, phone, address, etc.)

## ❌ What's Missing (Need to Deploy)

You need to deploy **2 new Lambda functions** to enable profile management:

1. **getUser** - Fetch user profile from DynamoDB
2. **updateUser** - Update user profile in DynamoDB

---

## 📂 Files Already Created

I've created these Lambda functions for you:

```
backend/lambda/users/
├── postConfirmation.js   ✅ (Already deployed)
├── getUser.js            🆕 (Need to deploy)
└── updateUser.js         🆕 (Need to deploy)
```

---

## 🛠️ Deployment Steps

### Step 1: Create getUser Lambda Function

1. Go to **AWS Lambda Console**: https://console.aws.amazon.com/lambda
2. Click **Create function**
3. Configure:
   - **Function name**: `livekart-getUser`
   - **Runtime**: Node.js 20.x
   - **Architecture**: x86_64
   - **Execution role**: Use existing role → `livekart-lambda-execution-role`
4. Click **Create function**
5. **Upload code**:
   - Copy the contents of `backend/lambda/users/getUser.js`
   - Paste into the Lambda code editor
   - Click **Deploy**
6. **Environment variables**:
   - Key: `USERS_TABLE`, Value: `livekart-users`
   - Key: `AWS_REGION`, Value: `us-east-1`
7. **Create Function URL**:
   - Go to **Configuration** → **Function URL**
   - Click **Create function URL**
   - **Auth type**: NONE (we handle auth in code)
   - **CORS** → Configure:
     - Allow origins: `*`
     - Allow methods: `GET, POST, PUT, OPTIONS`
     - Allow headers: `Content-Type, Authorization`
   - Click **Save**
   - **Copy the Function URL** (you'll need this)

### Step 2: Create updateUser Lambda Function

1. Go to **AWS Lambda Console**
2. Click **Create function**
3. Configure:
   - **Function name**: `livekart-updateUser`
   - **Runtime**: Node.js 20.x
   - **Architecture**: x86_64
   - **Execution role**: Use existing role → `livekart-lambda-execution-role`
4. Click **Create function**
5. **Upload code**:
   - Copy the contents of `backend/lambda/users/updateUser.js`
   - Paste into the Lambda code editor
   - Click **Deploy**
6. **Environment variables**:
   - Key: `USERS_TABLE`, Value: `livekart-users`
   - Key: `AWS_REGION`, Value: `us-east-1`
7. **Create Function URL**:
   - Go to **Configuration** → **Function URL**
   - Click **Create function URL**
   - **Auth type**: NONE
   - **CORS** → Configure same as above
   - Click **Save**
   - **Copy the Function URL**

### Step 3: Verify IAM Permissions

The Lambda execution role should already have DynamoDB permissions from previous setup. Verify it has:

```json
{
  "Effect": "Allow",
  "Action": [
    "dynamodb:PutItem", // ✅ For postConfirmation (create user on signup)
    "dynamodb:GetItem", // ✅ For getUser + updateUser (read user data)
    "dynamodb:UpdateItem" // 🆕 IMPORTANT: For updateUser (modify user profile)
  ],
  "Resource": "arn:aws:dynamodb:us-east-1:*:table/livekart-users"
}
```

**⚠️ IMPORTANT**: You probably have `PutItem` and `GetItem` already, but make sure to **add `UpdateItem`** permission for the profile update feature to work!

#### How to Add UpdateItem Permission:

1. Go to **IAM Console**: https://console.aws.amazon.com/iam/home#/roles
2. Find role: `livekart-lambda-execution-role`
3. Click on the role
4. Under **Permissions** tab, find the policy for DynamoDB
5. Click **Edit policy**
6. Add `"dynamodb:UpdateItem"` to the Actions array
7. Click **Review policy** → **Save changes**

### Step 4: Update Frontend Environment Variables

Add the new Lambda Function URLs to `frontend/.env`:

```env
# Existing variables
VITE_LAMBDA_GET_PRODUCTS=https://...
VITE_LAMBDA_CREATE_PRODUCT=https://...
VITE_LAMBDA_CREATE_ORDER=https://...
VITE_LAMBDA_GET_ORDERS=https://...

# 🆕 NEW - Add these two
VITE_LAMBDA_GET_USER=https://your-get-user-function-url.lambda-url.us-east-1.on.aws/
VITE_LAMBDA_UPDATE_USER=https://your-update-user-function-url.lambda-url.us-east-1.on.aws/
```

---

## 🧪 Test the Functions

### Test getUser:

```bash
# Get the function URL from Lambda console
curl -X GET "https://your-function-url/livekart-getUser?userId=USER_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected response:

```json
{
  "success": true,
  "user": {
    "user_id": "xxx",
    "email": "user@example.com",
    "name": "John Doe",
    "phoneNumber": "+91 1234567890",
    "address": {...},
    "notificationPreferences": {...}
  }
}
```

### Test updateUser:

```bash
curl -X PUT "https://your-function-url/livekart-updateUser" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "phoneNumber": "+91 9876543210",
    "address": {
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    }
  }'
```

Expected response:

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {...}
}
```

---

## ✅ How It Works Now

### When user edits profile:

1. **Frontend** (ProfilePage.tsx):

   - User edits name, phone, address, etc.
   - Clicks "Save Changes"

2. **Save to localStorage** (immediate):

   - Saves data locally for instant access
   - Works even if AWS is down

3. **Save to DynamoDB** (via Lambda):

   - Calls `lambdaAPI.updateUserProfile()`
   - Sends data to `updateUser` Lambda function
   - Lambda updates `livekart-users` table in DynamoDB

4. **Load profile**:
   - First tries to load from DynamoDB (via `getUser` Lambda)
   - Falls back to localStorage if AWS unavailable
   - Always shows most recent data

### Benefits:

✅ **Persistent** - Data saved to DynamoDB, persists across devices  
✅ **Fast** - localStorage fallback ensures instant loading  
✅ **Resilient** - Works even if AWS temporarily unavailable  
✅ **Secure** - JWT token authentication required  
✅ **Multi-device** - User sees same profile on phone, laptop, etc.

---

## 📊 Current DynamoDB Schema

The `livekart-users` table already has these fields (set up by postConfirmation trigger):

```javascript
{
  user_id: "cognito-uuid",        // Primary Key
  username: "johndoe",
  email: "john@example.com",
  name: "John Doe",
  role: "customer",

  // Profile fields (updated by updateUser)
  phoneNumber: "+91 1234567890",  // ✅ Updated by profile page
  address: {                       // ✅ Updated by profile page
    street: "123 Main St",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001"
  },
  notificationPreferences: {       // ✅ Updated by profile page
    orderUpdates: true,
    promotions: false,
    wishlistAlerts: true
  },

  // Auto-managed fields
  createdAt: "2025-11-02T...",
  updatedAt: "2025-11-02T...",     // ✅ Auto-updated by updateUser
  status: "active",
  emailVerified: true,

  // Shopping data
  wishlist: [],
  cart: [],
  totalOrders: 0,
  totalSpent: 0
}
```

---

## 🎯 Summary

**Current Status**:

- ✅ DynamoDB users table: **Working**
- ✅ Post-confirmation trigger: **Working** (auto-creates users)
- ✅ Frontend code: **Ready** (with fallback to localStorage)
- ❌ getUser Lambda: **Need to deploy**
- ❌ updateUser Lambda: **Need to deploy**

**After deployment**:

- Users can edit their profile (name, phone, address, notifications)
- Changes save to DynamoDB and persist across sessions
- Profile loads from DynamoDB when user signs in
- localStorage provides instant fallback if AWS unavailable

---

## 📝 Quick Deployment Checklist

- [ ] Deploy `getUser` Lambda function
- [ ] Create Function URL for getUser
- [ ] Deploy `updateUser` Lambda function
- [ ] Create Function URL for updateUser
- [ ] Verify IAM permissions (DynamoDB GetItem, UpdateItem)
- [ ] Add Function URLs to frontend `.env` file
- [ ] Test with real user account
- [ ] Verify data saves to DynamoDB table

---

## 🔗 AWS Console Links

- **Lambda Functions**: https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions
- **DynamoDB Tables**: https://console.aws.amazon.com/dynamodbv2/home?region=us-east-1#tables
- **IAM Roles**: https://console.aws.amazon.com/iam/home#/roles
- **CloudWatch Logs**: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups

---

**Questions?** Check CloudWatch logs for debugging or test with curl commands above!
