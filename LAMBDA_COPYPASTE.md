# 📋 Copy-Paste Lambda Functions for Learner Academy

## Quick Guide: How to Update Your Lambda Functions

For each function below:

1. Open your Lambda function in AWS Console
2. Delete all existing code
3. Copy the entire code block below
4. Paste into the code editor
5. Add environment variables (shown for each function)
6. Click **Deploy**
7. Test with the test event provided

---

## 1️⃣ getProducts Function

### Code:

```javascript
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");

const REGION = process.env.AWS_REGION || "us-east-1";
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE || "Products";
const S3_BUCKET = process.env.S3_BUCKET;

const ddbClient = new DynamoDBClient({ region: REGION });
const ddbDoc = DynamoDBDocumentClient.from(ddbClient);

exports.handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));

  try {
    const queryParams = event.queryStringParameters || {};
    const category = queryParams.category;
    const limit = parseInt(queryParams.limit) || 50;

    const command = new ScanCommand({
      TableName: PRODUCTS_TABLE,
    });

    const result = await ddbDoc.send(command);
    let products = result.Items || [];

    if (category) {
      products = products.filter((p) => p.category === category);
    }

    products.sort((a, b) => (b.views || 0) - (a.views || 0));
    products = products.slice(0, limit);

    for (const product of products) {
      if (product.imageKey) {
        product.imageUrl = `https://${S3_BUCKET}.s3.${REGION}.amazonaws.com/${product.imageKey}`;
      }
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: true,
        count: products.length,
        products,
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};
```

### Environment Variables:

```
AWS_REGION = us-east-1
PRODUCTS_TABLE = Products
S3_BUCKET = your-bucket-name
```

### Test Event:

```json
{
  "queryStringParameters": {
    "limit": "10"
  }
}
```

---

## 2️⃣ getProduct Function (Single Product)

### Code:

```javascript
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");

const REGION = process.env.AWS_REGION || "us-east-1";
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE || "Products";
const S3_BUCKET = process.env.S3_BUCKET;

const ddbClient = new DynamoDBClient({ region: REGION });
const ddbDoc = DynamoDBDocumentClient.from(ddbClient);

exports.handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));

  try {
    const productId = event.pathParameters?.id;

    if (!productId) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          success: false,
          error: "Product ID is required",
        }),
      };
    }

    const getCommand = new GetCommand({
      TableName: PRODUCTS_TABLE,
      Key: { productId },
    });

    const result = await ddbDoc.send(getCommand);
    const product = result.Item;

    if (!product) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          success: false,
          error: "Product not found",
        }),
      };
    }

    // Increment view counter
    try {
      await ddbDoc.send(
        new UpdateCommand({
          TableName: PRODUCTS_TABLE,
          Key: { productId },
          UpdateExpression: "ADD #views :inc",
          ExpressionAttributeNames: { "#views": "views" },
          ExpressionAttributeValues: { ":inc": 1 },
        })
      );
      product.views = (product.views || 0) + 1;
    } catch (err) {
      console.error("Error incrementing views:", err);
    }

    if (product.imageKey) {
      product.imageUrl = `https://${S3_BUCKET}.s3.${REGION}.amazonaws.com/${product.imageKey}`;
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: true,
        product,
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};
```

### Environment Variables:

```
AWS_REGION = us-east-1
PRODUCTS_TABLE = Products
S3_BUCKET = your-bucket-name
```

### Test Event:

```json
{
  "pathParameters": {
    "id": "test-product-id"
  }
}
```

---

## 3️⃣ createProduct Function

### Code:

```javascript
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const REGION = process.env.AWS_REGION || "us-east-1";
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE || "Products";

const ddbClient = new DynamoDBClient({ region: REGION });
const ddbDoc = DynamoDBDocumentClient.from(ddbClient);

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

exports.handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));

  try {
    // Parse body
    const body =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const { title, description, price, category, imageKey, stock } = body;

    // Validate
    if (!title || !price || !category) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          success: false,
          error: "Missing required fields: title, price, category",
        }),
      };
    }

    if (typeof price !== "number" || price <= 0) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          success: false,
          error: "Price must be a positive number",
        }),
      };
    }

    // Create product
    const product = {
      productId: generateId(),
      title: title.trim(),
      description: description?.trim() || "",
      price: parseFloat(price),
      category: category.trim(),
      imageKey: imageKey || null,
      stock: stock || 0,
      views: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Save to DynamoDB
    await ddbDoc.send(
      new PutCommand({
        TableName: PRODUCTS_TABLE,
        Item: product,
      })
    );

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: true,
        message: "Product created successfully",
        product,
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};
```

### Environment Variables:

```
AWS_REGION = us-east-1
PRODUCTS_TABLE = Products
```

### Test Event:

```json
{
  "body": "{\"title\":\"Test Product\",\"description\":\"A test product\",\"price\":29.99,\"category\":\"Electronics\",\"stock\":100}"
}
```

---

## 4️⃣ getUploadUrl Function (S3 Pre-signed URL)

### Code:

```javascript
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const REGION = process.env.AWS_REGION || "us-east-1";
const S3_BUCKET = process.env.S3_BUCKET;

const s3Client = new S3Client({ region: REGION });

function generateKey(filename) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = filename.split(".").pop();
  return `products/${timestamp}-${random}.${ext}`;
}

exports.handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));

  try {
    const body =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const { filename, contentType } = body;

    if (!filename) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          success: false,
          error: "Filename is required",
        }),
      };
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    const finalContentType = contentType || "image/jpeg";

    if (!allowedTypes.includes(finalContentType)) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          success: false,
          error: "Invalid content type. Only images allowed.",
        }),
      };
    }

    const key = generateKey(filename);

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: finalContentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: true,
        uploadUrl,
        key,
        imageUrl: `https://${S3_BUCKET}.s3.${REGION}.amazonaws.com/${key}`,
        expiresIn: 300,
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};
```

### Environment Variables:

```
AWS_REGION = us-east-1
S3_BUCKET = your-bucket-name
```

### Test Event:

```json
{
  "body": "{\"filename\":\"product.jpg\",\"contentType\":\"image/jpeg\"}"
}
```

---

## 🎯 Quick Setup Checklist

For each function:

- [ ] Copy code from above
- [ ] Paste into Lambda Console
- [ ] Add environment variables
- [ ] Click **Deploy**
- [ ] Run test event
- [ ] Verify success response
- [ ] Enable Function URL (Configuration → Function URL)
- [ ] Enable CORS on Function URL

---

## 📝 All Environment Variables Summary

```
AWS_REGION = us-east-1
PRODUCTS_TABLE = Products
ORDERS_TABLE = Orders
S3_BUCKET = your-actual-bucket-name-here
```

---

## ✅ After Updating All Functions

Test each Function URL in your browser or Postman:

```
GET  https://YOUR_FUNCTION_URL.lambda-url.us-east-1.on.aws/
POST https://YOUR_FUNCTION_URL.lambda-url.us-east-1.on.aws/
```

**Next:** Update your React frontend to use these Function URLs!
