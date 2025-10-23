const express = require("express");
const { v4: uuidv4 } = require("uuid");

// ===== AWS IMPORTS (COMMENTED OUT FOR LOCAL DEVELOPMENT) =====
// const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
// const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
// const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
// const {
//   DynamoDBDocumentClient,
//   PutCommand,
//   ScanCommand,
//   UpdateCommand,
// } = require("@aws-sdk/lib-dynamodb");
// const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const router = express.Router();

// ===== AWS CONFIGURATION (COMMENTED OUT) =====
// const REGION = process.env.AWS_REGION || "us-east-1";
// const S3_BUCKET = process.env.S3_BUCKET || "livekart-product-images";
// const CDN_BASE = process.env.CDN_BASE || "";
// const s3 = new S3Client({ region: REGION });
// const ddb = new DynamoDBClient({ region: REGION });
// const ddbDoc = DynamoDBDocumentClient.from(ddb);
// const ses = new SESClient({ region: REGION });

// ===== MOCK IN-MEMORY DATABASE =====
let mockProducts = [
  {
    product_id: "1",
    vendor_id: "vendor1",
    title: "Premium Wireless Headphones",
    description:
      "High-quality noise-canceling wireless headphones with 30-hour battery life",
    price: 199.99,
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
    views: 245,
    category: "Electronics",
  },
  {
    product_id: "2",
    vendor_id: "vendor1",
    title: "Smart Watch Pro",
    description: "Advanced fitness tracking with heart rate monitor and GPS",
    price: 299.99,
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
    views: 189,
    category: "Electronics",
  },
  {
    product_id: "3",
    vendor_id: "vendor2",
    title: "Leather Backpack",
    description: "Premium leather backpack with laptop compartment",
    price: 149.99,
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
    views: 156,
    category: "Fashion",
  },
  {
    product_id: "4",
    vendor_id: "vendor2",
    title: "Running Shoes",
    description: "Lightweight running shoes with superior cushioning",
    price: 89.99,
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
    views: 178,
    category: "Sports",
  },
  {
    product_id: "5",
    vendor_id: "vendor3",
    title: "Coffee Maker Deluxe",
    description: "Programmable coffee maker with thermal carafe",
    price: 79.99,
    imageUrl:
      "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500",
    views: 134,
    category: "Home",
  },
  {
    product_id: "6",
    vendor_id: "vendor3",
    title: "Yoga Mat Premium",
    description: "Non-slip eco-friendly yoga mat with carrying strap",
    price: 49.99,
    imageUrl:
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500",
    views: 98,
    category: "Sports",
  },
];

// ===== MOCK S3 UPLOAD ENDPOINT =====
router.post("/sign-s3", async (req, res) => {
  const { fileName } = req.body;
  const key = `products/${Date.now()}-${fileName}`;

  // Mock response for S3 signed URL
  const mockPublicUrl = `https://via.placeholder.com/500?text=${encodeURIComponent(
    fileName
  )}`;

  res.json({
    key,
    publicUrl: mockPublicUrl,
    uploadUrl: mockPublicUrl,
    message: "Mock S3 upload - AWS integration disabled",
  });

  // ===== AWS S3 CODE (COMMENTED OUT) =====
  // const publicUrl = CDN_BASE
  //   ? `${CDN_BASE}/${key}`
  //   : `https://${S3_BUCKET}.s3.amazonaws.com/${key}`;
  // try {
  //   const command = new PutObjectCommand({
  //     Bucket: S3_BUCKET,
  //     Key: key,
  //     ContentType: req.body.contentType || "application/octet-stream",
  //   });
  //   const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
  //   res.json({ key, publicUrl, uploadUrl });
  // } catch (err) {
  //   console.error(err);
  //   res.status(500).json({ error: String(err) });
  // }
});

// ===== ADD PRODUCT ENDPOINT =====
router.post("/addProduct", async (req, res) => {
  try {
    const { title, description, price, imageUrl, vendor_id, category } =
      req.body;
    const product_id = uuidv4();
    const item = {
      product_id,
      vendor_id: vendor_id || "unknown",
      title,
      description: description || "",
      price: Number(price) || 0,
      imageUrl: imageUrl || "https://via.placeholder.com/500",
      views: 0,
      category: category || "General",
      createdAt: new Date().toISOString(),
    };

    // Mock database - add to in-memory array
    mockProducts.push(item);

    res.json({ ok: true, item, message: "Product added successfully" });

    // ===== AWS DYNAMODB CODE (COMMENTED OUT) =====
    // await ddbDoc.send(
    //   new PutCommand({
    //     TableName: process.env.DDB_TABLE || "LiveKartProducts",
    //     Item: item,
    //   })
    // );
    // res.json({ ok: true, item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

// ===== GET ALL PRODUCTS =====
router.get("/getProducts", async (req, res) => {
  try {
    // Return mock products
    res.json(mockProducts);

    // ===== AWS DYNAMODB CODE (COMMENTED OUT) =====
    // const data = await ddbDoc.send(
    //   new ScanCommand({
    //     TableName: process.env.DDB_TABLE || "LiveKartProducts",
    //   })
    // );
    // res.json(data.Items || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

// ===== PLACE ORDER ENDPOINT =====
router.post("/placeOrder", async (req, res) => {
  try {
    const { customerEmail, items, totalAmount } = req.body;

    // Mock order placement
    const orderId = uuidv4();
    console.log(`Order ${orderId} placed by ${customerEmail}:`, items);

    res.json({
      ok: true,
      orderId,
      message: "Order placed successfully! (Mock - Email not sent)",
      customerEmail,
      totalAmount,
    });

    // ===== AWS SES CODE (COMMENTED OUT) =====
    // const params = {
    //   Destination: { ToAddresses: [customerEmail] },
    //   Message: {
    //     Body: {
    //       Text: {
    //         Data: `Thanks for your order. Items: ${JSON.stringify(items)}`,
    //       },
    //     },
    //     Subject: { Data: "Order confirmation — LiveKart" },
    //   },
    //   Source: process.env.SES_SENDER || "noreply@livekart.example.com",
    // };
    // await ses.send(new SendEmailCommand(params));
    // res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

// ===== GET TRENDING PRODUCTS =====
router.get("/getTrending", async (req, res) => {
  try {
    // Return top products by views
    const trending = [...mockProducts]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 10);

    res.json(trending);

    // ===== AWS DYNAMODB CODE (COMMENTED OUT) =====
    // const data = await ddbDoc.send(
    //   new ScanCommand({
    //     TableName: process.env.DDB_TABLE || "LiveKartProducts",
    //   })
    // );
    // const items = (data.Items || [])
    //   .sort((a, b) => (b.views || 0) - (a.views || 0))
    //   .slice(0, 10);
    // res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

// ===== GET ANALYTICS (ADMIN) =====
router.get("/getAnalytics", async (req, res) => {
  try {
    const analytics = {
      totalProducts: mockProducts.length,
      totalViews: mockProducts.reduce((sum, p) => sum + (p.views || 0), 0),
      avgPrice: (
        mockProducts.reduce((sum, p) => sum + p.price, 0) / mockProducts.length
      ).toFixed(2),
      topCategory: "Electronics",
      recentProducts: mockProducts.slice(-5).reverse(),
    };
    res.json(analytics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

module.exports = router;
