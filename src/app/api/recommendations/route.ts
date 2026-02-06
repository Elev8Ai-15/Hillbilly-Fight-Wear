import { NextRequest, NextResponse } from "next/server";
import { products } from "@/data/products";
import { Product } from "@/types";

interface RecommendationRequest {
  productId?: string;
  category?: string;
  tags?: string[];
  limit?: number;
}

// AI-powered product recommendation engine
function getRecommendations(params: RecommendationRequest): {
  recommendations: { product: Product; score: number; reason: string }[];
} {
  const { productId, category, tags, limit = 4 } = params;

  let scored: { product: Product; score: number; reason: string }[] = [];

  if (productId) {
    // Similar product recommendations
    const sourceProduct = products.find((p) => p.id === productId);
    if (!sourceProduct) {
      return { recommendations: [] };
    }

    scored = products
      .filter((p) => p.id !== productId)
      .map((product) => {
        let score = 0;
        const reasons: string[] = [];

        // Same category boost
        if (product.category === sourceProduct.category) {
          score += 30;
          reasons.push("Same category");
        }

        // Shared tags boost
        const sharedTags = product.tags.filter((t) =>
          sourceProduct.tags.includes(t)
        );
        score += sharedTags.length * 15;
        if (sharedTags.length > 0) {
          reasons.push(`Shared interests: ${sharedTags.join(", ")}`);
        }

        // Price range similarity
        const priceDiff = Math.abs(product.price - sourceProduct.price);
        if (priceDiff < 20) {
          score += 20;
          reasons.push("Similar price range");
        }

        // Rating boost
        if (product.rating >= 4.5) {
          score += 10;
          reasons.push("Highly rated");
        }

        // Popularity boost
        if (product.reviewCount > 100) {
          score += 10;
          reasons.push("Popular choice");
        }

        // Complementary category boost
        const complementary: Record<string, string[]> = {
          shorts: ["rashguards", "spats", "gloves"],
          rashguards: ["shorts", "spats"],
          gloves: ["shorts", "headgear"],
          headgear: ["gloves", "shorts"],
          spats: ["rashguards", "shorts"],
          hoodies: ["tshirts", "accessories"],
          tshirts: ["hoodies", "accessories"],
          accessories: ["tshirts", "hoodies"],
        };

        if (
          complementary[sourceProduct.category]?.includes(product.category)
        ) {
          score += 25;
          reasons.push("Completes your training kit");
        }

        return {
          product,
          score,
          reason: reasons.join(" | ") || "Recommended for you",
        };
      });
  } else if (category) {
    // Category-based recommendations
    scored = products
      .filter((p) => p.category === category)
      .map((product) => ({
        product,
        score: product.rating * 10 + product.reviewCount / 10,
        reason: `Top rated in ${category}`,
      }));
  } else if (tags && tags.length > 0) {
    // Tag-based recommendations
    scored = products.map((product) => {
      const matchedTags = product.tags.filter((t) => tags.includes(t));
      return {
        product,
        score: matchedTags.length * 25 + product.rating * 5,
        reason:
          matchedTags.length > 0
            ? `Matches: ${matchedTags.join(", ")}`
            : "You might also like",
      };
    });
  } else {
    // Default trending recommendations
    scored = products.map((product) => ({
      product,
      score: product.rating * 10 + product.reviewCount / 5,
      reason: "Trending now",
    }));
  }

  const recommendations = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return { recommendations };
}

export async function POST(request: NextRequest) {
  try {
    const body: RecommendationRequest = await request.json();
    const result = getRecommendations(body);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
