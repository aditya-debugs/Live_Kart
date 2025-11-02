import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import CustomerHome from "./pages/CustomerHome";
import VendorDashboard from "./pages/VendorDashboard";
import ProductAnalytics from "./pages/ProductAnalytics";
import AdminOverview from "./pages/AdminOverview";
import WishlistPage from "./pages/WishlistPage";
import ProfilePage from "./pages/ProfilePage";
import OrdersPage from "./pages/OrdersPage";
import { AuthProvider } from "./utils/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Customer Routes */}
        <Route
          path="/customer"
          element={
            <ProtectedRoute requiredRole="customer">
              <CustomerHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Vendor Routes */}
        <Route
          path="/vendor"
          element={
            <ProtectedRoute requiredRole="vendor">
              <VendorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/analytics/:productId"
          element={
            <ProtectedRoute requiredRole="vendor">
              <ProductAnalytics />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminOverview />
            </ProtectedRoute>
          }
        />

        {/* Default Route */}
        <Route path="/" element={<CustomerHome />} />
      </Routes>
    </AuthProvider>
  );
}
