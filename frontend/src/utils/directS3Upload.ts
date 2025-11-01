// Direct S3 Upload for Product Images
// Uses HTTP PUT to upload directly to S3 bucket (no AWS SDK needed)

const S3_BUCKET = "live-kart-product-images";
const S3_REGION = "us-east-1";
const S3_FOLDER = "product-images";

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  url: string;
  key: string;
  error?: string;
}

/**
 * Validate image file before upload
 */
export function validateImage(file: File): { valid: boolean; error?: string } {
  // Check if it's an image
  if (!file.type.startsWith("image/")) {
    return { valid: false, error: "File must be an image" };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: "Image size must be less than 5MB" };
  }

  // Check file type (allow common image formats)
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Only JPEG, PNG, WebP, and GIF images are allowed",
    };
  }

  return { valid: true };
}

/**
 * Upload image directly to S3 bucket using HTTP PUT
 * Works with bucket policy that allows public uploads
 */
export async function uploadImageToS3(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    // Validate file
    const validation = validateImage(file);
    if (!validation.valid) {
      return {
        success: false,
        url: "",
        key: "",
        error: validation.error,
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `product_${timestamp}_${randomString}.${fileExtension}`;
    const s3Key = `${S3_FOLDER}/${fileName}`;

    // Progress callback - start
    if (onProgress) {
      onProgress({ loaded: 0, total: file.size, percentage: 0 });
    }

    // Create the S3 URL for direct upload
    const s3Url = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${s3Key}`;

    // Use XMLHttpRequest for better progress tracking and simpler upload
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable && onProgress) {
          const percentage = Math.round((e.loaded / e.total) * 100);
          onProgress({
            loaded: e.loaded,
            total: e.total,
            percentage,
          });
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200 || xhr.status === 204) {
          console.log("✅ Image uploaded successfully to S3:", s3Url);

          resolve({
            success: true,
            url: s3Url,
            key: s3Key,
          });
        } else {
          const errorMsg = `Upload failed with status ${xhr.status}: ${xhr.statusText}`;
          console.error("❌ S3 Upload Error:", errorMsg);
          reject(new Error(errorMsg));
        }
      });

      xhr.addEventListener("error", () => {
        const errorMsg =
          "Network error during S3 upload. Check CORS configuration.";
        console.error("❌ S3 Upload Error:", errorMsg);
        reject(new Error(errorMsg));
      });

      xhr.addEventListener("abort", () => {
        reject(new Error("Upload was cancelled"));
      });

      // Open PUT request to S3
      xhr.open("PUT", s3Url);

      // Set content type header
      xhr.setRequestHeader("Content-Type", file.type);

      // Enable CORS
      xhr.withCredentials = false;

      // Send the file
      xhr.send(file);
    });
  } catch (error: any) {
    console.error("❌ S3 Upload Error:", error);

    // Provide helpful error messages
    let errorMessage = "Failed to upload image to S3";

    if (error.message?.includes("CORS")) {
      errorMessage = "CORS error. Please configure S3 bucket CORS policy.";
    } else if (error.message?.includes("403")) {
      errorMessage =
        "Access denied. Please configure S3 bucket policy to allow uploads.";
    } else if (error.message?.includes("404")) {
      errorMessage = "S3 bucket not found. Check bucket name configuration.";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      url: "",
      key: "",
      error: errorMessage,
    };
  }
}

/**
 * Convert file to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove data:image/xxx;base64, prefix
      const base64Data = base64.split(",")[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Preview image before upload
 */
export function previewImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Compress image before upload (optional)
 */
export async function compressImage(
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"));
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("Failed to load image"));
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
  });
}
