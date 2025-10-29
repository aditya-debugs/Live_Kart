# ⚡ Lambda Functions - Super Quick Start

## 🎯 What You Need to Do

Create **8 Lambda functions** in AWS Console. Each one takes 5-10 minutes.

**Your existing setup:**

- ✅ DynamoDB tables: Products, Orders, Users, Sessions
- ✅ S3 bucket (for images)
- ❌ Lambda functions (we'll create these now!)
- ⚠️ AWS Academy/Educate account (can't create IAM roles, will use existing ones)

---

## 🔥 The 5-Minute Per Function Process

### Same Steps for All 8 Functions:

1. **Create** → Author from scratch → Node.js 18.x → Use existing role (LabRole) ✅
2. **Code** → Delete default → Paste from LAMBDA_COPYPASTE.md → Deploy
3. **Config** → Environment Variables → Add them
4. **Permissions** → Try to add DynamoDB + S3 policies (might already have them!)
5. **Function URL** → Create → Auth=NONE, CORS=enabled
6. **Test** → Should see success!
7. **Save** the Function URL

---

## 📋 All 8 Functions at a Glance

| Function        | Env Variables                            | IAM Policies | Code Source                              |
| --------------- | ---------------------------------------- | ------------ | ---------------------------------------- |
| `getProducts`   | AWS_REGION, PRODUCTS_TABLE, S3_BUCKET    | DynamoDB, S3 | LAMBDA_COPYPASTE.md #1                   |
| `getProduct`    | AWS_REGION, PRODUCTS_TABLE, S3_BUCKET    | DynamoDB, S3 | LAMBDA_COPYPASTE.md #2                   |
| `createProduct` | AWS_REGION, PRODUCTS_TABLE               | DynamoDB     | LAMBDA_COPYPASTE.md #3                   |
| `updateProduct` | AWS_REGION, PRODUCTS_TABLE               | DynamoDB     | backend/lambda/products/updateProduct.js |
| `deleteProduct` | AWS_REGION, PRODUCTS_TABLE, S3_BUCKET    | DynamoDB, S3 | backend/lambda/products/deleteProduct.js |
| `getUploadUrl`  | AWS_REGION, S3_BUCKET                    | S3           | LAMBDA_COPYPASTE.md #4                   |
| `createOrder`   | AWS_REGION, PRODUCTS_TABLE, ORDERS_TABLE | DynamoDB     | backend/lambda/orders/createOrder.js     |
| `getOrders`     | AWS_REGION, ORDERS_TABLE                 | DynamoDB     | backend/lambda/orders/getOrders.js       |

**Replace these values:**

- `AWS_REGION` → `us-east-1`
- `PRODUCTS_TABLE` → `Products`
- `ORDERS_TABLE` → `Orders`
- `S3_BUCKET` → Your actual S3 bucket name

---

## 🚀 Create Function #1 (getProducts)

### In AWS Lambda Console:

1. Click **Create function**
2. Name: `getProducts`
3. Runtime: `Node.js 18.x`
4. Permissions:
   - Click "Change default execution role"
   - Select **"Use an existing role"**
   - Choose: `LabRole` (or `lambda-basic-execution` if no LabRole)
5. **Create function**

### Add Code:

1. Delete default code
2. Copy from **LAMBDA_COPYPASTE.md → Section 1**
3. Paste
4. **Deploy**

### Environment Variables:

1. Configuration → Environment variables → Edit
2. Add:
   - `AWS_REGION` = `us-east-1`
   - `PRODUCTS_TABLE` = `Products`
   - `S3_BUCKET` = `your-bucket-name`
3. **Save**

### IAM Permissions (Try This, Might Skip):

🎓 **AWS Academy Note:** You might not be able to edit IAM. That's OK! LabRole usually has permissions already.

**If you CAN edit:**

1. Configuration → Permissions → Click role name
2. Add permissions → Attach policies
3. Add: `AmazonDynamoDBFullAccess`
4. Add: `AmazonS3FullAccess`

**If you CAN'T edit (button grayed out):**

- Skip this step! LabRole likely has permissions
- Test the function in next steps
- If you get AccessDenied error, see AWS_LAMBDA_CONSOLE_GUIDE.md Part 4.5

### Function URL:

1. Configuration → Function URL → Create
2. Auth: `NONE`
3. Check ✅ Configure CORS
4. Allow origin: `*`
5. Allow methods: All
6. **Save**
7. **Copy the URL!**

### Test:

Open URL in browser → Should see:

```json
{ "success": true, "count": 0, "products": [] }
```

✅ **Function #1 Done!**

---

## 🔁 Repeat for Functions #2-8

Same process, just change:

- Function name
- Code (from table above)
- Environment variables (from table above)
- IAM policies (DynamoDB and/or S3)

---

## 💾 Save All URLs

```
getProducts: https://_____.lambda-url.us-east-1.on.aws/
getProduct: https://_____.lambda-url.us-east-1.on.aws/
createProduct: https://_____.lambda-url.us-east-1.on.aws/
updateProduct: https://_____.lambda-url.us-east-1.on.aws/
deleteProduct: https://_____.lambda-url.us-east-1.on.aws/
getUploadUrl: https://_____.lambda-url.us-east-1.on.aws/
createOrder: https://_____.lambda-url.us-east-1.on.aws/
getOrders: https://_____.lambda-url.us-east-1.on.aws/
```

---

## 🆘 Common Issues

| Issue                | Fix                             |
| -------------------- | ------------------------------- |
| "Cannot find module" | Use Node.js 18.x runtime        |
| "AccessDenied"       | Add IAM policies (DynamoDB/S3)  |
| "CORS error"         | Enable CORS on Function URL     |
| Empty products       | Normal! Use createProduct first |

---

## 📚 Need More Details?

See **AWS_LAMBDA_CONSOLE_GUIDE.md** for full step-by-step with explanations!

---

**Total time: 1-2 hours for all 8 functions** ⏱️
