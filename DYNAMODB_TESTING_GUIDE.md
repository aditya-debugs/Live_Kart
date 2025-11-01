# 🧪 DynamoDB Integration Testing Guide

## ✅ What Was Fixed

### **Issue 1: Field Name Mismatch**

- **Problem**: Frontend was sending `title` but Lambda expected `name`
- **Fix**: Updated `lambdaAPI.ts` to send `name` field to Lambda
- **Status**: ✅ FIXED

### **Issue 2: Missing VendorId**

- **Problem**: Products weren't tagged with which vendor created them
- **Fix**: Extract `cognito:username` from JWT token and send as `vendorId`
- **Status**: ✅ FIXED

### **Issue 3: Product Display**

- **Problem**: DynamoDB stores `name` but frontend expects `title`
- **Fix**: Map `name → title` when loading products
- **Status**: ✅ FIXED

---

## 🎯 Testing Checklist

### **Step 1: Check Custom Role Attribute in Cognito**

First, verify if `custom:role` attribute exists in your User Pool:

1. Go to AWS Cognito Console → User Pool `us-east-1_pMr6t5GFA`
2. Click **User pool properties** → **Custom attributes**
3. Look for: `custom:role` (mutable, string)

**If it exists:** ✅ Users will automatically get roles on signup  
**If it doesn't exist:** ⚠️ You need to manually assign users to Cognito Groups

---

### **Step 2: Sign Up as Vendor**

1. **Open your app**: http://localhost:5176/ (check terminal for actual port)
2. **Click "Sign Up"**
3. **Fill the form:**
   - Email: `vendor1@test.com`
   - Password: `Test@123456` (must meet Cognito requirements)
   - Username: `VendorOne`
   - **Role: Select "Vendor"** ⚠️ Important!
4. **Submit** → Check email for verification code
5. **Verify account** with the code
6. **Sign in** with vendor credentials

---

### **Step 3: Verify Role Detection**

After signing in as vendor, check the **RoleDebug card** (bottom-right corner):

**Expected Output:**

```
👤 User: vendor1@test.com
🎭 Role: vendor
```

**If it shows `customer` instead:**

1. Sign out
2. Go to AWS Cognito Console → Users
3. Click on `vendor1@test.com`
4. **Add to "Vendors" group** (if custom:role doesn't exist)
5. Sign in again

---

### **Step 4: Test Product Creation (Vendor Dashboard)**

1. **After signing in as vendor**, you should see: **Vendor Dashboard**
2. **Fill the "Add New Product" form:**
   - Product Title: `Test Laptop`
   - Description: `High performance laptop for testing`
   - Price: `999.99`
   - Category: `Electronics`
   - Image URL: Leave empty (uses placeholder) or use: `https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500`
3. **Click "➕ Add Product"**
4. **Expected:**
   - ✅ Success alert: "Product added successfully!"
   - ✅ Product appears in "My Products" list
   - ✅ Shows: Title, Price, Image

---

### **Step 5: Verify Data in DynamoDB**

#### **Option A: AWS Console (Easiest)**

1. Go to: https://us-east-1.console.aws.amazon.com/dynamodbv2/home?region=us-east-1#item-explorer
2. Select table: `livekart-products`
3. Click **"Scan: Scan or query items"**
4. **You should see:**
   - ✅ Product with your title: `Test Laptop`
   - ✅ `vendorId`: Should match your Cognito username
   - ✅ `price`: `999.99`
   - ✅ `category`: `Electronics`
   - ✅ `createdAt`: Recent timestamp

#### **Option B: Using AWS CLI**

```powershell
aws dynamodb scan --table-name livekart-products --region us-east-1
```

**Expected Output:**

```json
{
  "Items": [
    {
      "product_id": "prod_1730476800123_abc123",
      "name": "Test Laptop",
      "price": 999.99,
      "category": "Electronics",
      "vendorId": "VendorOne",
      "createdAt": "2025-11-01T10:30:00.000Z",
      ...
    }
  ],
  "Count": 1
}
```

---

### **Step 6: Test Product Display (Customer View)**

1. **Sign out** from vendor account
2. **Sign up/Sign in as customer:**
   - Email: `customer1@test.com`
   - Role: Customer
3. **You should be redirected to**: `/customer` (CustomerHome page)
4. **Check if your product appears:**
   - Scroll down to "Featured Products" section
   - ✅ Should see "Test Laptop" card
   - ✅ Price: ₹999 (or $999 depending on display)
   - ✅ Image loads correctly

---

### **Step 7: Verify Product Filtering (Vendor Dashboard)**

1. **Sign in as vendor again**
2. **Navigate to Vendor Dashboard** (`/vendor`)
3. **Check "My Products" section:**
   - ✅ Should ONLY show products created by this vendor
   - ✅ Should NOT show products from other vendors
   - ✅ Count should match number of products you created

**Test Filter Logic:**

- Open browser DevTools (F12) → Console
- Look for log: `"Filtered vendor products:"`
- Verify: Products have `vendorId` matching your username

---

## 🔍 Troubleshooting

### **Problem: "Product added successfully" but not showing in My Products**

**Cause:** VendorId mismatch  
**Solution:**

1. Open DevTools → Console
2. Look for: `"Creating product with data:"`
3. Check if `vendorId` matches your `cognito:username`
4. If not matching, check JWT token:
   - localStorage → `livekart_tokens` → `idToken`
   - Decode at: https://jwt.io
   - Find `cognito:username` field

---

### **Problem: "Failed to add product" error**

**Possible Causes:**

1. **Lambda Function Error:**

   - Go to AWS CloudWatch → Log groups
   - Find: `/aws/lambda/livekart-createProduct`
   - Check recent logs for errors

2. **DynamoDB Permissions:**

   - Lambda execution role needs `dynamodb:PutItem` permission
   - Check Lambda → Configuration → Permissions

3. **CORS Error:**
   - Check browser console for CORS errors
   - Verify Lambda Function URL CORS is disabled (we handle it in code)

---

### **Problem: Products not showing in DynamoDB table**

**Check:**

1. **Table exists:** `livekart-products` (check spelling)
2. **Lambda logs:** Any errors during PutItem?
3. **Permissions:** Lambda role has DynamoDB access?
4. **Region:** Both Lambda and DynamoDB in `us-east-1`?

**Debug Command:**

```powershell
aws dynamodb describe-table --table-name livekart-products --region us-east-1
```

---

### **Problem: Role shows "customer" instead of "vendor"**

**Solutions (in priority order):**

1. **Check custom:role in Cognito:**

   - User Pool → Users → Click user → Attributes
   - If `custom:role` exists and = "vendor" → Sign out and sign in again

2. **Add to Cognito Group:**

   - If `custom:role` doesn't exist
   - User Pool → Groups → Add user to "Vendors" group
   - Sign out and sign in again

3. **Check JWT token:**
   - DevTools → Application → localStorage → `livekart_tokens`
   - Copy `idToken`
   - Paste at https://jwt.io
   - Check for: `"custom:role": "vendor"` OR `"cognito:groups": ["Vendors"]`

---

## 📊 Expected Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│  1. VENDOR SIGNS UP                                     │
│     ↓                                                   │
│     custom:role = "vendor" (if configured)              │
│     OR manually added to "Vendors" group                │
└─────────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│  2. VENDOR SIGNS IN                                     │
│     ↓                                                   │
│     JWT token contains: custom:role or cognito:groups   │
│     AuthContext detects: role = "vendor"                │
│     Redirect to: /vendor                                │
└─────────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│  3. VENDOR CREATES PRODUCT                              │
│     ↓                                                   │
│     Form data: {title, price, category, description}    │
│     lambdaAPI.createProduct() extracts vendorId         │
│     Sends to Lambda: {name, price, category, vendorId}  │
└─────────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│  4. LAMBDA PROCESSES REQUEST                            │
│     ↓                                                   │
│     createProduct-simple.js receives data               │
│     Generates product_id: prod_timestamp_random         │
│     Calls: dynamodb.send(PutCommand)                    │
│     Stores in: livekart-products table                  │
└─────────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│  5. DYNAMODB STORES ITEM                                │
│     {                                                   │
│       product_id: "prod_...",                           │
│       name: "Test Laptop",                              │
│       price: 999.99,                                    │
│       vendorId: "VendorOne",                            │
│       category: "Electronics",                          │
│       createdAt: "2025-11-01T..."                       │
│     }                                                   │
└─────────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│  6. FRONTEND RELOADS PRODUCTS                           │
│     ↓                                                   │
│     lambdaAPI.getProducts() → Lambda → DynamoDB Scan    │
│     Filter by: vendorId === current user                │
│     Map: name → title for display                       │
│     Display in: "My Products" list                      │
└─────────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│  7. CUSTOMER VIEWS PRODUCTS                             │
│     ↓                                                   │
│     CustomerHome → lambdaAPI.getProducts()              │
│     Gets ALL products from DynamoDB                     │
│     Displays with: title, price, image, category        │
└─────────────────────────────────────────────────────────┘
```

---

## 🎓 Understanding the Architecture

### **Why 4 Lambda Functions?**

1. **`getProducts`** - Read all/filtered products from DynamoDB
2. **`createProduct`** - Vendor creates new product → DynamoDB
3. **`getOrders`** - Customer views their orders → DynamoDB
4. **`createOrder`** - Customer places order → DynamoDB

### **DynamoDB Tables:**

| Table               | Primary Key  | Purpose                     |
| ------------------- | ------------ | --------------------------- |
| `livekart-products` | `product_id` | Store product listings      |
| `livekart-orders`   | `order_id`   | Store customer orders       |
| `livekart-users`    | `user_id`    | User profiles (optional)    |
| `livekart-sessions` | `session_id` | Session management with TTL |

### **Authentication Flow:**

```
Cognito Sign Up → custom:role OR Groups → JWT Token
                                              ↓
                              AuthContext reads token
                                              ↓
                              Extracts: username, email, role
                                              ↓
                              Routes: /vendor, /customer, /admin
```

---

## ✅ Final Verification Checklist

Before submitting your project, verify:

- [ ] **Cognito**: Users can sign up and sign in
- [ ] **Cognito**: Roles work (vendor sees dashboard, customer sees home)
- [ ] **Cognito**: `custom:role` OR Groups configured
- [ ] **Lambda**: All 4 functions deployed and working
- [ ] **Lambda**: Function URLs configured in `.env`
- [ ] **Lambda**: CORS handled in code (NOT in Function URL settings)
- [ ] **DynamoDB**: `livekart-products` table exists and active
- [ ] **DynamoDB**: Products appear after vendor creation
- [ ] **DynamoDB**: Products have correct vendorId
- [ ] **S3**: Bucket `live-kart-product-images` exists
- [ ] **S3**: Images accessible via public URLs
- [ ] **Frontend**: Vendor can create products
- [ ] **Frontend**: Vendor sees only their products
- [ ] **Frontend**: Customer sees all products
- [ ] **Frontend**: Product names display correctly

---

## 🚀 Quick Test Commands

### **Check if table has data:**

```powershell
aws dynamodb scan --table-name livekart-products --region us-east-1 --output json | ConvertFrom-Json | Select-Object -ExpandProperty Count
```

### **Check if Lambda is working:**

```powershell
curl https://xocvuh6d54bc2ftmrl56ff6yue0ablnk.lambda-url.us-east-1.on.aws/
```

### **View recent CloudWatch logs:**

```powershell
aws logs tail /aws/lambda/livekart-createProduct --region us-east-1 --follow
```

---

## 📞 Still Having Issues?

1. **Check browser console** (F12) for JavaScript errors
2. **Check CloudWatch logs** for Lambda errors
3. **Check DynamoDB** to see if data was written
4. **Verify `.env` file** has correct Lambda URLs
5. **Clear browser cache** and localStorage
6. **Try incognito mode** to rule out cached data

---

## 🎉 Success Criteria

You'll know everything is working when:

1. ✅ Sign up as vendor → Role detected as "vendor"
2. ✅ Create product → Success alert shown
3. ✅ Product appears in "My Products" list
4. ✅ DynamoDB table shows the product
5. ✅ Sign in as customer → Product visible on home page
6. ✅ All 6 AWS services working (Cognito, Lambda, DynamoDB, S3, Lambda URLs, CloudWatch)

---

Good luck with your college project! 🎓
