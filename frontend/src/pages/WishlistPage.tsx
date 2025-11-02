import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HeartIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import CustomerLayout from "../layouts/CustomerLayout";
import { useAuth } from "../utils/AuthContext";
import CartDrawer from "../components/CartDrawer";
import ProductCard from "../components/ProductCard";
import toast, { Toaster } from "react-hot-toast";
import { getWishlistProducts } from "../utils/api";

type Product = {
  product_id: string;
  vendor_id: string;
  title: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category?: string;
  quantity?: number;
};

interface CartItem extends Product {
  quantity: number;
}

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      // Load wishlist IDs from localStorage
      const savedWishlist = localStorage.getItem("wishlist");
      const wishlistIds = savedWishlist ? JSON.parse(savedWishlist) : [];
      setWishlist(new Set(wishlistIds));

      if (wishlistIds.length > 0) {
        // Fetch the full product details for wishlist items
        const wishlistProducts = await getWishlistProducts(wishlistIds);
        setProducts(wishlistProducts);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Failed to load wishlist:", error);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWishlist = (productId: string) => {
    const newWishlist = new Set(wishlist);
    if (wishlist.has(productId)) {
      newWishlist.delete(productId);
      toast.success("Removed from wishlist");
      // Remove the product from the displayed list
      setProducts(products.filter((p) => p.product_id !== productId));
    }
    setWishlist(newWishlist);
    localStorage.setItem("wishlist", JSON.stringify([...newWishlist]));
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(
      (item) => item.product_id === product.product_id
    );
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product_id === product.product_id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    toast.success("Added to cart");
  };

  const handleAddAllToCart = () => {
    const newItems = products
      .filter(
        (product) =>
          !cart.some((item) => item.product_id === product.product_id)
      )
      .map((product) => ({ ...product, quantity: 1 }));

    setCart([...cart, ...newItems]);
    toast.success("All items added to cart");
  };

  const getTotalItems = () =>
    cart.reduce((total, item) => total + (item.quantity || 1), 0);

  if (loading) {
    return (
      <CustomerLayout
        cartCount={getTotalItems()}
        wishlistCount={wishlist.size}
        onCartClick={() => setShowCart(true)}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout
      cartCount={getTotalItems()}
      wishlistCount={wishlist.size}
      onCartClick={() => setShowCart(true)}
    >
      <Toaster position="top-right" />

      <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="mt-2 text-gray-600">{products.length} items saved</p>
          </div>
          {products.length > 0 && (
            <button
              onClick={handleAddAllToCart}
              className="flex items-center gap-2 px-4 py-2 bg-[#8C5630] text-white rounded-lg hover:bg-[#754626] transition"
            >
              <ShoppingBagIcon className="h-5 w-5" />
              Add All to Cart
            </button>
          )}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <HeartIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Your wishlist is empty
            </h3>
            <p className="mt-2 text-gray-500">
              Save items you like by clicking the heart icon on products
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {products.map((product, index) => (
              <motion.div
                key={product.product_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard
                  product={product}
                  onAddToCart={() => addToCart(product)}
                  onToggleWishlist={() =>
                    handleToggleWishlist(product.product_id)
                  }
                  isInWishlist={wishlist.has(product.product_id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <CartDrawer
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        items={cart}
        onUpdateQuantity={(productId, quantity) => {
          setCart(
            cart.map((item) =>
              item.product_id === productId ? { ...item, quantity } : item
            )
          );
        }}
        onRemoveItem={(productId) => {
          setCart(cart.filter((item) => item.product_id !== productId));
        }}
        onCheckout={() => {
          toast.success("Proceeding to checkout...");
        }}
      />
    </CustomerLayout>
  );
}
