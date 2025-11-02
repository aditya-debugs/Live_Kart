/**
 * Get User Profile Lambda Function
 *
 * Fetches user profile data from DynamoDB livekart-users table
 *
 * Method: GET
 * Auth: Required (JWT token)
 * Query Params: ?userId=xxx (optional, defaults to logged-in user)
 */

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

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
  console.log("Get User Profile Event:", JSON.stringify(event, null, 2));

  // Handle OPTIONS preflight request
  if (
    event.requestContext?.http?.method === "OPTIONS" ||
    event.httpMethod === "OPTIONS"
  ) {
    return createCORSResponse(200, { message: "OK" });
  }

  try {
    // Get user ID from token or query parameter
    const tokenUserId = getUserIdFromToken(event);
    const queryUserId = event.queryStringParameters?.userId;

    // Use query param if provided, otherwise use token
    const userId = queryUserId || tokenUserId;

    if (!userId) {
      return createCORSResponse(401, {
        success: false,
        error: "Unauthorized - No valid user ID found",
      });
    }

    // Fetch user from DynamoDB
    const getCommand = new GetCommand({
      TableName: USERS_TABLE,
      Key: {
        user_id: userId,
      },
    });

    const response = await docClient.send(getCommand);

    if (!response.Item) {
      return createCORSResponse(404, {
        success: false,
        error: "User not found",
      });
    }

    // Remove sensitive fields before sending
    const userProfile = { ...response.Item };

    console.log("✅ User profile retrieved:", userId);

    return createCORSResponse(200, {
      success: true,
      user: userProfile,
    });
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);

    return createCORSResponse(500, {
      success: false,
      error: "Failed to fetch user profile",
      message: error.message,
    });
  }
};
