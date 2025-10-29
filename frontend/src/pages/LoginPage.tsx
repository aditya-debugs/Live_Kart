import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ShoppingCartIcon,
  UserCircleIcon,
  BuildingStorefrontIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../utils/AuthContext";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<"customer" | "vendor" | "admin">("customer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [cognitoUsername, setCognitoUsername] = useState(""); // Store username for confirmation

  const { signIn, signUp, confirmSignUp } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await signIn(email, password);
      toast.success("Welcome back!");
      // Navigate based on user role
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "vendor") {
        navigate("/vendor");
      } else {
        navigate("/customer");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Sign in failed";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signUp(email, password, username || email, role);
      setError("");
      if (result.needsConfirmation) {
        toast.success(result.message);
        setCognitoUsername(result.username); // Store the generated username
        setNeedsConfirmation(true);
      } else {
        toast.success("Account created successfully! Please sign in.");
        setIsSignUp(false);
        setPassword("");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Sign up failed";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Use the stored Cognito username (not email)
      await confirmSignUp(cognitoUsername, confirmationCode);
      toast.success("Email verified successfully! You can now sign in.");
      setNeedsConfirmation(false);
      setIsSignUp(false);
      setPassword("");
      setConfirmationCode("");
      setCognitoUsername("");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Confirmation failed";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setIsSignUp(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Toaster />

      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#8C5630] p-12 flex-col justify-between relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-white rounded-xl p-3">
              <ShoppingCartIcon className="h-10 w-10 text-[#8C5630]" />
            </div>
            <span className="text-4xl font-bold text-white">LiveKart</span>
          </Link>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-bold text-white mb-6">
            Shop smarter,
            <br />
            live better
          </h1>
          <p className="text-xl text-indigo-100 mb-12">
            Join millions of shoppers and vendors who trust LiveKart for their
            online shopping needs.
          </p>

          {/* Features */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-3 text-white"
            >
              <div className="bg-white/20 rounded-lg p-2">
                <ShieldCheckIcon className="h-6 w-6" />
              </div>
              <span className="text-lg">Secure & trusted platform</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center space-x-3 text-white"
            >
              <div className="bg-white/20 rounded-lg p-2">
                <BuildingStorefrontIcon className="h-6 w-6" />
              </div>
              <span className="text-lg">1000+ verified vendors</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center space-x-3 text-white"
            >
              <div className="bg-white/20 rounded-lg p-2">
                <UserCircleIcon className="h-6 w-6" />
              </div>
              <span className="text-lg">5M+ happy customers</span>
            </motion.div>
          </div>
        </div>

        <div className="relative z-10 text-white/60 text-sm">
          © 2025 LiveKart. All rights reserved.
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-8"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <div className="bg-[#8C5630] rounded-xl p-3">
              <ShoppingCartIcon className="h-8 w-8 text-[#8C5630]" />
            </div>
            <span className="text-3xl font-bold text-[#8C5630]">LiveKart</span>
          </div>

          {/* Header */}
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              {needsConfirmation
                ? "Verify Your Email"
                : isSignUp
                ? "Create Account"
                : "Welcome Back"}
            </h2>
            <p className="text-gray-600">
              {needsConfirmation
                ? "Enter the verification code sent to your email"
                : isSignUp
                ? "Start your shopping journey today"
                : "Sign in to continue shopping"}
            </p>
          </div>

          {/* Form */}
          <form
            className="mt-8 space-y-6"
            onSubmit={
              needsConfirmation
                ? handleConfirmSignUp
                : isSignUp
                ? handleSignUp
                : handleSignIn
            }
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg"
              >
                <p className="font-medium">{error}</p>
              </motion.div>
            )}

            <div className="space-y-4">
              {/* Confirmation Code (only shown when needsConfirmation) */}
              {needsConfirmation && (
                <div>
                  <label
                    htmlFor="code"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Verification Code
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value)}
                    required
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                  />
                </div>
              )}

              {/* Username (only for sign up) */}
              {!needsConfirmation && isSignUp && (
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserCircleIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              {!needsConfirmation && (
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              {!needsConfirmation && (
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Password requirements hint for signup */}
              {!needsConfirmation && isSignUp && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                  <p className="text-xs text-blue-700 font-semibold mb-1">
                    Password must contain:
                  </p>
                  <ul className="text-xs text-blue-600 space-y-0.5 ml-4 list-disc">
                    <li>At least 8 characters</li>
                    <li>Uppercase letter (A-Z)</li>
                    <li>Lowercase letter (a-z)</li>
                    <li>Number (0-9)</li>
                    <li>Special character (@, !, #, $, etc.)</li>
                  </ul>
                </div>
              )}

              {/* Role selection for signup */}
              {!needsConfirmation && isSignUp && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Sign up as
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["customer", "vendor", "admin"].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r as any)}
                        className={`px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                          role === r
                            ? "bg-[#8C5630] text-white shadow-lg"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Remember me / Forgot password */}
              {!needsConfirmation && !isSignUp && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Remember me
                    </label>
                  </div>
                  <button
                    type="button"
                    className="text-sm font-semibold text-[#8C5630] hover:text-[#734628]"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white bg-[#8C5630] hover:bg-[#734628] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8C5630] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  {needsConfirmation
                    ? "Verify Email"
                    : isSignUp
                    ? "Create Account"
                    : "Sign In"}
                  <ChevronRightIcon className="ml-2 h-5 w-5" />
                </>
              )}
            </button>

            {/* Toggle Sign In/Up or Back to Sign In */}
            <div className="text-center">
              {needsConfirmation ? (
                <button
                  type="button"
                  onClick={() => {
                    setNeedsConfirmation(false);
                    setConfirmationCode("");
                  }}
                  className="text-sm font-semibold text-[#8C5630] hover:text-[#734628]"
                >
                  Back to Sign In
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError("");
                    setPassword("");
                    setUsername("");
                  }}
                  className="text-sm font-semibold text-[#8C5630] hover:text-[#734628]"
                >
                  {isSignUp
                    ? "Already have an account? Sign in"
                    : "Don't have an account? Sign up"}
                </button>
              )}
            </div>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              <svg
                className="h-5 w-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              Facebook
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
