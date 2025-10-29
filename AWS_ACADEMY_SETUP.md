# 🎓 AWS Academy/Learner Lab Setup Guide

## 🎯 Special Instructions for AWS Academy/Educate/Learner Lab Users

Your AWS account has **restricted permissions** compared to regular AWS accounts. This guide helps you work around those limitations.

---

## ⚠️ Key Differences in AWS Academy

| What You Can't Do         | What You Can Do Instead                            |
| ------------------------- | -------------------------------------------------- |
| ❌ Create new IAM roles   | ✅ Use existing `LabRole`                          |
| ❌ Edit some IAM policies | ✅ Test if LabRole already has permissions         |
| ❌ Use CloudFront         | ✅ Use direct S3 URLs (already done in our code)   |
| ❌ Use SES (production)   | ✅ Skip email features                             |
| ❌ Keep resources forever | ✅ Session expires in 4 hours, restart when needed |

---

## 🚀 Creating Lambda Functions in AWS Academy

### Step 1: When Creating a Function

Instead of creating a new role, **use the existing LabRole**:

1. Click **"Create function"**
2. Fill in function name and runtime (Node.js 18.x)
3. Under **"Permissions"**:
   - Click **"Change default execution role"**
   - Select **"Use an existing role"**
   - From dropdown, choose: **`LabRole`**
4. Click **"Create function"**

### Step 2: What is LabRole?

`LabRole` is a pre-configured IAM role that AWS Academy provides. It usually already has:

- ✅ Lambda execution permissions
- ✅ CloudWatch logging
- ✅ **Often** DynamoDB and S3 access

### Step 3: Check What Permissions LabRole Has

1. After creating your first function, go to **Configuration → Permissions**
2. Click the **LabRole** link (opens IAM console)
3. Look at **"Permissions"** tab
4. You'll see attached policies like:
   - `AWSLambdaBasicExecutionRole-...` (for Lambda)
   - Possibly `AmazonDynamoDBFullAccess` (for DynamoDB)
   - Possibly `AmazonS3FullAccess` (for S3)

**If you see DynamoDB and S3 policies already attached:**

- ✅ You're all set! No need to add permissions.
- Continue with the Lambda setup guide.

**If you DON'T see DynamoDB and S3 policies:**

- Continue to Step 4 below.

---

## 🔐 Adding Permissions to LabRole (If Needed)

### Option A: Try Adding Policies (Might Not Work)

1. In the LabRole page, click **"Add permissions"** dropdown
2. Select **"Attach policies"**

**If the button is grayed out or you get an error:**

- Your account doesn't allow editing LabRole
- Skip to Option B or C

**If it works:**

1. Search for `DynamoDB`
2. Check ✅ `AmazonDynamoDBFullAccess`
3. Click **"Add permissions"**
4. Repeat for `AmazonS3FullAccess`

### Option B: Test Without Adding Permissions

AWS Academy's LabRole often has broad permissions already!

1. **Skip the IAM editing step**
2. **Create your Lambda function** with the code
3. **Add environment variables**
4. **Test the function**

**If it works:**

- ✅ Great! LabRole already had the permissions.

**If you get "AccessDeniedException":**

- Continue to Option C

### Option C: Ask Your Instructor

If testing fails with permission errors:

1. Take a screenshot showing:
   - The Lambda function name
   - The error message (AccessDeniedException)
   - The LabRole name
2. Contact your instructor/TA with this message:

```
Hi! I'm setting up Lambda functions for my project and need
DynamoDB and S3 permissions added to LabRole.

Can you please add these policies to LabRole:
- AmazonDynamoDBFullAccess
- AmazonS3FullAccess

Or let me know if there's a different role I should use?

[Attach screenshot]
```

### Option D: Use Inline Policy (If Allowed)

Some AWS Academy setups allow inline policies:

1. In LabRole page, look for **"Add inline policy"** button
2. If it's clickable, click it
3. Switch to **JSON** tab
4. Paste this:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["dynamodb:*"],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:*"],
      "Resource": "*"
    }
  ]
}
```

5. Click **"Review policy"**
6. Name: `LambdaDynamoDBandS3`
7. Click **"Create policy"**

---

## 🧪 Testing If Your Permissions Work

### Quick Test for DynamoDB:

1. Create a Lambda function with this test code:

```javascript
const {
  DynamoDBClient,
  ListTablesCommand,
} = require("@aws-sdk/client-dynamodb");

exports.handler = async (event) => {
  const client = new DynamoDBClient({ region: "us-east-1" });
  try {
    const response = await client.send(new ListTablesCommand({}));
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, tables: response.TableNames }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
```

2. Test it
3. **If you see your table names** → ✅ DynamoDB permissions work!
4. **If you see AccessDenied** → ❌ Need to add permissions

### Quick Test for S3:

1. Create a Lambda with this code:

```javascript
const { S3Client, ListBucketsCommand } = require("@aws-sdk/client-s3");

exports.handler = async (event) => {
  const client = new S3Client({ region: "us-east-1" });
  try {
    const response = await client.send(new ListBucketsCommand({}));
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, buckets: response.Buckets }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
```

2. Test it
3. **If you see your bucket** → ✅ S3 permissions work!
4. **If you see AccessDenied** → ❌ Need to add permissions

---

## ⏰ AWS Academy Session Management

### Session Expires in 4 Hours

AWS Academy sessions automatically stop after 4 hours. Here's what happens:

**What Stays:**

- ✅ Lambda functions (code and configuration)
- ✅ DynamoDB tables and data
- ✅ S3 buckets and files
- ✅ Function URLs

**What Resets:**

- ⚠️ Your browser session (need to re-login)
- ⚠️ Some environment variables might need refresh

### When Starting a New Session:

1. **Click "Start Lab"** in AWS Academy
2. Wait for green dot next to "AWS"
3. Click **"AWS"** to open console
4. Your Lambda functions should still be there!
5. Test one function to make sure it still works

### If Functions Stop Working After Session Restart:

1. Check if Function URLs still work in browser
2. If not, go to Lambda → Configuration → Function URL
3. You might need to **recreate** the Function URL
4. Save the new URL

---

## 🆘 Common AWS Academy Issues

### Issue 1: "User is not authorized to perform iam:CreateRole"

**What it means:** You can't create new IAM roles.

**Solution:** Use **LabRole** instead (see Step 1 above).

---

### Issue 2: "User is not authorized to perform iam:AttachRolePolicy"

**What it means:** You can't add policies to LabRole.

**Solution:**

1. Test if LabRole already has permissions (Option B above)
2. Or ask your instructor (Option C)

---

### Issue 3: Lambda function returns "AccessDeniedException"

**What it means:** LabRole doesn't have DynamoDB or S3 permissions.

**Solution:**

1. Take a screenshot
2. Ask instructor to add permissions
3. Or try inline policy (Option D)

---

### Issue 4: "Function URL" option is missing

**What it means:** Your AWS Academy version might be older.

**Solution:** Use API Gateway instead:

1. Follow **LEARNER_ACADEMY_INTEGRATION.md**
2. Section: "Setting Up API Gateway"

---

### Issue 5: Session expired, Lambda not working

**What it means:** 4-hour session ended.

**Solution:**

1. Start new lab session
2. Wait for green dot
3. Lambda should still exist
4. Test it - might need to recreate Function URLs

---

### Issue 6: "Module not found: @aws-sdk/..."

**What it means:** Wrong Node.js runtime version.

**Solution:**

1. Edit function → Runtime settings
2. Change to **Node.js 18.x** or **Node.js 20.x**
3. Deploy again

---

## ✅ AWS Academy Setup Checklist

Before creating your 8 Lambda functions:

- [ ] Started AWS Academy lab session
- [ ] Green dot next to "AWS"
- [ ] Opened AWS Console
- [ ] Confirmed region is **us-east-1**
- [ ] Found LabRole in IAM (IAM → Roles → search "Lab")
- [ ] Checked LabRole permissions (has DynamoDB and S3?)
- [ ] Ready to create functions using LabRole

---

## 🎯 Your Next Steps

Now that you understand AWS Academy limitations:

1. **Go to**: [LAMBDA_QUICK_START.md](./LAMBDA_QUICK_START.md)
2. **Use LabRole** instead of creating new roles
3. **Skip IAM editing** if buttons are grayed out
4. **Test functions** to see if permissions already work
5. **Ask instructor** if you get permission errors

---

## 💡 Pro Tips for AWS Academy

### Tip 1: Work in Sprints

Since sessions expire in 4 hours, plan your work:

- Session 1: Create first 4 Lambda functions
- Session 2: Create last 4 Lambda functions
- Session 3: Test and debug
- Session 4: Frontend integration

### Tip 2: Save Everything

Before session expires:

- Copy all Function URLs to a text file
- Screenshot any important configurations
- Note which functions are working

### Tip 3: Use CloudWatch Logs

Even if you can't edit IAM, you can view logs:

1. Lambda → Monitor → View CloudWatch logs
2. See all errors and console.log outputs
3. Helpful for debugging permission issues

### Tip 4: Test One Function First

Before creating all 8:

1. Create `getProducts` function
2. Make sure it works completely
3. Confirm permissions are OK
4. Then create the other 7

---

**Ready to start? Open [LAMBDA_QUICK_START.md](./LAMBDA_QUICK_START.md) and create your first function!** 🚀
