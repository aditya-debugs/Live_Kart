import React from "react";
import { motion } from "framer-motion";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

type OrderConfirmationProps = {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  totalAmount: number;
};

export default function OrderConfirmation({
  isOpen,
  onClose,
  orderId,
  totalAmount,
}: OrderConfirmationProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <CheckCircleIcon className="h-24 w-24 text-green-500 mx-auto mb-4" />
        </motion.div>

        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Order Confirmed! 🎉
        </h2>
        <p className="text-gray-600 mb-6">
          Thank you for your order. We'll send you a confirmation email shortly.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">Order ID:</span>
            <span className="text-sm font-mono font-semibold">
              {orderId.slice(0, 8)}...
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Total Amount:</span>
            <span className="text-sm font-bold text-[#8C5630]">
              ₹{totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              navigate("/orders");
              onClose();
            }}
            className="w-full px-6 py-3 bg-[#8C5630] text-white rounded-lg hover:bg-[#754626] transition font-medium"
          >
            View My Orders
          </button>
          <button
            onClick={() => {
              navigate("/customer");
              onClose();
            }}
            className="w-full px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Continue Shopping
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Expected delivery: 3-5 business days
        </p>
      </motion.div>
    </div>
  );
}
