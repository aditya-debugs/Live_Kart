// Lambda Function: Get All Products
// GET /products

const { scanTable, PRODUCTS_TABLE } = require("../utils/dynamodb");
const { createResponse } = require("../utils/auth");
const { getDownloadUrl } = require("../utils/s3");

exports.handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));

  try {
    // Parse query parameters for filtering/pagination
    const queryParams = event.queryStringParameters || {};
    const category = queryParams.category;
    const limit = parseInt(queryParams.limit) || 50;
    const minPrice = queryParams.minPrice
      ? parseFloat(queryParams.minPrice)
      : null;
    const maxPrice = queryParams.maxPrice
      ? parseFloat(queryParams.maxPrice)
      : null;

    // Get all products from DynamoDB
    let products = await scanTable(PRODUCTS_TABLE);

    // Filter by category if provided
    if (category) {
      products = products.filter((p) => p.category === category);
    }

    // Filter by price range if provided
    if (minPrice !== null) {
      products = products.filter((p) => p.price >= minPrice);
    }
    if (maxPrice !== null) {
      products = products.filter((p) => p.price <= maxPrice);
    }

    // Sort by views (popularity) or creation date
    const sortBy = queryParams.sortBy || "views";
    if (sortBy === "views") {
      products.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sortBy === "price-asc") {
      products.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      products.sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      products.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }

    // Limit results
    products = products.slice(0, limit);

    // Generate pre-signed URLs for images (if needed)
    // Note: If S3 bucket is public, you can skip this
    for (const product of products) {
      if (product.imageKey) {
        try {
          product.imageUrl = await getDownloadUrl(product.imageKey, 86400); // 24 hours
        } catch (err) {
          console.error("Error generating image URL:", err);
          product.imageUrl = null;
        }
      }
    }

    return createResponse(200, {
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return createResponse(500, {
      success: false,
      error: "Failed to fetch products",
      message: error.message,
    });
  }
};
