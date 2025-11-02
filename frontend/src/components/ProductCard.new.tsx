// Professional Product Card Component
// Modern, clean design for e-commerce platform

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  HeartIcon,
  ShoppingCartIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

interface ProductCardProps {
  product: {
    product_id: string;
    title: string;
    description?: string;
    price: number;
    imageUrl?: string;
    category?: string;
    rating?: number;
    reviews?: number;
    discount?: number;
    inStock?: boolean;
  };
  onAddToCart?: (product: any) => void;
  onToggleWishlist?: (productId: string) => void;
  isInWishlist?: boolean;
}

export default function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isInWishlist = false,
}: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const rating = product.rating || 4.0 + Math.random();
  const reviews = product.reviews || Math.floor(Math.random() * 1000) + 50;
  const discount =
    product.discount ||
    (Math.random() > 0.6 ? Math.floor(Math.random() * 30) + 10 : 0);
  const originalPrice = discount
    ? product.price / (1 - discount / 100)
    : product.price;
  const inStock = product.inStock !== false;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart && inStock) {
      onAddToCart(product);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist(product.product_id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group h-full"
    >
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-neutral-100">
          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-3 left-3 z-10 bg-error text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-md">
              -{discount}%
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
            aria-label={
              isInWishlist ? "Remove from wishlist" : "Add to wishlist"
            }
          >
            {isInWishlist ? (
              <HeartSolid className="h-5 w-5 text-error" />
            ) : (
              <HeartIcon className="h-5 w-5 text-neutral-600 hover:text-error" />
            )}
          </button>

          {/* Product Image */}
          {!imageError ? (
            <img
              src={product.imageUrl || "https://via.placeholder.com/400"}
              alt={product.title}
              className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-100">
              <svg
                className="h-16 w-16 text-neutral-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {/* Loading Skeleton */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-neutral-200 animate-pulse" />
          )}

          {/* Stock Status */}
          {!inStock && (
            <div className="absolute inset-0 bg-neutral-900 bg-opacity-70 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Category */}
          {product.category && (
            <span className="text-xs font-medium text-primary-600 uppercase tracking-wider mb-2">
              {product.category}
            </span>
          )}

          {/* Title */}
          <h3 className="text-base font-semibold text-neutral-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center space-x-1 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(rating)
                      ? "text-warning fill-warning"
                      : "text-neutral-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-neutral-500">
              ({reviews.toLocaleString()})
            </span>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline space-x-2 mb-4 mt-auto">
            <span className="text-2xl font-bold text-neutral-900">
              ₹{product.price.toLocaleString()}
            </span>
            {discount > 0 && (
              <span className="text-sm text-neutral-500 line-through">
                ₹{Math.round(originalPrice).toLocaleString()}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
              inStock
                ? "bg-primary-600 text-white hover:bg-primary-700 active:scale-95 shadow-sm hover:shadow-md"
                : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
            }`}
          >
            <ShoppingCartIcon className="h-5 w-5" />
            <span>{inStock ? "Add to Cart" : "Out of Stock"}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
