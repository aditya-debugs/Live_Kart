// LAMBDA FUNCTION 3: Create Order
// REQUIRES AUTHENTICATION (Cognito JWT)

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} = require("@aws-sdk/lib-dynamodb");
const { CognitoJwtVerifier } = require("aws-jwt-verify");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});
const dynamodb = DynamoDBDocumentClient.from(client);

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID,
  tokenUse: "id",
  clientId: null,
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
        body: JSON.stringify({ error: "No authorization token" }),
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

    // 2. Parse order data
    const body = JSON.parse(event.body);
    const { items, shippingAddress, paymentMethod } = body;

    if (!items || items.length === 0) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Order must contain at least one item" }),
      };
    }

    // 3. Calculate total (verify product prices from DB)
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      // Get product from DB
      const productResult = await dynamodb.send(
        new GetCommand({
          TableName: process.env.PRODUCTS_TABLE || "livekart-products",
          Key: { product_id: item.productId },
        })
      );

      if (!productResult.Item) {
        return {
          statusCode: 404,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({
            error: `Product ${item.productId} not found`,
          }),
        };
      }

      const product = productResult.Item;
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: item.productId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        imageUrl: product.imageUrl,
      });
    }

    // 4. Create order
    const orderId = `order_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const order = {
      order_id: orderId,
      user_id: userId,
      userEmail: userEmail,
      items: orderItems,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      shippingAddress: shippingAddress || {},
      paymentMethod: paymentMethod || "COD",
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 5. Save to DynamoDB
    await dynamodb.send(
      new PutCommand({
        TableName: process.env.ORDERS_TABLE || "livekart-orders",
        Item: order,
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
        order,
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
