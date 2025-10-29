import React from "react";
import { motion } from "framer-motion";


interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
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
    description: "Latest gadgets and smart devices",
    image: "/src/assets/images/electronics.jpg",
    color: "bg-blue-50",
  },
  {
    id: "fashion",
    name: "Fashion",
    description: "Trendy clothing and accessories",
    image: "/src/assets/categoryimg1.jpg",
    color: "bg-pink-50",
  },
  {
    id: "home-living",
    name: "Home & Living",
    description: "Furniture and home decor",
    image: "/src/assets/categoryimg2.jpg",
    color: "bg-amber-50",
  },
  {
    id: "beauty",
    name: "Beauty",
    description: "Cosmetics and personal care",
    image: "/src/assets/categoryimg3.jpg",
    color: "bg-purple-50",
  },
  {
    id: "sports",
    name: "Sports & Fitness",
    description: "Sports gear and equipment",
    image: "/src/assets/images/sports.jpg",
    color: "bg-green-50",
  },
  {
    id: "books",
    name: "Books & Media",
    description: "Books, movies, and music",
    image: "/src/assets/categoryimg4.jpg",
    color: "bg-yellow-50",
  },
];

export default function CategoryGrid({
  onSelectCategory,
  selectedCategory,
}: CategoryGridProps) {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="px-4 py-12 max-w-6xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">
          Shop by Category
        </h2>
        <p className="text-gray-600">
          Discover our wide range of products across various categories
        </p>
      </div>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {categories.map((category) => (
          <motion.button
            key={category.id}
            variants={itemVariant}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectCategory(category.id)}
            className={`group relative text-center p-4 rounded-xl ${category.color} hover:shadow-md transition-all duration-300`}
          >
            <div className="aspect-[4/3] mb-4 rounded-lg overflow-hidden bg-white shadow-sm">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="relative">
              <h3 className="text-gray-800 font-semibold text-lg mb-1">
                {category.name}
              </h3>
              <p className="text-gray-600 text-xs">{category.description}</p>
            </div>
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black ring-opacity-0 group-hover:ring-opacity-5 transition-opacity" />
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
