import axios from "axios";

// Use localhost for development, or environment variable for production
const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:3000";

const instance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for authentication and debugging
instance.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);

    // Add authorization token if available
    const tokens = localStorage.getItem("livekart_tokens");
    if (tokens) {
      try {
        const { idToken } = JSON.parse(tokens);
        if (idToken) {
          config.headers.Authorization = `Bearer ${idToken}`;
        }
      } catch (e) {
        console.error("Failed to parse auth tokens:", e);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface OrderItem {
  product_id: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface Order {
  order_id: string;
  date: string;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  expectedDelivery?: string;
}

interface OrdersResponse {
  orders: Order[];
  total: number;
}

export const getWishlistProducts = async (productIds: string[]) => {
  try {
    const response = await instance.get("/getWishlistProducts", {
      params: { ids: productIds.join(",") },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch wishlist products:", error);
    throw error;
  }
};

export const fetchOrders = async (
  timeFrame: string = "last3months",
  status: string = "all",
  page: number = 1,
  limit: number = 10
): Promise<OrdersResponse> => {
  try {
    const response = await instance.get("/orders", {
      params: {
        timeFrame,
        status,
        page,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    throw error;
  }
};

export const buyAgain = async (
  orderId: string,
  productId: string
): Promise<void> => {
  try {
    await instance.post("/cart/add", {
      productId,
      quantity: 1,
    });
  } catch (error) {
    console.error("Failed to add item to cart:", error);
    throw error;
  }
};

export const trackOrder = async (orderId: string): Promise<any> => {
  try {
    const response = await instance.get(`/orders/${orderId}/tracking`);
    return response.data;
  } catch (error) {
    console.error("Failed to track order:", error);
    throw error;
  }
};

export const writeReview = async (
  orderId: string,
  productId: string,
  rating: number,
  comment: string
): Promise<void> => {
  try {
    await instance.post(`/products/${productId}/reviews`, {
      orderId,
      rating,
      comment,
    });
  } catch (error) {
    console.error("Failed to write review:", error);
    throw error;
  }
};

export default instance;
