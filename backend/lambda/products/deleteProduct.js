// Lambda Function: Delete Product
// DELETE /products/{id}
// Requires: Vendor (own product) or Admin

const { getItem, deleteItem, PRODUCTS_TABLE } = require("../utils/dynamodb");
const { authenticate, createResponse } = require("../utils/auth");
const { deleteObject } = require("../utils/s3");

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

    // Check ownership (vendors can only delete their own products)
    const isAdmin = auth.user.groups.includes("admins");
    const isOwner = existingProduct.vendor_id === auth.user.userId;

    if (!isAdmin && !isOwner) {
      return createResponse(403, {
        success: false,
        error: "You can only delete your own products",
      });
    }

    // Delete product image from S3 (if exists)
    if (existingProduct.imageKey) {
      try {
        await deleteObject(existingProduct.imageKey);
        console.log("Deleted product image:", existingProduct.imageKey);
      } catch (err) {
        console.error("Error deleting image:", err);
        // Continue even if image deletion fails
      }
    }

    // Delete product from DynamoDB
    await deleteItem(PRODUCTS_TABLE, { product_id: productId });

    return createResponse(200, {
      success: true,
      message: "Product deleted successfully",
      product_id: productId,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return createResponse(500, {
      success: false,
      error: "Failed to delete product",
      message: error.message,
    });
  }
};
