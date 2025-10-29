// Lambda Function: Get Single Product
// GET /products/{id}

const {
  getItem,
  incrementCounter,
  PRODUCTS_TABLE,
} = require("../utils/dynamodb");
const { createResponse } = require("../utils/auth");
const { getDownloadUrl } = require("../utils/s3");

exports.handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));

  try {
    // Get product ID from path parameters
    const productId = event.pathParameters?.id;

    if (!productId) {
      return createResponse(400, {
        success: false,
        error: "Product ID is required",
      });
    }

    // Get product from DynamoDB
    const product = await getItem(PRODUCTS_TABLE, { product_id: productId });

    if (!product) {
      return createResponse(404, {
        success: false,
        error: "Product not found",
      });
    }

    // Increment view counter
    try {
      await incrementCounter(
        PRODUCTS_TABLE,
        { product_id: productId },
        "views"
      );
      product.views = (product.views || 0) + 1;
    } catch (err) {
      console.error("Error incrementing views:", err);
      // Continue even if view increment fails
    }

    // Generate pre-signed URL for image
    if (product.imageKey) {
      try {
        product.imageUrl = await getDownloadUrl(product.imageKey, 86400); // 24 hours
      } catch (err) {
        console.error("Error generating image URL:", err);
        product.imageUrl = null;
      }
    }

    return createResponse(200, {
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return createResponse(500, {
      success: false,
      error: "Failed to fetch product",
      message: error.message,
    });
  }
};
