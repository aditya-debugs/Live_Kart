import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import lambdaAPI from "../utils/lambdaAPI";
import { useAuth } from "../utils/AuthContext";
import toast from "react-hot-toast";
import {
  validateImage,
  previewImage,
  compressImage,
  uploadImageToS3,
} from "../utils/directS3Upload";

type Product = {
  product_id: string;
  name?: string;
  title?: string;
  price: number;
  category?: string;
  imageUrl?: string;
  views?: number;
  vendorId?: string;
};

type Order = {
  order_id: string;
  user_id: string;
  items: Array<{
    product_id: string;
    title?: string;
    price: number;
    quantity: number;
    vendor_id?: string;
  }>;
  totalAmount: number;
  status: string;
  createdAt: number;
  shippingAddress?: any;
};

export default function VendorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [vendorOrders, setVendorOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    loadMyProducts();
    loadVendorOrders();
  }, []);

  const loadVendorOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await lambdaAPI.getOrders();
      console.log("Vendor orders from Lambda:", res);
      setVendorOrders(res.orders || []);
    } catch (err) {
      console.error("Failed to load orders", err);
      toast.error("Failed to load orders");
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadMyProducts = async () => {
    try {
      // Use Lambda API
      const res = await lambdaAPI.getProducts();
      console.log("All products from Lambda:", res);

      // Filter products by current vendor - check both vendorId and vendor_id
      const vendorProducts = (res.products || []).filter(
        (p: any) =>
          p.vendorId === user?.username ||
          p.vendor_id === user?.username ||
          p.vendorId === user?.email ||
          p.vendor_id === user?.email
      );

      console.log("Filtered vendor products:", vendorProducts);
      console.log("Current user:", user);

      setMyProducts(vendorProducts);
    } catch (err) {
      console.error("Failed to load products", err);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image
    const validation = validateImage(file);
    if (!validation.valid) {
      alert(`❌ ${validation.error}`);
      e.target.value = ""; // Clear input
      return;
    }

    // Show preview
    try {
      const preview = await previewImage(file);
      setImagePreview(preview);
      setImageFile(file);
    } catch (error) {
      console.error("Failed to preview image:", error);
      alert("❌ Failed to preview image");
    }
  };

  const uploadToS3 = async (file: File): Promise<string> => {
    try {
      // Compress image before upload
      console.log("Compressing image...");
      const compressedFile = await compressImage(file, 800, 800, 0.85);
      console.log(
        `Original size: ${(file.size / 1024).toFixed(2)}KB, Compressed: ${(
          compressedFile.size / 1024
        ).toFixed(2)}KB`
      );

      // Upload to S3 with progress tracking
      console.log("Uploading to S3...");
      const result = await uploadImageToS3(compressedFile, (progress) => {
        setUploadProgress(progress.percentage);
        console.log(`Upload progress: ${progress.percentage}%`);
      });

      if (!result.success) {
        throw new Error(result.error || "Upload failed");
      }

      console.log("Upload successful! URL:", result.url);
      return result.url;
    } catch (error: any) {
      console.error("S3 Upload error:", error);
      throw new Error(error.message || "Failed to upload image to S3");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please sign in as a vendor");
      return;
    }

    if (!imageFile) {
      alert("❌ Please select a product image");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      // Upload image to S3
      console.log("Starting S3 upload...");
      const productImageUrl = await uploadToS3(imageFile);
      console.log("Image uploaded to:", productImageUrl);

      // Create product with S3 image URL
      console.log("Creating product in DynamoDB...");
      await lambdaAPI.createProduct({
        title: title,
        description,
        price: Number(price),
        imageUrl: productImageUrl,
        category,
        stock: 100,
      });

      setUploadProgress(100);
      alert("✅ Product added successfully with image uploaded to S3!");

      // Reset form
      setTitle("");
      setDescription("");
      setPrice("");
      setImageFile(null);
      setImagePreview("");
      setUploadProgress(0);
      setCategory("Electronics");

      // Reload products
      loadMyProducts();
    } catch (err: any) {
      console.error("Error:", err);
      alert(`❌ Failed to add product: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "Electronics",
    "Fashion",
    "Sports",
    "Home",
    "Books",
    "Toys",
    "Beauty",
    "Food",
  ];

  // Filter products based on selected category
  const filteredProducts =
    filterCategory === "All"
      ? myProducts
      : myProducts.filter((p) => p.category === filterCategory);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Vendor Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back, {user?.username || "Vendor"}! Manage your product
          listings below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add Product Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            Add New Product
          </h2>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Title *
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                placeholder="e.g., Premium Wireless Headphones"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                placeholder="Describe your product..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (USD) *
              </label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image *
              </label>
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#8C5630] file:text-white hover:file:bg-[#754626] file:cursor-pointer"
                />
                <p className="text-xs text-gray-500">
                  📸 Upload a product image (JPEG, PNG, WebP, or GIF - Max 5MB)
                </p>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative w-full h-48 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview("");
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Upload Progress */}
                {loading && uploadProgress > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#8C5630] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !imageFile}
              className="w-full py-3 bg-[#8C5630] text-white rounded-lg hover:bg-[#754626] transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Adding Product...
                </>
              ) : (
                "➕ Add Product"
              )}
            </button>
          </form>
        </div>

        {/* My Products List */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              My Products ({filteredProducts.length})
            </h2>

            {/* Category Filter Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Filter:
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8C5630] transition bg-white"
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-gray-500">
                  {filterCategory === "All"
                    ? "No products yet"
                    : `No products in ${filterCategory}`}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  {filterCategory === "All"
                    ? "Add your first product to get started!"
                    : "Try selecting a different category"}
                </p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.product_id}
                  className="flex items-center gap-4 p-4 bg-[#F5E6D3] rounded-lg hover:bg-[#E6D7C3] transition group"
                >
                  <img
                    src={product.imageUrl || "https://via.placeholder.com/80"}
                    alt={product.name || product.title}
                    className="w-20 h-20 object-cover rounded-lg shadow-sm"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {product.name || product.title || "Unnamed Product"}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm font-medium text-[#8C5630]">
                        ${product.price.toFixed(2)}
                      </p>
                      {product.category && (
                        <span className="text-xs bg-white px-2 py-1 rounded-full text-gray-600">
                          {product.category}
                        </span>
                      )}
                    </div>
                    {product.views !== undefined && (
                      <p className="text-xs text-gray-500 mt-1">
                        👁️ {product.views} views
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      navigate(`/vendor/analytics/${product.product_id}`)
                    }
                    className="px-4 py-2 bg-[#8C5630] text-white rounded-lg hover:bg-[#754626] transition opacity-0 group-hover:opacity-100 font-medium text-sm"
                  >
                    📊 View Analytics
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-[#8C5630] to-[#754626] text-white rounded-xl p-6 shadow-lg">
          <h3 className="text-sm font-semibold mb-2 opacity-90">
            Total Products
          </h3>
          <p className="text-4xl font-bold">{myProducts.length}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
          <h3 className="text-sm font-semibold mb-2 opacity-90">Total Views</h3>
          <p className="text-4xl font-bold">
            {myProducts.reduce((sum, p) => sum + (p.views || 0), 0)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
          <h3 className="text-sm font-semibold mb-2 opacity-90">
            Inventory Value
          </h3>
          <p className="text-4xl font-bold">
            ${myProducts.reduce((sum, p) => sum + p.price, 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
          <h3 className="text-sm font-semibold mb-2 opacity-90">Categories</h3>
          <p className="text-4xl font-bold">
            {new Set(myProducts.map((p) => p.category)).size}
          </p>
        </div>
      </div>

      {/* Vendor Orders Section */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          📦 Recent Orders ({vendorOrders.length})
        </h2>

        {loadingOrders ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8C5630]" />
          </div>
        ) : vendorOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500">No orders yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Orders containing your products will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {vendorOrders.map((order) => {
              const orderTotal = order.items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
              );

              return (
                <div
                  key={order.order_id}
                  className="border border-gray-200 rounded-lg p-6 hover:border-[#8C5630] transition"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Order ID</p>
                      <p className="font-mono text-sm">{order.order_id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Status</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Order Date</p>
                      <p className="text-sm">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Customer</p>
                      <p className="text-sm truncate">{order.user_id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Order Total</p>
                      <p className="text-sm font-semibold text-[#8C5630]">
                        ₹{orderTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold mb-3">Your Items:</p>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 bg-gray-50 p-3 rounded"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {item.title || "Product"}
                            </p>
                            <p className="text-xs text-gray-500">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-semibold">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
