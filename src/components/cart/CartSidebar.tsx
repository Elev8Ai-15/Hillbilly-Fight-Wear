"use client";

import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";

export default function CartSidebar() {
  const { items, isOpen, setCartOpen, removeItem, updateQuantity, totalPrice } =
    useCartStore();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => setCartOpen(false)}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShoppingBag size={20} />
            Your Cart ({items.reduce((sum, item) => sum + item.quantity, 0)})
          </h2>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag size={48} className="text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">Your cart is empty</p>
              <p className="text-gray-400 text-sm mt-1">
                Add some gear to get started
              </p>
              <Link
                href="/products"
                onClick={() => setCartOpen(false)}
                className="mt-6 bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors"
              >
                Shop Now
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={`${item.product.id}-${item.size}-${item.color.name}-${index}`}
                  className="flex gap-4 p-3 bg-gray-50 rounded-lg"
                >
                  {/* Product image placeholder */}
                  <div
                    className="w-20 h-20 rounded-md flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: item.color.hex }}
                  >
                    {item.product.category.slice(0, 3).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.color.name} / {item.size}
                      {item.customization && " / Custom Design"}
                    </p>
                    <p className="font-bold text-sm mt-1">
                      {formatPrice(item.product.price)}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(index, item.quantity - 1)
                        }
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(index, item.quantity + 1)
                        }
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => removeItem(index)}
                        className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Subtotal</span>
              <span className="font-bold text-lg">
                {formatPrice(totalPrice())}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Shipping and taxes calculated at checkout
            </p>
            <Link
              href="/checkout"
              onClick={() => setCartOpen(false)}
              className="block w-full bg-primary text-white text-center py-3 rounded-lg font-bold hover:bg-primary-dark transition-colors"
            >
              Checkout
            </Link>
            <button
              onClick={() => setCartOpen(false)}
              className="block w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
