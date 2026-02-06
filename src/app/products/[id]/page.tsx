"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Star,
  ShoppingCart,
  Paintbrush,
  ChevronLeft,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import { getProductBySlug } from "@/data/products";
import { useCartStore } from "@/store/cart-store";
import { formatPrice, getDiscountPercentage } from "@/lib/utils";
import { Size, Product } from "@/types";
import ProductCard from "@/components/products/ProductCard";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.id as string;
  const product = getProductBySlug(slug);
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useCartStore((s) => s.setCartOpen);

  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);

  // Fetch AI-powered recommendations from API
  useEffect(() => {
    if (!product) return;
    const controller = new AbortController();

    fetch("/api/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, limit: 4 }),
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.recommendations) {
          setRecommendations(
            data.recommendations.map(
              (r: { product: Product }) => r.product
            )
          );
        }
      })
      .catch(() => {
        // Silently fail — recommendations are non-critical
      });

    return () => controller.abort();
  }, [product]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Product Not Found</h1>
        <p className="text-gray-500 mt-2">
          The product you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-primary font-medium mt-4 hover:underline"
        >
          <ChevronLeft size={16} />
          Back to Products
        </Link>
      </div>
    );
  }

  const selectedColor = product.colors[selectedColorIndex];

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addItem(product, selectedSize, selectedColor, quantity);
    setAddedToCart(true);
    setCartOpen(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary">
          Products
        </Link>
        <span>/</span>
        <span className="text-secondary font-medium">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Product image */}
        <div className="space-y-4">
          <div
            className="aspect-square rounded-xl flex items-center justify-center text-white text-2xl font-bold"
            style={{ backgroundColor: selectedColor.hex }}
          >
            <div className="text-center">
              <div className="text-6xl mb-2">
                {product.category === "shorts" && "🩳"}
                {product.category === "rashguards" && "👕"}
                {product.category === "gloves" && "🥊"}
                {product.category === "headgear" && "⛑️"}
                {product.category === "spats" && "👖"}
                {product.category === "hoodies" && "🧥"}
                {product.category === "tshirts" && "👕"}
                {product.category === "accessories" && "🎒"}
              </div>
              <span className="text-lg opacity-80">{product.name}</span>
              <br />
              <span className="text-sm opacity-60">{selectedColor.name}</span>
            </div>
          </div>
        </div>

        {/* Product info */}
        <div>
          {product.compareAtPrice && (
            <span className="inline-block bg-primary text-white text-sm font-bold px-3 py-1 rounded mb-3">
              Save{" "}
              {getDiscountPercentage(product.price, product.compareAtPrice)}%
            </span>
          )}

          <h1 className="text-3xl font-black">{product.name}</h1>

          <div className="flex items-center gap-2 mt-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < Math.round(product.rating)
                      ? "text-accent fill-accent"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              {product.rating} ({product.reviewCount} reviews)
            </span>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <span className="text-3xl font-black">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <p className="text-gray-600 mt-4 leading-relaxed">
            {product.description}
          </p>

          {/* Color selection */}
          <div className="mt-6">
            <h3 className="font-bold text-sm mb-2">
              Color: {selectedColor.name}
            </h3>
            <div className="flex gap-2">
              {product.colors.map((color, index) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColorIndex(index)}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    index === selectedColorIndex
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Size selection */}
          <div className="mt-6">
            <h3 className="font-bold text-sm mb-2">Size</h3>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                    selectedSize === size
                      ? "border-primary bg-primary text-white"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {!selectedSize && (
              <p className="text-sm text-red-500 mt-1">
                Please select a size
              </p>
            )}
          </div>

          {/* Quantity */}
          <div className="mt-6">
            <h3 className="font-bold text-sm mb-2">Quantity</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="font-bold text-lg w-8 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Add to cart / Customize */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize}
              className="flex-1 bg-primary hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart size={18} />
              {addedToCart ? "Added!" : "Add to Cart"}
            </button>
            {product.customizable && (
              <Link
                href={`/custom-designer?product=${product.id}`}
                className="bg-accent hover:bg-accent-dark text-secondary-dark py-3 px-6 rounded-lg font-bold transition-colors flex items-center gap-2"
              >
                <Paintbrush size={18} />
                Customize
              </Link>
            )}
          </div>

          {/* Trust signals */}
          <div className="mt-8 space-y-3 border-t pt-6">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Truck size={18} className="text-primary shrink-0" />
              Free shipping on orders over $99
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Shield size={18} className="text-primary shrink-0" />
              Quality guaranteed with premium materials
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <RotateCcw size={18} className="text-primary shrink-0" />
              30-day hassle-free returns
            </div>
          </div>

          {/* Features */}
          <div className="mt-8 border-t pt-6">
            <h3 className="font-bold mb-3">Features</h3>
            <ul className="space-y-2">
              {product.features.map((feature) => (
                <li
                  key={feature}
                  className="text-sm text-gray-600 flex items-start gap-2"
                >
                  <span className="text-primary font-bold mt-0.5">+</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* AI-Powered Recommendations */}
      {recommendations.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-black mb-6">Recommended For You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
