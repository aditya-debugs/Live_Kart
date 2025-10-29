import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCartIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../utils/AuthContext";

interface HeaderProps {
  cartCount?: number;
  onCartClick?: () => void;
  onSearchChange?: (value: string) => void;
}

export default function Header({
  cartCount = 0,
  onCartClick,
  onSearchChange,
}: HeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

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
    <header className="fixed top-3 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-6xl">
      <div className="bg-white/40 backdrop-blur-md shadow-lg rounded-3xl border border-white/10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            {/* Logo */}
            <Link
              to="/customer"
              className="flex items-center space-x-2 flex-shrink-0"
            >
              <div className="flex items-center">
                <ShoppingCartIcon
                  className="h-8 w-8"
                  style={{ color: "#8C5630" }}
                />
                <span className="ml-2 text-xl font-bold text-neutral-900">
                  LiveKart
                </span>
              </div>
            </Link>

            {/* Search Bar - Desktop */}
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
                  className="w-full px-4 py-1 pr-10 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 h-full px-3 text-neutral-500 hover:text-primary-600 transition-colors"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>
              </div>
            </form>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {user ? (
                <>
                  <button
                    className="flex items-center space-x-1 text-neutral-700 hover:text-primary-600 transition-colors"
                    title="Wishlist"
                  >
                    <HeartIcon className="h-6 w-6" />
                    <span className="text-sm font-medium">Wishlist</span>
                  </button>

                  <button
                    onClick={onCartClick}
                    className="flex items-center space-x-1 text-neutral-700 hover:text-primary-600 transition-colors relative"
                  >
                    <ShoppingCartIcon className="h-6 w-6" />
                    <span className="text-sm font-medium">Cart</span>
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 text-neutral-700 hover:text-primary-600 transition-colors"
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
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-soft-lg border border-neutral-200 py-1 z-20">
                          <div className="px-4 py-2 border-b border-neutral-200">
                            <p className="text-sm font-medium text-neutral-900">
                              {user.username}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {user.email}
                            </p>
                          </div>
                          <Link
                            to="/profile"
                            className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                            onClick={() => setShowUserMenu(false)}
                          >
                            My Profile
                          </Link>
                          <Link
                            to="/orders"
                            className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                            onClick={() => setShowUserMenu(false)}
                          >
                            Orders
                          </Link>
                          {user.role === "vendor" && (
                            <Link
                              to="/vendor"
                              className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                              onClick={() => setShowUserMenu(false)}
                            >
                              Vendor Dashboard
                            </Link>
                          )}
                          {user.role === "admin" && (
                            <Link
                              to="/admin"
                              className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                              onClick={() => setShowUserMenu(false)}
                            >
                              Admin Panel
                            </Link>
                          )}
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              handleSignOut();
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-error-600 hover:bg-neutral-50 border-t border-neutral-200"
                          >
                            Sign Out
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-5 py-1.5 text-white rounded-lg font-medium transition-colors text-sm hover:brightness-90"
                  style={{ backgroundColor: "#8C5630" }}
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-700 hover:text-primary-600"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="md:hidden pb-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-2 pr-10 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-3 text-neutral-500"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200/10 bg-white/40 backdrop-blur-md rounded-b-3xl overflow-hidden">
          <div className="px-4 py-4 space-y-3">
            {user ? (
              <>
                <div className="pb-3 border-b border-neutral-200">
                  <p className="font-medium text-neutral-900">
                    {user.username}
                  </p>
                  <p className="text-sm text-neutral-500">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    onCartClick?.();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-between w-full py-2 text-neutral-700"
                >
                  <span className="flex items-center space-x-2">
                    <ShoppingCartIcon className="h-5 w-5" />
                    <span>Cart</span>
                  </span>
                  {cartCount > 0 && (
                    <span className="bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
                <Link
                  to="/orders"
                  className="flex items-center space-x-2 py-2 text-neutral-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Orders</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 py-2 text-neutral-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Profile</span>
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 text-error-600 border-t border-neutral-200"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block w-full px-4 py-2 bg-primary-600 text-white rounded-lg font-medium text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
