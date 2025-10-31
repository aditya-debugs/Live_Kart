# Role Assignment Guide - Fix Vendor Dashboard Access

## 🔴 CRITICAL ISSUE IDENTIFIED

**Problem:** Users are showing as "customer" role even when they should be vendors because they haven't been assigned to Cognito Groups yet.

**Why:** When you sign up, the account is created in Cognito, but **Cognito Groups are separate** and must be assigned manually or through a backend process.

**Solution:** You need to assign your vendor test user to the "Vendors" group in Cognito.

---

## 🎯 Quick Fix (Choose One Method)

### Method 1: Using PowerShell Script (Recommended - Fast!)

1. Open PowerShell in the `scripts` folder
2. Run:
   ```powershell
   .\assign-user-to-group.ps1
   ```
3. Enter your vendor user's email
4. Select option `2` (Vendors)
5. **Sign out and sign in again** to get updated token

### Method 2: Manual via AWS Console (Always Works)

1. **Go to Cognito Console:**

   - https://us-east-1.console.aws.amazon.com/cognito/v2/idp/user-pools/us-east-1_pMr6t5GFA/users?region=us-east-1

2. **Find your vendor user:**

   - Click on "Users" tab
   - Find the email you signed up with as vendor
   - Click on the username

3. **Add to Vendors group:**

   - Scroll down to "Group memberships" section
   - Click "Add user to group"
   - Select "Vendors" from dropdown
   - Click "Add"

4. **CRITICAL: Sign out and sign in again!**
   - Go to your app
   - Click Sign Out
   - Sign In again with the same vendor credentials
   - Now the JWT token will contain the "Vendors" group

---

## ✅ Verification Steps

After assigning the user to the Vendors group and signing in again:

1. **Check the RoleDebug card** (bottom-right corner of your app):

   - Should show: `role: vendor` ✅
   - If still shows `role: customer` ❌ - you need to sign out and sign in again

2. **Check automatic redirect:**

   - After signing in as vendor, should redirect to `/vendor` route
   - Should see "Vendor Dashboard" page with product management form

3. **Check Profile Page:**

   - Click on Profile
   - "Account Role" field should show: **Vendor** in a blue badge

4. **Check Protected Routes:**
   - Try clicking "Go to Vendor" button in RoleDebug card
   - Should work without being redirected

---

## 🔧 How the Role System Works

### 1. **Sign Up** (First Step)

- User creates account in Cognito
- Account is created but **no group assigned yet**
- Default role: "customer"

### 2. **Group Assignment** (Second Step - MANUAL)

- Admin assigns user to Cognito Group:
  - "Customers" → customer role
  - "Vendors" → vendor role
  - "Admins" → admin role

### 3. **Sign In** (Get Role)

- User signs in
- Cognito returns JWT token with `cognito:groups` field
- AuthContext reads groups from token:
  ```javascript
  const cognitoGroups = idTokenPayload["cognito:groups"] || [];
  if (cognitoGroups.includes("Vendors")) {
    userRole = "vendor"; // ✅ Vendor access!
  }
  ```

### 4. **Route Protection** (Enforce Role)

- ProtectedRoute component checks user role
- Redirects if role doesn't match required role
- Example: `/vendor` route requires `requiredRole="vendor"`

---

## 📋 Current Groups in Cognito

| Group Name    | Role     | Access                                  |
| ------------- | -------- | --------------------------------------- |
| **Customers** | customer | Browse products, place orders, wishlist |
| **Vendors**   | vendor   | Vendor Dashboard, manage products       |
| **Admins**    | admin    | Admin Overview, full system access      |

---

## 🚨 Common Mistakes

### ❌ Mistake 1: Forgot to Sign Out

**Problem:** Changed group in Cognito but still seeing old role  
**Solution:** Must sign out and sign in to get new JWT token

### ❌ Mistake 2: Wrong Group Name

**Problem:** Using lowercase "vendors" instead of "Vendors"  
**Solution:** Group names are case-sensitive! Use: `Vendors`, `Customers`, `Admins`

### ❌ Mistake 3: User Not Found

**Problem:** Trying to add non-existent user to group  
**Solution:** User must complete sign-up first (including email confirmation if required)

---

## 🔍 Debugging Tips

### Check JWT Token Contents

1. Open Browser Developer Tools (F12)
2. Go to Application/Storage → Local Storage
3. Find key: `livekart_tokens`
4. Copy the `idToken` value
5. Paste into: https://jwt.io
6. Look for `cognito:groups` field in payload
7. Should contain: `["Vendors"]` for vendor users

### Check Console Logs

When signing in, AuthContext logs the detected role:

```javascript
console.log("User role detected:", userRole);
console.log("Cognito groups:", cognitoGroups);
```

---

## 📝 Testing Checklist

- [ ] Created Cognito Groups (Customers, Vendors, Admins)
- [ ] Assigned vendor test user to "Vendors" group
- [ ] Assigned customer test user to "Customers" group
- [ ] Signed out completely
- [ ] Signed in as vendor
- [ ] RoleDebug shows "vendor" role ✅
- [ ] Automatically redirected to /vendor
- [ ] Can see Vendor Dashboard
- [ ] Profile page shows "Vendor" badge
- [ ] Can add products as vendor
- [ ] Signed out and signed in as customer
- [ ] RoleDebug shows "customer" role ✅
- [ ] Redirected to /customer (CustomerHome)
- [ ] Profile page shows "Customer" badge

---

## 🎯 Next Steps After Role Assignment

1. ✅ **Assign users to groups** (this guide)
2. Test vendor product creation
3. Test customer browsing
4. Remove RoleDebug component (temporary debug tool)
5. Final testing before submission

---

## 📞 Still Having Issues?

If the role is still showing as "customer" after:

1. ✅ Added user to Vendors group in Cognito
2. ✅ Signed out completely
3. ✅ Signed in again
4. ✅ Checked RoleDebug card

Then check:

- Is the group name exactly "Vendors" (capital V)?
- Did you wait for the page to fully reload after sign in?
- Clear browser cache and localStorage, try again
- Check browser console for any errors in AuthContext
