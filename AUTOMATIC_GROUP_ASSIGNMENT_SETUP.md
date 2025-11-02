# Automatic Cognito Group Assignment Setup

This guide explains how to automatically add new users to Cognito groups (Customers, Vendors, Admins) based on the role they select during sign-up.

## 🎯 What We're Implementing

When a user signs up and selects a role:
1. **Customer** → Automatically added to `Customers` group
2. **Vendor** → Automatically added to `Vendors` group  
3. **Admin** → Automatically added to `Admins` group

This happens automatically when they confirm their email!

---

## 📋 Prerequisites

- AWS CLI configured
- Cognito User Pool: `us-east-1_pMr6t5GFA`
- Lambda execution role with permissions

---

## 🚀 Setup Steps

### Step 1: Create Cognito Groups

Run the PowerShell script to create all three groups:

```powershell
cd "d:\Bhumik\All Projects\College projects\livekart\Live_Kart\scripts"
.\setup-cognito-groups.ps1
```

This creates:
- **Customers** group
- **Vendors** group (already exists)
- **Admins** group

---

### Step 2: Deploy Updated Lambda Function

The `postConfirmation.js` Lambda has been updated to automatically add users to groups.

#### 2.1: Install Dependencies

```powershell
cd "d:\Bhumik\All Projects\College projects\livekart\Live_Kart\backend\lambda\users"
npm install @aws-sdk/client-cognito-identity-provider
```

#### 2.2: Package the Lambda

```powershell
# Still in backend/lambda/users directory
Compress-Archive -Path postConfirmation.js,node_modules -DestinationPath post-confirmation-trigger.zip -Force
```

#### 2.3: Update Lambda Function

```powershell
aws lambda update-function-code `
  --function-name postConfirmationTrigger `
  --zip-file fileb://post-confirmation-trigger.zip `
  --region us-east-1
```

#### 2.4: Add Environment Variable (USER_POOL_ID)

```powershell
aws lambda update-function-configuration `
  --function-name postConfirmationTrigger `
  --environment "Variables={USER_POOL_ID=us-east-1_pMr6t5GFA,USERS_TABLE=livekart-users}" `
  --region us-east-1
```

---

### Step 3: Grant Lambda Permissions

The Lambda needs permission to add users to Cognito groups.

#### 3.1: Create IAM Policy

Save this as `cognito-group-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cognito-idp:AdminAddUserToGroup",
        "cognito-idp:GetGroup",
        "cognito-idp:ListGroups"
      ],
      "Resource": "arn:aws:cognito-idp:us-east-1:*:userpool/us-east-1_pMr6t5GFA"
    }
  ]
}
```

#### 3.2: Attach Policy to Lambda Role

First, get the Lambda's role name:

```powershell
aws lambda get-function-configuration --function-name postConfirmationTrigger --query "Role" --output text
```

This will return something like: `arn:aws:iam::123456789012:role/postConfirmationTrigger-role`

Then attach the policy:

```powershell
# Replace YOUR_ROLE_NAME with the actual role name from above
aws iam put-role-policy `
  --role-name YOUR_ROLE_NAME `
  --policy-name CognitoGroupManagement `
  --policy-document file://cognito-group-policy.json
```

**OR** use the AWS Console:
1. Go to IAM → Roles
2. Find your Lambda's role (e.g., `postConfirmationTrigger-role`)
3. Click "Add permissions" → "Attach policies"
4. Create inline policy with the JSON above

---

### Step 4: Verify Cognito Trigger is Connected

Make sure the Lambda is connected as a Post-Confirmation trigger:

```powershell
aws cognito-idp describe-user-pool --user-pool-id us-east-1_pMr6t5GFA --query "UserPool.LambdaTriggers" --region us-east-1
```

You should see:
```json
{
  "PostConfirmation": "arn:aws:lambda:us-east-1:...:function:postConfirmationTrigger"
}
```

If NOT connected, connect it:

```powershell
aws cognito-idp update-user-pool `
  --user-pool-id us-east-1_pMr6t5GFA `
  --lambda-config PostConfirmation=arn:aws:lambda:us-east-1:YOUR_ACCOUNT_ID:function:postConfirmationTrigger `
  --region us-east-1
```

---

## ✅ Testing

### Test 1: Sign Up as Customer

1. Go to your app: http://localhost:5173
2. Click "Sign Up"
3. Select role: **Customer**
4. Complete sign-up and verify email
5. Check Cognito Console → Groups → Customers → Should see new user!

### Test 2: Sign Up as Vendor

1. Sign up with role: **Vendor**
2. Confirm email
3. Check Cognito Console → Groups → Vendors → Should see new user!

### Test 3: Check CloudWatch Logs

```powershell
aws logs tail /aws/lambda/postConfirmationTrigger --follow --region us-east-1
```

You should see:
```
📋 Adding user 'testuser123' to group 'Customers'...
✅ User 'testuser123' added to group 'Customers'
```

---

## 🔧 Troubleshooting

### Issue: User not added to group

**Check CloudWatch Logs:**
```powershell
aws logs tail /aws/lambda/postConfirmationTrigger --follow --region us-east-1
```

**Common errors:**

1. **"AccessDeniedException"** → Lambda doesn't have permission
   - Solution: Add the IAM policy from Step 3

2. **"ResourceNotFoundException"** → Group doesn't exist
   - Solution: Run `setup-cognito-groups.ps1` again

3. **"custom:role does not exist"** → Normal! The Lambda handles this
   - It will still create user with default "customer" role

### Issue: Lambda not triggered

Check if trigger is connected:
```powershell
aws cognito-idp describe-user-pool --user-pool-id us-east-1_pMr6t5GFA --query "UserPool.LambdaTriggers"
```

---

## 📊 How It Works

### Sign-Up Flow:

1. User fills sign-up form → Selects role (Customer/Vendor/Admin)
2. Frontend calls Cognito `SignUpCommand` with `custom:role` attribute
3. User receives verification email
4. User confirms email with verification code
5. **Cognito triggers `postConfirmation` Lambda** ⚡
6. Lambda:
   - Saves user to DynamoDB with role
   - **Adds user to appropriate Cognito group** 🎯
7. User logs in → JWT token contains `cognito:groups: ["Vendors"]` ✅

### Group Mapping:

```javascript
const groupMap = {
  customer: "Customers",  // Note: Capital C
  vendor: "Vendors",      // Note: Capital V
  admin: "Admins"         // Note: Capital A
};
```

**Important:** Group names are case-sensitive in Cognito! Make sure:
- `Customers` (with capital C)
- `Vendors` (with capital V)
- `Admins` (with capital A)

---

## 🎉 Success Criteria

After setup, when a user signs up:

✅ User created in Cognito  
✅ User saved to DynamoDB with role  
✅ User automatically added to correct Cognito group  
✅ When user logs in, JWT token contains group membership  
✅ Delete product works because user is in "Vendors" group  

---

## 📝 Summary of Changes

### Modified Files:
- `backend/lambda/users/postConfirmation.js` - Added automatic group assignment

### New Dependencies:
- `@aws-sdk/client-cognito-identity-provider` - For AdminAddUserToGroup

### No Changes Needed:
- Frontend sign-up flow (already passes role)
- AuthContext.tsx (already handles groups)
- Delete Lambda (already checks groups)

---

## 🔒 Security Notes

- Lambda uses `AdminAddUserToGroup` (requires admin permissions)
- Only Lambda execution role can add users to groups
- Users cannot add themselves to groups
- Group membership is included in JWT tokens automatically

---

## 🚨 Important Reminders

1. **Run setup-cognito-groups.ps1 first** to create all groups
2. **Update Lambda permissions** to allow group management
3. **Deploy updated Lambda** with new code
4. **Test with a new user** (existing users won't be auto-added)
5. **Check CloudWatch logs** if issues occur

---

Need help? Check CloudWatch logs for the `postConfirmationTrigger` Lambda function!
