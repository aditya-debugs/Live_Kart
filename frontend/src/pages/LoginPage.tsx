import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<"customer" | "vendor" | "admin">("customer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await signIn(email, password);
      // Navigate based on user role
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "vendor") {
        navigate("/vendor");
      } else {
        navigate("/customer");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signUp(email, password, role);
      setError("");
      alert(
        "✅ Account created successfully! Please sign in with your credentials."
      );
      setIsSignUp(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isSignUp
              ? "Sign up to start shopping or selling"
              : "Sign in to your LiveKart account"}
          </p>
        </div>

        {/* Demo Credentials Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-blue-900 mb-2">
            🎯 Demo Credentials (Click to auto-fill):
          </p>
          <div className="space-y-1 text-xs">
            <button
              onClick={() =>
                handleDemoLogin("customer@livekart.com", "customer123")
              }
              className="block w-full text-left p-2 hover:bg-blue-100 rounded transition"
            >
              <span className="font-semibold">Customer:</span>{" "}
              customer@livekart.com / customer123
            </button>
            <button
              onClick={() =>
                handleDemoLogin("vendor@livekart.com", "vendor123")
              }
              className="block w-full text-left p-2 hover:bg-blue-100 rounded transition"
            >
              <span className="font-semibold">Vendor:</span> vendor@livekart.com
              / vendor123
            </button>
            <button
              onClick={() => handleDemoLogin("admin@livekart.com", "admin123")}
              className="block w-full text-left p-2 hover:bg-blue-100 rounded transition"
            >
              <span className="font-semibold">Admin:</span> admin@livekart.com /
              admin123
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          <form
            className="space-y-6"
            onSubmit={isSignUp ? handleSignUp : handleSignIn}
          >
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  I want to sign up as:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["customer", "vendor", "admin"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r as any)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                        role === r
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
            >
              {loading ? (
                <span className="flex items-center">
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
                </span>
              ) : isSignUp ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                }}
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
