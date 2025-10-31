# ✅ AWS Cognito Role Setup - Complete Guide

## What We've Done

Configured AWS Cognito to automatically assign user roles during sign-up using the `custom:role` attribute.

---

## 🎯 Quick Summary

### Before (Manual Process):

```
User signs up → Email verification → Admin runs script → User can sign in
```

### After (Automatic):

```
User signs up → Role saved automatically → Email verification → User can sign in ✅
```

---

## 📋 Configuration Steps Completed

### 1. ✅ Added `custom:role` Attribute in AWS Cognito

**Location:** AWS Console → Cognito → User Pool → Sign-up experience → Custom attributes

**Configuration:**

```
Name:              role
Data type:         String
Mutable:           Yes
Minimum length:    1
Maximum length:    20
```

### 2. ✅ Code Already Configured

The frontend code automatically:

- Sends the selected role during sign-up
- Saves it as `custom:role` in Cognito
- Reads it during sign-in
- Falls back to `cognito:groups` if needed

---

## 🧪 Testing Checklist

### Test New User Sign-Up

1. **Go to:** http://localhost:5173
2. **Click:** Sign Up
3. **Fill in:**
   - Name: Test User
   - Email: test@example.com
   - Password: TestPass123!
   - Role: Select any role (Customer/Vendor/Admin)
4. **Submit** and verify email
5. **Sign in** with credentials
6. **Expected:** Redirected to correct dashboard based on role

### Verify in AWS Console

1. **Go to:** AWS Console → Cognito → User Pool → Users
2. **Click on:** test@example.com
3. **Check:** User attributes should show `custom:role = vendor` (or whatever you selected)

---

## 🔄 How It Works Now

### Sign-Up Flow

```mermaid
User fills form
    ↓
Selects role (Customer/Vendor/Admin)
    ↓
Submits sign-up
    ↓
Cognito creates account + saves custom:role ✅
    ↓
Email verification code sent
    ↓
User enters code
    ↓
Account confirmed ✅
```

### Sign-In Flow

```mermaid
User enters email + password
    ↓
Cognito authenticates
    ↓
Returns JWT token
    ↓
Decode token
    ↓
Check custom:role attribute
    ↓
If found: Use that role ✅
If not found: Check cognito:groups (fallback for existing users)
    ↓
Navigate to correct dashboard:
- customer → /customer
- vendor → /vendor
- admin → /admin
```

---

## 👥 Existing Users

Your existing test users will continue to work because:

1. They have `cognito:groups` set
2. Code checks `custom:role` first, then falls back to `cognito:groups`
3. Both methods work simultaneously

**Optionally add custom:role to existing users:**

```powershell
# Replace YOUR_USER_POOL_ID with your actual User Pool ID
aws cognito-idp admin-update-user-attributes `
  --user-pool-id YOUR_USER_POOL_ID `
  --username customer@livekart.com `
  --user-attributes Name=custom:role,Value=customer

aws cognito-idp admin-update-user-attributes `
  --user-pool-id YOUR_USER_POOL_ID `
  --username vendor@livekart.com `
  --user-attributes Name=custom:role,Value=vendor

aws cognito-idp admin-update-user-attributes `
  --user-pool-id YOUR_USER_POOL_ID `
  --username admin@livekart.com `
  --user-attributes Name=custom:role,Value=admin
```

---

## 🎯 Role-Based Navigation

### Customer Role

- Dashboard: `/customer` (CustomerHome)
- Can browse products
- Can place orders
- Can manage wishlist

### Vendor Role

- Dashboard: `/vendor` (VendorDashboard)
- Can manage products (add/edit/delete)
- Can view orders
- Can upload product images

### Admin Role

- Dashboard: `/admin` (AdminOverview)
- Full access to all features
- Can view analytics
- Can manage all users and products

---

## 🔍 Troubleshooting

### Issue: User signs up but role is not saved

**Check:**

1. Did you add `custom:role` attribute in Cognito?
2. Is the attribute name exactly `role` (not `Role` or `user_role`)?
3. Is it set to **Mutable: Yes**?

**Fix:** Go back to AWS Console and verify the attribute configuration.

---

### Issue: User gets wrong dashboard

**Check:**

1. Sign in to AWS Console
2. Go to Cognito → Users → [username]
3. Check the `custom:role` value

**Fix:**

```powershell
aws cognito-idp admin-update-user-attributes `
  --user-pool-id YOUR_USER_POOL_ID `
  --username USERNAME `
  --user-attributes Name=custom:role,Value=CORRECT_ROLE
```

---

### Issue: Existing users stopped working

**This shouldn't happen!** The code has fallback logic.

**Check:**

```powershell
# Check which groups the user is in
aws cognito-idp admin-list-groups-for-user `
  --user-pool-id YOUR_USER_POOL_ID `
  --username USERNAME
```

**Fix:** Make sure they're still in their group or add `custom:role` attribute.

---

## 📊 Verification Commands

### Check user attributes

```powershell
aws cognito-idp admin-get-user `
  --user-pool-id YOUR_USER_POOL_ID `
  --username USERNAME
```

### Check user's groups

```powershell
aws cognito-idp admin-list-groups-for-user `
  --user-pool-id YOUR_USER_POOL_ID `
  --username USERNAME
```

### List all users

```powershell
aws cognito-idp list-users `
  --user-pool-id YOUR_USER_POOL_ID
```

---

## ✅ Benefits of This Approach

1. **Automatic** - No manual script needed for new users
2. **Scalable** - Works for 1 user or 10,000 users
3. **Reliable** - Role is stored in Cognito, not just localStorage
4. **Flexible** - Supports both custom:role and groups
5. **Backward Compatible** - Existing users still work
6. **AWS Native** - Uses standard Cognito features

---

## 🎉 Summary

✅ **One-time setup:** 2 minutes to add custom:role attribute  
✅ **New users:** Role assigned automatically during sign-up  
✅ **Existing users:** Still work with their current groups  
✅ **No scripts:** Never need to manually assign roles again  
✅ **Production ready:** Scales to any number of users

**You're now using the proper AWS-native approach!** 🚀

---

## 📚 Additional Resources

- [AWS Cognito Custom Attributes Documentation](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-attributes.html)
- [AWS Cognito Groups Documentation](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-user-groups.html)
- Main Setup Guide: `SETUP_GUIDE.md`
- AWS Services Guide: `AWS_SERVICES_GUIDE.md`
