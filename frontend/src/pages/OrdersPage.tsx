import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  UserCircleIcon,
  ShoppingBagIcon,
  HeartIcon,
  TruckIcon,
  DocumentTextIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import lambdaAPI from "../utils/lambdaAPI";
import CustomerLayout from "../layouts/CustomerLayout";
import { useAuth } from "../utils/AuthContext";
import toast, { Toaster } from "react-hot-toast";

// Order type matching Lambda response
type Order = {
  order_id: string;
  user_id: string;
  items: Array<{
    product_id: string;
    title?: string;
    price: number;
    quantity: number;
    imageUrl?: string;
  }>;
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: number;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [timeFrame, setTimeFrame] = useState<string>("last3months");

  const navigationItems = [
    { icon: UserCircleIcon, label: "Profile Information", href: "/profile" },
    { icon: ShoppingBagIcon, label: "Orders", href: "/orders", active: true },
    { icon: HeartIcon, label: "Wishlist", href: "/wishlist" },
  ];

  useEffect(() => {
    loadOrders();
  }, [timeFrame, filterStatus]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // Use Lambda API to get orders
      const response = await lambdaAPI.getOrders();
      setOrders(response.orders || []);
    } catch (error) {
      toast.error("Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return "text-green-600";
      case "shipped":
        return "text-blue-600";
      case "processing":
        return "text-yellow-600";
      case "cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return <TruckIcon className="h-5 w-5 text-green-600" />;
      case "shipped":
        return <TruckIcon className="h-5 w-5 text-blue-600" />;
      case "processing":
        return <ArrowPathIcon className="h-5 w-5 text-yellow-600" />;
      case "cancelled":
        return <DocumentTextIcon className="h-5 w-5 text-red-600" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <CustomerLayout wishlistCount={0} cartCount={0} onCartClick={() => {}}>
      <Toaster position="top-right" />

      {/* Page Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-neutral-900">My Orders</h1>
          <p className="mt-2 text-neutral-600">
            View and track your order history
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-3 mb-8 lg:mb-0">
            <nav className="space-y-1 bg-white rounded-xl border border-neutral-200 p-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    item.active
                      ? "bg-primary-600 text-white"
                      : "text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9 mt-8 lg:mt-0">
            <div className="bg-white shadow-sm rounded-lg">
              {/* Orders Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Your Orders
                  </h2>
                  <div className="mt-3 sm:mt-0 flex space-x-4">
                    <select
                      value={timeFrame}
                      onChange={(e) => setTimeFrame(e.target.value)}
                      className="block w-full sm:w-auto rounded-md border-gray-300 text-sm focus:ring-[#8C5630] focus:border-[#8C5630]"
                    >
                      <option value="last30days">Last 30 days</option>
                      <option value="last3months">Last 3 months</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                    </select>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="block w-full sm:w-auto rounded-md border-gray-300 text-sm focus:ring-[#8C5630] focus:border-[#8C5630]"
                    >
                      <option value="all">All Orders</option>
                      <option value="delivered">Delivered</option>
                      <option value="shipped">Shipped</option>
                      <option value="processing">Processing</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Orders List */}
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8C5630]" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-base font-medium text-gray-900">
                    No orders found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    We haven't found any orders matching your criteria.
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/customer"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#8C5630] hover:bg-[#754626] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8C5630]"
                    >
                      Start Shopping
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <div key={order.order_id} className="p-6">
                      {/* Order Header */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">ORDER PLACED</p>
                          <p className="text-sm">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">TOTAL</p>
                          <p className="text-sm font-medium">
                            {formatPrice(order.totalAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">SHIP TO</p>
                          <p className="text-sm truncate">
                            {order.shippingAddress?.street || "N/A"},{" "}
                            {order.shippingAddress?.city || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">ORDER ID</p>
                          <p className="text-sm">{order.order_id}</p>
                        </div>
                      </div>

                      {/* Status Bar */}
                      <div className="flex items-center mb-4">
                        {getStatusIcon(order.status)}
                        <span
                          className={`ml-2 text-sm font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-4">
                        {order.items.map((item) => (
                          <div key={item.product_id} className="flex space-x-4">
                            <div className="flex-shrink-0 w-20 h-20">
                              <img
                                src={
                                  item.imageUrl ||
                                  `https://source.unsplash.com/400x400/?product`
                                }
                                alt={item.title}
                                className="w-full h-full object-cover rounded-md"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900">
                                {item.title}
                              </h4>
                              <p className="mt-1 text-sm text-gray-500">
                                Quantity: {item.quantity}
                              </p>
                              <p className="mt-1 text-sm font-medium text-gray-900">
                                {formatPrice(item.price)}
                              </p>
                              {order.status === "delivered" && (
                                <button
                                  onClick={() => {
                                    toast.success(
                                      "Buy Again feature coming soon!"
                                    );
                                  }}
                                  className="mt-2 text-sm text-[#8C5630] hover:text-[#754626]"
                                >
                                  Buy Again
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Actions */}
                      <div className="mt-4 flex space-x-4">
                        <button
                          onClick={() => {
                            toast.success("Track Package feature coming soon!");
                          }}
                          className="text-sm text-[#8C5630] hover:text-[#754626]"
                        >
                          Track Package
                        </button>
                        <button
                          onClick={() => {
                            toast.success("Order details feature coming soon!");
                          }}
                          className="text-sm text-[#8C5630] hover:text-[#754626]"
                        >
                          View Order Details
                        </button>
                        {order.status === "delivered" && (
                          <button
                            onClick={() => {
                              toast.success("Review feature coming soon!");
                            }}
                            className="text-sm text-[#8C5630] hover:text-[#754626]"
                          >
                            Write a Product Review
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </CustomerLayout>
  );
}
