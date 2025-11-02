/**
 * Update User Profile Lambda Function
 *
 * Updates user profile data in DynamoDB livekart-users table
 *
 * Method: PUT/POST
 * Auth: Required (JWT token)
 * Body: { name, phoneNumber, address, notificationPreferences, ... }
 */

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  UpdateCommand,
  GetCommand,
} = require("@aws-sdk/lib-dynamodb");

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const USERS_TABLE = process.env.USERS_TABLE || "livekart-users";

/**
 * Create CORS response helper
 */
function createCORSResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Requested-With, Accept, Origin",
      "Access-Control-Allow-Credentials": "true",
    },
    body: JSON.stringify(body),
  };
}

/**
 * Extract user ID from JWT token
 */
function getUserIdFromToken(event) {
  try {
    const authHeader =
      event.headers?.Authorization || event.headers?.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    return payload.sub; // Cognito user ID
  } catch (error) {
    console.error("Failed to extract user ID from token:", error);
    return null;
  }
}

/**
 * Main Lambda Handler
 */
exports.handler = async (event) => {
  console.log("Update User Profile Event:", JSON.stringify(event, null, 2));

  // Handle OPTIONS preflight request
  if (
    event.requestContext?.http?.method === "OPTIONS" ||
    event.httpMethod === "OPTIONS"
  ) {
    return createCORSResponse(200, { message: "OK" });
  }

  try {
    // Get user ID from token
    const userId = getUserIdFromToken(event);

    if (!userId) {
      return createCORSResponse(401, {
        success: false,
        error: "Unauthorized - No valid authentication token",
      });
    }

    // Parse request body
    const body =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;

    // Validate that user exists first
    const getCommand = new GetCommand({
      TableName: USERS_TABLE,
      Key: { user_id: userId },
    });

    const existingUser = await docClient.send(getCommand);
    if (!existingUser.Item) {
      return createCORSResponse(404, {
        success: false,
        error: "User not found",
      });
    }

    // Build update expression dynamically
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    // Allowed fields to update
    const allowedFields = [
      "name",
      "phoneNumber",
      "phone",
      "address",
      "profileImage",
      "notificationPreferences",
      "wishlist",
      "cart",
    ];

    // Handle phone vs phoneNumber field name
    if (body.phone && !body.phoneNumber) {
      body.phoneNumber = body.phone;
    }

    // Build update expression for each field
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateExpressions.push(`#${field} = :${field}`);
        expressionAttributeNames[`#${field}`] = field;
        expressionAttributeValues[`:${field}`] = body[field];
      }
    });

    // Always update the updatedAt timestamp
    updateExpressions.push(`#updatedAt = :updatedAt`);
    expressionAttributeNames["#updatedAt"] = "updatedAt";
    expressionAttributeValues[":updatedAt"] = new Date().toISOString();

    if (updateExpressions.length === 1) {
      // Only updatedAt, nothing else to update
      return createCORSResponse(400, {
        success: false,
        error: "No valid fields to update",
      });
    }

    // Execute update
    const updateCommand = new UpdateCommand({
      TableName: USERS_TABLE,
      Key: { user_id: userId },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    });

    const result = await docClient.send(updateCommand);

    console.log("✅ User profile updated:", userId);

    return createCORSResponse(200, {
      success: true,
      message: "Profile updated successfully",
      user: result.Attributes,
    });
  } catch (error) {
    console.error("❌ Error updating user profile:", error);

    return createCORSResponse(500, {
      success: false,
      error: "Failed to update user profile",
      message: error.message,
    });
  }
};
