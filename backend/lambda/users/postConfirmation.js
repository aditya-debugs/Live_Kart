/**
 * Cognito Post-Confirmation Trigger
 *
 * This Lambda function is automatically triggered by Cognito AFTER a user
 * confirms their email. It adds the user to the DynamoDB users table.
 *
 * Trigger: Post Confirmation
 * Event: When user confirms signup via email verification code
 */

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const USERS_TABLE = process.env.USERS_TABLE || "livekart-users";

/**
 * Cognito Post-Confirmation Trigger Handler
 * @param {Object} event - Cognito trigger event
 * @returns {Object} event - Must return the event object
 */
exports.handler = async (event) => {
  console.log(
    "Post-Confirmation Trigger Event:",
    JSON.stringify(event, null, 2)
  );

  try {
    // Extract user information from Cognito event
    const {
      userName, // Cognito username
      request: { userAttributes },
    } = event;

    const {
      sub, // User ID (UUID from Cognito)
      email,
      name,
      "custom:role": customRole, // Custom role attribute if configured
    } = userAttributes;

    // Determine user role
    // Priority: custom:role > default to 'customer'
    const userRole = customRole || "customer";

    // Create user record for DynamoDB
    const userRecord = {
      user_id: sub, // Primary key (Cognito sub)
      username: userName, // Cognito username
      email: email,
      name: name || userName, // Full name or default to username
      role: userRole, // customer, vendor, or admin
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "active", // User account status
      emailVerified: true, // Since this trigger runs AFTER confirmation

      // Optional fields (can be updated later)
      phoneNumber: userAttributes.phone_number || null,
      address: null,
      profileImage: null,

      // Shopping-related fields
      wishlist: [], // Array of product IDs
      cart: [], // Array of cart items

      // Metadata
      lastLoginAt: null,
      totalOrders: 0,
      totalSpent: 0,
    };

    // Additional vendor-specific fields
    if (userRole === "vendor") {
      userRecord.storeName = null;
      userRecord.storeDescription = null;
      userRecord.totalProducts = 0;
      userRecord.totalRevenue = 0;
      userRecord.rating = 0;
      userRecord.totalReviews = 0;
    }

    // Save user to DynamoDB
    const putCommand = new PutCommand({
      TableName: USERS_TABLE,
      Item: userRecord,
      // Don't overwrite if user already exists (shouldn't happen, but safe)
      ConditionExpression: "attribute_not_exists(user_id)",
    });

    await docClient.send(putCommand);

    console.log("✅ User added to DynamoDB:", {
      user_id: sub,
      email: email,
      role: userRole,
      username: userName,
    });

    // IMPORTANT: Must return the event object for Cognito
    return event;
  } catch (error) {
    console.error("❌ Error adding user to DynamoDB:", error);

    // If ConditionalCheckFailedException, user already exists (not a critical error)
    if (error.name === "ConditionalCheckFailedException") {
      console.log("⚠️ User already exists in DynamoDB, skipping...");
      return event;
    }

    // For other errors, log but don't fail the signup process
    // (user is still created in Cognito even if DynamoDB fails)
    console.error(
      "⚠️ DynamoDB insert failed, but continuing signup:",
      error.message
    );

    // Still return event to allow user signup to complete
    return event;
  }
};
