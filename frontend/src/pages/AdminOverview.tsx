import React, { useEffect, useState } from "react";
import api from "../utils/api";

type Product = {
  product_id: string;
  title: string;
  price: number;
  views: number;
  vendor_id: string;
};

type Analytics = {
  totalProducts: number;
  totalViews: number;
  avgPrice: string;
  topCategory: string;
  recentProducts: Product[];
};

export default function AdminOverview() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [trending, setTrending] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, trendingRes] = await Promise.all([
        api.get("/getAnalytics"),
        api.get("/getTrending"),
      ]);
      setAnalytics(analyticsRes.data);
      setTrending(trendingRes.data);
    } catch (err) {
      console.error("Failed to load analytics", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Monitor your platform's performance and analytics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold opacity-90">Total Products</h3>
            <span className="text-2xl">📦</span>
          </div>
          <p className="text-4xl font-bold">{analytics?.totalProducts || 0}</p>
          <p className="text-xs opacity-75 mt-2">Active listings</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold opacity-90">Total Views</h3>
            <span className="text-2xl">👁️</span>
          </div>
          <p className="text-4xl font-bold">{analytics?.totalViews || 0}</p>
          <p className="text-xs opacity-75 mt-2">Product impressions</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold opacity-90">Avg Price</h3>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-4xl font-bold">${analytics?.avgPrice || "0.00"}</p>
          <p className="text-xs opacity-75 mt-2">Per product</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold opacity-90">Top Category</h3>
            <span className="text-2xl">⭐</span>
          </div>
          <p className="text-2xl font-bold">
            {analytics?.topCategory || "N/A"}
          </p>
          <p className="text-xs opacity-75 mt-2">Most popular</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trending Products */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            🔥 Trending Products
          </h2>
          <div className="space-y-4">
            {trending.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No trending data</p>
            ) : (
              trending.slice(0, 5).map((product, index) => (
                <div
                  key={product.product_id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {product.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      ${product.price.toFixed(2)} • 👁️ {product.views} views
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            🆕 Recently Added
          </h2>
          <div className="space-y-4">
            {!analytics?.recentProducts ||
            analytics.recentProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No recent products
              </p>
            ) : (
              analytics.recentProducts.map((product) => (
                <div
                  key={product.product_id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {product.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      ${product.price.toFixed(2)} • by {product.vendor_id}
                    </p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                    New
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="mt-8 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">⚙️ System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="opacity-75">Platform Status:</span>
            <p className="font-semibold text-green-400">✓ Operational</p>
          </div>
          <div>
            <span className="opacity-75">Database:</span>
            <p className="font-semibold">Mock In-Memory (Development)</p>
          </div>
          <div>
            <span className="opacity-75">AWS Integration:</span>
            <p className="font-semibold text-yellow-400">⚠️ Disabled</p>
          </div>
        </div>
      </div>
    </div>
  );
}
