// Customer Layout - Floating Header with Brown Theme
// Shopping-focused experience with compact floating navbar

import React, { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import {
  ShoppingBagIcon,
  HeartIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

interface CustomerLayoutProps {
  children: ReactNode;
  cartCount?: number;
  wishlistCount?: number;
  onCartClick?: () => void;
  onSearchChange?: (value: string) => void;
  hideSearch?: boolean;
}

export default function CustomerLayout({
  children,
  cartCount = 0,
  wishlistCount = 0,
  onCartClick,
  onSearchChange,
  hideSearch = false,
}: CustomerLayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchChange && searchQuery.trim()) {
      onSearchChange(searchQuery);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Floating Header - Original Style */}
      <header className="fixed top-3 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-6xl">
        <div className="bg-white/40 backdrop-blur-md shadow-lg rounded-3xl border border-white/10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-12">
              {/* Logo */}
              <Link to="/customer" className="flex items-center space-x-2">
                <ShoppingCartIcon
                  className="h-7 w-7"
                  style={{ color: "#8C5630" }}
                />
                <span className="text-xl font-bold text-gray-900">
                  LiveKart
                </span>
              </Link>

              {/* Search Bar - Desktop */}
              {!hideSearch && (
                <form
                  onSubmit={handleSearch}
                  className="hidden md:flex flex-1 max-w-2xl mx-8"
                >
                  <div className="relative w-full">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full px-4 py-1.5 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8C5630] focus:border-transparent text-sm bg-white/80"
                    />
                    <button
                      type="submit"
                      className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-[#8C5630] transition-colors"
                    >
                      <MagnifyingGlassIcon className="h-5 w-5" />
                    </button>
                  </div>
                </form>
              )}

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-6">
                {/* Wishlist */}
                <Link
                  to="/wishlist"
                  className="relative flex items-center space-x-1 text-gray-700 hover:text-[#8C5630] transition-colors"
                >
                  <HeartIcon className="h-6 w-6" />
                  <span className="text-sm font-medium">Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Cart */}
                <button
                  onClick={onCartClick}
                  className="relative flex items-center space-x-1 text-gray-700 hover:text-[#8C5630] transition-colors"
                >
                  <ShoppingCartIcon className="h-6 w-6" />
                  <span className="text-sm font-medium">Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#8C5630] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-[#8C5630] transition-colors"
                  >
                    <UserCircleIcon className="h-6 w-6" />
                    <span className="text-sm font-medium">Account</span>
                  </button>

                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                        <div className="px-4 py-2 border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-900">
                            {user?.username}
                          </p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <Link
                          to="/orders"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          My Orders
                        </Link>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Profile
                        </Link>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            handleSignOut();
                          }}
                          className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200">
              <div className="px-4 py-4 space-y-3 bg-white/95 backdrop-blur-md rounded-b-3xl">
                {!hideSearch && (
                  <form onSubmit={handleSearch} className="mb-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8C5630] text-sm"
                      />
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </form>
                )}
                <Link
                  to="/customer"
                  className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <HomeIcon className="h-5 w-5 mr-3" />
                  Home
                </Link>
                <Link
                  to="/wishlist"
                  className="flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <HeartIcon className="h-5 w-5 mr-3" />
                    Wishlist
                  </div>
                  {wishlistCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onCartClick?.();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <ShoppingCartIcon className="h-5 w-5 mr-3" />
                    Cart
                  </div>
                  {cartCount > 0 && (
                    <span className="bg-[#8C5630] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
                <Link
                  to="/orders"
                  className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ClipboardDocumentListIcon className="h-5 w-5 mr-3" />
                  My Orders
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserCircleIcon className="h-5 w-5 mr-3" />
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content with padding for floating header */}
      <main className="flex-1 pt-20">{children}</main>

      {/* Professional Footer */}
      <footer className="bg-gray-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <ShoppingBagIcon
                  className="h-8 w-8"
                  style={{ color: "#8C5630" }}
                />
                <span className="text-2xl font-bold">LiveKart</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Your trusted online marketplace for quality products from
                verified vendors.
              </p>
              <p className="text-gray-500 text-xs">
                © 2025 LiveKart. All rights reserved.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Shop</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link
                    to="/customer"
                    className="hover:text-white transition-colors"
                  >
                    All Products
                  </Link>
                </li>
                <li>
                  <Link
                    to="/customer"
                    className="hover:text-white transition-colors"
                  >
                    Categories
                  </Link>
                </li>
                <li>
                  <Link
                    to="/wishlist"
                    className="hover:text-white transition-colors"
                  >
                    Wishlist
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Account</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link
                    to="/orders"
                    className="hover:text-white transition-colors"
                  >
                    My Orders
                  </Link>
                </li>
                <li>
                  <Link
                    to="/profile"
                    className="hover:text-white transition-colors"
                  >
                    Profile
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
