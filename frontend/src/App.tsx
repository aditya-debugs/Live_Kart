import React from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import CustomerHome from "./pages/CustomerHome";
import VendorDashboard from "./pages/VendorDashboard";
import AdminOverview from "./pages/AdminOverview";
import { AuthProvider, useAuth } from "./utils/AuthContext";

const Nav = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Main Links */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-3xl">🛒</span>
              <span className="font-bold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                LiveKart
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/customer"
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  isActive("/customer") || isActive("/")
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                🛍️ Shop
              </Link>
              <Link
                to="/vendor"
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  isActive("/vendor")
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                💼 Sell
              </Link>
              <Link
                to="/admin"
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  isActive("/admin")
                    ? "bg-orange-100 text-orange-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                ⚙️ Admin
              </Link>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {user.username}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user.role}
                  </p>
                </div>
                <button
                  onClick={signOut}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium text-sm"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="flex justify-around py-2">
          <Link
            to="/customer"
            className={`flex-1 text-center py-2 text-sm font-medium ${
              isActive("/customer") || isActive("/")
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-600"
            }`}
          >
            🛍️ Shop
          </Link>
          <Link
            to="/vendor"
            className={`flex-1 text-center py-2 text-sm font-medium ${
              isActive("/vendor")
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-600"
            }`}
          >
            💼 Sell
          </Link>
          <Link
            to="/admin"
            className={`flex-1 text-center py-2 text-sm font-medium ${
              isActive("/admin")
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-gray-600"
            }`}
          >
            ⚙️ Admin
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <main className="p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/customer" element={<CustomerHome />} />
            <Route path="/vendor" element={<VendorDashboard />} />
            <Route path="/admin" element={<AdminOverview />} />
            <Route path="/" element={<CustomerHome />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                © 2025 LiveKart. Built with React, Express, and ❤️
              </p>
              <p className="text-gray-500 text-xs mt-2">
                ⚠️ Development Mode - AWS Integration Disabled
              </p>
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}
