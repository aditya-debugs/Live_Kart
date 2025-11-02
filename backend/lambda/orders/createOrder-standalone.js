/**
 * AWS Lambda Function: Create Order (Standalone)
 * This function is completely self-contained with no external dependencies
 * Copy-paste this directly into AWS Lambda console
 *
 * Required Environment Variables:
 * - ORDERS_TABLE: Name of DynamoDB Orders table (default: livekart-orders)
 *
 * Required IAM Permissions:
 * - dynamodb:PutItem on Orders table
 */

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const crypto = require("crypto");

// Initialize DynamoDB client
const ddbClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

// Table name from environment or default
const ORDERS_TABLE = process.env.ORDERS_TABLE || "livekart-orders";

/**
 * Create standardized response with CORS headers
 */
function createResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Requested-With, X-Amz-Date, X-Api-Key, X-Amz-Security-Token",
      "Access-Control-Max-Age": "86400",
    },
    body: JSON.stringify(body),
  };
}

/**
 * Main Lambda handler
 */
exports.handler = async (event) => {
  console.log("=== Create Order Lambda ===");
  console.log("Full Event:", JSON.stringify(event, null, 2));

  // Extract HTTP method
  const method =
    event.requestContext?.http?.method ||
    event.httpMethod ||
    event.requestContext?.httpMethod ||
    "POST";

  console.log("HTTP Method:", method);
  console.log("Request Headers:", JSON.stringify(event.headers, null, 2));
  console.log(
    "Query Parameters:",
    JSON.stringify(event.queryStringParameters, null, 2)
  );

  // Handle OPTIONS preflight request
  if (method === "OPTIONS") {
    console.log("Handling OPTIONS preflight request");
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Requested-With, X-Amz-Date, X-Api-Key, X-Amz-Security-Token",
        "Access-Control-Max-Age": "86400",
      },
      body: "",
    };
  }

  // Only allow POST method for creating orders
  if (method !== "POST") {
    return createResponse(405, {
      success: false,
      error: "Method not allowed. Use POST to create an order.",
    });
  }

  try {
    // Parse request body
    let body;
    try {
      body =
        typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return createResponse(400, {
        success: false,
        error: "Invalid JSON in request body",
      });
    }

    console.log("Parsed body:", JSON.stringify(body, null, 2));

    // Extract user information (simplified - no JWT verification)
    const userId = body.userId || body.user_id || "guest";
    const userEmail = body.userEmail || body.user_email || "guest@example.com";

    // Extract order data
    const { items, shippingAddress, paymentMethod, totalAmount } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return createResponse(400, {
        success: false,
        error: "Order must contain at least one item",
        details: "The 'items' field must be a non-empty array",
      });
    }

    // Validate shipping address
    if (!shippingAddress || typeof shippingAddress !== "object") {
      return createResponse(400, {
        success: false,
        error: "Valid shipping address is required",
        details:
          "The 'shippingAddress' field must be an object with address details",
      });
    }

    // Calculate total if not provided
    let calculatedTotal = totalAmount || 0;
    if (!totalAmount) {
      calculatedTotal = items.reduce((sum, item) => {
        const price = parseFloat(item.price || 0);
        const quantity = parseInt(item.quantity || 1);
        return sum + price * quantity;
      }, 0);
    }

    // Generate unique order ID using crypto (built-in module)
    const orderId = crypto.randomUUID();
    const timestamp = Date.now();

    // Prepare order items with proper structure
    const orderItems = items.map((item) => ({
      productId: item.productId || item.product_id || item.id || "unknown",
      title: item.title || item.name || "Product",
      price: parseFloat(item.price || 0),
      quantity: parseInt(item.quantity || 1),
      subtotal: parseFloat(item.price || 0) * parseInt(item.quantity || 1),
      vendorId: item.vendorId || item.vendor_id || "unknown",
    }));

    // Create order object (using order_id to match DynamoDB table schema)
    const order = {
      order_id: orderId, // Primary key - using order_id to match table schema
      userId,
      userEmail,
      items: orderItems,
      totalAmount: parseFloat(calculatedTotal.toFixed(2)),
      shippingAddress: {
        street: shippingAddress.street || "",
        city: shippingAddress.city || "",
        state: shippingAddress.state || "",
        zipCode: shippingAddress.zipCode || shippingAddress.zip || "",
        country: shippingAddress.country || "USA",
      },
      paymentMethod: paymentMethod || "pending",
      status: "pending", // pending, confirmed, shipped, delivered, cancelled
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    console.log("Creating order:", JSON.stringify(order, null, 2));

    // Save order to DynamoDB
    const putCommand = new PutCommand({
      TableName: ORDERS_TABLE,
      Item: order,
    });

    console.log("Sending PutCommand to DynamoDB...");
    await ddbDocClient.send(putCommand);

    console.log("✅ Order created successfully in DynamoDB:", orderId);

    // Return success response
    return createResponse(201, {
      success: true,
      message: "Order created successfully",
      order: {
        orderId: order.order_id, // Return as orderId for consistency
        order_id: order.order_id, // Also include order_id
        userId: order.userId,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        items: order.items,
        shippingAddress: order.shippingAddress,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    console.error("Error stack:", error.stack);

    // Check for specific DynamoDB errors
    if (error.name === "ResourceNotFoundException") {
      return createResponse(500, {
        success: false,
        error: "Database table not found",
        message: `The table '${ORDERS_TABLE}' does not exist. Please create it first.`,
        details: error.message,
      });
    }

    if (error.name === "ValidationException") {
      return createResponse(400, {
        success: false,
        error: "Invalid data format",
        message: "The order data does not match the required format",
        details: error.message,
      });
    }

    // Generic error response
    return createResponse(500, {
      success: false,
      error: "Failed to create order",
      message: error.message,
      errorType: error.name,
    });
  }
};
