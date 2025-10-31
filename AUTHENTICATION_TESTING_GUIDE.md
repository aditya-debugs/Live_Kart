# LiveKart - Authentication Testing Guide

## 🎯 Objective

Test role-based authentication for Customer and Vendor roles using AWS Cognito

---

## 📋 Prerequisites Checklist

- [ ] AWS Cognito User Pool created (ID: `us-east-1_pMr6t5GFA`)
- [ ] Frontend running on http://localhost:5173
- [ ] Lambda functions deployed and working

---

## 🔧 Step 1: Create Cognito User Groups

### Via AWS Console:

1. Go to **AWS Cognito Console** → **User Pools** → Select `livekart-users`

2. Click **Groups** in the left sidebar

3. Click **Create group** button

4. Create **3 groups**:

   **Group 1: Customers**

   - Group name: `Customers`
   - Description: `Customer users who can browse and purchase products`
   - Click **Create group**

   **Group 2: Vendors**

   - Group name: `Vendors`
   - Description: `Vendor users who can list and manage products`
   - Click **Create group**

   **Group 3: Admins**

   - Group name: `Admins`
   - Description: `Administrator users with full system access`
   - Click **Create group**

---

## 👥 Step 2: Create Test Users

### Via AWS Console:

1. Go to **Users** tab in Cognito

2. Click **Create user** button

3. Create **3 test users**:

   **Customer User:**

   - Invitation message: Don't send
   - User name: `customer1`
   - Email: `customer@livekart.com`
   - ☑️ Mark email as verified
   - Temporary password: UNCHECK "Send an email invitation"
   - Set password: `Customer@123`
   - ☑️ Password set by administrator (permanent)
   - Click **Create user**

   After creation:

   - Click on `customer1`
   - Go to **Group memberships** tab
   - Click **Add user to group**
   - Select **Customers**
   - Click **Add**

   **Vendor User:**

   - User name: `vendor1`
   - Email: `vendor@livekart.com`
   - ☑️ Mark email as verified
   - Set password: `Vendor@123`
   - ☑️ Password set by administrator (permanent)
   - Click **Create user**

   After creation:

   - Add to **Vendors** group

   **Admin User (Optional):**

   - User name: `admin1`
   - Email: `admin@livekart.com`
   - ☑️ Mark email as verified
   - Set password: `Admin@123`
   - ☑️ Password set by administrator (permanent)
   - Click **Create user**

   After creation:

   - Add to **Admins** group

---

## 🧪 Step 3: Test Authentication

### Test Customer Login:

1. Open http://localhost:5173/login
2. Sign in with:
   - Email: `customer@livekart.com`
   - Password: `Customer@123`
3. ✅ Should redirect to `/customer` (Customer Home Page)
4. ✅ Should see products browsing interface
5. ✅ Should NOT see "Add Product" or vendor features

### Test Vendor Login:

1. Sign out (if logged in)
2. Go to http://localhost:5173/login
3. Sign in with:
   - Email: `vendor@livekart.com`
   - Password: `Vendor@123`
4. ✅ Should redirect to `/vendor` (Vendor Dashboard)
5. ✅ Should see "Add Product" form
6. ✅ Should see product management features
7. ✅ Should NOT see customer shopping cart/wishlist

### Test Role-Based Access:

1. As Customer, try to access `/vendor` directly
   - ✅ Should redirect back to `/customer`
2. As Vendor, try to access `/customer` directly
   - ✅ Should redirect back to `/vendor`

---

## 🎨 Step 4: Upload Images to S3

### Manual Upload via AWS Console:

1. Go to **S3 Console**
2. Find or create bucket: `livekart-images-2024`
3. Create folder: `images`
4. Upload the following files from `frontend/src/assets/`:
   - `bannerimg.jpg`
   - `bannerimg2.jpg`
   - `bannerimg3.jpg`
   - `bannerimg4.jpg`
   - `categoryimg1.jpg`
   - `categoryimg2.jpg`
   - `categoryimg3.jpg`
   - `categoryimg4.jpg`
   - `productimg1.jpg`
   - `productimg2.jpg`
   - `productimg3.jpg`
   - `productimg4.jpg`
5. For each file after upload:
   - Click on the file
   - Click **Permissions** tab
   - Click **Edit** under "Access control list (ACL)"
   - Grant **Read** permission to **Everyone (public access)**
   - Click **Save**

### Get S3 URLs:

After uploading, each image will have a URL like:

```
https://livekart-images-2024.s3.us-east-1.amazonaws.com/images/bannerimg.jpg
```

Copy these URLs and update your frontend components.

---

## ✅ Verification Checklist

### Cognito Setup:

- [ ] 3 groups created (Customers, Vendors, Admins)
- [ ] Customer test user created and assigned to Customers group
- [ ] Vendor test user created and assigned to Vendors group
- [ ] All test users have verified emails
- [ ] Passwords are permanent (not temporary)

### Authentication Testing:

- [ ] Customer can sign in and sees customer interface
- [ ] Vendor can sign in and sees vendor dashboard
- [ ] Role-based redirection works correctly
- [ ] Protected routes block unauthorized access
- [ ] User info displayed correctly in UI

### S3 Images:

- [ ] S3 bucket created
- [ ] All 12 images uploaded to `images/` folder
- [ ] Images have public read permissions
- [ ] Image URLs accessible in browser
- [ ] Frontend components updated with S3 URLs

---

## 📝 Test User Credentials Summary

| Role     | Email                 | Password     | Access                       |
| -------- | --------------------- | ------------ | ---------------------------- |
| Customer | customer@livekart.com | Customer@123 | Browse and purchase products |
| Vendor   | vendor@livekart.com   | Vendor@123   | List and manage products     |
| Admin    | admin@livekart.com    | Admin@123    | Full system administration   |

---

## 🐛 Troubleshooting

### Issue: "User is not authorized"

- **Solution**: Make sure user is added to the correct group

### Issue: "Email not verified"

- **Solution**: In Cognito console, check "Mark email as verified" when creating user

### Issue: "Need to change password"

- **Solution**: Set password as permanent when creating user

### Issue: CORS errors with Lambda

- **Solution**: Ensure Lambda Function URL CORS is disabled (CORS handled in code)

### Issue: Images not loading from S3

- **Solution**: Check bucket policy and ACL permissions are set to public read

---

## 🚀 Next Steps After Testing

1. ✅ Verify Lambda Function URLs are working
2. ✅ Test product creation (as Vendor)
3. ✅ Test product browsing (as Customer)
4. ✅ Test order placement
5. ✅ Check DynamoDB for created records
6. ✅ Review CloudWatch logs for any errors

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Check Lambda CloudWatch logs
3. Verify Cognito group memberships
4. Ensure all environment variables are set correctly in `.env`

---

**Good luck with your college project submission!** 🎓
