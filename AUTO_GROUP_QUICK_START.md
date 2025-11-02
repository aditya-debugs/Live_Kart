# ✨ Auto Group Assignment - Quick Start

## What Does This Do?

When users sign up and select a role (Customer, Vendor, or Admin), they are **automatically added to the corresponding Cognito group** after email confirmation.

- Customer → Adds to `Customers` group
- Vendor → Adds to `Vendors` group
- Admin → Adds to `Admins` group

## 🚀 Quick Deployment (2 Minutes)

### Run the deployment script:

```powershell
cd "d:\Bhumik\All Projects\College projects\livekart\Live_Kart\scripts"
.\deploy-auto-group-assignment.ps1
```

This script will:
1. ✅ Create Cognito groups (Customers, Vendors, Admins)
2. ✅ Install required npm packages
3. ✅ Package the Lambda function
4. ✅ Deploy to AWS
5. ✅ Configure environment variables

### Then add permissions (IMPORTANT):

**Option 1: AWS Console** (Easiest)
1. Go to [IAM Console](https://console.aws.amazon.com/iam)
2. Click **Roles** → Find your Lambda's role (shown in script output)
3. Click **Add permissions** → **Create inline policy**
4. Click **JSON** tab
5. Copy-paste from `scripts/cognito-group-policy.json`
6. Click **Review policy** → Name it `CognitoGroupManagement`
7. Click **Create policy**

**Option 2: AWS CLI**
```powershell
# Replace YOUR_ROLE_NAME with the role name from script output
aws iam put-role-policy `
  --role-name YOUR_ROLE_NAME `
  --policy-name CognitoGroupManagement `
  --policy-document file://cognito-group-policy.json
```

---

## 🧪 Testing

1. **Sign up a new user** (existing users won't be auto-added)
2. Select role: **Vendor**
3. Verify email
4. Go to Cognito Console → Groups → Vendors
5. **You should see the new user there!** ✅

### Check Logs:
```powershell
aws logs tail /aws/lambda/postConfirmationTrigger --follow
```

Look for:
```
📋 Adding user 'testuser' to group 'Vendors'...
✅ User 'testuser' added to group 'Vendors'
```

---

## 📖 Full Documentation

See `AUTOMATIC_GROUP_ASSIGNMENT_SETUP.md` for complete details and troubleshooting.

---

## ✅ What Works Now

- ✅ New users automatically added to groups
- ✅ JWT tokens contain group membership
- ✅ Vendor delete function works (checks groups)
- ✅ Role-based access control enabled
- ✅ No manual group assignment needed!

---

## 🔧 Modified Files

- `backend/lambda/users/postConfirmation.js` - Added group assignment logic
- `scripts/deploy-auto-group-assignment.ps1` - New deployment script
- `scripts/cognito-group-policy.json` - IAM policy for Lambda

---

## 📝 Notes

- **Existing users** need to be manually added to groups (already done for `bhumik`)
- **New users** will be auto-added going forward
- Group names are case-sensitive: `Customers`, `Vendors`, `Admins`
