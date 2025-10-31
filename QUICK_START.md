# ⚡ LIVEKART AWS INTEGRATION - QUICK START

## Ultra-Fast Deployment Guide (30-45 Minutes Total)

---

## 🎯 OBJECTIVE

Transform your hardcoded e-commerce app into a fully functional AWS-powered application using **5 AWS services**.

---

## 📊 AWS SERVICES USED

| Service           | Purpose                   | Status             |
| ----------------- | ------------------------- | ------------------ |
| **1. Cognito**    | User authentication       | ✅ Already working |
| **2. S3**         | Product image storage     | ✅ Bucket created  |
| **3. DynamoDB**   | Database (4 tables)       | 🔄 Setup required  |
| **4. Lambda**     | Backend API (4 functions) | 🔄 Setup required  |
| **5. CloudWatch** | Logs & monitoring         | ✅ Auto-included   |

---

## 🚀 DEPLOYMENT STEPS

### STEP 1: Create DynamoDB Tables (2 minutes)

```powershell
# Run this in PowerShell
cd "d:\Bhumik\All Projects\College projects\livekart\Live_Kart"
.\scripts\create-dynamodb-tables.ps1
```

**Creates 4 tables:**

- `livekart-products` (with category-index)
- `livekart-orders` (with user_id-index)
- `livekart-users`
- `livekart-sessions` (with TTL)

**Wait 30 seconds** for tables to become ACTIVE.

---

### STEP 2: Create Lambda Functions (10-15 minutes)

Create 4 Lambda functions in AWS Console:

#### Function 1: livekart-getProducts

```
Name: livekart-getProducts
Runtime: Node.js 18.x
Role: [Your existing role]
Code: backend/lambda/MINIMAL_FUNCTIONS/getProducts.js
Env Vars:
  AWS_REGION = us-east-1
  PRODUCTS_TABLE = livekart-products
Timeout: 30 seconds
Function URL: ENABLED (Auth: NONE, CORS: *)
```

#### Function 2: livekart-createProduct

```
Name: livekart-createProduct
Runtime: Node.js 18.x
Role: [Your existing role]
Code: backend/lambda/MINIMAL_FUNCTIONS/createProduct-simple.js
Env Vars:
  AWS_REGION = us-east-1
  PRODUCTS_TABLE = livekart-products
Timeout: 30 seconds
Function URL: ENABLED (Auth: NONE, CORS: *)
```

#### Function 3: livekart-createOrder

```
Name: livekart-createOrder
Runtime: Node.js 18.x
Role: [Your existing role]
Code: backend/lambda/MINIMAL_FUNCTIONS/createOrder-simple.js
Env Vars:
  AWS_REGION = us-east-1
  PRODUCTS_TABLE = livekart-products
  ORDERS_TABLE = livekart-orders
Timeout: 30 seconds
Function URL: ENABLED (Auth: NONE, CORS: *)
```

#### Function 4: livekart-getOrders

```
Name: livekart-getOrders
Runtime: Node.js 18.x
Role: [Your existing role]
Code: backend/lambda/MINIMAL_FUNCTIONS/getOrders-simple.js
Env Vars:
  AWS_REGION = us-east-1
  ORDERS_TABLE = livekart-orders
Timeout: 30 seconds
Function URL: ENABLED (Auth: NONE, CORS: *)
```

**SAVE ALL 4 FUNCTION URLS!** You'll need them next.

---

### STEP 3: Configure Frontend (2 minutes)

1. **Copy environment template:**

   ```powershell
   Copy-Item frontend\.env.lambda frontend\.env
   ```

2. **Edit `frontend/.env`** and add your Lambda URLs:

   ```env
   # Existing Cognito (keep as is)
   VITE_USER_POOL_ID=us-east-1_pMr6t5GFA
   VITE_USER_POOL_CLIENT_ID=2gaplvhum103s6rapucvvbv7pa
   VITE_AWS_REGION=us-east-1

   # YOUR Lambda URLs (REPLACE THESE!)
   VITE_LAMBDA_GET_PRODUCTS=https://xxxxx.lambda-url.us-east-1.on.aws/
   VITE_LAMBDA_CREATE_PRODUCT=https://yyyyy.lambda-url.us-east-1.on.aws/
   VITE_LAMBDA_CREATE_ORDER=https://zzzzz.lambda-url.us-east-1.on.aws/
   VITE_LAMBDA_GET_ORDERS=https://aaaaa.lambda-url.us-east-1.on.aws/
   ```

---

### STEP 4: Update Frontend Code (10-15 minutes)

You need to update these files to use Lambda instead of hardcoded data:

#### File 1: CustomerHome.tsx (Product Listing)

Add at the top:

```typescript
import lambdaAPI from "../utils/lambdaAPI";
```

Replace hardcoded products with:

```typescript
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadProducts();
}, []);

const loadProducts = async () => {
  try {
    const result = await lambdaAPI.getProducts();
    if (result.success) {
      setProducts(result.products);
    }
  } catch (error) {
    console.error("Error loading products:", error);
  } finally {
    setLoading(false);
  }
};
```

#### File 2: VendorDashboard.tsx (Product Creation)

Add product creation:

```typescript
const handleCreateProduct = async (formData) => {
  try {
    const result = await lambdaAPI.createProduct({
      name: formData.name,
      price: parseFloat(formData.price),
      description: formData.description,
      category: formData.category,
      imageUrl: formData.imageUrl || "",
      stock: parseInt(formData.stock) || 0,
    });

    if (result.success) {
      alert("Product created!");
      // Refresh products
    }
  } catch (error) {
    alert("Failed to create product");
  }
};
```

#### File 3: OrdersPage.tsx (View Orders)

```typescript
const [orders, setOrders] = useState([]);

useEffect(() => {
  loadOrders();
}, []);

const loadOrders = async () => {
  try {
    const result = await lambdaAPI.getOrders();
    if (result.success) {
      setOrders(result.orders);
    }
  } catch (error) {
    console.error("Error loading orders:", error);
  }
};
```

#### File 4: Checkout Flow (Create Order)

Wherever you handle checkout:

```typescript
const handleCheckout = async () => {
  try {
    const items = cartItems.map((item) => ({
      productId: item.product_id,
      quantity: item.quantity,
    }));

    const result = await lambdaAPI.createOrder({
      items,
      shippingAddress: address,
      paymentMethod: "COD",
    });

    if (result.success) {
      alert("Order placed!");
      // Clear cart, navigate to orders
    }
  } catch (error) {
    alert("Order failed");
  }
};
```

---

### STEP 5: Test Everything (5-10 minutes)

1. **Start frontend:**

   ```powershell
   cd frontend
   npm run dev
   ```

2. **Test flow:**
   - ✅ Login (Cognito - already working)
   - ✅ View products page (should be empty initially)
   - ✅ Login as vendor
   - ✅ Create a test product
   - ✅ Check DynamoDB console - product should appear
   - ✅ Logout, login as customer
   - ✅ View products - should see your product
   - ✅ Add to cart and checkout
   - ✅ Check DynamoDB orders table

---

## 🎬 DEMO PRESENTATION FLOW

### 1. Show AWS Console (5 services)

**DynamoDB:**

- Show 4 tables created
- Show sample data in products table
- Show order record

**S3:**

- Show bucket for product images
- Show uploaded images (if any)

**Cognito:**

- Show User Pool with test users
- Show user groups (customer, vendor, admin)

**Lambda:**

- Show 4 Lambda functions
- Show one function's code
- Show environment variables
- Show Function URL configuration

**CloudWatch:**

- Show logs from Lambda function execution
- Show API calls being logged

### 2. Show Application

**Customer Flow:**

1. Login with Cognito
2. Browse products (from DynamoDB)
3. Add product to cart
4. Checkout (creates order in DynamoDB)
5. View orders page (from DynamoDB)

**Vendor Flow:**

1. Login as vendor
2. Create new product (saves to DynamoDB)
3. Upload product image (to S3)
4. Product appears in customer view

### 3. Show Backend Integration

Open browser dev tools and show:

- API calls to Lambda Function URLs
- Responses from DynamoDB
- Authentication tokens from Cognito

---

## 📋 VERIFICATION CHECKLIST

Before demo:

- [ ] 4 DynamoDB tables exist and are ACTIVE
- [ ] S3 bucket exists with CORS configured
- [ ] Cognito User Pool has test users
- [ ] 4 Lambda functions deployed
- [ ] All Lambda Function URLs working
- [ ] Frontend `.env` has all Lambda URLs
- [ ] Can login (Cognito working)
- [ ] Can view products (DynamoDB read)
- [ ] Can create product (DynamoDB write)
- [ ] Can place order (DynamoDB write)
- [ ] Can view orders (DynamoDB read)

---

## 🎯 MINIMAL WORKING FEATURES

**MUST WORK:**

1. User login (Cognito) ✅
2. Product listing (DynamoDB) ✅
3. Product creation (DynamoDB) ✅
4. Order creation (DynamoDB) ✅

**NICE TO HAVE:** 5. Order viewing (DynamoDB) 6. Image upload (S3) 7. Category filtering

**CAN SKIP:**

- Product update/delete
- Order status updates
- Search functionality
- Reviews/ratings
- Email notifications
- Payment integration

---

## 🐛 COMMON ISSUES & QUICK FIXES

### Issue: CORS Error

**Fix:** Lambda Function URL → CORS settings → Allow `*` for all fields

### Issue: Empty products

**Fix:** Manually add test product in DynamoDB console or use Postman

### Issue: Timeout

**Fix:** Lambda Configuration → Increase timeout to 30 seconds

### Issue: Access Denied

**Fix:** Check IAM role has `AmazonDynamoDBFullAccess` policy

### Issue: Can't see orders

**Fix:** Check `user_id-index` GSI exists on orders table

---

## 📁 FILE STRUCTURE

```
Live_Kart/
├── backend/lambda/MINIMAL_FUNCTIONS/
│   ├── getProducts.js           ← Use this
│   ├── createProduct-simple.js  ← Use this
│   ├── createOrder-simple.js    ← Use this
│   └── getOrders-simple.js      ← Use this
│
├── frontend/
│   ├── .env                     ← Update with Lambda URLs
│   └── src/
│       ├── utils/
│       │   └── lambdaAPI.ts     ← Import and use this
│       └── pages/
│           ├── CustomerHome.tsx  ← Update
│           ├── VendorDashboard.tsx ← Update
│           └── OrdersPage.tsx    ← Update
│
├── scripts/
│   └── create-dynamodb-tables.ps1
│
├── LAMBDA_SETUP_GUIDE.md        ← Detailed Lambda steps
├── INTEGRATION_GUIDE.md         ← Code integration details
└── QUICK_START.md              ← This file
```

---

## 🚀 DEPLOYMENT TIMELINE

| Task                       | Time   | Total  |
| -------------------------- | ------ | ------ |
| Create DynamoDB tables     | 2 min  | 2 min  |
| Create Lambda function 1   | 3 min  | 5 min  |
| Create Lambda function 2   | 3 min  | 8 min  |
| Create Lambda function 3   | 3 min  | 11 min |
| Create Lambda function 4   | 3 min  | 14 min |
| Update frontend .env       | 2 min  | 16 min |
| Update CustomerHome.tsx    | 5 min  | 21 min |
| Update VendorDashboard.tsx | 5 min  | 26 min |
| Update OrdersPage.tsx      | 3 min  | 29 min |
| Update Checkout flow       | 3 min  | 32 min |
| Test everything            | 10 min | 42 min |

**Total: ~45 minutes** (with buffer)

---

## 📞 SUPPORT

If stuck, check:

1. `LAMBDA_SETUP_GUIDE.md` - Detailed Lambda creation steps
2. `INTEGRATION_GUIDE.md` - Frontend code examples
3. AWS CloudWatch Logs - See Lambda errors
4. Browser Console - See frontend errors

---

## 🎉 SUCCESS CRITERIA

Your demo is successful if you can show:

✅ 5 AWS services in AWS Console  
✅ Login with Cognito  
✅ Products displayed from DynamoDB  
✅ Create product as vendor → Saves to DynamoDB  
✅ Place order → Saves to DynamoDB  
✅ View orders from DynamoDB  
✅ CloudWatch logs showing Lambda execution

---

**GOOD LUCK! 🚀**

**Time-saving tip:** Use the `-simple.js` Lambda functions first (no JWT auth). Add authentication later if you have time.
