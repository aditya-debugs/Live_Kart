# User Role Management Scripts

This directory contains scripts to manage user roles in AWS Cognito for the LiveKart application.

## 📋 Overview

LiveKart uses AWS Cognito Groups to manage user roles. When a user signs up, they select a role (customer/vendor/admin), but they need to be added to the corresponding Cognito group to actually have that role.

## 🔧 Scripts

### 1. `add-user-to-group.ps1`

Adds a single user to a Cognito group.

**Usage:**

```powershell
.\scripts\add-user-to-group.ps1 -Username "john_doe" -GroupName "vendor"
```

**Parameters:**

- `-Username`: The Cognito username (shown after sign-up confirmation)
- `-GroupName`: The role/group (customer, vendor, or admin)
- `-UserPoolId`: (Optional) User Pool ID if not set in environment
- `-Region`: (Optional) AWS region, defaults to us-east-1

**Example:**

```powershell
# Add a vendor user
.\scripts\add-user-to-group.ps1 -Username "jane_smith" -GroupName "vendor"

# Add a customer user
.\scripts\add-user-to-group.ps1 -Username "john_doe" -GroupName "customer"

# With custom User Pool ID
.\scripts\add-user-to-group.ps1 -Username "admin_user" -GroupName "admin" -UserPoolId "us-east-1_xxxxxxxxx"
```

---

### 2. `batch-add-users-to-groups.ps1`

Adds multiple users to groups interactively.

**Usage:**

```powershell
.\scripts\batch-add-users-to-groups.ps1
```

The script will prompt you for each user:

```
Username: john_doe
Role (customer/vendor/admin): customer

Username: jane_smith
Role (customer/vendor/admin): vendor

Username: (press Enter to finish)
```

**Example Session:**

```powershell
PS> .\scripts\batch-add-users-to-groups.ps1

================================================
   Batch Add Users to Cognito Groups
================================================

User Pool ID: us-east-1_pMr6t5GFA
Region: us-east-1

Enter the usernames and roles you want to assign:
(Leave username blank to finish)

Username: alice123
Role (customer/vendor/admin): vendor
Added: alice123 -> vendor

Username: bob456
Role (customer/vendor/admin): customer
Added: bob456 -> customer

Username:

================================================
Summary: Adding 2 user(s)
================================================
  alice123 -> vendor
  bob456 -> customer

Continue? (Y/N): Y

Processing...

Processing: alice123 -> vendor...
  SUCCESS: alice123 added to vendor

Processing: bob456 -> customer...
  SUCCESS: bob456 added to customer

================================================
Results:
  Success: 2
  Failed:  0
================================================
```

---

## 🚀 How It Works

### Sign-Up Flow

1. **User Signs Up**

   - User fills out sign-up form
   - Selects role (Customer/Vendor/Admin)
   - Account created in Cognito
   - Role preference stored locally

2. **Email Confirmation**

   - User receives confirmation code via email
   - Enters code to verify email
   - Account is now active

3. **Role Assignment** (You do this)

   - Use one of the scripts to add user to group
   - User can now sign in with full permissions

4. **Sign In**
   - User signs in with email/password
   - System detects role from Cognito group
   - User is redirected to correct dashboard:
     - Customer → `/customer` (CustomerHome)
     - Vendor → `/vendor` (VendorDashboard)
     - Admin → `/admin` (AdminOverview)

### For Existing Users

If you already have users in Cognito groups, they will automatically get the correct role when they sign in. No additional steps needed!

---

## 📝 Prerequisites

### 1. AWS CLI Installed

```powershell
# Check if installed
aws --version

# If not installed, download from:
# https://awscli.amazonaws.com/AWSCLIV2.msi
```

### 2. AWS Credentials Configured

```powershell
aws configure
# Enter your Access Key ID, Secret Access Key, and Region
```

### 3. User Pool ID

The scripts need your Cognito User Pool ID. It can be:

- Set as environment variable: `$env:VITE_USER_POOL_ID = "us-east-1_xxxxxxxxx"`
- Read from `frontend/.env` file automatically
- Passed as parameter: `-UserPoolId "us-east-1_xxxxxxxxx"`

---

## 🎯 Workflow Examples

### Scenario 1: New User Signs Up as Vendor

**User Action:**

1. Goes to /login, clicks "Sign Up"
2. Fills in email, password, name
3. Selects "Vendor" role
4. Receives confirmation code
5. Enters code to verify email

**Your Action (Admin):**

```powershell
# User tells you their username (shown after confirmation)
.\scripts\add-user-to-group.ps1 -Username "newvendor123" -GroupName "vendor"
```

**Result:**
User can now sign in and will be redirected to Vendor Dashboard!

---

### Scenario 2: Multiple New Sign-Ups

**Your Action:**

```powershell
.\scripts\batch-add-users-to-groups.ps1

# Then enter each user:
Username: alice_vendor
Role: vendor

Username: bob_customer
Role: customer

Username: charlie_admin
Role: admin

Username: (press Enter)
```

**Result:**
All three users can sign in with correct roles!

---

### Scenario 3: Existing Users Already in Groups

**No action needed!**
Users already in Cognito groups will automatically get the correct role on sign-in.

---

## 🔍 Troubleshooting

### Error: "User not found"

- Make sure user has confirmed their email
- Check username spelling (case-sensitive)
- Verify User Pool ID is correct

### Error: "AWS CLI not found"

- Install AWS CLI: https://awscli.amazonaws.com/AWSCLIV2.msi
- Restart PowerShell after installation

### Error: "Access denied"

- Configure AWS credentials: `aws configure`
- Make sure IAM user has Cognito permissions

### Error: "Group doesn't exist"

- The script will automatically create the group
- If creation fails, check IAM permissions

### User signs in but gets wrong role

- Check which group they're in:
  ```powershell
  aws cognito-idp admin-list-groups-for-user --user-pool-id us-east-1_xxx --username john_doe
  ```
- Remove from wrong group:
  ```powershell
  aws cognito-idp admin-remove-user-from-group --user-pool-id us-east-1_xxx --username john_doe --group-name oldgroup
  ```
- Add to correct group (use script above)

---

## 📚 Additional Commands

### List all users

```powershell
aws cognito-idp list-users --user-pool-id us-east-1_xxxxxxxxx
```

### List all groups

```powershell
aws cognito-idp list-groups --user-pool-id us-east-1_xxxxxxxxx
```

### List users in a specific group

```powershell
aws cognito-idp list-users-in-group --user-pool-id us-east-1_xxxxxxxxx --group-name vendor
```

### Check which groups a user is in

```powershell
aws cognito-idp admin-list-groups-for-user --user-pool-id us-east-1_xxxxxxxxx --username john_doe
```

### Remove user from group

```powershell
aws cognito-idp admin-remove-user-from-group --user-pool-id us-east-1_xxxxxxxxx --username john_doe --group-name customer
```

---

## 🎉 Summary

**For New Users:**

1. User signs up and selects role
2. User confirms email
3. **You run script to add them to group**
4. User signs in and gets correct dashboard

**For Existing Users:**

- They already have correct roles from their group membership
- No action needed!

**The system automatically:**

- Detects role from Cognito groups on sign-in
- Redirects to appropriate dashboard
- Works for both custom:role attribute and groups
- Handles case-insensitive group names

---

Need help? Check the main documentation in `SETUP_GUIDE.md` and `AWS_SERVICES_GUIDE.md`!
