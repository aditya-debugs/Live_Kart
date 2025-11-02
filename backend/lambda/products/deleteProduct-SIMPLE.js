// Lambda Function: Delete Product (SIMPLIFIED - No JWT dependency)
// DELETE /products?product_id={id}
// WARNING: This version trusts the Authorization header without full verification
// Use ONLY for development/testing

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");

// Environment variables
const REGION = "us-east-1";
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE || "livekart-products";
const S3_BUCKET = process.env.S3_BUCKET || "live-kart-product-images";

// Create clients
const ddbClient = new DynamoDBClient({ region: REGION });
const ddbDoc = DynamoDBDocumentClient.from(ddbClient);
const s3Client = new S3Client({ region: REGION });

// Helper: Create HTTP response
function createResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      // CORS headers removed - handled by Function URL
    },
    body: JSON.stringify(body),
  };
}

// Helper: Extract user from token (simplified - decodes JWT without verification)
function extractUserFromToken(authHeader) {
  if (!authHeader) {
    return null;
  }

  try {
    const token = authHeader.replace("Bearer ", "");

    // Decode JWT (without verification - for development only)
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());

    // DEBUG: Log the entire payload to see what's in the token
    console.log("🔍 FULL TOKEN PAYLOAD:", JSON.stringify(payload, null, 2));

    return {
      userId: payload.sub,
      username: payload.username || payload["cognito:username"],
      groups: payload["cognito:groups"] || [],
    };
  } catch (error) {
    console.error("Error extracting user from token:", error);
    return null;
  }
}

// Helper: Get item from DynamoDB
async function getItem(tableName, key) {
  const command = new GetCommand({
    TableName: tableName,
    Key: key,
  });
  const result = await ddbDoc.send(command);
  return result.Item;
}

// Helper: Delete item from DynamoDB
async function deleteItem(tableName, key) {
  const command = new DeleteCommand({
    TableName: tableName,
    Key: key,
  });
  return await ddbDoc.send(command);
}

// Helper: Delete object from S3
async function deleteFromS3(key) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error("Error deleting from S3:", error);
    throw error;
  }
}

// Main Lambda Handler
exports.handler = async (event) => {
  console.log("📥 Event:", JSON.stringify(event, null, 2));

  // Handle OPTIONS request for CORS
  if (event.requestContext?.http?.method === "OPTIONS") {
    return createResponse(200, { message: "OK" });
  }

  try {
    // Extract user from Authorization header
    const authHeader =
      event.headers?.Authorization || event.headers?.authorization;
    const user = extractUserFromToken(authHeader);

    if (!user) {
      console.log("❌ No valid authorization token");
      return createResponse(401, {
        success: false,
        error: "Authentication required",
      });
    }

    console.log("👤 User:", user);

    // Check if user is vendor or admin (case-insensitive)
    const userGroups = user.groups.map((g) => g.toLowerCase());
    const isVendor =
      userGroups.includes("vendor") || userGroups.includes("vendors");
    const isAdmin =
      userGroups.includes("admin") || userGroups.includes("admins");

    if (!isVendor && !isAdmin) {
      return createResponse(403, {
        success: false,
        error: "Access denied. Vendors and admins only.",
      });
    }

    // Get product ID from query parameters
    const productId = event.queryStringParameters?.product_id;

    if (!productId) {
      return createResponse(400, {
        success: false,
        error: "Product ID is required",
      });
    }

    console.log("🔍 Looking for product:", productId);

    // Get existing product from DynamoDB
    const existingProduct = await getItem(PRODUCTS_TABLE, {
      product_id: productId,
    });

    if (!existingProduct) {
      console.log("❌ Product not found");
      return createResponse(404, {
        success: false,
        error: "Product not found",
      });
    }

    console.log("✅ Product found:", JSON.stringify(existingProduct, null, 2));

    // TEMPORARILY DISABLED ownership check for debugging
    console.log("⚠️ OWNERSHIP CHECK DISABLED - Any vendor can delete");
    console.log("  Product.vendor_id:", existingProduct.vendor_id);
    console.log("  Product.vendorId:", existingProduct.vendorId);
    console.log("  User.userId:", user.userId);
    console.log("  User.username:", user.username);

    // Delete product image from S3 (if exists)
    if (existingProduct.imageKey) {
      try {
        console.log("🗑️ Deleting image from S3:", existingProduct.imageKey);
        await deleteFromS3(existingProduct.imageKey);
        console.log("✅ Image deleted from S3");
      } catch (err) {
        console.error("⚠️ Error deleting image from S3:", err);
        // Continue even if image deletion fails
      }
    } else {
      console.log("ℹ️ No image to delete");
    }

    // Delete product from DynamoDB
    console.log("🗑️ Deleting product from DynamoDB...");
    await deleteItem(PRODUCTS_TABLE, { product_id: productId });
    console.log("✅ Product deleted from DynamoDB");

    return createResponse(200, {
      success: true,
      message: "Product deleted successfully",
      product_id: productId,
    });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    return createResponse(500, {
      success: false,
      error: "Failed to delete product",
      message: error.message,
      stack: error.stack,
    });
  }
};
