import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import lambdaAPI from "../utils/lambdaAPI";
import { useAuth } from "../utils/AuthContext";
import VendorLayout from "../layouts/VendorLayout";
import toast, { Toaster } from "react-hot-toast";
import {
  validateImage,
  previewImage,
  compressImage,
  uploadImageToS3,
} from "../utils/directS3Upload";
import {
  PlusIcon,
  PhotoIcon,
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

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

  useEffect(() => {
    loadMyProducts();
  }, []);

  const loadMyProducts = async () => {
    try {
      const res = await lambdaAPI.getProducts();
      const vendorProducts = (res.products || []).filter(
        (p: any) =>
          p.vendorId === user?.username ||
          p.vendor_id === user?.username ||
          p.vendorId === user?.email ||
          p.vendor_id === user?.email
      );
      setMyProducts(vendorProducts);
    } catch (err) {
      console.error("Failed to load products", err);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImage(file);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid image");
      e.target.value = "";
      return;
    }

    try {
      const preview = await previewImage(file);
      setImagePreview(preview);
      setImageFile(file);
    } catch (error) {
      console.error("Failed to preview image:", error);
      toast.error("Failed to preview image");
    }
  };

  const uploadToS3 = async (file: File): Promise<string> => {
    try {
      const compressedFile = await compressImage(file, 800, 800, 0.85);
      const result = await uploadImageToS3(compressedFile, (progress) => {
        setUploadProgress(progress.percentage);
      });

      if (!result.success) {
        throw new Error(result.error || "Upload failed");
      }

      // Return the full S3 URL, not just the key
      return result.url;
    } catch (error) {
      console.error("S3 upload error:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error("Please select an image");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const imageUrl = await uploadToS3(imageFile);

      console.log("✅ Image uploaded to S3:", imageUrl);

      const productData = {
        title,
        description,
        price: parseFloat(price),
        category,
        imageUrl, // Changed from imageKey to imageUrl
      };

      console.log("📦 Creating product with data:", productData);

      const result = await lambdaAPI.createProduct(productData);

      if (result.success) {
        toast.success("Product created successfully! 🎉");
        setTitle("");
        setDescription("");
        setPrice("");
        setCategory("Electronics");
        setImageFile(null);
        setImagePreview("");
        setUploadProgress(0);
        loadMyProducts();
      } else {
        throw new Error(result.error || "Failed to create product");
      }
    } catch (err: any) {
      console.error("Failed to create product:", err);
      toast.error(err.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      "Are you sure you want to delete this product? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      console.log("🗑️ Deleting product:", productId);

      const result = await lambdaAPI.deleteProduct(productId);

      if (result.success) {
        toast.success("Product deleted successfully! 🗑️");
        console.log("✅ Product deleted");

        // Reload products to update the list
        await loadMyProducts();
      } else {
        throw new Error(result.error || "Failed to delete product");
      }
    } catch (error: any) {
      console.error("❌ Failed to delete product:", error);

      // Show debug info from the error
      if (error.response?.data?.debug) {
        console.error("🔍 DEBUG INFO:", error.response.data.debug);
        alert(
          `Delete failed!\n\n` +
            `Product vendor: ${
              error.response.data.debug.productVendorId ||
              error.response.data.debug.productVendorIdAlt
            }\n` +
            `Your userId: ${error.response.data.debug.yourUserId}\n` +
            `Your username: ${error.response.data.debug.yourUsername}\n\n` +
            `${error.response.data.debug.message}`
        );
      }

      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Failed to delete product"
      );
    }
  };

  // Calculate stats
  const totalProducts = myProducts.length;
  const totalViews = myProducts.reduce((sum, p) => sum + (p.views || 0), 0);
  const inventoryValue = myProducts.reduce((sum, p) => sum + p.price, 0);
  const uniqueCategories = new Set(myProducts.map((p) => p.category)).size;

  // Get recent products (max 5)
  const recentProducts = myProducts.slice(0, 5);

  return (
    <VendorLayout>
      <Toaster position="top-center" />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#8C5630] to-[#754626] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-bold">Vendor Dashboard</h1>
            <p className="mt-2 text-white/90">
              Welcome back! Manage your products and grow your business.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards - Single Set with Brown/White Theme */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Products
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {totalProducts}
                  </p>
                </div>
                <div
                  className="h-12 w-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#8C563020" }}
                >
                  <svg
                    className="h-6 w-6"
                    style={{ color: "#8C5630" }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Views
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {totalViews}
                  </p>
                </div>
                <div
                  className="h-12 w-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#22C55E20" }}
                >
                  <EyeIcon className="h-6 w-6" style={{ color: "#22C55E" }} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Inventory Value
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    ${inventoryValue.toFixed(2)}
                  </p>
                </div>
                <div
                  className="h-12 w-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#8C563020" }}
                >
                  <ChartBarIcon
                    className="h-6 w-6"
                    style={{ color: "#8C5630" }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Categories
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {uniqueCategories}
                  </p>
                </div>
                <div
                  className="h-12 w-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#22C55E20" }}
                >
                  <svg
                    className="h-6 w-6"
                    style={{ color: "#22C55E" }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Products Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Recent Products
              </h2>
              <button
                onClick={() => navigate("/vendor/products")}
                className="flex items-center space-x-2 text-[#8C5630] hover:text-[#754626] font-medium"
              >
                <span>View All</span>
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </div>

            {recentProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-gray-500">No products yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Create your first product using the form below
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentProducts.map((product) => (
                  <div
                    key={product.product_id}
                    className="group relative border border-gray-200 rounded-lg p-4 hover:border-[#8C5630] hover:shadow-lg transition"
                  >
                    <img
                      src={
                        product.imageUrl || "https://via.placeholder.com/300"
                      }
                      alt={product.title || product.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-semibold text-gray-900">
                      {product.title || product.name}
                    </h3>
                    <p className="text-[#8C5630] font-bold text-lg">
                      ${product.price}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                      <span className="flex items-center">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        {product.views || 0} views
                      </span>
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {product.category}
                      </span>
                    </div>

                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-2">
                      <button
                        onClick={() =>
                          navigate(`/vendor/analytics/${product.product_id}`)
                        }
                        className="px-4 py-2 bg-white text-[#8C5630] rounded-lg hover:bg-gray-100 transition font-medium text-sm"
                      >
                        📊 View Analytics
                      </button>
                      <button
                        onClick={() => handleDelete(product.product_id)}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Product Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Add New Product
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Enter product title"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8C5630] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      placeholder="0.00"
                      className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8C5630] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8C5630] focus:border-transparent"
                  >
                    <option>Electronics</option>
                    <option>Clothing</option>
                    <option>Home & Garden</option>
                    <option>Books</option>
                    <option>Sports</option>
                    <option>Toys</option>
                    <option>Beauty</option>
                    <option>Food</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image *
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      required={!imageFile}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8C5630] focus:border-transparent"
                    />
                    <PhotoIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Enter product description"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8C5630] focus:border-transparent"
                />
              </div>

              {imagePreview && (
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview("");
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          Uploading...
                        </span>
                        <span className="text-sm font-medium text-[#8C5630]">
                          {uploadProgress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${uploadProgress}%`,
                            backgroundColor: "#8C5630",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-[#8C5630] text-white rounded-lg hover:bg-[#754626] disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-5 w-5" />
                      <span>Create Product</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </VendorLayout>
  );
}
