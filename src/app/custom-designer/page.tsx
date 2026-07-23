"use client";

import { useEffect, useRef, useState } from "react";
import {
  ShoppingCart,
  Download,
  Share2,
  Undo2,
  Redo2,
  Paintbrush,
} from "lucide-react";
import GarmentCanvas from "@/components/custom-designer/GarmentCanvas";
import DesignerToolbar from "@/components/custom-designer/DesignerToolbar";
import { useDesignerStore } from "@/store/designer-store";
import { useCartStore } from "@/store/cart-store";
import { getProductById } from "@/data/products";
import {
  renderDesignToPng,
  downloadDataUrl,
  encodeDesignForUrl,
  decodeDesignFromUrl,
} from "@/lib/design-export";
import { formatPrice } from "@/lib/utils";
import { Product, ProductCategory } from "@/types";

const customPricing: Record<string, number> = {
  tshirts: 44.99,
  shorts: 69.99,
  rashguards: 64.99,
  hoodies: 84.99,
  spats: 59.99,
};

export default function CustomDesignerPage() {
  const {
    garmentType,
    baseColor,
    secondaryColor,
    elements,
    past,
    future,
    undo,
    redo,
    setGarmentType,
    setBaseColor,
    loadDesign,
  } = useDesignerStore();
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useCartStore((s) => s.setCartOpen);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [addedToCart, setAddedToCart] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [sourceProduct, setSourceProduct] = useState<Product | undefined>();
  const initializedRef = useRef(false);

  const price = customPricing[garmentType] || 49.99;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // On first load: shared-design link wins, then the product the user came from
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const hash = window.location.hash;
    if (hash.startsWith("#d=")) {
      const shared = decodeDesignFromUrl(hash.slice(3));
      if (shared) {
        loadDesign(shared);
        showToast("Shared design loaded");
        return;
      }
    }

    const productId = new URLSearchParams(window.location.search).get(
      "product"
    );
    const product = productId ? getProductById(productId) : undefined;
    if (product && customPricing[product.category]) {
      setSourceProduct(product);
      setGarmentType(product.category as ProductCategory);
      if (product.colors[0]) {
        setBaseColor(product.colors[0].hex);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExport = async () => {
    const png = await renderDesignToPng(2);
    if (!png) {
      showToast("Export failed — try again");
      return;
    }
    downloadDataUrl(png, `hfw-custom-${garmentType}.png`);
    showToast("Design downloaded");
  };

  const handleShare = async () => {
    const encoded = encodeDesignForUrl({
      v: 1,
      garmentType,
      baseColor,
      secondaryColor,
      elements,
    });
    if (!encoded) {
      showToast("Design too large to share as a link (uploaded images)");
      return;
    }
    const url = `${window.location.origin}/custom-designer#d=${encoded}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast("Share link copied to clipboard");
    } catch {
      // Clipboard API can be blocked (permissions, embedded contexts) — legacy fallback
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      textarea.remove();
      showToast(
        copied ? "Share link copied to clipboard" : "Couldn't access clipboard"
      );
    }
  };

  const handleAddToCart = async () => {
    if (!selectedSize) return;

    // Snapshot a preview image so the cart shows the actual design
    const previewImage = (await renderDesignToPng(1)) ?? undefined;
    const garmentLabel =
      garmentType.charAt(0).toUpperCase() + garmentType.slice(1);

    addItem(
      {
        id: `custom-${Date.now()}`,
        name: sourceProduct
          ? `Custom ${sourceProduct.name}`
          : `Custom ${garmentLabel} Design`,
        slug: "custom-design",
        description: `Custom designed ${garmentType} with ${elements.length} design element(s)`,
        price,
        category: garmentType,
        images: [],
        sizes: ["S", "M", "L", "XL", "2XL"],
        colors: [{ name: "Custom", hex: baseColor }],
        features: ["Custom designed", "Sublimated printing", "Premium materials"],
        inStock: true,
        stockCount: 999,
        customizable: true,
        rating: 5,
        reviewCount: 0,
        tags: ["custom"],
        createdAt: new Date().toISOString(),
      },
      selectedSize as "S" | "M" | "L" | "XL" | "2XL",
      { name: "Custom", hex: baseColor },
      1,
      {
        baseColor,
        secondaryColor,
        placement: [],
        elements,
        previewImage,
      }
    );

    setAddedToCart(true);
    setCartOpen(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const viewCounts = ["front", "back", "left", "right"]
    .map((view) => ({
      view,
      count: elements.filter((el) => (el.view ?? "front") === view).length,
    }))
    .filter((v) => v.count > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Paintbrush className="text-primary" size={24} />
              <div>
                <h1 className="text-xl font-black">Custom Garment Designer</h1>
                <p className="text-sm text-gray-500">
                  {sourceProduct
                    ? `Designing from: ${sourceProduct.name}`
                    : "Design your own fight wear with our interactive preview"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-primary">
                {formatPrice(price)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Canvas area */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <GarmentCanvas />
            </div>

            {/* Bottom controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-xl shadow-sm p-4">
              <div className="flex gap-2">
                <button
                  onClick={undo}
                  disabled={past.length === 0}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 size={14} />
                  Undo
                </button>
                <button
                  onClick={redo}
                  disabled={future.length === 0}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Redo (Ctrl+Shift+Z)"
                >
                  <Redo2 size={14} />
                  Redo
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download size={14} />
                  Export
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Share2 size={14} />
                  Share
                </button>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Select Size</option>
                  <option value="S">Small</option>
                  <option value="M">Medium</option>
                  <option value="L">Large</option>
                  <option value="XL">X-Large</option>
                  <option value="2XL">2X-Large</option>
                </select>

                <button
                  onClick={handleAddToCart}
                  disabled={!selectedSize}
                  className="bg-primary hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                >
                  <ShoppingCart size={16} />
                  {addedToCart ? "Added!" : "Add to Cart"}
                </button>
              </div>
            </div>
            {!selectedSize && (
              <p className="text-xs text-gray-400 -mt-2 px-1">
                Pick a size to add your design to the cart.
              </p>
            )}

            {/* Design info */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-bold text-sm mb-2">Design Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Garment:</span>
                  <p className="font-medium capitalize">{garmentType}</p>
                </div>
                <div>
                  <span className="text-gray-500">Base Color:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: baseColor }}
                    />
                    <span className="font-medium">{baseColor}</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Accent Color:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: secondaryColor }}
                    />
                    <span className="font-medium">{secondaryColor}</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Elements:</span>
                  <p className="font-medium">
                    {elements.length === 0
                      ? "None yet"
                      : viewCounts
                          .map((v) => `${v.view}: ${v.count}`)
                          .join(" · ")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Toolbar sidebar */}
          <div className="space-y-4">
            <DesignerToolbar />
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-secondary-dark text-white text-sm px-4 py-2.5 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
