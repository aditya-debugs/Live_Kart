// Lambda Function: Update Product
// PUT /products/{id}
// Requires: Vendor (own product) or Admin

const { getItem, updateItem, PRODUCTS_TABLE } = require("../utils/dynamodb");
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

    // Get product ID from path parameters
    const productId = event.pathParameters?.id;

    if (!productId) {
      return createResponse(400, {
        success: false,
        error: "Product ID is required",
      });
    }

    // Get existing product
    const existingProduct = await getItem(PRODUCTS_TABLE, {
      product_id: productId,
    });

    if (!existingProduct) {
      return createResponse(404, {
        success: false,
        error: "Product not found",
      });
    }

    // Check ownership (vendors can only update their own products)
    const isAdmin = auth.user.groups.includes("admins");
    const isOwner = existingProduct.vendor_id === auth.user.userId;

    if (!isAdmin && !isOwner) {
      return createResponse(403, {
        success: false,
        error: "You can only update your own products",
      });
    }

    // Parse request body
    const body = JSON.parse(event.body);
    const { title, description, price, category, imageKey, stock } = body;

    // Build update expression
    const updates = [];
    const expressionValues = {
      ":updatedAt": Date.now(),
    };

    if (title !== undefined) {
      updates.push("title = :title");
      expressionValues[":title"] = title.trim();
    }
    if (description !== undefined) {
      updates.push("description = :description");
      expressionValues[":description"] = description.trim();
    }
    if (price !== undefined) {
      if (typeof price !== "number" || price <= 0) {
        return createResponse(400, {
          success: false,
          error: "Price must be a positive number",
        });
      }
      updates.push("price = :price");
      expressionValues[":price"] = parseFloat(price);
    }
    if (category !== undefined) {
      updates.push("category = :category");
      expressionValues[":category"] = category.trim();
    }
    if (imageKey !== undefined) {
      updates.push("imageKey = :imageKey");
      expressionValues[":imageKey"] = imageKey;
    }
    if (stock !== undefined) {
      updates.push("stock = :stock");
      expressionValues[":stock"] = parseInt(stock);
    }

    if (updates.length === 0) {
      return createResponse(400, {
        success: false,
        error: "No fields to update",
      });
    }

    // Add updatedAt to all updates
    updates.push("updatedAt = :updatedAt");

    const updateExpression = `SET ${updates.join(", ")}`;

    // Update product
    const updatedProduct = await updateItem(
      PRODUCTS_TABLE,
      { product_id: productId },
      updateExpression,
      expressionValues
    );

    return createResponse(200, {
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return createResponse(500, {
      success: false,
      error: "Failed to update product",
      message: error.message,
    });
  }
};
