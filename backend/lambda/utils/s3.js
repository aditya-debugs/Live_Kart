// S3 Helper Functions for LiveKart Lambda Functions

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const REGION = process.env.AWS_REGION || "us-east-1";
const S3_BUCKET = process.env.S3_BUCKET || "livekart-product-images";

// Create S3 client
const s3Client = new S3Client({ region: REGION });

/**
 * Generate pre-signed URL for uploading to S3
 * @param {string} key - S3 object key (filename)
 * @param {string} contentType - MIME type (e.g., 'image/jpeg')
 * @param {number} expiresIn - URL expiration in seconds (default: 5 minutes)
 */
async function getUploadUrl(key, contentType = "image/jpeg", expiresIn = 300) {
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
  return signedUrl;
}

/**
 * Generate pre-signed URL for downloading from S3
 * @param {string} key - S3 object key (filename)
 * @param {number} expiresIn - URL expiration in seconds (default: 1 hour)
 */
async function getDownloadUrl(key, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
  return signedUrl;
}

/**
 * Delete object from S3
 * @param {string} key - S3 object key (filename)
 */
async function deleteObject(key) {
  const command = new DeleteObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  });

  await s3Client.send(command);
  return true;
}

/**
 * Get public S3 URL (for public buckets)
 * Note: In Learner Academy, you may need to use pre-signed URLs instead
 */
function getPublicUrl(key) {
  return `https://${S3_BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
}

/**
 * Generate unique filename for upload
 */
function generateUniqueKey(originalFilename, prefix = "products") {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalFilename.split(".").pop();
  return `${prefix}/${timestamp}-${randomString}.${extension}`;
}

module.exports = {
  S3_BUCKET,
  getUploadUrl,
  getDownloadUrl,
  deleteObject,
  getPublicUrl,
  generateUniqueKey,
};
