import React from "react";
import { motion } from "framer-motion";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface CategoryGridProps {
  onSelectCategory: (category: string) => void;
  selectedCategory?: string;
}

const categories: Category[] = [
  {
    id: "electronics",
    name: "Electronics",
    icon: "💻",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "fashion",
    name: "Fashion",
    icon: "👔",
    color: "from-pink-500 to-pink-600",
  },
  {
    id: "home",
    name: "Home & Kitchen",
    icon: "🏠",
    color: "from-green-500 to-green-600",
  },
  {
    id: "books",
    name: "Books",
    icon: "📚",
    color: "from-yellow-500 to-yellow-600",
  },
  {
    id: "sports",
    name: "Sports",
    icon: "⚽",
    color: "from-red-500 to-red-600",
  },
  {
    id: "toys",
    name: "Toys & Games",
    icon: "🎮",
    color: "from-purple-500 to-purple-600",
  },
  {
    id: "beauty",
    name: "Beauty",
    icon: "💄",
    color: "from-indigo-500 to-indigo-600",
  },
  {
    id: "automotive",
    name: "Automotive",
    icon: "🚗",
    color: "from-gray-700 to-gray-800",
  },
];

export default function CategoryGrid({
  onSelectCategory,
  selectedCategory,
}: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
      {categories.map((category, index) => (
        <motion.button
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelectCategory(category.id)}
          className={`relative overflow-hidden rounded-xl p-6 text-center transition-all ${
            selectedCategory === category.id
              ? "ring-4 ring-indigo-500 shadow-xl"
              : "shadow-md hover:shadow-lg"
          }`}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90`}
          />
          <div className="relative">
            <div className="text-4xl mb-2">{category.icon}</div>
            <div className="text-white font-semibold text-sm">
              {category.name}
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
