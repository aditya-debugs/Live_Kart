// API Integration for Lambda Functions
import axios from "axios";

// Lambda Function URLs - UPDATE THESE AFTER DEPLOYING LAMBDA FUNCTIONS!
const LAMBDA_URLS = {
  getProducts: (import.meta as any).env?.VITE_LAMBDA_GET_PRODUCTS || "",
  createProduct: (import.meta as any).env?.VITE_LAMBDA_CREATE_PRODUCT || "",
  updateProduct: (import.meta as any).env?.VITE_LAMBDA_UPDATE_PRODUCT || "",
  deleteProduct: (import.meta as any).env?.VITE_LAMBDA_DELETE_PRODUCT || "",
  createOrder: (import.meta as any).env?.VITE_LAMBDA_CREATE_ORDER || "",
  getOrders: (import.meta as any).env?.VITE_LAMBDA_GET_ORDERS || "",
  getUser: (import.meta as any).env?.VITE_LAMBDA_GET_USER || "",
  updateUser: (import.meta as any).env?.VITE_LAMBDA_UPDATE_USER || "",
};

// Helper to get auth token
const getAuthToken = () => {
  const tokens = localStorage.getItem("livekart_tokens");
  if (tokens) {
    try {
      const { idToken } = JSON.parse(tokens);
      return idToken;
    } catch (e) {
      console.error("Failed to parse auth tokens:", e);
    }
  }
  return null;
};

// Helper to get current user ID
export const getCurrentUserId = () => {
  const tokens = localStorage.getItem("livekart_tokens");
  if (tokens) {
    try {
      const { idToken } = JSON.parse(tokens);
      // Decode JWT to get user ID (sub claim)
      const payload = JSON.parse(atob(idToken.split(".")[1]));
      return payload.sub;
    } catch (e) {
      console.error("Failed to get user ID:", e);
    }
  }
  return null;
};

// Products API
export const lambdaAPI = {
  // Get all products
  getProducts: async (category?: string) => {
    try {
      const url = category
        ? `${LAMBDA_URLS.getProducts}?category=${category}`
        : LAMBDA_URLS.getProducts;

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch products:", error);
      throw error;
    }
  },

  // Create product (vendor only)
  createProduct: async (productData: {
    title?: string;
    name?: string;
    price: number;
    description: string;
    category: string;
    imageUrl?: string;
    stock?: number;
  }) => {
    try {
      const token = getAuthToken();
      const userId = getCurrentUserId();

      // Get vendor username from token
      let vendorId = "system";
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          vendorId = payload["cognito:username"] || payload.sub || "system";
        } catch (e) {
          console.error("Failed to get vendorId from token:", e);
        }
      }

      // Lambda expects 'name' field, not 'title'
      const productName =
        productData.title || productData.name || "Unnamed Product";

      const requestBody = {
        name: productName, // ✅ Lambda expects 'name'
        price: productData.price,
        description: productData.description,
        category: productData.category,
        imageUrl: productData.imageUrl || "",
        stock: productData.stock || 100,
        vendorId: vendorId, // ✅ Add vendorId to track which vendor created this
      };

      console.log("Creating product with data:", requestBody);

      const response = await axios.post(
        LAMBDA_URLS.createProduct,
        requestBody,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      console.log("Product created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to create product:", error);
      throw error;
    }
  },

  // Update product (vendor only)
  updateProduct: async (
    productId: string,
    productData: {
      title?: string;
      name?: string;
      price?: number;
      description?: string;
      category?: string;
      imageUrl?: string;
      stock?: number;
    }
  ) => {
    try {
      const token = getAuthToken();

      // Lambda expects 'name' field, not 'title'
      const productName = productData.title || productData.name;

      const requestBody = {
        product_id: productId,
        ...(productName && { name: productName }),
        ...(productData.price && { price: productData.price }),
        ...(productData.description && {
          description: productData.description,
        }),
        ...(productData.category && { category: productData.category }),
        ...(productData.imageUrl && { imageUrl: productData.imageUrl }),
        ...(productData.stock && { stock: productData.stock }),
      };

      const response = await axios.put(LAMBDA_URLS.updateProduct, requestBody, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      return response.data;
    } catch (error) {
      console.error("Failed to update product:", error);
      throw error;
    }
  },

  // Delete product (vendor only)
  deleteProduct: async (productId: string) => {
    try {
      const token = getAuthToken();

      const response = await axios.delete(
        `${LAMBDA_URLS.deleteProduct}?product_id=${productId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      return response.data;
    } catch (error) {
      console.error("Failed to delete product:", error);
      throw error;
    }
  },

  // Create order
  createOrder: async (orderData: {
    items: Array<{
      product_id: string;
      quantity: number;
    }>;
    shippingAddress?: any;
    paymentMethod?: string;
  }) => {
    try {
      const token = getAuthToken();
      const userId = getCurrentUserId();

      // Get user email from token
      let userEmail = "guest@livekart.com";
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          userEmail = payload.email || userEmail;
        } catch (e) {
          console.error("Failed to decode token:", e);
        }
      }

      const response = await axios.post(
        LAMBDA_URLS.createOrder,
        {
          ...orderData,
          userId: userId || "guest",
          userEmail,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to create order:", error);
      throw error;
    }
  },

  // Get user orders
  getOrders: async () => {
    try {
      const token = getAuthToken();
      const userId = getCurrentUserId();

      if (!userId) {
        return { success: true, orders: [], count: 0 };
      }

      const response = await axios.get(
        `${LAMBDA_URLS.getOrders}?userId=${userId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      throw error;
    }
  },

  // Get user profile
  getUserProfile: async () => {
    try {
      const token = getAuthToken();
      const userId = getCurrentUserId();

      if (!userId || !token) {
        throw new Error("User not authenticated");
      }

      const response = await axios.get(
        `${LAMBDA_URLS.getUser}?userId=${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      throw error;
    }
  },

  // Update user profile
  updateUserProfile: async (profileData: {
    name?: string;
    phoneNumber?: string;
    phone?: string;
    address?: any;
    profileImage?: string;
    notificationPreferences?: any;
  }) => {
    try {
      const token = getAuthToken();
      const userId = getCurrentUserId();

      if (!userId || !token) {
        throw new Error("User not authenticated");
      }

      const response = await axios.put(LAMBDA_URLS.updateUser, profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to update user profile:", error);
      throw error;
    }
  },
};

export default lambdaAPI;
