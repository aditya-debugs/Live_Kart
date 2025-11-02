/**
 * AWS Lambda Function: Get Orders (Standalone)
 * This function is completely self-contained with no external dependencies
 * Copy-paste this directly into AWS Lambda console
 *
 * Required Environment Variables:
 * - ORDERS_TABLE: Name of DynamoDB Orders table (default: livekart-orders)
 *
 * Required IAM Permissions:
 * - dynamodb:Scan on Orders table
 * - dynamodb:Query on Orders table (if using GSI)
 */

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  ScanCommand,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");

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
  console.log("=== Get Orders Lambda ===");
  console.log("Full Event:", JSON.stringify(event, null, 2));

  // Extract HTTP method
  const method =
    event.requestContext?.http?.method ||
    event.httpMethod ||
    event.requestContext?.httpMethod ||
    "GET";

  console.log("HTTP Method:", method);
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
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Requested-With, X-Amz-Date, X-Api-Key, X-Amz-Security-Token",
        "Access-Control-Max-Age": "86400",
      },
      body: "",
    };
  }

  // Only allow GET method
  if (method !== "GET") {
    return createResponse(405, {
      success: false,
      error: "Method not allowed. Use GET to retrieve orders.",
    });
  }

  try {
    // Extract query parameters
    const queryParams = event.queryStringParameters || {};
    console.log("Query parameters:", JSON.stringify(queryParams, null, 2));

    const userId = queryParams.userId || queryParams.user_id;
    const status = queryParams.status;
    const limit = parseInt(queryParams.limit || "100");

    console.log(
      "Filters - userId:",
      userId,
      "status:",
      status,
      "limit:",
      limit
    );

    let orders = [];

    // If userId is provided, we need to scan and filter
    // Note: For production, create a GSI (Global Secondary Index) on userId for better performance
    if (userId) {
      console.log("Scanning orders for userId:", userId);

      const scanCommand = new ScanCommand({
        TableName: ORDERS_TABLE,
        FilterExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
        Limit: limit,
      });

      const result = await ddbDocClient.send(scanCommand);
      orders = result.Items || [];

      // If status filter is also provided, filter further
      if (status) {
        orders = orders.filter((order) => order.status === status);
      }
    } else if (status) {
      // Filter by status only
      console.log("Scanning orders for status:", status);

      const scanCommand = new ScanCommand({
        TableName: ORDERS_TABLE,
        FilterExpression: "#status = :status",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":status": status,
        },
        Limit: limit,
      });

      const result = await ddbDocClient.send(scanCommand);
      orders = result.Items || [];
    } else {
      // Get all orders (with limit)
      console.log("Scanning all orders with limit:", limit);

      const scanCommand = new ScanCommand({
        TableName: ORDERS_TABLE,
        Limit: limit,
      });

      const result = await ddbDocClient.send(scanCommand);
      orders = result.Items || [];
    }

    // Sort orders by createdAt (newest first)
    orders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    console.log(`Found ${orders.length} orders`);

    // Return success response
    return createResponse(200, {
      success: true,
      count: orders.length,
      orders: orders.map((order) => ({
        orderId: order.order_id || order.orderId, // Support both field names
        order_id: order.order_id || order.orderId,
        userId: order.userId,
        userEmail: order.userEmail,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items || [],
        shippingAddress: order.shippingAddress || {},
        paymentMethod: order.paymentMethod,
      })),
      filters: {
        userId: userId || null,
        status: status || null,
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
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
        error: "Invalid query parameters",
        message: "The query parameters are not valid",
        details: error.message,
      });
    }

    // Generic error response
    return createResponse(500, {
      success: false,
      error: "Failed to fetch orders",
      message: error.message,
      errorType: error.name,
    });
  }
};
