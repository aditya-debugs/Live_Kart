import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  StarIcon,
  HeartIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartSolid,
  StarIcon as StarSolid,
} from "@heroicons/react/24/solid";

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
  const [imageError, setImageError] = useState(false);

  const rating = product.rating || 4.0 + Math.random();
  const reviews = product.reviews || Math.floor(Math.random() * 5000) + 100;
  const discount =
    product.discount ||
    (Math.random() > 0.5 ? Math.floor(Math.random() * 30) + 10 : 0);
  const originalPrice = discount
    ? product.price / (1 - discount / 100)
    : product.price;
  const inStock = product.inStock !== false;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onAddToCart && inStock) {
      onAddToCart(product);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onToggleWishlist) {
      onToggleWishlist(product.product_id);
    }
  };

  return (
    <Link to={`/product/${product.product_id}`} className="group">
      <div className="card h-full flex flex-col relative overflow-hidden">
        {/* Wishlist button */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 z-10 bg-white rounded-full p-1.5 shadow-soft opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          aria-label="Add to wishlist"
        >
          {isInWishlist ? (
            <HeartSolid className="h-5 w-5 text-error-500" />
          ) : (
            <HeartIcon className="h-5 w-5 text-neutral-600 hover:text-error-500" />
          )}
        </button>

        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 z-10 bg-error-500 text-white text-xs font-semibold px-2 py-1 rounded">
            {discount}% OFF
          </div>
        )}

        {/* Product Image */}
        <div className="relative w-full pt-[100%] bg-neutral-50 overflow-hidden">
          {!imageError && product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ShoppingCartIcon className="h-16 w-16 text-neutral-300" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Category */}
          {product.category && (
            <span className="text-xs text-neutral-500 font-medium uppercase tracking-wide mb-1">
              {product.category}
            </span>
          )}

          {/* Title */}
          <h3 className="font-medium text-neutral-900 text-sm line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
            {product.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) =>
                i < Math.floor(rating) ? (
                  <StarSolid key={i} className="h-4 w-4 text-warning-500" />
                ) : (
                  <StarIcon key={i} className="h-4 w-4 text-neutral-300" />
                )
              )}
            </div>
            <span className="text-xs text-neutral-600 ml-1">
              {rating.toFixed(1)} ({reviews.toLocaleString()})
            </span>
          </div>

          {/* Price */}
          <div className="mt-auto">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-xl font-bold text-neutral-900">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {discount > 0 && (
                <span className="text-sm text-neutral-500 line-through">
                  ₹{Math.round(originalPrice).toLocaleString("en-IN")}
                </span>
              )}
            </div>

            {/* Stock status */}
            {!inStock && (
              <p className="text-xs text-error-600 font-medium mb-2">
                Out of Stock
              </p>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className="w-full py-2 px-4 text-white rounded-lg font-medium disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors duration-200 text-sm hover:brightness-90 active:brightness-75"
              style={{ backgroundColor: "#8C5630" }}
            >
              {inStock ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
