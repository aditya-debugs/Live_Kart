# ⚡ QUICK SETUP - Users to DynamoDB (You Already Have the Table!)

Since you **already have** the `livekart-users` DynamoDB table, you only need **2 simple steps**:

---

## ✅ Step 1: Create Lambda Function (5 minutes)

### Option A: AWS Console (Easiest)

1. **Go to Lambda Console**: https://console.aws.amazon.com/lambda/home?region=us-east-1#/create/function

2. **Create function**:

   - Click "Create function"
   - Choose: **Author from scratch**
   - Function name: `livekart-post-confirmation-trigger`
   - Runtime: **Node.js 18.x**
   - Click "Create function"

3. **Upload the code**:

   - In the function page, go to **Code** tab
   - Click "Upload from" → ".zip file"
   - Upload: `backend/lambda/users/post-confirmation-trigger.zip` ✅ (Already created!)
   - Click "Save"

4. **Add environment variables**:

   - Go to **Configuration** tab → **Environment variables**
   - Click "Edit" → "Add environment variable"
   - Add these 2 variables:
     ```
     USERS_TABLE = livekart-users
     AWS_REGION = us-east-1
     ```
   - Click "Save"

5. **Update permissions**:

   - Go to **Configuration** tab → **Permissions**
   - Click on the execution role name (opens IAM)
   - Click "Add permissions" → "Create inline policy"
   - Choose JSON and paste:

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

   - Click "Review policy"
   - Name: `DynamoDBUsersAccess`
   - Click "Create policy"

6. **Add Cognito permission**:
   - Back in Lambda console → **Configuration** → **Permissions**
   - Scroll to "Resource-based policy statements"
   - Click "Add permissions"
   - Choose "AWS service"
   - Service: **Other**
   - Statement ID: `AllowCognitoInvoke`
   - Principal: `cognito-idp.amazonaws.com`
   - Source ARN: `arn:aws:cognito-idp:us-east-1:*:userpool/us-east-1_pMr6t5GFA`
   - Action: `lambda:InvokeFunction`
   - Click "Save"

---

## ✅ Step 2: Connect Cognito Trigger (2 minutes)

1. **Go to Cognito User Pool Triggers**:
   https://console.aws.amazon.com/cognito/v2/idp/user-pools/us-east-1_pMr6t5GFA/triggers?region=us-east-1

2. **Configure Post-Confirmation trigger**:
   - Scroll down to **"Post confirmation trigger"** section
   - Click "Add Lambda trigger"
   - From dropdown, select: `livekart-post-confirmation-trigger`
   - Click **"Save changes"**

✅ **DONE!** That's it!

---

## 🧪 Test It Right Now

1. **Go to your app**: http://localhost:5174/login

2. **Sign up a new test user**:

   - Click "Sign Up"
   - Email: `test123@example.com`
   - Password: `Test@1234`
   - Name: `Test User`
   - Role: Customer
   - Click "Create Account"

3. **Check email** and enter verification code

4. **Verify in DynamoDB**:
   - Go to: https://console.aws.amazon.com/dynamodbv2/home?region=us-east-1#item-explorer
   - Select table: `livekart-users`
   - Click "Scan"
   - ✅ **You should see your new user!**

---

## 📊 What Will Happen

```
User signs up
  ↓
Enters verification code
  ↓
Email verified ✅
  ↓
🔥 Cognito AUTOMATICALLY triggers Lambda
  ↓
Lambda adds user to DynamoDB livekart-users
  ↓
✅ User exists in both Cognito AND DynamoDB!
```

---

## 🔍 Check Lambda Logs (Optional)

To see if it's working:

1. Go to: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups
2. Find: `/aws/lambda/livekart-post-confirmation-trigger`
3. Click latest log stream
4. Look for: `"✅ User added to DynamoDB"`

---

## ⚡ Quick Links

**Lambda Console**: https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions

**Cognito Triggers**: https://console.aws.amazon.com/cognito/v2/idp/user-pools/us-east-1_pMr6t5GFA/triggers?region=us-east-1

**DynamoDB Users Table**: https://console.aws.amazon.com/dynamodbv2/home?region=us-east-1#item-explorer?table=livekart-users

**CloudWatch Logs**: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups

---

## 📝 Summary

Since you already have the DynamoDB table, you just needed:

✅ **Step 1**: Create Lambda function (upload the ZIP file)  
✅ **Step 2**: Connect it to Cognito as Post-Confirmation trigger

**Total time**: ~7 minutes  
**Difficulty**: Easy (just AWS Console clicks)

---

**Status**: ZIP file ready at `backend/lambda/users/post-confirmation-trigger.zip`  
**Next**: Follow Step 1 above to deploy it! 🚀
