// LAMBDA FUNCTION 2: Create Product
// REQUIRES AUTHENTICATION (Cognito JWT)

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { CognitoJwtVerifier } = require("aws-jwt-verify");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});
const dynamodb = DynamoDBDocumentClient.from(client);

// Cognito JWT Verifier
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID,
  tokenUse: "id",
  clientId: null, // Accept any client
});

exports.handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));

  try {
    // 1. Verify JWT token
    const token =
      event.headers?.authorization?.replace("Bearer ", "") ||
      event.headers?.Authorization?.replace("Bearer ", "");

    if (!token) {
      return {
        statusCode: 401,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "No authorization token provided" }),
      };
    }

    let payload;
    try {
      payload = await verifier.verify(token);
    } catch (err) {
      return {
        statusCode: 401,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Invalid token" }),
      };
    }

    const userId = payload.sub;
    const userEmail = payload.email;

    // 2. Parse request body
    const body = JSON.parse(event.body);
    const { name, price, description, category, imageUrl, stock } = body;

    // 3. Validate required fields
    if (!name || !price || !category) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({
          error: "Missing required fields: name, price, category",
        }),
      };
    }

    // 4. Create product item
    const productId = `prod_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const product = {
      product_id: productId,
      name,
      price: parseFloat(price),
      description: description || "",
      category,
      imageUrl: imageUrl || "",
      vendorId: userId,
      vendorEmail: userEmail,
      stock: stock || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 5. Save to DynamoDB
    await dynamodb.send(
      new PutCommand({
        TableName: process.env.PRODUCTS_TABLE || "livekart-products",
        Item: product,
      })
    );

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: true,
        product,
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
