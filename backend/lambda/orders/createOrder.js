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

exports.handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));

  try {
    // Authenticate user (customers, vendors, admins can place orders)
    const auth = await authenticate(event);
    if (!auth.success) {
      return createResponse(auth.statusCode, {
        success: false,
        error: auth.error,
      });
    }

    // Parse request body
    const body = JSON.parse(event.body);
    const { items, shippingAddress, paymentMethod } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return createResponse(400, {
        success: false,
        error: "Order must contain at least one item",
      });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
      return createResponse(400, {
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
        return createResponse(400, {
          success: false,
          error: "Invalid item in order",
        });
      }

      // Get product details from DynamoDB
      const product = await getItem(PRODUCTS_TABLE, { product_id });

      if (!product) {
        return createResponse(404, {
          success: false,
          error: `Product not found: ${product_id}`,
        });
      }

      // Check stock availability (if stock tracking is enabled)
      if (product.stock !== undefined && product.stock < quantity) {
        return createResponse(400, {
          success: false,
          error: `Insufficient stock for product: ${product.title}`,
        });
      }

      // Calculate item total
      const itemTotal = product.price * quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product_id,
        title: product.title,
        price: product.price,
        quantity,
        subtotal: itemTotal,
        vendor_id: product.vendor_id,
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

    return createResponse(201, {
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return createResponse(500, {
      success: false,
      error: "Failed to create order",
      message: error.message,
    });
  }
};
