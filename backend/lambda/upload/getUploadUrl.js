// Lambda Function: Get S3 Upload URL
// POST /upload-url
// Requires: Authenticated user (vendors/admins to upload product images)

const { authenticate, createResponse } = require("../utils/auth");
const { getUploadUrl, generateUniqueKey } = require("../utils/s3");

exports.handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));

  try {
    // Authenticate user
    const auth = await authenticate(event, ["vendor", "admin"]);
    if (!auth.success) {
      return createResponse(auth.statusCode, {
        success: false,
        error: auth.error,
      });
    }

    // Parse request body
    const body = JSON.parse(event.body);
    const { filename, contentType } = body;

    if (!filename) {
      return createResponse(400, {
        success: false,
        error: "Filename is required",
      });
    }

    // Validate content type (images only)
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    const finalContentType = contentType || "image/jpeg";

    if (!allowedTypes.includes(finalContentType)) {
      return createResponse(400, {
        success: false,
        error: "Invalid content type. Only images are allowed.",
      });
    }

    // Generate unique S3 key
    const key = generateUniqueKey(filename, "products");

    // Generate pre-signed URL for upload (5 minutes expiry)
    const uploadUrl = await getUploadUrl(key, finalContentType, 300);

    return createResponse(200, {
      success: true,
      uploadUrl,
      key, // Return key so frontend can save it with product
      expiresIn: 300, // seconds
    });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return createResponse(500, {
      success: false,
      error: "Failed to generate upload URL",
      message: error.message,
    });
  }
};
