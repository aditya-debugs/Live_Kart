// Lambda Function: Get User Orders
// GET /orders
// Requires: Authenticated user

const { queryTable, scanTable, ORDERS_TABLE } = require("../utils/dynamodb");
const { authenticate, createResponse } = require("../utils/auth");

exports.handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));

  try {
    // Authenticate user
    const auth = await authenticate(event);
    if (!auth.success) {
      return createResponse(auth.statusCode, {
        success: false,
        error: auth.error,
      });
    }

    const isAdmin = auth.user.groups.includes("admins");
    const isVendor = auth.user.groups.includes("vendors");

    let orders = [];

    if (isAdmin) {
      // Admins can see all orders
      orders = await scanTable(ORDERS_TABLE);
    } else if (isVendor) {
      // Vendors can see orders containing their products
      const allOrders = await scanTable(ORDERS_TABLE);

      // Filter orders that contain vendor's products
      orders = allOrders.filter((order) => {
        return order.items.some((item) => item.vendor_id === auth.user.userId);
      });

      // For vendors, only show items from their products
      orders = orders.map((order) => ({
        ...order,
        items: order.items.filter(
          (item) => item.vendor_id === auth.user.userId
        ),
      }));
    } else {
      // Customers can only see their own orders
      // Note: You might need to create a GSI on user_id for better performance
      const allOrders = await scanTable(ORDERS_TABLE);
      orders = allOrders.filter((order) => order.user_id === auth.user.userId);
    }

    // Sort by creation date (newest first)
    orders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    // Parse query parameters for pagination
    const queryParams = event.queryStringParameters || {};
    const limit = parseInt(queryParams.limit) || 50;
    const offset = parseInt(queryParams.offset) || 0;

    // Paginate results
    const paginatedOrders = orders.slice(offset, offset + limit);

    return createResponse(200, {
      success: true,
      count: paginatedOrders.length,
      total: orders.length,
      orders: paginatedOrders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return createResponse(500, {
      success: false,
      error: "Failed to fetch orders",
      message: error.message,
    });
  }
};
