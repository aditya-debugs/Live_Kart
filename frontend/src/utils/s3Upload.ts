// S3 Upload Utilities for Product Images
// Handles secure uploads using pre-signed URLs

import { uploadData, getUrl, remove } from "aws-amplify/storage";
import awsConfig from "../config/aws-config";

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  key: string;
  url: string;
  cdnUrl: string;
}

/**
 * Upload an image to S3 with progress tracking
 * @param file - File to upload
 * @param folder - S3 folder (e.g., 'products', 'vendors')
 * @param onProgress - Progress callback
 * @returns Upload result with S3 key and URLs
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

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = file.name.split(".").pop();
    const key = `${folder}/${timestamp}-${randomString}.${extension}`;

    // Upload to S3
    const result = await uploadData({
      key,
      data: file,
      options: {
        contentType: file.type,
        onProgress: (event) => {
          if (onProgress && event.totalBytes) {
            onProgress({
              loaded: event.transferredBytes,
              total: event.totalBytes,
              percentage: Math.round(
                (event.transferredBytes / event.totalBytes) * 100
              ),
            });
          }
        },
      },
    }).result;

    // Get the S3 URL
    const urlResult = await getUrl({ key });
    const s3Url = urlResult.url.toString();

    // Construct CloudFront CDN URL
    const cdnUrl = awsConfig.cloudFront.url
      ? `${awsConfig.cloudFront.url}/${key}`
      : s3Url;

    return {
      key,
      url: s3Url,
      cdnUrl,
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

/**
 * Upload multiple images
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
 * Get a pre-signed URL for secure image access
 * @param key - S3 object key
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns Pre-signed URL
 */
export async function getPresignedUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const result = await getUrl({
      key,
      options: {
        expiresIn,
      },
    });
    return result.url.toString();
  } catch (error) {
    console.error("Error getting pre-signed URL:", error);
    throw error;
  }
}

/**
 * Get CloudFront URL for an image
 * @param key - S3 object key
 * @returns CloudFront CDN URL or S3 URL as fallback
 */
export function getCDNUrl(key: string): string {
  if (awsConfig.cloudFront.url) {
    return `${awsConfig.cloudFront.url}/${key}`;
  }
  // Fallback to S3 URL construction
  return `https://${awsConfig.s3.bucketName}.s3.${awsConfig.region}.amazonaws.com/${key}`;
}

/**
 * Delete an image from S3
 * @param key - S3 object key
 */
export async function deleteImage(key: string): Promise<void> {
  try {
    await remove({ key });
  } catch (error) {
    console.error("Error deleting image:", error);
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
