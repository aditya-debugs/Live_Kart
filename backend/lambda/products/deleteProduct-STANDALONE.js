// Lambda Function: Delete Product (STANDALONE - Copy this ENTIRE code to AWS Lambda)
// DELETE /products?product_id={id}
// No external dependencies - all code included

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { CognitoJwtVerifier } = require("aws-jwt-verify");

// Environment variables
const REGION = process.env.AWS_REGION || "us-east-1";
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE || "livekart-products";
const S3_BUCKET = process.env.S3_BUCKET || "live-kart-product-images";
const USER_POOL_ID = process.env.USER_POOL_ID || "us-east-1_pMr6t5GFA";
const CLIENT_ID = process.env.CLIENT_ID || "2gaplvhum103s6rapucvvbv7pa";

// Create clients
const ddbClient = new DynamoDBClient({ region: REGION });
const ddbDoc = DynamoDBDocumentClient.from(ddbClient);
const s3Client = new S3Client({ region: REGION });

// Create JWT verifier
const verifier = CognitoJwtVerifier.create({
  userPoolId: USER_POOL_ID,
  tokenUse: "access",
  clientId: CLIENT_ID,
});

// Helper: Create HTTP response
function createResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
    body: JSON.stringify(body),
  };
}

// Helper: Authenticate user
async function authenticate(event, allowedGroups = []) {
  try {
    // Extract token from Authorization header
    const authHeader =
      event.headers?.Authorization || event.headers?.authorization;

    if (!authHeader) {
      return {
        success: false,
        statusCode: 401,
        error: "No authorization token provided",
      };
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify JWT token
    const payload = await verifier.verify(token);

    // Extract user info
    const userId = payload.sub;
    const username = payload.username;
    const groups = payload["cognito:groups"] || [];

    // Check if user belongs to allowed groups
    if (allowedGroups.length > 0) {
      const hasPermission = groups.some((group) =>
        allowedGroups.includes(group)
      );
      if (!hasPermission) {
        return {
          success: false,
          statusCode: 403,
          error: `Access denied. Requires one of: ${allowedGroups.join(", ")}`,
        };
      }
    }

    return {
      success: true,
      user: { userId, username, groups },
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      success: false,
      statusCode: 401,
      error: "Invalid or expired token",
    };
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
  const command = new DeleteObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  });
  await s3Client.send(command);
  return true;
}

// Main Lambda Handler
exports.handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));

  try {
    // Authenticate and authorize (vendors and admins only)
    const auth = await authenticate(event, ["vendor", "admin"]);
    if (!auth.success) {
      return createResponse(auth.statusCode, {
        success: false,
        error: auth.error,
      });
    }

    // Get product ID from query parameters (Function URL style)
    const productId = event.queryStringParameters?.product_id;

    if (!productId) {
      return createResponse(400, {
        success: false,
        error: "Product ID is required",
      });
    }

    console.log("🔍 Looking for product:", productId);

    // Get existing product
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

    console.log("✅ Product found:", existingProduct);

    // Check ownership (vendors can only delete their own products)
    const isAdmin =
      auth.user.groups?.includes("admin") ||
      auth.user.groups?.includes("admins");
    const isOwner =
      existingProduct.vendor_id === auth.user.userId ||
      existingProduct.vendor_id === auth.user.username ||
      existingProduct.vendorId === auth.user.userId ||
      existingProduct.vendorId === auth.user.username;

    console.log("👤 Auth check - isAdmin:", isAdmin, "isOwner:", isOwner);
    console.log(
      "👤 Product vendor_id:",
      existingProduct.vendor_id,
      "User ID:",
      auth.user.userId
    );

    if (!isAdmin && !isOwner) {
      return createResponse(403, {
        success: false,
        error: "You can only delete your own products",
      });
    }

    // Delete product image from S3 (if exists)
    if (existingProduct.imageKey) {
      try {
        await deleteFromS3(existingProduct.imageKey);
        console.log(
          "✅ Deleted product image from S3:",
          existingProduct.imageKey
        );
      } catch (err) {
        console.error("⚠️ Error deleting image from S3:", err);
        // Continue even if image deletion fails
      }
    }

    // Delete product from DynamoDB
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
