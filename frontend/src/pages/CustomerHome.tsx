import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRightIcon,
  SparklesIcon,
  TruckIcon,
  ShieldCheckIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import api from "../utils/api";
import lambdaAPI from "../utils/lambdaAPI";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import CategoryGrid from "../components/CategoryGrid";
import CartDrawer from "../components/CartDrawer";
import toast, { Toaster } from "react-hot-toast";
import { S3_IMAGES } from "../config/s3-images";

type Product = {
  product_id: string;
  vendor_id: string;
  title: string;
  description?: string;
  price: number;
  imageUrl?: string;
  views?: number;
  category?: string;
  quantity?: number;
};

interface CartItem extends Product {
  quantity: number;
}

export default function CustomerHome() {
  // Use S3 banners instead of local imports
  const banners = S3_IMAGES.banners;
  const [currentBanner, setCurrentBanner] = useState(0);

  // Auto-advance banners every 5 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setCurrentBanner((c) => (c + 1) % banners.length);
    }, 5000);
    return () => clearInterval(id);
  }, [banners.length]);

  const prevBanner = () =>
    setCurrentBanner((c) => (c - 1 + banners.length) % banners.length);
  const nextBanner = () => setCurrentBanner((c) => (c + 1) % banners.length);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Use Lambda API instead of old API
      const res = await lambdaAPI.getProducts();
      // Ensure all products have image URLs
      const productsWithImages = (res.products || []).map(
        (product: Product, index: number) => ({
          ...product,
          imageUrl:
            product.imageUrl ||
            S3_IMAGES.products[index % S3_IMAGES.products.length] ||
            `https://source.unsplash.com/400x400/?${
              product.category || "product"
            }`,
        })
      );
      setProducts(productsWithImages);
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
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.product_id === product.product_id
      );
      if (existingItem) {
        return prevCart.map((item) =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });

    toast.success("Added to cart!", {
      icon: "🛒",
      duration: 2000,
      position: "top-center",
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product_id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.product_id !== productId)
    );
    toast.success("Removed from cart");
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(productId)) {
        newWishlist.delete(productId);
        toast.success("Removed from wishlist");
      } else {
        newWishlist.add(productId);
        toast.success("Added to wishlist", { icon: "❤️" });
      }
      return newWishlist;
    });
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const totalAmount = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    try {
      await api.post("/placeOrder", {
        customerEmail: "customer@example.com",
        items: cart,
        totalAmount: totalAmount.toFixed(2),
      });
      toast.success("🎉 Order placed successfully!");
      setCart([]);
      setShowCart(false);
    } catch (err) {
      toast.error("Failed to place order");
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    window.scrollTo({ top: 600, behavior: "smooth" });
  };

  const [sortOption, setSortOption] = useState<string>("featured");

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      p.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Apply sorting based on the selected sort option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "best-selling":
        return (b.views || 0) - (a.views || 0);
      // 'featured' and 'newest' fall back to original order
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header cartCount={0} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">
              Loading amazing products...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header cartCount={0} />
        <div className="max-w-2xl mx-auto mt-12 px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-8 py-6 rounded-xl shadow-lg">
            <h3 className="font-bold text-xl mb-3">⚠️ Error</h3>
            <p className="mb-4">{error}</p>
            <button
              onClick={loadProducts}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      <Header
        cartCount={getTotalItems()}
        onCartClick={() => setShowCart(true)}
        onSearchChange={handleSearchChange}
        wishlistCount={wishlist.size}
      />

      {/* Hero Banner (carousel) */}
      <div className="hero-section relative h-[820px] md:h-[650px] sm:h-[520px] z-10 overflow-hidden bg-gray-900">
        <div className="absolute inset-0">
          <AnimatePresence initial={false}>
            {banners.map((src, idx) => (
              <motion.div
                key={src}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: idx === currentBanner ? 1 : 0,
                  transition: { duration: 0.4 },
                }}
                transition={{
                  duration: 0.4,
                  ease: "easeInOut",
                }}
                style={{
                  zIndex: idx === currentBanner ? 1 : 0,
                }}
              >
                <img
                  src={src}
                  alt={`LiveKart Banner ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {idx === 0 && (
                  <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {/* keep spacing but remove any overlay text/icons so nothing appears during transitions */}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-6 pt-28 pb-16" />
      </div>

      {/* Today's Deals Banner */}
      <div className="hot-deals">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SparklesIcon className="h-6 w-6" />
              <span className="font-bold text-lg">Today's Hot Deals</span>
            </div>
            <button className="flex items-center space-x-2 hover:opacity-80 transition">
              <span className="font-semibold">View All</span>
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div style={{ backgroundColor: "#F3DCC0" }} className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <CategoryGrid
              onSelectCategory={handleCategorySelect}
              selectedCategory={selectedCategory}
            />
          </motion.div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {selectedCategory === "all"
                ? "All Products"
                : `${selectedCategory} Products`}
            </h2>
            <p className="text-gray-600">
              {filteredProducts.length} products available
            </p>
          </div>

          {/* Filter/Sort options */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="best-selling">Best Selling</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filters
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSortOption("featured");
              }}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {sortedProducts.slice(0, 12).map((product, index) => (
              <motion.div
                key={product.product_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard
                  product={product}
                  onAddToCart={() => addToCart(product)}
                  onToggleWishlist={() => toggleWishlist(product.product_id)}
                  isInWishlist={wishlist.has(product.product_id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
      />

      <Footer />
    </div>
  );
}
