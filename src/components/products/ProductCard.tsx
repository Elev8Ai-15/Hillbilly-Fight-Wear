"use client";

import Link from "next/link";
import { Star, Paintbrush } from "lucide-react";
import { Product } from "@/types";
import { formatPrice, getDiscountPercentage } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <div
          className="w-full h-full flex items-center justify-center text-white font-bold text-lg"
          style={{ backgroundColor: product.colors[0]?.hex || "#1a1a1a" }}
        >
          <div className="text-center">
            <div className="text-3xl mb-1">
              {product.category === "shorts" && "🩳"}
              {product.category === "rashguards" && "👕"}
              {product.category === "gloves" && "🥊"}
              {product.category === "headgear" && "⛑️"}
              {product.category === "spats" && "👖"}
              {product.category === "hoodies" && "🧥"}
              {product.category === "tshirts" && "👕"}
              {product.category === "accessories" && "🎒"}
            </div>
            <span className="text-sm opacity-80">{product.name}</span>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.compareAtPrice && (
            <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded">
              {getDiscountPercentage(product.price, product.compareAtPrice)}% OFF
            </span>
          )}
          {product.customizable && (
            <span className="bg-accent text-secondary-dark text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
              <Paintbrush size={10} />
              Customizable
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-sm group-hover:text-primary transition-colors line-clamp-1">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mt-1.5">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={
                  i < Math.round(product.rating)
                    ? "text-accent fill-accent"
                    : "text-gray-300"
                }
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.reviewCount})</span>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className="font-bold text-lg">{formatPrice(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Color swatches */}
        <div className="flex gap-1.5 mt-3">
          {product.colors.map((color) => (
            <div
              key={color.name}
              className="w-4 h-4 rounded-full border-2 border-gray-200"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      </div>
    </Link>
  );
}
