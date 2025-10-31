import React from "react";
import { useAuth } from "../utils/AuthContext";
import { useNavigate } from "react-router-dom";

export default function RoleDebug() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
        <p className="font-bold">Not logged in</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-2 px-3 py-1 bg-white text-red-500 rounded"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg max-w-sm">
      <p className="font-bold mb-2">🔐 User Info:</p>
      <div className="text-xs space-y-1">
        <p>
          <span className="font-semibold">Username:</span> {user.username}
        </p>
        <p>
          <span className="font-semibold">Email:</span> {user.email}
        </p>
        <p>
          <span className="font-semibold">Role:</span>{" "}
          <span className="font-bold text-yellow-300">{user.role}</span>
        </p>
      </div>
      <div className="mt-3 flex gap-2">
        {user.role === "vendor" && (
          <button
            onClick={() => navigate("/vendor")}
            className="px-3 py-1 bg-white text-blue-500 rounded text-xs font-semibold"
          >
            Vendor Dashboard
          </button>
        )}
        {user.role === "customer" && (
          <button
            onClick={() => navigate("/customer")}
            className="px-3 py-1 bg-white text-blue-500 rounded text-xs font-semibold"
          >
            Customer Home
          </button>
        )}
      </div>
    </div>
  );
}
