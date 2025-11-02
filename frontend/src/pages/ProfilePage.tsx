import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  UserCircleIcon,
  ShoppingBagIcon,
  HeartIcon,
  BellIcon,
  EnvelopeIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import CustomerLayout from "../layouts/CustomerLayout";
import { useAuth } from "../utils/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import lambdaAPI from "../utils/lambdaAPI";
import CartDrawer from "../components/CartDrawer";

type Product = {
  product_id: string;
  vendor_id: string;
  title: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category?: string;
  quantity?: number;
};

interface CartItem extends Product {
  quantity: number;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  defaultAddress?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  notificationPreferences: {
    orderUpdates: boolean;
    promotions: boolean;
    wishlistAlerts: boolean;
  };
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: user?.username || "",
    email: user?.email || "",
    phone: "",
    defaultAddress: {
      street: "",
      city: "",
      state: "",
      pincode: "",
    },
    notificationPreferences: {
      orderUpdates: true,
      promotions: false,
      wishlistAlerts: true,
    },
  });

  useEffect(() => {
    // Load profile data
    loadProfile();
  }, [user?.email]);

  const loadProfile = async () => {
    try {
      // Try to load profile from DynamoDB via Lambda
      try {
        const response = await lambdaAPI.getUserProfile();
        if (response.success && response.user) {
          // Map DynamoDB user data to profile state
          const dbUser = response.user;
          setProfile({
            name: dbUser.name || user?.username || "",
            email: dbUser.email || user?.email || "",
            phone: dbUser.phoneNumber || dbUser.phone || "",
            defaultAddress: dbUser.address || {
              street: "",
              city: "",
              state: "",
              pincode: "",
            },
            notificationPreferences: dbUser.notificationPreferences || {
              orderUpdates: true,
              promotions: false,
              wishlistAlerts: true,
            },
          });
          console.log("✅ Profile loaded from DynamoDB");
          return;
        }
      } catch (dbError) {
        console.log(
          "⚠️ DynamoDB not available, using localStorage fallback:",
          dbError
        );
      }

      // Fallback to localStorage if DynamoDB fails
      const savedProfile = localStorage.getItem(
        `livekart_profile_${user?.email}`
      );

      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(parsedProfile);
        console.log("✅ Profile loaded from localStorage");
      } else {
        // First time - use defaults
        setProfile({
          name: user?.username || "",
          email: user?.email || "",
          phone: "",
          defaultAddress: {
            street: "",
            city: "",
            state: "",
            pincode: "",
          },
          notificationPreferences: {
            orderUpdates: true,
            promotions: false,
            wishlistAlerts: true,
          },
        });
        console.log("✅ Using default profile");
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      toast.error("Failed to load profile");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [section, field] = name.split(".");
      setProfile((prev) => ({
        ...prev,
        [section]: {
          ...(prev[section as keyof UserProfile] as any),
          [field]: value,
        },
      }));
    } else {
      setProfile((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleNotificationChange = (
    setting: keyof typeof profile.notificationPreferences
  ) => {
    setProfile((prev) => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [setting]: !prev.notificationPreferences[setting],
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Save to localStorage first (always works)
      localStorage.setItem(
        `livekart_profile_${user?.email}`,
        JSON.stringify(profile)
      );

      // Try to save to DynamoDB via Lambda
      try {
        const response = await lambdaAPI.updateUserProfile({
          name: profile.name,
          phoneNumber: profile.phone,
          phone: profile.phone, // Support both field names
          address: profile.defaultAddress,
          notificationPreferences: profile.notificationPreferences,
        });

        if (response.success) {
          toast.success("Profile updated successfully!");
          console.log("✅ Profile saved to DynamoDB");
        }
      } catch (dbError) {
        console.log(
          "⚠️ DynamoDB save failed, but localStorage saved:",
          dbError
        );
        toast.success("Profile updated successfully!");
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product_id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.product_id !== productId)
    );
    toast.success("Removed from cart");
  };

  const handleCheckoutClick = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }
    toast.success("Proceeding to checkout...");
  };

  const navigationItems = [
    {
      icon: UserCircleIcon,
      label: "Profile Information",
      href: "/profile",
      active: true,
    },
    { icon: ShoppingBagIcon, label: "Orders", href: "/orders" },
    { icon: HeartIcon, label: "Wishlist", href: "/wishlist" },
  ];

  return (
    <>
      <CustomerLayout
        wishlistCount={0}
        cartCount={getTotalItems()}
        onCartClick={() => setShowCart(true)}
        hideSearch={true}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Navigation Sidebar */}
            <aside className="lg:col-span-3">
              <nav className="space-y-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                      item.active
                        ? "bg-[#8C5630] text-white"
                        : "text-gray-900 hover:bg-gray-100"
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white shadow-sm rounded-lg"
              >
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Profile Information
                    </h2>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-sm text-[#8C5630] hover:text-[#754626] font-medium"
                    >
                      {isEditing ? "Cancel" : "Edit"}
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={profile.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8C5630] focus:ring-[#8C5630] disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8C5630] focus:ring-[#8C5630] disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profile.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8C5630] focus:ring-[#8C5630] disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Account Role
                      </label>
                      <div className="mt-1 flex items-center">
                        <span
                          className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                            user?.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : user?.role === "vendor"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user?.role
                            ? user.role.charAt(0).toUpperCase() +
                              user.role.slice(1)
                            : "Customer"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Default Address */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Default Address
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Street Address
                        </label>
                        <input
                          type="text"
                          name="defaultAddress.street"
                          value={profile.defaultAddress?.street}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8C5630] focus:ring-[#8C5630] disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          City
                        </label>
                        <input
                          type="text"
                          name="defaultAddress.city"
                          value={profile.defaultAddress?.city}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8C5630] focus:ring-[#8C5630] disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          State
                        </label>
                        <input
                          type="text"
                          name="defaultAddress.state"
                          value={profile.defaultAddress?.state}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8C5630] focus:ring-[#8C5630] disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          PIN Code
                        </label>
                        <input
                          type="text"
                          name="defaultAddress.pincode"
                          value={profile.defaultAddress?.pincode}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8C5630] focus:ring-[#8C5630] disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notification Preferences */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Notification Preferences
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <BellIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-700">
                            Order Updates
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleNotificationChange("orderUpdates")
                          }
                          disabled={!isEditing}
                          className={`${
                            profile.notificationPreferences.orderUpdates
                              ? "bg-[#8C5630]"
                              : "bg-gray-200"
                          } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#8C5630] focus:ring-offset-2 disabled:opacity-50`}
                        >
                          <span
                            className={`${
                              profile.notificationPreferences.orderUpdates
                                ? "translate-x-5"
                                : "translate-x-0"
                            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-700">
                            Promotional Emails
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleNotificationChange("promotions")}
                          disabled={!isEditing}
                          className={`${
                            profile.notificationPreferences.promotions
                              ? "bg-[#8C5630]"
                              : "bg-gray-200"
                          } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#8C5630] focus:ring-offset-2 disabled:opacity-50`}
                        >
                          <span
                            className={`${
                              profile.notificationPreferences.promotions
                                ? "translate-x-5"
                                : "translate-x-0"
                            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <HeartIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-700">
                            Wishlist Alerts
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleNotificationChange("wishlistAlerts")
                          }
                          disabled={!isEditing}
                          className={`${
                            profile.notificationPreferences.wishlistAlerts
                              ? "bg-[#8C5630]"
                              : "bg-gray-200"
                          } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#8C5630] focus:ring-offset-2 disabled:opacity-50`}
                        >
                          <span
                            className={`${
                              profile.notificationPreferences.wishlistAlerts
                                ? "translate-x-5"
                                : "translate-x-0"
                            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  {isEditing && (
                    <div className="flex justify-end pt-6 border-t border-gray-200">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#8C5630] text-white rounded-md hover:bg-[#754626] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8C5630]"
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </form>
              </motion.div>
            </main>
          </div>
        </div>

        <Toaster position="top-right" />
      </CustomerLayout>

      <CartDrawer
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckoutClick}
      />
    </>
  );
}
