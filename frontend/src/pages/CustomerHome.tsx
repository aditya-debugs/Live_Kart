import React, { useEffect, useState } from "react";
import api from "../utils/api";

type Product = {
  product_id: string;
  vendor_id: string;
  title: string;
  description?: string;
  price: number;
  imageUrl?: string;
  views?: number;
  category?: string;
};

export default function CustomerHome() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState<Product[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/getProducts");
      setProducts(res.data);
      setError("");
    } catch (err) {
      setError(
        "Failed to load products. Please check if the backend is running."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart([...cart, product]);
    // Show brief notification
    const notification = document.createElement("div");
    notification.className =
      "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce";
    notification.textContent = "✓ Added to cart!";
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      await api.post("/placeOrder", {
        customerEmail: "customer@example.com",
        items: cart,
        totalAmount: getTotalPrice(),
      });
      alert("🎉 Order placed successfully!");
      setCart([]);
      setShowCart(false);
    } catch (err) {
      alert("Failed to place order");
    }
  };

  const categories = [
    "All",
    ...new Set(products.map((p) => p.category || "General").filter(Boolean)),
  ];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading amazing products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <h3 className="font-semibold mb-2">⚠️ Error</h3>
          <p>{error}</p>
          <button
            onClick={loadProducts}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Discover Amazing Products
            </h1>
            <p className="text-gray-600">
              Browse our collection of {products.length} premium products
            </p>
          </div>
          <button
            onClick={() => setShowCart(true)}
            className="relative px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-lg"
          >
            🛒 Cart
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="🔍 Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => (
            <div
              key={p.product_id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="relative">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    className="w-full h-56 object-cover"
                  />
                ) : (
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-56 flex items-center justify-center">
                    <span className="text-gray-400 text-4xl">📦</span>
                  </div>
                )}
                {p.category && (
                  <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700">
                    {p.category}
                  </span>
                )}
              </div>

              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
                  {p.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
                  {p.description || "No description available"}
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-indigo-600">
                      ${p.price.toFixed(2)}
                    </div>
                    {p.views !== undefined && (
                      <div className="text-xs text-gray-500">
                        👁️ {p.views} views
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => addToCart(p)}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  Shopping Cart ({cart.length})
                </h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <img
                        src={item.imageUrl || "https://via.placeholder.com/100"}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.title}</h4>
                        <p className="text-sm text-gray-600">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="text-red-500 hover:text-red-700 font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold">Total:</span>
                  <span className="text-3xl font-bold text-indigo-600">
                    ${getTotalPrice()}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold text-lg"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
