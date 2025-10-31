# 🚀 COMPLETE INTEGRATION GUIDE

## From Hardcoded Data to AWS Lambda + DynamoDB

---

## 📋 WHAT YOU'VE DONE SO FAR

✅ Cognito authentication (working)  
✅ S3 bucket created  
✅ DynamoDB tables created (4 tables)  
✅ Lambda functions code ready

---

## ⚡ ULTRA-FAST INTEGRATION (30 MINUTES)

### PHASE 1: Deploy Lambda Functions (15 min)

1. **Run DynamoDB table creation script:**

   ```powershell
   cd "d:\Bhumik\All Projects\College projects\livekart\Live_Kart"
   .\scripts\create-dynamodb-tables.ps1
   ```

   Wait 30 seconds for tables to become ACTIVE.

2. **Create 4 Lambda functions in AWS Console:**

   Follow `LAMBDA_SETUP_GUIDE.md` to create:

   - `livekart-getProducts` (SIMPLE version - no auth)
   - `livekart-createProduct` (SIMPLE version - no auth)
   - `livekart-createOrder` (SIMPLE version - no auth)
   - `livekart-getOrders` (SIMPLE version - no auth)

   **Use the `-simple.js` versions for fastest deployment!**

   Files to copy:

   - `backend/lambda/MINIMAL_FUNCTIONS/getProducts.js`
   - `backend/lambda/MINIMAL_FUNCTIONS/createProduct-simple.js`
   - `backend/lambda/MINIMAL_FUNCTIONS/createOrder-simple.js`
   - `backend/lambda/MINIMAL_FUNCTIONS/getOrders-simple.js`

3. **Save all 4 Function URLs**

---

### PHASE 2: Update Frontend (5 min)

1. **Copy `.env.lambda` to `.env`:**

   ```powershell
   Copy-Item frontend\.env.lambda frontend\.env
   ```

2. **Edit `frontend/.env` and add your Lambda URLs:**

   ```env
   VITE_LAMBDA_GET_PRODUCTS=https://your-url-1.lambda-url.us-east-1.on.aws/
   VITE_LAMBDA_CREATE_PRODUCT=https://your-url-2.lambda-url.us-east-1.on.aws/
   VITE_LAMBDA_CREATE_ORDER=https://your-url-3.lambda-url.us-east-1.on.aws/
   VITE_LAMBDA_GET_ORDERS=https://your-url-4.lambda-url.us-east-1.on.aws/
   ```

3. **Update product listing page to use Lambda API:**

   Open `frontend/src/pages/CustomerHome.tsx` and replace hardcoded data.

4. **Update vendor dashboard to use Lambda API:**

   Open `frontend/src/pages/VendorDashboard.tsx` for product creation.

5. **Update orders page:**

   Open `frontend/src/pages/OrdersPage.tsx` to fetch from Lambda.

---

### PHASE 3: Test (10 min)

1. **Start frontend:**

   ```powershell
   cd frontend
   npm run dev
   ```

2. **Test product listing:**

   - Go to http://localhost:5173
   - Should load (empty at first, no products yet)

3. **Test product creation:**

   - Login as vendor
   - Add a test product
   - Check DynamoDB console - product should appear

4. **Test order creation:**
   - Add product to cart
   - Checkout
   - Check DynamoDB orders table

---

## 📝 FILES THAT NEED CHANGES

### Frontend Files to Update:

1. **`frontend/src/pages/CustomerHome.tsx`**

   - Replace hardcoded products with Lambda API call
   - Use `lambdaAPI.getProducts()`

2. **`frontend/src/pages/VendorDashboard.tsx`**

   - Replace mock product creation
   - Use `lambdaAPI.createProduct()`

3. **`frontend/src/pages/OrdersPage.tsx`**

   - Replace hardcoded orders
   - Use `lambdaAPI.getOrders()`

4. **Cart/Checkout Flow:**
   - Update checkout to call `lambdaAPI.createOrder()`

---

## 🔧 QUICK CODE SNIPPETS

### 1. CustomerHome.tsx - Load Products from Lambda

```typescript
import { useEffect, useState } from "react";
import lambdaAPI from "../utils/lambdaAPI";

const CustomerHome = () => {
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
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading products...</div>;

  return (
    <div>
      {products.map((product) => (
        <ProductCard key={product.product_id} product={product} />
      ))}
    </div>
  );
};
```

### 2. VendorDashboard.tsx - Create Product

```typescript
import lambdaAPI from "../utils/lambdaAPI";

const handleCreateProduct = async (productData) => {
  try {
    const result = await lambdaAPI.createProduct({
      name: productData.name,
      price: parseFloat(productData.price),
      description: productData.description,
      category: productData.category,
      imageUrl: productData.imageUrl || "",
      stock: parseInt(productData.stock) || 0,
    });

    if (result.success) {
      alert("Product created successfully!");
      // Refresh product list
    }
  } catch (error) {
    alert("Failed to create product");
  }
};
```

### 3. Checkout - Create Order

```typescript
import lambdaAPI from "../utils/lambdaAPI";

const handleCheckout = async (cartItems, shippingAddress) => {
  try {
    const items = cartItems.map((item) => ({
      productId: item.product_id,
      quantity: item.quantity,
    }));

    const result = await lambdaAPI.createOrder({
      items,
      shippingAddress,
      paymentMethod: "COD",
    });

    if (result.success) {
      alert("Order placed successfully!");
      // Clear cart, redirect to orders page
    }
  } catch (error) {
    alert("Failed to place order");
  }
};
```

### 4. OrdersPage.tsx - Load Orders

```typescript
import { useEffect, useState } from "react";
import lambdaAPI from "../utils/lambdaAPI";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {orders.map((order) => (
        <OrderCard key={order.order_id} order={order} />
      ))}
    </div>
  );
};
```

---

## 🎯 PRIORITIZATION (Limited Time)

### MUST HAVE (Core Demo):

1. ✅ Product listing from DynamoDB
2. ✅ Product creation (vendor)
3. ✅ Order creation
4. ✅ User authentication (already done)

### NICE TO HAVE (If Time):

5. Order viewing
6. S3 image upload
7. Product categories filter

### SKIP FOR NOW:

- Product update/delete
- Order status updates
- Reviews/ratings
- Admin dashboard
- Email notifications (no SES)

---

## 🐛 TROUBLESHOOTING

### Issue: Lambda returns CORS error

**Fix:** Check Function URL has CORS enabled with `*` for all fields.

### Issue: Empty products array

**Fix:**

1. Manually add test product in DynamoDB console
2. Or use Postman to call createProduct Lambda directly

### Issue: "Cannot read property of undefined"

**Fix:** Check Lambda environment variables are set correctly.

### Issue: Orders not showing

**Fix:** Check userId is being passed correctly in query parameter.

---

## 📊 TESTING CHECKLIST

- [ ] DynamoDB tables created and ACTIVE
- [ ] 4 Lambda functions deployed
- [ ] All Lambda Function URLs saved
- [ ] Frontend `.env` updated with URLs
- [ ] Frontend starts without errors
- [ ] Can view products (even if empty)
- [ ] Can create product as vendor
- [ ] Product appears in DynamoDB
- [ ] Can place order
- [ ] Order appears in DynamoDB

---

## 🎉 DEMO SCRIPT

1. **Show AWS Console:**

   - DynamoDB tables (4 tables)
   - S3 bucket
   - Cognito User Pool
   - Lambda functions (4 functions)
   - CloudWatch logs

2. **Show Frontend:**

   - Login with Cognito
   - Create product (vendor)
   - View products list
   - Place order
   - View orders

3. **Show DynamoDB:**
   - Products table with data
   - Orders table with data

**5 AWS Services Used:**

1. Cognito ✅
2. DynamoDB ✅
3. S3 ✅
4. Lambda ✅
5. CloudWatch ✅

---

## 📌 NEXT STEPS AFTER SUBMISSION

If you have more time later:

1. Add JWT authentication to Lambda functions
2. Implement S3 direct upload for images
3. Add product update/delete
4. Add order status tracking
5. Deploy frontend to S3 + CloudFront
6. Add API Gateway (instead of Function URLs)

---

**Good luck! 🚀**
