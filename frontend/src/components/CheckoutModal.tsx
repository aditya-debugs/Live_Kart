import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

type CartItem = {
  product_id: string;
  title?: string;
  name?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

type CheckoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onPlaceOrder: (orderData: {
    items: Array<{ product_id: string; quantity: number }>;
    shippingAddress: any;
    paymentMethod: string;
  }) => Promise<void>;
};

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  onPlaceOrder,
}: CheckoutModalProps) {
  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review
  const [loading, setLoading] = useState(false);

  // Address fields
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("customer@livekart.com");
  const [phone, setPhone] = useState("+91 9876543210");
  const [street, setStreet] = useState("123 Main Street");
  const [city, setCity] = useState("Mumbai");
  const [state, setState] = useState("Maharashtra");
  const [zipCode, setZipCode] = useState("400001");
  const [country, setCountry] = useState("India");

  // Payment fields
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 500 ? 0 : 50;
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);

      const orderData = {
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          name,
          email,
          phone,
          street,
          city,
          state,
          zipCode,
          country,
        },
        paymentMethod,
      };

      await onPlaceOrder(orderData);

      // Success message will be shown by parent component
      onClose();
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Checkout ({step}/3)
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              {["Address", "Payment", "Review"].map((label, idx) => (
                <div key={label} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        step > idx + 1
                          ? "bg-green-500 text-white"
                          : step === idx + 1
                          ? "bg-[#8C5630] text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {step > idx + 1 ? "✓" : idx + 1}
                    </div>
                    <p className="text-xs mt-1 text-gray-600">{label}</p>
                  </div>
                  {idx < 2 && (
                    <div
                      className={`h-1 flex-1 ${
                        step > idx + 1 ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* Step 1: Shipping Address */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8C5630] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8C5630] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8C5630] focus:border-transparent"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8C5630] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8C5630] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8C5630] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8C5630] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8C5630] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                <div className="space-y-3">
                  <div
                    onClick={() => setPaymentMethod("COD")}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      paymentMethod === "COD"
                        ? "border-[#8C5630] bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        checked={paymentMethod === "COD"}
                        onChange={() => setPaymentMethod("COD")}
                        className="w-4 h-4 text-[#8C5630] focus:ring-[#8C5630]"
                      />
                      <div className="ml-3">
                        <p className="font-semibold">Cash on Delivery (COD)</p>
                        <p className="text-sm text-gray-500">
                          Pay when you receive your order
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentMethod("UPI")}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      paymentMethod === "UPI"
                        ? "border-[#8C5630] bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        checked={paymentMethod === "UPI"}
                        onChange={() => setPaymentMethod("UPI")}
                        className="w-4 h-4 text-[#8C5630] focus:ring-[#8C5630]"
                      />
                      <div className="ml-3">
                        <p className="font-semibold">UPI Payment</p>
                        <p className="text-sm text-gray-500">
                          PhonePe, Google Pay, Paytm (Simulated)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentMethod("Card")}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      paymentMethod === "Card"
                        ? "border-[#8C5630] bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        checked={paymentMethod === "Card"}
                        onChange={() => setPaymentMethod("Card")}
                        className="w-4 h-4 text-[#8C5630] focus:ring-[#8C5630]"
                      />
                      <div className="ml-3">
                        <p className="font-semibold">Credit/Debit Card</p>
                        <p className="text-sm text-gray-500">
                          Visa, Mastercard, RuPay (Simulated)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mt-4">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Note:</strong> This is a demo checkout. All
                    payment methods will bypass actual payment processing.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Review Order */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Review Your Order</h3>

                {/* Order Items */}
                <div>
                  <h4 className="font-semibold mb-3">Items ({cart.length})</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item.product_id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.title || item.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {item.title || item.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h4 className="font-semibold mb-2">Shipping Address</h4>
                  <div className="bg-gray-50 p-4 rounded-lg text-sm">
                    <p className="font-medium">{name}</p>
                    <p>{street}</p>
                    <p>
                      {city}, {state} {zipCode}
                    </p>
                    <p>{country}</p>
                    <p className="mt-2">{phone}</p>
                    <p>{email}</p>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h4 className="font-semibold mb-2">Payment Method</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">{paymentMethod}</p>
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <h4 className="font-semibold mb-2">Order Summary</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>
                        {shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (GST 18%)</span>
                      <span>₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-[#8C5630]">
                        ₹{total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-between">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="ml-auto px-6 py-3 bg-[#8C5630] text-white rounded-lg hover:bg-[#754626] transition font-medium"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="ml-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
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
                    Placing Order...
                  </>
                ) : (
                  <>
                    <span>🎉</span> Place Order
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
