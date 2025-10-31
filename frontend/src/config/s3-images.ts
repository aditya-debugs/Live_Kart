// S3 Image URLs Configuration
// All images are hosted on AWS S3

export const S3_IMAGES = {
  // Banner Images
  banners: [
    "https://live-kart-product-images.s3.us-east-1.amazonaws.com/frontend-assets/bannerimg.jpg",
    "https://live-kart-product-images.s3.us-east-1.amazonaws.com/frontend-assets/bannerimg2.jpg",
    "https://live-kart-product-images.s3.us-east-1.amazonaws.com/frontend-assets/bannerimg3.jpg",
    "https://live-kart-product-images.s3.us-east-1.amazonaws.com/frontend-assets/bannerimg4.jpg",
  ],

  // Category Images
  categories: [
    "https://live-kart-product-images.s3.us-east-1.amazonaws.com/frontend-assets/electronics.jpg",
    "https://live-kart-product-images.s3.us-east-1.amazonaws.com/frontend-assets/categoryimg2.jpg",
    "https://live-kart-product-images.s3.us-east-1.amazonaws.com/frontend-assets/categoryimg3.jpg",
    "https://live-kart-product-images.s3.us-east-1.amazonaws.com/frontend-assets/categoryimg4.jpg",
    "https://live-kart-product-images.s3.us-east-1.amazonaws.com/frontend-assets/sports.jpg",
    "https://live-kart-product-images.s3.us-east-1.amazonaws.com/frontend-assets/categoryimg4.jpg",
  ],

  // Product Images
  products: [
    "https://live-kart-product-images.s3.us-east-1.amazonaws.com/frontend-assets/productimg1.jpg",
    "https://live-kart-product-images.s3.us-east-1.amazonaws.com/frontend-assets/productimg2.jpg",
    "https://live-kart-product-images.s3.us-east-1.amazonaws.com/frontend-assets/productimg3.jpg",
    "https://live-kart-product-images.s3.us-east-1.amazonaws.com/frontend-assets/productimg4.jpg",
  ],
};

// S3 Configuration
export const S3_CONFIG = {
  bucket: "live-kart-product-images",
  region: "us-east-1",
  baseUrl:
    "https://live-kart-product-images.s3.us-east-1.amazonaws.com/frontend-assets",
};

// Helper function to get S3 URL for any image
export const getS3ImageUrl = (imageName: string): string => {
  return `${S3_CONFIG.baseUrl}/${imageName}`;
};
