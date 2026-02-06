import Link from "next/link";
import {
  ArrowRight,
  Paintbrush,
  Truck,
  Shield,
  Star,
  Zap,
} from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import NewsletterForm from "@/components/ui/NewsletterForm";
import { getFeaturedProducts, products } from "@/data/products";

export default function HomePage() {
  const featured = getFeaturedProducts();
  const newArrivals = products.slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-secondary-dark text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
          <div className="max-w-2xl">
            <span className="inline-block bg-primary/20 text-primary-light text-sm font-bold px-4 py-1.5 rounded-full mb-6">
              New Collection Drop
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
              Born in the
              <br />
              <span className="text-primary-light">Backwoods.</span>
              <br />
              Built for the
              <br />
              <span className="text-primary-light">Cage.</span>
            </h1>
            <p className="text-gray-300 text-lg mt-6 max-w-lg leading-relaxed">
              Premium fight gear and custom apparel designed for warriors who
              train hard and fight harder. Now with AI-powered custom garment
              design.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                href="/products"
                className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg font-bold transition-colors flex items-center gap-2"
              >
                Shop Collection <ArrowRight size={18} />
              </Link>
              <Link
                href="/custom-designer"
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-bold transition-colors flex items-center gap-2 backdrop-blur-sm"
              >
                <Paintbrush size={18} />
                Custom Designer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <Truck size={24} className="text-primary shrink-0" />
              <div>
                <p className="font-bold text-sm">Free Shipping</p>
                <p className="text-xs text-gray-500">Orders over $99</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield size={24} className="text-primary shrink-0" />
              <div>
                <p className="font-bold text-sm">Quality Guaranteed</p>
                <p className="text-xs text-gray-500">30-day returns</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Paintbrush size={24} className="text-primary shrink-0" />
              <div>
                <p className="font-bold text-sm">Custom Designs</p>
                <p className="text-xs text-gray-500">AI-powered creator</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Zap size={24} className="text-primary shrink-0" />
              <div>
                <p className="font-bold text-sm">Fast Production</p>
                <p className="text-xs text-gray-500">Ships in 5-7 days</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black">Bestsellers</h2>
            <p className="text-gray-500 mt-1">
              Our most popular fight gear, battle-tested by athletes
            </p>
          </div>
          <Link
            href="/products"
            className="text-primary font-bold text-sm hover:underline flex items-center gap-1"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Custom Designer CTA */}
      <section className="bg-secondary-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-accent/20 text-accent text-sm font-bold px-4 py-1.5 rounded-full mb-4">
                AI-Powered
              </span>
              <h2 className="text-3xl sm:text-4xl font-black leading-tight">
                Design Your Own
                <br />
                <span className="text-primary-light">Custom Fight Gear</span>
              </h2>
              <p className="text-gray-300 mt-4 leading-relaxed max-w-lg">
                Use our AI-powered garment designer to create one-of-a-kind
                fight wear. Choose your garment, colors, add text and graphics,
                and preview your design in real-time with our interactive 3D
                preview.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Real-time garment preview with color customization",
                  "Add custom text, logos, and graphics",
                  "AI-assisted design suggestions",
                  "Multiple garment types and views",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-gray-300"
                  >
                    <Star size={14} className="text-accent shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/custom-designer"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg font-bold transition-colors mt-8"
              >
                <Paintbrush size={18} />
                Launch Designer
              </Link>
            </div>
            <div className="bg-gradient-to-br from-primary/20 to-accent/10 rounded-2xl p-8 flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <Paintbrush size={64} className="text-primary-light mx-auto mb-4" />
                <p className="text-2xl font-black">Custom Designer</p>
                <p className="text-gray-400 mt-2">Interactive Preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black">New Arrivals</h2>
            <p className="text-gray-500 mt-1">
              Fresh drops straight from the holler
            </p>
          </div>
          <Link
            href="/products"
            className="text-primary font-bold text-sm hover:underline flex items-center gap-1"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-black">Join the Fight Club</h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Get exclusive drops, fighter discounts, and early access to new
            collections delivered to your inbox.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
