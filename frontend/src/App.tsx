import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import CustomerHome from "./pages/CustomerHome";
import VendorDashboard from "./pages/VendorDashboard";
import AdminOverview from "./pages/AdminOverview";
import WishlistPage from "./pages/WishlistPage";
import ProfilePage from "./pages/ProfilePage";
import OrdersPage from "./pages/OrdersPage";
import { AuthProvider } from "./utils/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/customer" element={<CustomerHome />} />
        <Route path="/vendor" element={<VendorDashboard />} />
        <Route path="/admin" element={<AdminOverview />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/" element={<CustomerHome />} />
      </Routes>
    </AuthProvider>
  );
}
