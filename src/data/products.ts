import { Product } from "@/types";

export const products: Product[] = [
  {
    id: "1",
    name: "Copperhead Strike Fight Shorts",
    slug: "copperhead-strike-fight-shorts",
    description:
      "Premium MMA fight shorts built for the cage. 4-way stretch fabric with reinforced split seams, internal drawstring and grip waistband. Sublimated copperhead snake graphic with the Hillbilly Fight Wear signature.",
    price: 59.99,
    compareAtPrice: 74.99,
    category: "shorts",
    images: ["/images/products/shorts-copperhead-front.jpg"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: [
      { name: "Timber Black", hex: "#1a1a1a" },
      { name: "Copperhead Brown", hex: "#8B4513" },
      { name: "Rattler Red", hex: "#b91c1c" },
    ],
    features: [
      "4-way stretch polyester/spandex blend",
      "Reinforced split side seams",
      "Internal drawstring with silicone grip waistband",
      "Sublimated graphics that never fade",
      "Antimicrobial treated fabric",
    ],
    inStock: true,
    stockCount: 150,
    customizable: true,
    rating: 4.8,
    reviewCount: 127,
    tags: ["mma", "shorts", "fight-wear", "bestseller"],
    createdAt: "2025-01-15",
  },
  {
    id: "2",
    name: "Moonshine Grappler Rashguard",
    slug: "moonshine-grappler-rashguard",
    description:
      "Long-sleeve competition rashguard with compression fit. Flatlock stitching throughout, moisture-wicking fabric, and UPF 50+ sun protection. Features the Moonshine Mason Jar design.",
    price: 54.99,
    category: "rashguards",
    images: ["/images/products/rashguard-moonshine-front.jpg"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: [
      { name: "Midnight Black", hex: "#0a0a0a" },
      { name: "Holler Green", hex: "#166534" },
      { name: "Lightning White", hex: "#f8fafc" },
    ],
    features: [
      "Compression fit polyester/spandex",
      "Flatlock stitching prevents chafing",
      "UPF 50+ sun protection",
      "Moisture-wicking technology",
      "IBJJF competition approved",
    ],
    inStock: true,
    stockCount: 200,
    customizable: true,
    rating: 4.9,
    reviewCount: 89,
    tags: ["bjj", "rashguard", "grappling", "competition"],
    createdAt: "2025-02-01",
  },
  {
    id: "3",
    name: "Backwoods Brawler Boxing Gloves",
    slug: "backwoods-brawler-boxing-gloves",
    description:
      "Hand-crafted genuine leather boxing gloves with multi-layered foam padding. Pre-curved design for natural fist closure, reinforced wrist support strap, and ventilated palm.",
    price: 89.99,
    compareAtPrice: 109.99,
    category: "gloves",
    images: ["/images/products/gloves-brawler-front.jpg"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Barn Red", hex: "#b91c1c" },
      { name: "Midnight Black", hex: "#0a0a0a" },
      { name: "Whiskey Brown", hex: "#92400e" },
    ],
    features: [
      "Genuine leather construction",
      "Multi-layered foam padding system",
      "Pre-curved ergonomic design",
      "Reinforced wrist support strap",
      "Ventilated palm for breathability",
    ],
    inStock: true,
    stockCount: 75,
    customizable: false,
    rating: 4.7,
    reviewCount: 63,
    tags: ["boxing", "gloves", "leather", "premium"],
    createdAt: "2025-03-10",
  },
  {
    id: "4",
    name: "Ridge Runner Compression Spats",
    slug: "ridge-runner-compression-spats",
    description:
      "Full-length compression spats with reinforced gusset and flatlock seams. Mountain ridge camo pattern with moisture management and antimicrobial treatment.",
    price: 49.99,
    category: "spats",
    images: ["/images/products/spats-ridgerunner-front.jpg"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: [
      { name: "Ridge Camo", hex: "#4a5568" },
      { name: "Shadow Black", hex: "#111827" },
      { name: "Storm Gray", hex: "#6b7280" },
    ],
    features: [
      "4-way stretch compression fabric",
      "Reinforced gusset panel",
      "Flatlock stitching throughout",
      "Moisture-wicking antimicrobial treatment",
      "Sublimated mountain camo graphic",
    ],
    inStock: true,
    stockCount: 120,
    customizable: true,
    rating: 4.6,
    reviewCount: 45,
    tags: ["bjj", "spats", "compression", "grappling"],
    createdAt: "2025-04-01",
  },
  {
    id: "5",
    name: "Holler & Swaller Pullover Hoodie",
    slug: "holler-swaller-pullover-hoodie",
    description:
      "Heavyweight 400gsm fleece-lined pullover hoodie. Oversized fit with kangaroo pocket, ribbed cuffs, and embroidered Hillbilly Fight Wear chest logo. Perfect for warming up or post-training.",
    price: 69.99,
    category: "hoodies",
    images: ["/images/products/hoodie-holler-front.jpg"],
    sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
    colors: [
      { name: "Charcoal", hex: "#374151" },
      { name: "Barn Red", hex: "#b91c1c" },
      { name: "Forest Green", hex: "#14532d" },
    ],
    features: [
      "400gsm heavyweight cotton/polyester fleece",
      "Oversized relaxed fit",
      "Fleece-lined hood with drawcord",
      "Kangaroo pocket",
      "Embroidered chest logo",
    ],
    inStock: true,
    stockCount: 180,
    customizable: true,
    rating: 4.9,
    reviewCount: 201,
    tags: ["hoodie", "streetwear", "warmup", "bestseller"],
    createdAt: "2025-01-20",
  },
  {
    id: "6",
    name: "Outlaw Takedown T-Shirt",
    slug: "outlaw-takedown-tshirt",
    description:
      "Premium ringspun cotton tee with a relaxed athletic fit. Screen-printed Outlaw wrestling graphic on front with small Hillbilly Fight Wear logo on back neck.",
    price: 34.99,
    category: "tshirts",
    images: ["/images/products/tshirt-outlaw-front.jpg"],
    sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
    colors: [
      { name: "Black", hex: "#0a0a0a" },
      { name: "Gunmetal", hex: "#4b5563" },
      { name: "White", hex: "#fafafa" },
    ],
    features: [
      "100% ringspun cotton",
      "Relaxed athletic fit",
      "Screen-printed graphics",
      "Reinforced shoulder seams",
      "Pre-shrunk fabric",
    ],
    inStock: true,
    stockCount: 300,
    customizable: true,
    rating: 4.5,
    reviewCount: 156,
    tags: ["tshirt", "wrestling", "casual", "streetwear"],
    createdAt: "2025-02-15",
  },
  {
    id: "7",
    name: "Timber Rattler Headgear",
    slug: "timber-rattler-headgear",
    description:
      "Competition-grade wrestling and MMA headgear with high-density foam padding. Adjustable chin strap, open-ear design for hearing, and moisture-wicking inner lining.",
    price: 44.99,
    category: "headgear",
    images: ["/images/products/headgear-rattler-front.jpg"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Black", hex: "#0a0a0a" },
      { name: "Red", hex: "#b91c1c" },
    ],
    features: [
      "High-density foam padding",
      "Adjustable chin strap system",
      "Open-ear design for hearing",
      "Moisture-wicking inner lining",
      "Lightweight durable shell",
    ],
    inStock: true,
    stockCount: 60,
    customizable: false,
    rating: 4.4,
    reviewCount: 38,
    tags: ["headgear", "wrestling", "mma", "protection"],
    createdAt: "2025-05-01",
  },
  {
    id: "8",
    name: "Country Strong Gym Bag",
    slug: "country-strong-gym-bag",
    description:
      "Heavy-duty 1000D nylon gym duffel with ventilated shoe compartment, padded shoulder strap, and multiple organizer pockets. Water-resistant base with Hillbilly Fight Wear branding.",
    price: 64.99,
    category: "accessories",
    images: ["/images/products/bag-country-front.jpg"],
    sizes: ["M"],
    colors: [
      { name: "Black", hex: "#0a0a0a" },
      { name: "OD Green", hex: "#3f6212" },
    ],
    features: [
      "1000D nylon construction",
      "Ventilated shoe compartment",
      "Padded adjustable shoulder strap",
      "Water-resistant base",
      "Multiple organizer pockets",
    ],
    inStock: true,
    stockCount: 90,
    customizable: false,
    rating: 4.7,
    reviewCount: 72,
    tags: ["bag", "gym", "accessories", "duffel"],
    createdAt: "2025-03-20",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.tags.includes("bestseller"));
}

export function getCustomizableProducts(): Product[] {
  return products.filter((p) => p.customizable);
}
