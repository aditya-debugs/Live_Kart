import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  XMarkIcon,
  TrashIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

interface CartItem {
  product_id: string;
  title: string;
  price: number;
  imageUrl?: string;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between bg-[#8C5630] px-4 py-6">
                      <Dialog.Title className="text-xl font-bold text-white">
                        Shopping Cart ({items.length})
                      </Dialog.Title>
                      <button
                        type="button"
                        className="text-white hover:text-gray-200 transition"
                        onClick={onClose}
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>

                    {items.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-6xl mb-4">🛒</div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Your cart is empty
                          </h3>
                          <p className="text-gray-500 mb-6">
                            Add some products to get started!
                          </p>
                          <button
                            onClick={onClose}
                            className="bg-[#8C5630] text-white px-6 py-2 rounded-lg hover:bg-[#734628] transition"
                          >
                            Continue Shopping
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto px-4 py-6">
                          <AnimatePresence>
                            {items.map((item) => (
                              <motion.div
                                key={item.product_id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex space-x-4 mb-4 pb-4 border-b last:border-b-0"
                              >
                                {/* Product Image */}
                                <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                                  {item.imageUrl ? (
                                    <img
                                      src={item.imageUrl}
                                      alt={item.title}
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      📦
                                    </div>
                                  )}
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 flex flex-col">
                                  <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                                    {item.title}
                                  </h3>
                                  <p className="text-lg font-bold text-[#8C5630] mb-2">
                                    ₹{item.price.toLocaleString("en-IN")}
                                  </p>

                                  <div className="flex items-center justify-between mt-auto">
                                    {/* Quantity controls */}
                                    <div className="flex items-center space-x-2 border rounded-lg">
                                      <button
                                        onClick={() =>
                                          onUpdateQuantity(
                                            item.product_id,
                                            Math.max(1, item.quantity - 1)
                                          )
                                        }
                                        className="p-2 hover:bg-gray-100 transition"
                                      >
                                        <MinusIcon className="h-4 w-4" />
                                      </button>
                                      <span className="px-3 font-semibold">
                                        {item.quantity}
                                      </span>
                                      <button
                                        onClick={() =>
                                          onUpdateQuantity(
                                            item.product_id,
                                            item.quantity + 1
                                          )
                                        }
                                        className="p-2 hover:bg-gray-100 transition"
                                      >
                                        <PlusIcon className="h-4 w-4" />
                                      </button>
                                    </div>

                                    {/* Remove button */}
                                    <button
                                      onClick={() =>
                                        onRemoveItem(item.product_id)
                                      }
                                      className="text-red-500 hover:text-red-700 transition"
                                    >
                                      <TrashIcon className="h-5 w-5" />
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>

                          {/* Free shipping banner */}
                          {subtotal < 50 && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-4">
                              <p className="text-sm text-orange-800">
                                🚚 Add{" "}
                                <span className="font-bold">
                                  ${(50 - subtotal).toFixed(2)}
                                </span>{" "}
                                more to get{" "}
                                <span className="font-bold">FREE shipping</span>
                                !
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Footer - Summary */}
                        <div className="border-t bg-gray-50 px-4 py-6">
                          <div className="space-y-2 mb-4 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Subtotal</span>
                              <span className="font-semibold">
                                ₹{Math.round(subtotal).toLocaleString("en-IN")}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Shipping</span>
                              <span
                                className={`font-semibold ${
                                  shipping === 0 ? "text-green-600" : ""
                                }`}
                              >
                                {shipping === 0
                                  ? "FREE"
                                  : `$${shipping.toFixed(2)}`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tax</span>
                              <span className="font-semibold">
                                ₹{Math.round(tax).toLocaleString("en-IN")}
                              </span>
                            </div>
                            <div className="flex justify-between border-t pt-2 text-lg">
                              <span className="font-bold">Total</span>
                              <span className="font-bold text-[#8C5630]">
                                ₹{Math.round(total).toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={onCheckout}
                            className="w-full bg-[#8C5630] hover:bg-[#734628] text-white font-bold py-3 rounded-lg transition shadow-md hover:shadow-lg"
                          >
                            Proceed to Checkout
                          </button>

                          <button
                            onClick={onClose}
                            className="w-full mt-3 border-2 border-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition"
                          >
                            Continue Shopping
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
