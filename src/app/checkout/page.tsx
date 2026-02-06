"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Lock,
  ChevronLeft,
  Check,
  ShoppingBag,
} from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const [step, setStep] = useState<"info" | "payment" | "confirmation">("info");
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });

  const subtotal = totalPrice();
  const shipping = subtotal >= 99 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    clearCart();
    setStep("confirmation");
  };

  if (items.length === 0 && step !== "confirmation") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <ShoppingBag size={48} className="text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="text-gray-500 mt-2">
          Add some gear before checking out.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg font-medium mt-6 hover:bg-primary-dark transition-colors"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  if (step === "confirmation") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={32} className="text-green-600" />
        </div>
        <h1 className="text-3xl font-black">Order Confirmed!</h1>
        <p className="text-gray-500 mt-3 max-w-md mx-auto">
          Your order has been placed. You&apos;ll receive a confirmation
          email with tracking information shortly.
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Order #{Math.random().toString(36).substring(2, 10).toUpperCase()}
        </p>
        <div className="flex justify-center gap-4 mt-8">
          <Link
            href="/products"
            className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg font-bold transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/products"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-6"
      >
        <ChevronLeft size={16} />
        Continue Shopping
      </Link>

      <h1 className="text-3xl font-black mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handlePlaceOrder}>
            {/* Shipping info */}
            <div className={step === "info" ? "block" : "hidden"}>
              <h2 className="text-lg font-bold mb-4">Shipping Information</h2>
              <div className="space-y-4">
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <input
                    type="text"
                    required
                    placeholder="ZIP Code"
                    value={formData.zip}
                    onChange={(e) =>
                      setFormData({ ...formData, zip: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep("payment")}
                className="mt-6 w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-bold transition-colors"
              >
                Continue to Payment
              </button>
            </div>

            {/* Payment */}
            <div className={step === "payment" ? "block" : "hidden"}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Payment</h2>
                <button
                  type="button"
                  onClick={() => setStep("info")}
                  className="text-sm text-primary hover:underline"
                >
                  Edit Shipping
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard size={18} className="text-gray-400" />
                  <span className="text-sm text-gray-500">
                    Card Information
                  </span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Card number"
                  value={formData.cardNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, cardNumber: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="MM / YY"
                    value={formData.expiry}
                    onChange={(e) =>
                      setFormData({ ...formData, expiry: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <input
                    type="text"
                    required
                    placeholder="CVC"
                    value={formData.cvc}
                    onChange={(e) =>
                      setFormData({ ...formData, cvc: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-6 w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Lock size={16} />
                Place Order - {formatPrice(total)}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                <Lock size={12} />
                Secure checkout - Your payment info is encrypted
              </p>
            </div>
          </form>
        </div>

        {/* Order summary */}
        <div>
          <div className="bg-gray-50 rounded-xl p-6 sticky top-24">
            <h2 className="font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {items.map((item, index) => (
                <div
                  key={`${item.product.id}-${index}`}
                  className="flex justify-between items-start text-sm"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-gray-500 text-xs">
                      {item.color.name} / {item.size} x {item.quantity}
                    </p>
                  </div>
                  <span className="font-medium">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-green-600 font-medium">Free</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tax</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
