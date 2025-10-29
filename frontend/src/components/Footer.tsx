import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{ backgroundColor: "#8C5630" }}
      className="text-black-300 mt-auto"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <ShoppingCartIcon className="h-8 w-8 text-black" />
              <span className="text-xl font-bold text-black">LiveKart</span>
            </div>
            <p className="text-sm text-black-400">
              Your trusted marketplace for quality products at great prices.
            </p>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-black font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/category/electronics"
                  className="hover:text-black transition-colors"
                >
                  Electronics
                </Link>
              </li>
              <li>
                <Link
                  to="/category/fashion"
                  className="hover:text-black transition-colors"
                >
                  Fashion
                </Link>
              </li>
              <li>
                <Link
                  to="/category/home"
                  className="hover:text-black transition-colors"
                >
                  Home & Kitchen
                </Link>
              </li>
              <li>
                <Link
                  to="/category/books"
                  className="hover:text-black transition-colors"
                >
                  Books
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-black font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/help" className="hover:text-black transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/orders"
                  className="hover:text-black transition-colors"
                >
                  Track Order
                </Link>
              </li>
              <li>
                <Link
                  to="/returns"
                  className="hover:text-black transition-colors"
                >
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="hover:text-black transition-colors"
                >
                  Shipping Info
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-black font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/about"
                  className="hover:text-black transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="hover:text-black transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  to="/press"
                  className="hover:text-black transition-colors"
                >
                  Press
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-black transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-black mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p className="text-black-400">
            © {currentYear} LiveKart. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-black transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-black transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="hover:text-black transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
