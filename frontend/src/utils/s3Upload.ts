// S3 Upload Utilities for Product Images
// Handles secure uploads using Lambda pre-signed URLs

import axios from "axios";

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  key: string;
  url: string;
}

/**
 * Upload an image to S3 using Lambda pre-signed URL
 * @param file - File to upload
 * @param folder - S3 folder (e.g., 'products', 'vendors')
 * @param onProgress - Progress callback
 * @returns Upload result with S3 key and URL
 */
export async function uploadImage(
  file: File,
  folder: string = "products",
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    // Validate file
    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image");
    }

    // Check file size (max 5MB for Free Tier)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error("Image size must be less than 5MB");
    }

    // Step 1: Get pre-signed URL from Lambda
    const uploadUrlEndpoint = (import.meta as any).env.VITE_API_GET_UPLOAD_URL;

    if (!uploadUrlEndpoint) {
      throw new Error(
        "Upload URL endpoint not configured. Set VITE_API_GET_UPLOAD_URL in .env"
      );
    }

    const uploadUrlResponse = await axios.post(uploadUrlEndpoint, {
      filename: file.name,
      contentType: file.type,
      folder: folder,
    });

    const { uploadUrl, key, publicUrl } = uploadUrlResponse.data;

    // Step 2: Upload file to S3 using pre-signed URL
    await axios.put(uploadUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            ),
          });
        }
      },
    });

    return {
      key,
      url: publicUrl,
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

/**
 * Upload multiple images using Lambda pre-signed URLs
 * @param files - Array of files to upload
 * @param folder - S3 folder
 * @param onProgress - Progress callback for each file
 * @returns Array of upload results
 */
export async function uploadMultipleImages(
  files: File[],
  folder: string = "products",
  onProgress?: (fileIndex: number, progress: UploadProgress) => void
): Promise<UploadResult[]> {
  const uploadPromises = files.map((file, index) =>
    uploadImage(file, folder, (progress) => {
      if (onProgress) {
        onProgress(index, progress);
      }
    })
  );

  return Promise.all(uploadPromises);
}

/**
 * Get S3 URL for an image key
 * @param key - S3 object key
 * @returns S3 URL
 */
export function getImageUrl(key: string): string {
  const bucketName = (import.meta as any).env.VITE_S3_BUCKET;
  const region = (import.meta as any).env.VITE_AWS_REGION || "us-east-1";

  if (!bucketName) {
    console.warn("S3 bucket name not configured");
    return key; // Return key as fallback
  }

  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
}

/**
 * Delete an image by calling Lambda delete function
 * @param productId - Product ID (Lambda will handle S3 key)
 */
export async function deleteProductImage(productId: string): Promise<void> {
  try {
    const deleteEndpoint = (import.meta as any).env.VITE_API_DELETE_PRODUCT;

    if (!deleteEndpoint) {
      throw new Error("Delete endpoint not configured");
    }

    await axios.delete(`${deleteEndpoint}?id=${productId}`);
  } catch (error) {
    console.error("Error deleting product image:", error);
    throw error;
  }
}

/**
 * Validate image file before upload
 * @param file - File to validate
 * @returns Validation result
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
 * Compress image before upload (client-side)
 * @param file - Image file to compress
 * @param maxWidth - Maximum width
 * @param maxHeight - Maximum height
 * @param quality - JPEG quality (0-1)
 * @returns Compressed image file
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
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

        // Calculate new dimensions
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
