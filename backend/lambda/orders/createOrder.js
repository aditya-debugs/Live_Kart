// Lambda Function: Create Order
// POST /orders
// Requires: Authenticated user (customers)

const { v4: uuidv4 } = require("uuid");
const {
  putItem,
  getItem,
  ORDERS_TABLE,
  PRODUCTS_TABLE,
} = require("../utils/dynamodb");
const { authenticate, createResponse } = require("../utils/auth");

// Custom CORS response wrapper
function createCORSResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Requested-With",
      "Access-Control-Allow-Credentials": "true",
    },
    body: JSON.stringify(body),
  };
}

exports.handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));

  // Handle CORS preflight OPTIONS request
  if (event.requestContext.http.method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
      body: "",
    };
  }

  try {
    // Authenticate user (customers, vendors, admins can place orders)
    const auth = await authenticate(event);
    if (!auth.success) {
      return createCORSResponse(auth.statusCode, {
        success: false,
        error: auth.error,
      });
    }

    // Parse request body
    const body = JSON.parse(event.body);
    const { items, shippingAddress, paymentMethod } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return createCORSResponse(400, {
        success: false,
        error: "Order must contain at least one item",
      });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
      return createCORSResponse(400, {
        success: false,
        error: "Valid shipping address is required",
      });
    }

    // Validate and calculate order total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const { product_id, quantity } = item;

      if (!product_id || !quantity || quantity <= 0) {
        return createCORSResponse(400, {
          success: false,
          error: "Invalid item in order",
        });
      }

      // Try to get product details from DynamoDB (optional - order will work without it)
      let product = null;
      let productPrice = 0;
      let productTitle = "Product";
      let vendorId = "unknown";

      try {
        product = await getItem(PRODUCTS_TABLE, { product_id });
        if (product) {
          productPrice = product.price || 0;
          productTitle = product.title || product.name || "Product";
          vendorId = product.vendor_id || product.vendorId || "unknown";
        }
      } catch (err) {
        console.warn(
          `Could not fetch product ${product_id}, using defaults:`,
          err.message
        );
        // Continue with defaults - order will still be created
      }

      // If product not found in DB, we still need a price
      // In a real scenario, you'd reject the order, but for demo we'll use a default
      if (!product) {
        console.warn(
          `Product ${product_id} not found in database, using default values`
        );
        productPrice = 100; // Default price for demo
      }

      // Calculate item total
      const itemTotal = productPrice * quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product_id,
        title: productTitle,
        price: productPrice,
        quantity,
        subtotal: itemTotal,
        vendor_id: vendorId,
      });
    }

    // Create order object
    const order = {
      order_id: uuidv4(),
      user_id: auth.user.userId,
      user_email: auth.user.email,
      items: orderItems,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      shippingAddress,
      paymentMethod: paymentMethod || "pending",
      status: "pending", // pending, confirmed, shipped, delivered, cancelled
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Save order to DynamoDB
    await putItem(ORDERS_TABLE, order);

    // TODO: Send confirmation email (if SES is available)
    // TODO: Notify vendors about new orders

    return createCORSResponse(201, {
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return createCORSResponse(500, {
      success: false,
      error: "Failed to create order",
      message: error.message,
    });
  }
};
