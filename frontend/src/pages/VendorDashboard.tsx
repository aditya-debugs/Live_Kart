import React, { useState, useEffect } from "react";
import api from "../utils/api";
import lambdaAPI from "../utils/lambdaAPI";
import { useAuth } from "../utils/AuthContext";

type Product = {
  product_id: string;
  name?: string;
  title?: string;
  price: number;
  imageUrl?: string;
  views?: number;
  vendorId?: string;
};

export default function VendorDashboard() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [myProducts, setMyProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadMyProducts();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please sign in as a vendor");
      return;
    }

    setLoading(true);
    try {
      // For now, use a placeholder image or URL
      const productImageUrl =
        imageUrl ||
        `https://via.placeholder.com/500?text=${encodeURIComponent(title)}`;

      // Use Lambda API to create product
      await lambdaAPI.createProduct({
        title: title, // ✅ Fixed: Changed from 'name' to 'title' to match Lambda
        description,
        price: Number(price),
        imageUrl: productImageUrl,
        category,
        stock: 100, // Default stock
      });

      alert("✅ Product added successfully!");

      // Reset form
      setTitle("");
      setDescription("");
      setPrice("");
      setImageUrl("");
      setCategory("Electronics");

      // Reload products
      loadMyProducts();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add product");
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
                Image URL (Optional)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Try using images from Unsplash.com for free high-quality
                photos
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
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
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            My Products ({myProducts.length})
          </h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {myProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-gray-500">No products yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Add your first product to get started!
                </p>
              </div>
            ) : (
              myProducts.map((product) => (
                <div
                  key={product.product_id}
                  className="flex items-center gap-4 p-4 bg-[#F5E6D3] rounded-lg hover:bg-[#E6D7C3] transition"
                >
                  <img
                    src={product.imageUrl || "https://via.placeholder.com/80"}
                    alt={product.name || product.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {product.name || product.title || "Unnamed Product"}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      ${product.price.toFixed(2)}
                    </p>
                    {product.views !== undefined && (
                      <p className="text-xs text-gray-500 mt-1">
                        {product.views} views
                      </p>
                    )}
                    {product.vendorId && (
                      <p className="text-xs text-gray-400 mt-1">
                        Vendor: {product.vendorId}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#8C5630] to-[#754626] text-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Total Products</h3>
          <p className="text-4xl font-bold">{myProducts.length}</p>
        </div>
        <div className="bg-gradient-to-br from-[#A66B3A] to-[#8C5630] text-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
          <p className="text-4xl font-bold">
            ${myProducts.reduce((sum, p) => sum + p.price, 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-[#754626] to-[#63381D] text-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Total Views</h3>
          <p className="text-4xl font-bold">
            {myProducts.reduce((sum, p) => sum + (p.views || 0), 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
