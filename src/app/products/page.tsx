"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import { products } from "@/data/products";
import { ProductCategory } from "@/types";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const categoryLabels: Record<ProductCategory, string> = {
  shorts: "Fight Shorts",
  rashguards: "Rashguards",
  gloves: "Gloves",
  headgear: "Headgear",
  spats: "Spats",
  hoodies: "Hoodies",
  tshirts: "T-Shirts",
  accessories: "Accessories",
};

type SortOption = "featured" | "price-asc" | "price-desc" | "rating" | "newest";

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") as ProductCategory | null;

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    ProductCategory | "all"
  >(categoryParam || "all");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Search filter
    if (search) {
      const query = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tags.some((t) => t.includes(query))
      );
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      default:
        result.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    return result;
  }, [selectedCategory, search, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black">
          {selectedCategory !== "all"
            ? categoryLabels[selectedCategory]
            : "All Products"}
        </h1>
        <p className="text-gray-500 mt-1">
          {filteredProducts.length} product
          {filteredProducts.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Search and controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors lg:hidden"
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside
          className={`w-56 shrink-0 ${showFilters ? "block" : "hidden"} lg:block`}
        >
          <div className="sticky top-24">
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4">
              Categories
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  selectedCategory === "all"
                    ? "bg-primary text-white font-medium"
                    : "hover:bg-gray-100"
                }`}
              >
                All Products
              </button>
              {(
                Object.entries(categoryLabels) as [ProductCategory, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    selectedCategory === key
                      ? "bg-primary text-white font-medium"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">No products found</p>
              <p className="text-gray-400 text-sm mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8">Loading products...</div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
