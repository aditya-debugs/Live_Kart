# Quick Manual Deployment Guide
## Auto Group Assignment Setup

Since AWS CLI is not in your PATH, here's the manual deployment process:

---

## Step 1: Create Cognito Groups (Using AWS Console)

1. Go to [AWS Cognito Console](https://console.aws.amazon.com/cognito)
2. Click on your user pool: `livekart-users` (ID: us-east-1_pMr6t5GFA)
3. Click **Groups** in the left sidebar
4. Create these groups if they don't exist:
   - **Customers** (description: "Customer users")
   - **Admins** (description: "Admin users")
   - **Vendors** (already exists)

---

## Step 2: Package & Deploy Lambda

### 2.1: Install Dependencies (Already Done ✅)
```powershell
cd "d:\Bhumik\All Projects\College projects\livekart\Live_Kart\backend\lambda\users"
npm install @aws-sdk/client-cognito-identity-provider
```

### 2.2: Package Lambda (Already Done ✅)
The script already created: `post-confirmation-trigger.zip`

### 2.3: Upload to AWS Lambda

**Using AWS Console:**
1. Go to [Lambda Console](https://console.aws.amazon.com/lambda)
2. Find function: **postConfirmationTrigger**
3. Click **Upload from** → **.zip file**
4. Select file: `d:\Bhumik\All Projects\College projects\livekart\Live_Kart\backend\lambda\users\post-confirmation-trigger.zip`
5. Click **Save**

---

## Step 3: Add Environment Variables

1. Still in Lambda console (postConfirmationTrigger function)
2. Click **Configuration** tab
3. Click **Environment variables**
4. Click **Edit**
5. Add these variables:
   - Key: `USER_POOL_ID` → Value: `us-east-1_pMr6t5GFA`
   - Key: `USERS_TABLE` → Value: `livekart-users`
   - Key: `AWS_REGION` → Value: `us-east-1`
6. Click **Save**

---

## Step 4: Add IAM Permissions

1. In Lambda console, click **Configuration** → **Permissions**
2. Click on the **Role name** (e.g., postConfirmationTrigger-role-xxx)
3. This opens IAM console
4. Click **Add permissions** → **Create inline policy**
5. Click **JSON** tab
6. Paste this:

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

7. Click **Review policy**
8. Name: `CognitoGroupManagement`
9. Click **Create policy**

---

## Step 5: Verify Trigger Connection

1. Go back to [Cognito Console](https://console.aws.amazon.com/cognito)
2. Click your user pool: `livekart-users`
3. Click **User pool properties** tab
4. Scroll to **Lambda triggers**
5. Check if **Post confirmation trigger** shows: `postConfirmationTrigger`
   - ✅ If YES → You're all set!
   - ❌ If NO → Click **Add Lambda trigger**:
     - Trigger type: **Post confirmation**
     - Lambda function: **postConfirmationTrigger**
     - Click **Save changes**

---

## ✅ Testing

### Test with a New User:

1. Go to your app: http://localhost:5173
2. Click **Sign Up**
3. Fill in details and select role: **Vendor**
4. Complete email verification
5. Go to AWS Cognito Console → Groups → Vendors
6. **You should see the new user there!** ✅

### Check CloudWatch Logs:

1. Go to [CloudWatch Console](https://console.aws.amazon.com/cloudwatch)
2. Click **Log groups**
3. Find: `/aws/lambda/postConfirmationTrigger`
4. Click on latest log stream
5. Look for:
   ```
   Adding user 'testuser' to group 'Vendors'...
   User 'testuser' added to group 'Vendors'
   ```

---

## 🎉 Done!

Now when users sign up and select a role:
- Customer → Auto-added to **Customers** group
- Vendor → Auto-added to **Vendors** group  
- Admin → Auto-added to **Admins** group

**No manual group assignment needed anymore!** 🚀

---

## Troubleshooting

### If user not added to group:

1. Check CloudWatch logs for errors
2. Verify IAM permissions were added (Step 4)
3. Verify environment variables are set (Step 3)
4. Verify trigger is connected (Step 5)

### Common Errors:

- **AccessDeniedException** → IAM permissions missing (redo Step 4)
- **ResourceNotFoundException** → Group doesn't exist (redo Step 1)
- **No logs at all** → Trigger not connected (redo Step 5)
