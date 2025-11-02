// Vendor Layout - Floating Header with Brown Theme
// Business-focused experience with compact floating navbar

import React, { ReactNode } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import {
  ShoppingBagIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

interface VendorLayoutProps {
  children: ReactNode;
}

export default function VendorLayout({ children }: VendorLayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  const tabs = [
    { name: "Dashboard", href: "/vendor", icon: HomeIcon },
    { name: "Products", href: "/vendor/products", icon: CubeIcon },
    { name: "Orders", href: "/vendor/orders", icon: ClipboardDocumentListIcon },
    { name: "Analytics", href: "/vendor/analytics", icon: ChartBarIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Floating Header - Compact Brown Theme */}
      <header className="fixed top-3 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-6xl">
        <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-3xl border border-white/20">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              {/* Logo & Title */}
              <Link to="/vendor" className="flex items-center space-x-3">
                <ShoppingBagIcon
                  className="h-7 w-7"
                  style={{ color: "#8C5630" }}
                />
                <div>
                  <span className="text-xl font-bold text-gray-900">
                    LiveKart
                  </span>
                  <span
                    className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "#22C55E", color: "white" }}
                  >
                    Vendor
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation Tabs */}
              <nav className="hidden md:flex items-center space-x-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = isActive(tab.href);
                  return (
                    <Link
                      key={tab.name}
                      to={tab.href}
                      className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                        active
                          ? "text-white shadow-sm"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      style={active ? { backgroundColor: "#8C5630" } : {}}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* User Menu */}
              <div className="hidden md:flex items-center">
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
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Profile Settings
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
              <div className="px-4 py-4 space-y-2 bg-white/95 backdrop-blur-md rounded-b-3xl">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = isActive(tab.href);
                  return (
                    <Link
                      key={tab.name}
                      to={tab.href}
                      className={`flex items-center px-3 py-2 rounded-lg ${
                        active ? "text-white" : "text-gray-700 hover:bg-gray-50"
                      }`}
                      style={active ? { backgroundColor: "#8C5630" } : {}}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {tab.name}
                    </Link>
                  );
                })}
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
                <span
                  className="text-xs font-semibold px-2 py-1 rounded-full"
                  style={{ backgroundColor: "#22C55E" }}
                >
                  Vendor Portal
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Manage your products, orders, and grow your business on
                LiveKart.
              </p>
              <p className="text-gray-500 text-xs">
                © 2025 LiveKart. All rights reserved.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Manage</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link
                    to="/vendor"
                    className="hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/vendor/products"
                    className="hover:text-white transition-colors"
                  >
                    Products
                  </Link>
                </li>
                <li>
                  <Link
                    to="/vendor/orders"
                    className="hover:text-white transition-colors"
                  >
                    Orders
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Account</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link
                    to="/vendor/analytics"
                    className="hover:text-white transition-colors"
                  >
                    Analytics
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
