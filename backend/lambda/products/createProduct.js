// Lambda Function: Create Product
// POST /products
// Requires: Vendor or Admin role

const { v4: uuidv4 } = require("uuid");
const { putItem, PRODUCTS_TABLE } = require("../utils/dynamodb");
const { authenticate, createResponse } = require("../utils/auth");

exports.handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));

  try {
    // Authenticate and authorize (vendors and admins only)
    const auth = await authenticate(event, ["vendors", "admins"]);
    if (!auth.success) {
      return createResponse(auth.statusCode, {
        success: false,
        error: auth.error,
      });
    }

    // Parse request body
    const body = JSON.parse(event.body);
    const { title, description, price, category, imageKey, stock } = body;

    // Validate required fields
    if (!title || !price || !category) {
      return createResponse(400, {
        success: false,
        error: "Missing required fields: title, price, category",
      });
    }

    // Validate price
    if (typeof price !== "number" || price <= 0) {
      return createResponse(400, {
        success: false,
        error: "Price must be a positive number",
      });
    }

    // Create product object
    const product = {
      product_id: uuidv4(),
      vendor_id: auth.user.userId,
      vendor_email: auth.user.email,
      title: title.trim(),
      description: description?.trim() || "",
      price: parseFloat(price),
      category: category.trim(),
      imageKey: imageKey || null,
      stock: stock || 0,
      views: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Save to DynamoDB
    await putItem(PRODUCTS_TABLE, product);

    return createResponse(201, {
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return createResponse(500, {
      success: false,
      error: "Failed to create product",
      message: error.message,
    });
  }
};
