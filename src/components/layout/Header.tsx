"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Menu,
  X,
  Search,
  Paintbrush,
  ChevronDown,
} from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";

const categories = [
  { name: "Fight Shorts", href: "/products?category=shorts" },
  { name: "Rashguards", href: "/products?category=rashguards" },
  { name: "Gloves", href: "/products?category=gloves" },
  { name: "Headgear", href: "/products?category=headgear" },
  { name: "Spats", href: "/products?category=spats" },
  { name: "Hoodies", href: "/products?category=hoodies" },
  { name: "T-Shirts", href: "/products?category=tshirts" },
  { name: "Accessories", href: "/products?category=accessories" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const itemCount = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const toggleCart = useCartStore((s) => s.toggleCart);

  return (
    <header className="bg-secondary-dark text-white sticky top-0 z-50">
      {/* Top banner */}
      <div className="bg-primary text-white text-center text-sm py-1.5 px-4 font-medium">
        Free Shipping on Orders Over $99 | Custom Designs Available
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl font-black tracking-tight">
              HILLBILLY<span className="text-primary-light"> FIGHT WEAR</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium hover:text-primary-light transition-colors"
            >
              Home
            </Link>

            {/* Shop dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setShopDropdownOpen(true)}
              onMouseLeave={() => setShopDropdownOpen(false)}
            >
              <Link
                href="/products"
                className="text-sm font-medium hover:text-primary-light transition-colors flex items-center gap-1"
              >
                Shop <ChevronDown size={14} />
              </Link>
              {shopDropdownOpen && (
                <div className="absolute top-full left-0 w-56 bg-white text-secondary-dark shadow-xl rounded-lg py-2 mt-1 animate-fade-in">
                  <Link
                    href="/products"
                    className="block px-4 py-2 text-sm font-semibold hover:bg-gray-50"
                  >
                    All Products
                  </Link>
                  <div className="border-t border-gray-100 my-1" />
                  {categories.map((cat) => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      className="block px-4 py-2 text-sm hover:bg-gray-50 hover:text-primary"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/custom-designer"
              className="text-sm font-medium hover:text-primary-light transition-colors flex items-center gap-1"
            >
              <Paintbrush size={16} />
              Custom Designer
            </Link>

            <Link
              href="/about"
              className="text-sm font-medium hover:text-primary-light transition-colors"
            >
              About
            </Link>

            <Link
              href="/contact"
              className="text-sm font-medium hover:text-primary-light transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            <button
              aria-label="Search products"
              className="p-2 hover:text-primary-light transition-colors"
            >
              <Search size={20} />
            </button>

            <button
              onClick={toggleCart}
              aria-label="Shopping cart"
              className="relative p-2 hover:text-primary-light transition-colors"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              className="lg:hidden p-2 hover:text-primary-light transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 py-4 animate-fade-in">
            <div className="flex flex-col gap-2">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-sm font-medium hover:bg-white/10 rounded"
              >
                Home
              </Link>
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-sm font-medium hover:bg-white/10 rounded"
              >
                All Products
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-8 py-1.5 text-sm text-gray-300 hover:bg-white/10 rounded"
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                href="/custom-designer"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "px-4 py-2 text-sm font-medium hover:bg-white/10 rounded",
                  "flex items-center gap-2 text-primary-light"
                )}
              >
                <Paintbrush size={16} />
                Custom Designer
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-sm font-medium hover:bg-white/10 rounded"
              >
                About
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-sm font-medium hover:bg-white/10 rounded"
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
